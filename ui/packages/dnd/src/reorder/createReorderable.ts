import { projectDropTarget, projectRect, resolveMoveTarget, type AxisSpan } from "./geometry.js";
import type {
  ReorderAxis,
  ReorderDragMoveDetail,
  ReorderDropTarget,
  ReorderItemRect,
  ReorderableConfig,
  ReorderableHandle,
} from "./types.js";

const ZONE_ATTR = "data-reorderable-zone";
const ITEM_DEFAULT_SELECTOR = "[data-reorderable-item]";
const DRAGGING_ATTR = "data-reorderable-dragging";
const OVER_ATTR = "data-reorderable-over";

const DRAG_THRESHOLD_PX = 4;
const DEFAULT_AUTO_SCROLL_THRESHOLD = 32;
const AUTO_SCROLL_STEP = 12;

/**
 * Turn `zone` into a reorderable list using pointer events.
 *
 * Pointer-based (not the native HTML5 drag-and-drop API) so it works when the
 * drag starts on a `<button>` handle, never leaves a text-selection ghost, and
 * behaves consistently inside Electron. Insertion is decided by the pointer
 * position relative to each row's edges, so it stays predictable regardless of
 * the dragged row's height.
 *
 * Items are matched by `config.itemSelector` (default `[data-reorderable-item]`)
 * and must be descendants of `zone`; order is read live from the DOM.
 */
