<!--
  A windowed (virtualized) vertical list.

  Renders every item until the list exceeds `threshold`; past that — and only
  when a `scrollElement` is provided — it renders just the items near the
  viewport (plus `overscanPx` above and below), keeping the DOM node count
  bounded on very long lists. Off-screen rows are replaced by top/bottom spacer
  divs whose heights are the sum of the (measured or estimated) row heights they
  stand in for, so the scrollbar and scroll position stay correct.

  Row heights are measured with a ResizeObserver and cached by key
  (measure-before-unmount keeps the spacer sums exact). Unmeasured rows use a
  stable `estimateHeight` supplied by the caller, either globally or per item.
  It is not a running average, so measuring one row never shifts the assumed
  height of the others and makes the scroll height swing while a list settles.

  Keyed scrolling and optional group anchors use that same height model, so
  navigation and item-array updates converge without displacing the row the
  reader is following.

  Layout: the list is a flex column with `gap` between rows; while windowed it
  switches to block flow and folds the gap into each row's border-box (so a
  measured row's height already includes the inter-row spacing).
-->
<script lang="ts" generics="TItem">
  import { tick, untrack, type Snippet } from "svelte";
  import { UserScrollIntentTracker } from "../../utils/userScrollIntent.js";
  import { HeightCache } from "./heightCache.js";
  import { computeVirtualWindow } from "./virtualWindow.js";

  interface Props {
    /** The full list of items. */
    items: readonly TItem[];
    /** Stable unique key for an item (used for list keying + the height cache). */
    key: (item: TItem, index: number) => string;
    /** Renders one item. Receives the item and its index in the full list. */
    row: Snippet<[item: TItem, index: number]>;
    /**
     * The scroll container the list lives in. Windowing stays OFF until this is
     * provided, so consumers that don't have (or want) virtualization simply
     * omit it and every item renders.
     */
    scrollElement?: HTMLElement;
    /** Globally toggle windowing off (still renders everything). Default true. */
    enabled?: boolean;
    /** Render everything at or below this many items. Default 60. */
    threshold?: number;
    /** Extra pixels rendered above and below the viewport. Default 1200. */
    overscanPx?: number;
    /** Assumed height for not-yet-measured rows. Default 200. */
    estimateHeight?: number | ((item: TItem, index: number) => number);
    /** Vertical gap between rows, in pixels. Default 0. */
    gap?: number;
    /** Keep the last row mounted while the viewport is at the bottom. Default true. */
    pinToBottom?: boolean;
    /** Keep the first visible row fixed while estimated heights are measured. */
    preserveScrollAnchor?: boolean;
    /**
     * Optional stable group identity used when the exact visible row disappears
     * during an item update. The list preserves the viewport's offset within
     * that group, falling back to the group's first row if it became shorter.
     */
    anchorGroup?: (item: TItem, index: number) => string | undefined;
    /**
     * Interpret the scroll position relative to this list's position inside a
     * shared ancestor scroller. Use for a virtual list nested in a larger row.
     */
    relativeToScrollElement?: boolean;
    /**
     * How close to the bottom (in px) counts as "pinned" for `pinToBottom`.
     * Wire this to the owner's auto-scroll detach threshold so the two agree on
     * "at the bottom" — otherwise there's a band where the tail stays mounted
     * but the viewport is no longer chased to it. Default 200.
     */
    pinThresholdPx?: number;
  }

  let {
    items,
    key,
    row,
    scrollElement,
    enabled = true,
    threshold = 60,
    overscanPx = 1200,
    estimateHeight = 200,
    gap = 0,
    pinToBottom = true,
    preserveScrollAnchor = false,
    anchorGroup,
    relativeToScrollElement = false,
    pinThresholdPx = 200,
  }: Props = $props();

  const windowed = $derived(enabled && scrollElement != null && items.length > threshold);
  // Every enabled anchoring interval gets its own identity. Anchor restoration
  // crosses ticks, so checking only the current boolean would let a correction
  // captured before a reattach run during a later detached interval.
  const scrollAnchorToken = $derived.by(() =>
    preserveScrollAnchor ? Symbol("scroll-anchor") : undefined,
  );

  // Height cache — fresh per component instance.
  const heightCache = new HeightCache();
  function estimatedHeightForItem(item: TItem, index: number): number {
    const estimated =
      typeof estimateHeight === "function" ? estimateHeight(item, index) : estimateHeight;
    return Math.max(1, estimated);
  }

  function heightForItem(item: TItem, index: number): number {
    return heightCache.get(key(item, index)) ?? estimatedHeightForItem(item, index);
  }

  // Bumped whenever a measurement changes; forces `win` to recompute.
  let measureVersion = $state(0);

  // Scroll geometry is read straight from the element (the source of truth)
  // rather than cached in $state, so (a) the first windowed frame uses the real
  // scroll position instead of 0, and (b) scrollTop and scrollHeight are always
  // read together — never a stale scrollTop against a fresh scrollHeight, which
  // could momentarily drop the pin and unmount the streaming tail. The ticks are
  // pure reactive triggers, bumped (rAF-throttled) by scroll and resize.
  let scrollTick = $state(0);
  let viewportTick = $state(0);
  let scrollRaf: number | undefined;
  let scrollFallback: ReturnType<typeof setTimeout> | undefined;
  let viewportObserver: ResizeObserver | undefined;
  let virtualRoot = $state<HTMLDivElement>();
  let listOffsetTop = $state(0);
  let listOffsetRaf: number | undefined;
  // Shared user-input tracking (wheel/touch/pointer/scroll keys). Corrections
  // captured before an input must not run after it — see staleAnchor.
  let intentTracker: UserScrollIntentTracker | undefined;

  interface ItemMetadata {
    item: TItem;
    key: string;
    group?: string;
    estimatedHeight: number;
  }

  interface ScrollToKeyOptions {
    /** Desired distance between the row and the scroll container's top edge. */
    offsetPx?: number;
  }

  interface ScrollTarget {
    key: string;
    offsetPx: number;
    modelOffset?: number;
    modelJumped: boolean;
    startedAt: number;
    stableFrames: number;
    releaseTimer?: ReturnType<typeof setTimeout>;
  }

  interface ScrollTargetAdjustment {
    adjustment: number;
    mounted: boolean;
    constrained: boolean;
    deferred: boolean;
  }

  const TARGET_STABLE_FRAMES = 3;
  const TARGET_RELEASE_DELAY_MS = 750;
  const TARGET_MAX_HOLD_MS = 3_000;
  let scrollTarget: ScrollTarget | undefined;
  let scrollTargetVersion = $state(0);
  let targetCorrectionRaf: number | undefined;

  function metadataForCurrentItems(): ItemMetadata[] {
    return items.map((item, index) => ({
      item,
      key: key(item, index),
      group: anchorGroup?.(item, index),
      estimatedHeight: estimatedHeightForItem(item, index),
    }));
  }

  function heightForMetadata(item: ItemMetadata): number {
    return heightCache.get(item.key) ?? item.estimatedHeight;
  }

  function offsetBeforeIndex(metadata: readonly ItemMetadata[], index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) offset += heightForMetadata(metadata[i]);
    return offset;
  }

  function modelOffsetForKey(
    metadata: readonly ItemMetadata[],
    itemKey: string,
  ): number | undefined {
    let offset = 0;
    for (const item of metadata) {
      if (item.key === itemKey) return offset;
      offset += heightForMetadata(item);
    }
    return undefined;
  }

  function refreshScrollTargetModelOffset(
    metadata: readonly ItemMetadata[] = metadataForCurrentItems(),
  ): void {
    if (!scrollTarget) return;
    scrollTarget.modelOffset = modelOffsetForKey(metadata, scrollTarget.key);
  }

  function listStartInScrollElement(): number {
    const root = virtualRoot;
    const container = scrollElement;
    if (!root || !container) return relativeToScrollElement ? listOffsetTop : 0;
    return (
      root.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    );
  }

  function cancelScrollTarget(): void {
    if (targetCorrectionRaf !== undefined) {
      cancelAnimationFrame(targetCorrectionRaf);
      targetCorrectionRaf = undefined;
    }
    if (scrollTarget?.releaseTimer !== undefined) {
      clearTimeout(scrollTarget.releaseTimer);
    }
    if (scrollTarget) {
      scrollTarget = undefined;
      scrollTargetVersion += 1;
    }
  }

  function clampScrollTop(container: HTMLElement, scrollTop: number): number {
    const maximumScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
    return Math.min(Math.max(0, scrollTop), maximumScrollTop);
  }

  function scrollRangeAvailable(
    container: HTMLElement | undefined = scrollElement,
  ): container is HTMLElement {
    return container != null && container.scrollHeight > container.clientHeight;
  }

  function nearBottomNow(container: HTMLElement | undefined = scrollElement): boolean {
    return (
      container != null &&
      container.scrollHeight - container.scrollTop - container.clientHeight < pinThresholdPx
    );
  }

  function applyScrollTarget(target: ScrollTarget): ScrollTargetAdjustment | undefined {
    const container = scrollElement;
    if (!container) return undefined;
    const mountedRow = rowsInThisList().find(
      (candidate) => candidate.dataset["vkey"] === target.key,
    );
    if (mountedRow) {
      target.modelJumped = true;
      const visualOffset =
        mountedRow.getBoundingClientRect().top - container.getBoundingClientRect().top;
      const rawScrollTop = container.scrollTop + visualOffset - target.offsetPx;
      const nextScrollTop = clampScrollTop(container, rawScrollTop);
      const adjustment = nextScrollTop - container.scrollTop;
      if (Math.abs(adjustment) >= 0.5) {
        container.scrollTop = nextScrollTop;
        scrollTick += 1;
      }
      return {
        adjustment: Math.abs(adjustment),
        mounted: true,
        constrained: Math.abs(nextScrollTop - rawScrollTop) >= 0.5,
        deferred: false,
      };
    }

    if (target.modelOffset === undefined) return undefined;
    if (!scrollRangeAvailable(container)) {
      return { adjustment: 0, mounted: false, constrained: false, deferred: true };
    }

    target.modelJumped = true;
    const rawScrollTop = listStartInScrollElement() + target.modelOffset - target.offsetPx;
    const nextScrollTop = clampScrollTop(container, rawScrollTop);
    const adjustment = nextScrollTop - container.scrollTop;
    if (Math.abs(adjustment) >= 0.5) {
      container.scrollTop = nextScrollTop;
      scrollTick += 1;
    }
    return {
      adjustment: Math.abs(adjustment),
      mounted: false,
      constrained: false,
      deferred: false,
    };
  }

  function deferScrollTargetUntilSignal(target: ScrollTarget): void {
    const remaining = TARGET_MAX_HOLD_MS - (performance.now() - target.startedAt);
    if (remaining <= 0) {
      cancelScrollTarget();
      return;
    }
    target.releaseTimer = setTimeout(() => {
      if (scrollTarget === target) cancelScrollTarget();
    }, remaining);
  }

  async function settleScrollTarget(target: ScrollTarget): Promise<void> {
    await tick();
    if (scrollTarget !== target) return;

    const result = applyScrollTarget(target);
    if (result === undefined) {
      cancelScrollTarget();
      return;
    }
    if (result.deferred) {
      deferScrollTargetUntilSignal(target);
      return;
    }
    target.stableFrames =
      result.mounted && (result.adjustment < 0.5 || result.constrained)
        ? target.stableFrames + 1
        : 0;

    if (performance.now() - target.startedAt >= TARGET_MAX_HOLD_MS) {
      cancelScrollTarget();
    } else if (target.stableFrames < TARGET_STABLE_FRAMES) {
      scheduleScrollTargetCorrection(false);
    } else {
      target.releaseTimer = setTimeout(() => {
        if (scrollTarget === target) cancelScrollTarget();
      }, TARGET_RELEASE_DELAY_MS);
    }
  }

  function scheduleScrollTargetCorrection(resetStability = true): void {
    const target = scrollTarget;
    if (!target) return;
    if (resetStability) target.stableFrames = 0;
    if (target.releaseTimer !== undefined) {
      clearTimeout(target.releaseTimer);
      target.releaseTimer = undefined;
    }
    if (targetCorrectionRaf !== undefined) return;
    targetCorrectionRaf = requestAnimationFrame(() => {
      targetCorrectionRaf = undefined;
      void settleScrollTarget(target);
    });
  }

  /**
   * Scroll a keyed row to a stable visual offset. Measured heights are used
   * wherever available, and the target is re-applied briefly while the new
   * window mounts and pending measurements settle.
   */
  export async function scrollToKey(
    itemKey: string,
    { offsetPx = 0 }: ScrollToKeyOptions = {},
  ): Promise<boolean> {
    cancelScrollTarget();
    const modelOffset = modelOffsetForKey(metadataForCurrentItems(), itemKey);
    if (modelOffset === undefined) return false;
    const target: ScrollTarget = {
      key: itemKey,
      offsetPx,
      modelOffset,
      modelJumped: false,
      startedAt: performance.now(),
      stableFrames: 0,
    };
    scrollTarget = target;
    if (applyScrollTarget(target) === undefined) {
      cancelScrollTarget();
      return false;
    }
    scrollTargetVersion += 1;
    await tick();
    if (scrollTarget !== target) return false;
    const result = applyScrollTarget(target);
    if (result === undefined) {
      cancelScrollTarget();
      return false;
    }
    if (result.deferred) deferScrollTargetUntilSignal(target);
    else scheduleScrollTargetCorrection();
    return true;
  }

  const geometry = $derived.by(() => {
    void scrollTick;
    void viewportTick;
    const el = scrollElement;
    if (el == null) {
      return { scrollTop: 0, viewportHeight: 0, distanceFromBottom: 0, present: false };
    }
    return {
      scrollTop: relativeToScrollElement ? el.scrollTop - listOffsetTop : el.scrollTop,
      viewportHeight: el.clientHeight,
      distanceFromBottom: el.scrollHeight - el.scrollTop - el.clientHeight,
      present: true,
    };
  });

  $effect(() => {
    const root = virtualRoot;
    const el = scrollElement;
    if (!windowed || !relativeToScrollElement || !root || !el) {
      listOffsetTop = 0;
      return;
    }
    const rootElement = root as HTMLDivElement;
    const scrollContainer = el as HTMLElement;

    function measureListOffset() {
      listOffsetRaf = undefined;
      if (virtualRoot !== rootElement || scrollElement !== scrollContainer) return;
      const nextOffset =
        rootElement.getBoundingClientRect().top -
        scrollContainer.getBoundingClientRect().top +
        scrollContainer.scrollTop;
      if (Math.abs(nextOffset - listOffsetTop) >= 0.5) {
        listOffsetTop = nextOffset;
      }
    }

    function scheduleListOffsetMeasurement() {
      if (listOffsetRaf !== undefined) return;
      listOffsetRaf = requestAnimationFrame(measureListOffset);
    }

    scheduleListOffsetMeasurement();
    const observer = new ResizeObserver(scheduleListOffsetMeasurement);
    observer.observe(rootElement);
    observer.observe(scrollContainer);

    return () => {
      observer.disconnect();
      if (listOffsetRaf !== undefined) {
        cancelAnimationFrame(listOffsetRaf);
        listOffsetRaf = undefined;
      }
    };
  });

  $effect(() => {
    if (!scrollElement) return;
    const el = scrollElement;

    // Any user scroll input cancels an in-flight keyed scroll target and
    // (via generation) invalidates captured anchors — corrections must never
    // replay a position over movement the user made after the capture.
    const tracker = new UserScrollIntentTracker(el, { onIntent: cancelScrollTarget });
    intentTracker = tracker;

    function removeUserIntentListeners(): void {
      tracker.disconnect();
      if (intentTracker === tracker) intentTracker = undefined;
    }

    if (!windowed) {
      return () => {
        removeUserIntentListeners();
        cancelScrollTarget();
      };
    }

    function flushScroll() {
      if (scrollRaf !== undefined) {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = undefined;
      }
      if (scrollFallback !== undefined) {
        clearTimeout(scrollFallback);
        scrollFallback = undefined;
      }
      scrollTick += 1;
    }

    function onScroll() {
      if (scrollRaf !== undefined || scrollFallback !== undefined) return;
      scrollRaf = requestAnimationFrame(flushScroll);
      scrollFallback = setTimeout(flushScroll, 100);
    }

    el.addEventListener("scroll", onScroll, { passive: true });

    viewportObserver = new ResizeObserver(() => {
      viewportTick += 1;
      if (scrollTarget) scheduleScrollTargetCorrection();
    });
    viewportObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      removeUserIntentListeners();
      viewportObserver?.disconnect();
      viewportObserver = undefined;
      cancelScrollTarget();
      if (scrollRaf !== undefined) {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = undefined;
      }
      if (scrollFallback !== undefined) {
        clearTimeout(scrollFallback);
        scrollFallback = undefined;
      }
    };
  });

  // A single ResizeObserver measures every mounted row. Measurements are applied
  // to the window on the NEXT frame — never synchronously inside the observer
  // callback, which would re-enter layout and livelock the observer.
  let rowObserver: ResizeObserver | null = null;
  let flushRaf: number | undefined;

  interface VisibleAnchor {
    key: string;
    offset: number;
    token: symbol;
    /** User-input generation at capture; a later value means the anchor is stale. */
    intentGeneration: number | undefined;
    group?: string;
    offsetWithinGroup?: number;
  }

  function rowsInThisList(): HTMLElement[] {
    if (!virtualRoot) return [];
    return Array.from(virtualRoot.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.classList.contains("virtual-list__row"),
    );
  }

  function captureVisibleAnchor(
    metadata: readonly ItemMetadata[] = metadataForCurrentItems(),
  ): VisibleAnchor | undefined {
    const container = scrollElement;
    const token = scrollAnchorToken;
    if (!token || !container) return undefined;
    const containerRect = container.getBoundingClientRect();
    for (const row of rowsInThisList()) {
      const rect = row.getBoundingClientRect();
      if (rect.bottom <= containerRect.top) continue;
      if (rect.top >= containerRect.bottom) return undefined;
      const rowKey = row.dataset["vkey"];
      if (rowKey) {
        const itemIndex = metadata.findIndex((item) => item.key === rowKey);
        const group = itemIndex >= 0 ? metadata[itemIndex]?.group : undefined;
        let offsetWithinGroup: number | undefined;
        if (group !== undefined) {
          let groupStart = itemIndex;
          while (groupStart > 0 && metadata[groupStart - 1]?.group === group) groupStart -= 1;
          offsetWithinGroup = geometry.scrollTop - offsetBeforeIndex(metadata, groupStart);
        }
        return {
          key: rowKey,
          offset: rect.top - containerRect.top,
          token,
          intentGeneration: intentTracker?.generation,
          group,
          offsetWithinGroup,
        };
      }
    }
    return undefined;
  }

  /**
   * A restore must never replay a captured position over movement the user
   * made after the capture: stale if any scroll input arrived since (wheel,
   * touch, scrollbar grab, scroll keys — generation moved), or if a gesture is
   * still in progress (a held scrollbar thumb emits no events between frames,
   * so the generation alone can't see it). This asymmetry is why downward
   * scrollbar drags snapped back (PE-2454): each newly mounted row's
   * measurement queued a restore that rewound the drag.
   */
  function staleAnchor(anchor: VisibleAnchor): boolean {
    const tracker = intentTracker;
    if (!tracker) return false;
    return (
      tracker.active() ||
      (anchor.intentGeneration !== undefined && tracker.generation !== anchor.intentGeneration)
    );
  }

  async function restoreVisibleAnchor(anchor: VisibleAnchor | undefined): Promise<void> {
    if (!anchor || !scrollElement || anchor.token !== scrollAnchorToken) return;
    if (staleAnchor(anchor)) return;
    const container = scrollElement;
    await tick();
    if (container !== scrollElement || anchor.token !== scrollAnchorToken) return;
    if (staleAnchor(anchor)) return;

    if (scrollTarget) {
      scheduleScrollTargetCorrection();
      return;
    }

    const row = rowsInThisList().find((candidate) => candidate.dataset["vkey"] === anchor.key);
    if (row) {
      const nextOffset = row.getBoundingClientRect().top - container.getBoundingClientRect().top;
      const adjustment = nextOffset - anchor.offset;
      if (Math.abs(adjustment) < 0.5) return;
      container.scrollTop += adjustment;
      scrollTick += 1;
      return;
    }

    const metadata = metadataForCurrentItems();
    const itemIndex = metadata.findIndex((item) => item.key === anchor.key);
    if (itemIndex >= 0) {
      const rawScrollTop =
        listStartInScrollElement() + offsetBeforeIndex(metadata, itemIndex) - anchor.offset;
      const nextScrollTop = clampScrollTop(container, rawScrollTop);
      if (Math.abs(nextScrollTop - container.scrollTop) < 0.5) return;
      container.scrollTop = nextScrollTop;
      scrollTick += 1;
      return;
    }

    if (anchor.group === undefined || anchor.offsetWithinGroup === undefined) return;
    const groupStart = metadata.findIndex((item) => item.group === anchor.group);
    if (groupStart < 0) return;
    let groupEnd = groupStart;
    while (groupEnd < metadata.length && metadata[groupEnd]?.group === anchor.group) groupEnd += 1;
    const groupHeight =
      offsetBeforeIndex(metadata, groupEnd) - offsetBeforeIndex(metadata, groupStart);
    const groupOffset =
      anchor.offsetWithinGroup >= 0 && anchor.offsetWithinGroup < groupHeight
        ? anchor.offsetWithinGroup
        : 0;
    const nextLogicalScrollTop = offsetBeforeIndex(metadata, groupStart) + groupOffset;
    container.scrollTop = relativeToScrollElement
      ? listOffsetTop + nextLogicalScrollTop
      : nextLogicalScrollTop;
    scrollTick += 1;
  }

  async function flushMeasurements(anchor: VisibleAnchor | undefined): Promise<void> {
    measureVersion += 1;
    if (scrollTarget) {
      refreshScrollTargetModelOffset();
      await tick();
      scheduleScrollTargetCorrection();
      return;
    }
    await restoreVisibleAnchor(anchor);
  }

  function scheduleFlush(): void {
    if (flushRaf !== undefined) return;
    const anchor = captureVisibleAnchor();
    flushRaf = requestAnimationFrame(() => {
      flushRaf = undefined;
      void flushMeasurements(anchor);
    });
  }

  function measureEntry(el: HTMLElement): void {
    // Skip detached / zero-height reads (e.g. during teardown) so the cache is
    // never poisoned with a 0 that would collapse the item's layout slot.
    if (!el.isConnected) return;
    const k = el.dataset["vkey"];
    if (!k) return;
    const height = el.offsetHeight; // border-box; includes the windowed gap padding
    if (height <= 0) return;
    if (heightCache.set(k, height)) scheduleFlush();
  }

  let previousItemMetadata: ItemMetadata[] | undefined;
  let itemChangeVersion = 0;

  $effect.pre(() => {
    const nextMetadata = metadataForCurrentItems();
    const previousMetadata = previousItemMetadata;
    previousItemMetadata = nextMetadata;
    if (
      previousMetadata === undefined ||
      (previousMetadata.length === nextMetadata.length &&
        previousMetadata.every((item, index) => {
          const nextItem = nextMetadata[index];
          return (
            item.item === nextItem?.item &&
            item.key === nextItem.key &&
            item.group === nextItem.group &&
            item.estimatedHeight === nextItem.estimatedHeight
          );
        }))
    ) {
      return;
    }

    refreshScrollTargetModelOffset(nextMetadata);
    const anchor = untrack(() => captureVisibleAnchor(previousMetadata));
    const version = ++itemChangeVersion;
    void tick().then(async () => {
      if (version !== itemChangeVersion) return;
      if (scrollTarget) {
        scheduleScrollTargetCorrection();
        return;
      }
      await restoreVisibleAnchor(anchor);
    });
  });

  function getRowObserver(): ResizeObserver {
    if (!rowObserver) {
      rowObserver = new ResizeObserver((entries) => {
        for (const entry of entries) measureEntry(entry.target as HTMLElement);
      });
    }
    return rowObserver;
  }

  $effect(() => {
    if (!windowed) {
      rowObserver?.disconnect();
      rowObserver = null;
    }
    return () => {
      rowObserver?.disconnect();
      rowObserver = null;
      if (flushRaf !== undefined) {
        cancelAnimationFrame(flushRaf);
        flushRaf = undefined;
      }
    };
  });

  // The container's DOM scrollHeight only reflects the
  // list's true (spacer-backed) height once we've rendered at least once. On the
  // very first frame — the cold open of an already-populated long thread — the
  // list's rows and spacers aren't in the DOM yet, so pinning can extend the
  // window to the last item while `start` is still 0 and mount the ENTIRE
  // transcript. Gate the pin on having laid out once, then read live geometry
  // whenever the window recomputes. Requiring a real scroll range also protects
  // hidden/zero-sized containers.
  let laidOut = $state(false);
  $effect(() => {
    laidOut = true; // runs once, after the first render has committed the spacers
    if (scrollTarget) scheduleScrollTargetCorrection();
  });

  const win = $derived.by(() => {
    void measureVersion; // recompute when a measurement lands
    void scrollTargetVersion; // temporarily keep a keyed scroll target mounted
    // Pin only when live DOM geometry says the viewport is at the bottom. This
    // is deliberately evaluated here instead of cached in a separate derived:
    // spacer commits and content growth change scrollHeight without changing a
    // reactive Svelte value.
    const pinEnd = pinToBottom && laidOut && scrollRangeAvailable() && nearBottomNow(scrollElement);
    const result = computeVirtualWindow({
      count: items.length,
      heightFor: (i) => heightForItem(items[i], i),
      scrollTop: geometry.scrollTop,
      viewportHeight: geometry.viewportHeight,
      overscanPx,
      pinEnd,
    });
    // A hidden or not-yet-laid-out container cannot accept the model jump.
    // Do not stretch one contiguous rendered window to a distant target while
    // we wait for a real scroll range; layout and content signals retry it.
    const targetKey =
      scrollRangeAvailable() && scrollTarget?.modelJumped ? scrollTarget.key : undefined;
    const targetIndex =
      targetKey === undefined
        ? -1
        : items.findIndex((item, index) => key(item, index) === targetKey);
    if (targetIndex < 0 || (targetIndex >= result.start && targetIndex <= result.end)) {
      return result;
    }

    if (targetIndex < result.start) {
      let addedHeight = 0;
      for (let i = targetIndex; i < result.start; i++) addedHeight += heightForItem(items[i], i);
      return {
        ...result,
        start: targetIndex,
        topPad: Math.max(0, result.topPad - addedHeight),
      };
    }

    let addedHeight = 0;
    for (let i = result.end + 1; i <= targetIndex; i++) addedHeight += heightForItem(items[i], i);
    return {
      ...result,
      end: targetIndex,
      bottomPad: Math.max(0, result.bottomPad - addedHeight),
    };
  });

  // Observe a row on mount (and take an immediate measurement so the first paint
  // has a real height), then capture a final measurement and unobserve on
  // destroy. Measure-before-unmount keeps spacer heights exact, so unmounting a
  // row never shifts the scroll position.
  function measureRow(el: HTMLElement) {
    getRowObserver().observe(el);
    measureEntry(el);
    return () => {
      if (el.isConnected && el.offsetHeight > 0) {
        const k = el.dataset["vkey"];
        if (k) heightCache.set(k, el.offsetHeight);
      }
      rowObserver?.unobserve(el);
    };
  }
</script>

{#if windowed}
  <div
    bind:this={virtualRoot}
    class="virtual-list virtual-list--windowed"
    class:virtual-list--manual-anchor={preserveScrollAnchor}
    style="--vlist-gap:{gap}px"
  >
    <div style="height:{win.topPad}px" aria-hidden="true"></div>
    {#each items.slice(win.start, win.end + 1) as item, localIndex (key(item, win.start + localIndex))}
      {@const index = win.start + localIndex}
      <div class="virtual-list__row" data-vkey={key(item, index)} {@attach measureRow}>
        {@render row(item, index)}
      </div>
    {/each}
    <div style="height:{win.bottomPad}px" aria-hidden="true"></div>
  </div>
{:else}
  <div bind:this={virtualRoot} class="virtual-list" style="--vlist-gap:{gap}px">
    {#each items as item, index (key(item, index))}
      <div class="virtual-list__row" data-vkey={key(item, index)}>
        {@render row(item, index)}
      </div>
    {/each}
  </div>
{/if}

<style>
  .virtual-list {
    display: flex;
    flex-direction: column;
    gap: var(--vlist-gap, 0);
  }

  /* Windowed: spacers replace off-screen rows, so flex `gap` can't be used (it
     would add space around the spacers). Switch to block flow and fold the gap
     into each row's border-box, so the measured height already includes the
     inter-row spacing and the spacer sums stay exact. */
  .virtual-list--windowed {
    display: block;
  }

  /* Avoid double compensation in Chromium when the explicit anchor path is on. */
  .virtual-list--manual-anchor {
    overflow-anchor: none;
  }
  .virtual-list--windowed .virtual-list__row {
    padding-bottom: var(--vlist-gap, 0);
  }

  /* Flex column so row content can use align-self (start/end), e.g. for chat
     bubbles aligned to one side. */
  .virtual-list__row {
    display: flex;
    flex-direction: column;
  }
</style>