export function createReorderable(zone: HTMLElement, config: ReorderableConfig): ReorderableHandle {
  let cfg = config;

  let pressItem: HTMLElement | null = null;
  let pressX = 0;
  let pressY = 0;
  let activePointerId: number | null = null;

  let dragging = false;
  let fromIndex = -1;
  let draggingEl: HTMLElement | null = null;
  let dragItemRect: ReorderItemRect | null = null;
  let dragItemRects: ReorderItemRect[] = [];
  let overEl: HTMLElement | null = null;
  let target: ReorderDropTarget | null = null;
  // Set when a drag begins so the click synthesised after release (e.g. on the
  // handle button) is swallowed instead of, say, toggling the row.
  let suppressClick = false;

  let scrollEl: HTMLElement | null = null;
  let scrollDir = 0;
  let scrollFrame = 0;
  let lastPointer = 0;

  const axis = (): ReorderAxis => cfg.axis ?? "vertical";
  const itemSelector = (): string => cfg.itemSelector ?? ITEM_DEFAULT_SELECTOR;

  function items(): HTMLElement[] {
    return Array.from(zone.querySelectorAll<HTMLElement>(itemSelector())).filter(
      (el) => el.closest(`[${ZONE_ATTR}]`) === zone,
    );
  }

  function ownItem(el: Element | null): HTMLElement | null {
    const item = el?.closest(itemSelector());
    if (item instanceof HTMLElement && item.closest(`[${ZONE_ATTR}]`) === zone) return item;
    return null;
  }

  // --- press / drag lifecycle ------------------------------------------------
  function onPointerDown(event: PointerEvent): void {
    // Clear any suppression leaked by a previous drag whose pointerup landed
    // outside the zone (so no trailing click reached onClickCapture). Done first,
    // before the early returns, so a press on a non-handle (e.g. the kebab) still
    // clears it. Safe because no pointerdown occurs between a drag's pointerup
    // and its synthetic click.
    suppressClick = false;
    if (cfg.disabled || event.button !== 0) return;
    if (!(event.target instanceof Element)) return;

    if (cfg.handleSelector) {
      const handle = event.target.closest(cfg.handleSelector);
      if (!handle || !zone.contains(handle)) return;
      pressItem = ownItem(handle);
    } else {
      pressItem = ownItem(event.target);
    }
    if (!pressItem) return;

    pressX = event.clientX;
    pressY = event.clientY;
    activePointerId = event.pointerId;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("keydown", onKeyDown, true);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!pressItem) return;
    if (activePointerId !== null && event.pointerId !== activePointerId) return;

    if (!dragging) {
      if (Math.hypot(event.clientX - pressX, event.clientY - pressY) < DRAG_THRESHOLD_PX) return;
      beginDrag(pressItem);
      if (!dragging) return;
    }

    event.preventDefault(); // suppress text selection / native scrolling
    emitDragMove(event.clientX, event.clientY);
    lastPointer = axis() === "horizontal" ? event.clientX : event.clientY;
    updateTarget();
    autoScroll(lastPointer);
  }

  function beginDrag(item: HTMLElement): void {
    const list = items();
    const index = list.indexOf(item);
    if (index < 0) {
      reset();
      return;
    }
    dragItemRect = rectSnapshot(item.getBoundingClientRect());
    dragItemRects = list.map((el) => rectSnapshot(el.getBoundingClientRect()));
    dragging = true;
    suppressClick = true;
    fromIndex = index;
    draggingEl = item;
    item.setAttribute(DRAGGING_ATTR, "");
    document.body.style.userSelect = "none";
    cfg.onDragStart?.(index);
  }

  function emitDragMove(clientX: number, clientY: number): void {
    if (!draggingEl || !dragItemRect || fromIndex < 0 || !cfg.onDragMove) return;

    const detail: ReorderDragMoveDetail = {
      from: fromIndex,
      clientX,
      clientY,
      pointerOffsetX: pressX - dragItemRect.left,
      pointerOffsetY: pressY - dragItemRect.top,
      itemRect: dragItemRect,
      itemRects: dragItemRects,
    };
    cfg.onDragMove(detail);
  }

  function updateTarget(): void {
    const list = items();
    const spans: AxisSpan[] = list.map((el) => projectRect(el.getBoundingClientRect(), axis()));
    const projected = projectDropTarget(lastPointer, spans);
    const valid =
      projected !== null && resolveMoveTarget(fromIndex, projected.index, projected.edge) !== null
        ? projected
        : null;
    setTarget(list, valid);
  }

  function onPointerUp(event: PointerEvent): void {
    if (activePointerId !== null && event.pointerId !== activePointerId) return;
    const wasDragging = dragging;
    const from = fromIndex;
    const committed = target;
    teardownListeners();
    reset();
    if (wasDragging && committed && from >= 0) {
      const to = resolveMoveTarget(from, committed.index, committed.edge);
      if (to !== null) cfg.onReorder(from, to);
    }
  }

  function onPointerCancel(): void {
    teardownListeners();
    reset();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && dragging) {
      teardownListeners();
      reset();
    }
  }

  function onClickCapture(event: MouseEvent): void {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function teardownListeners(): void {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    window.removeEventListener("keydown", onKeyDown, true);
  }

  function setTarget(list: HTMLElement[], next: ReorderDropTarget | null): void {
    const changed = !sameTarget(target, next);
    if (overEl) {
      overEl.removeAttribute(OVER_ATTR);
      overEl = null;
    }
    target = next;
    if (next) {
      const el = list[next.index];
      if (el) {
        el.setAttribute(OVER_ATTR, next.edge);
        overEl = el;
      }
    }
    if (changed) cfg.onTargetChange?.(next);
  }

  // Reset all transient state. Leaves `suppressClick` untouched so the trailing
  // click can still be swallowed after a drag.
  function reset(): void {
    const wasDragging = dragging;
    const hadTarget = target !== null;
    draggingEl?.removeAttribute(DRAGGING_ATTR);
    overEl?.removeAttribute(OVER_ATTR);
    if (wasDragging) document.body.style.userSelect = "";
    pressItem = null;
    activePointerId = null;
    dragging = false;
    fromIndex = -1;
    draggingEl = null;
    dragItemRect = null;
    dragItemRects = [];
    overEl = null;
    target = null;
    stopAutoScroll();
    scrollEl = null;
    if (hadTarget) cfg.onTargetChange?.(null);
    if (wasDragging) cfg.onDragEnd?.();
  }

  // --- auto-scroll -----------------------------------------------------------
  function autoScroll(pointer: number): void {
    const threshold = cfg.autoScrollThreshold ?? DEFAULT_AUTO_SCROLL_THRESHOLD;
    if (threshold <= 0) {
      stopAutoScroll();
      return;
    }
    scrollEl ??= cfg.getScrollContainer
      ? cfg.getScrollContainer(zone)
      : nearestScrollable(zone, axis());
    if (!scrollEl) return;

    const rect = scrollEl.getBoundingClientRect();
    const a = axis();
    const min = a === "horizontal" ? rect.left : rect.top;
    const max = a === "horizontal" ? rect.right : rect.bottom;

    let dir = 0;
    if (pointer < min + threshold) dir = -1;
    else if (pointer > max - threshold) dir = 1;
    if (dir === scrollDir) return;

    scrollDir = dir;
    if (dir === 0) stopAutoScroll();
    else startAutoScroll();
  }

  function startAutoScroll(): void {
    if (scrollFrame) return;
    const tick = (): void => {
      if (scrollDir === 0 || !scrollEl) {
        scrollFrame = 0;
        return;
      }
      const delta = scrollDir * AUTO_SCROLL_STEP;
      if (axis() === "horizontal") scrollEl.scrollLeft += delta;
      else scrollEl.scrollTop += delta;
      updateTarget(); // content moved under a stationary pointer
      scrollFrame = requestAnimationFrame(tick);
    };
    scrollFrame = requestAnimationFrame(tick);
  }

  function stopAutoScroll(): void {
    scrollDir = 0;
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
  }

  // --- wiring ----------------------------------------------------------------
  zone.setAttribute(ZONE_ATTR, "");
  zone.addEventListener("pointerdown", onPointerDown);
  zone.addEventListener("click", onClickCapture, true);

  return {
    update(next: ReorderableConfig): void {
      cfg = next;
    },
    destroy(): void {
      teardownListeners();
      reset();
      suppressClick = false;
      zone.removeEventListener("pointerdown", onPointerDown);
      zone.removeEventListener("click", onClickCapture, true);
      zone.removeAttribute(ZONE_ATTR);
    },
  };
}

function rectSnapshot(rect: DOMRect): ReorderItemRect {
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function sameTarget(a: ReorderDropTarget | null, b: ReorderDropTarget | null): boolean {
  if (a === b) return true;
  return a !== null && b !== null && a.index === b.index && a.edge === b.edge;
}

function nearestScrollable(el: HTMLElement, axis: ReorderAxis): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const overflow = axis === "horizontal" ? style.overflowX : style.overflowY;
    const canScroll =
      axis === "horizontal"
        ? node.scrollWidth > node.clientWidth
        : node.scrollHeight > node.clientHeight;
    if ((overflow === "auto" || overflow === "scroll") && canScroll) return node;
    node = node.parentElement;
  }
  return null;
}
