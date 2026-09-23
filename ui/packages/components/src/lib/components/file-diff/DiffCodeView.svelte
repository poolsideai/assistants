<script lang="ts" module>
  import type { FileContents, FileDiffMetadata } from "@pierre/diffs";
  import { createCacheNamespace } from "./cacheNamespace.js";

  /**
   * One file's diff in the review surface. Follows pierre CodeView's data
   * model: items are identified by a stable `id`, and any content change
   * (patch, contents, collapsed) must bump `version` — CodeView uses it
   * instead of deep equality to decide what to re-render.
   */
  export interface DiffCodeViewItem {
    /** Stable unique id, e.g. the repo-relative file path. */
    id: string;
    /** Unified diff text for exactly one file. */
    patch: string;
    /** Hides the diff body; header stays. Bump `version` when toggling. */
    collapsed?: boolean;
    /** Increment whenever patch, contents, or collapsed change. */
    version: number;
    /**
     * Increment only when patch or contents change. Presentation-only
     * version bumps (collapse toggles) that keep contentVersion stable
     * reuse the parsed metadata and pierre's highlight caches. Defaults to
     * `version`.
     */
    contentVersion?: number;
    /**
     * Optional full before/after contents. When both are present the diff is
     * re-parsed with them, making pierre's collapsed-context separators
     * expandable in place.
     */
    oldFile?: FileContents;
    newFile?: FileContents;
  }

  interface ParsedItem {
    contentVersion: number;
    fileDiff: FileDiffMetadata | undefined;
  }

  /**
   * Scroll behaviors accepted by scrollToItem. "smooth-auto" is the
   * recommended smooth option: pierre glides only for distances under ~10
   * viewports and jumps otherwise, and always jumps under
   * prefers-reduced-motion.
   */
  export type DiffCodeViewScrollBehavior = "instant" | "smooth" | "smooth-auto";

  /**
   * Pixels rendered above and below the viewport before pierre releases an
   * item back to a blank placeholder. Matches the 1000px default of pierre's
   * simple virtualizer rather than CodeView's 200px: WebKit's async
   * (compositor-thread) scrolling lets a flick move further than 200px
   * between main-thread frames, which showed up as the last file whiting
   * out and re-rendering. Exported for tests.
   */
  export const OVERSCROLL_SIZE = 1000;
</script>

<script lang="ts">
  // Multi-file diff review surface built directly on pierre's CodeView — the
  // library's own "one large scroll region" component with built-in
  // per-line virtualization, measured layout reconciliation, sticky headers,
  // and scrollTo targeting. This intentionally delegates all windowing and
  // height estimation to pierre; keep custom CSS that changes rendered
  // heights in sync with `itemMetrics` (see separatorCss.ts).
  import {
    CodeView,
    parsePatchFiles,
    processFile,
    type CodeViewDiffItem,
    type CodeViewOptions,
  } from "@pierre/diffs";
  import { preferredShikiHighlighter } from "../../utils/shikiEngine.js";
  import { getDiffWorkerPool } from "./diffWorkerPool.js";
  import {
    detectPierreTheme,
    DIFF_SURFACE_BACKGROUND,
    PIERRE_APP_THEMES,
    type PierreTheme,
  } from "./pierreTheme.js";
  import {
    CARD_CSS,
    HEADER_CSS,
    HEADER_HEIGHT,
    SEPARATOR_CSS,
    SEPARATOR_HEIGHT,
  } from "./separatorCss.js";

  interface Props {
    items: DiffCodeViewItem[];
    /** Diff layout: unified (stacked) or side-by-side. */
    layout?: "unified" | "split";
    /** Wrap long lines instead of the default horizontal scrolling. */
    wrap?: boolean;
    /** Color mode for syntax highlighting. Defaults to the app theme. */
    theme?: PierreTheme;
    /** Pin the active file's header while its content scrolls. */
    stickyHeaders?: boolean;
    /**
     * Custom per-file header content, slotted into pierre's header row.
     * The returned element is caller-owned: attach click handlers for
     * collapse toggles etc. before returning it.
     */
    renderCustomHeader?: (fileDiff: FileDiffMetadata) => Element | null | undefined;
    /** Vertical padding above the first and below the last file. */
    inset?: number;
    /** Vertical gap between files. */
    gap?: number;
    class?: string;
  }

  let {
    items,
    layout = "unified",
    wrap = false,
    theme,
    stickyHeaders = true,
    renderCustomHeader,
    inset = 12,
    gap = 12,
    class: className = "",
  }: Props = $props();

  let root = $state<HTMLDivElement>();
  let viewer = $state.raw<CodeView>();

  // Parsed pierre metadata per item id, reused across renders while the
  // item's content version is unchanged. cacheKey ties into pierre's
  // highlight caches (and worker-pool request dedupe) so identical content
  // re-renders for free without letting a removed/recreated path reuse stale
  // highlighted content.
  const parseCache = new Map<string, ParsedItem>();
  const cacheNamespace = createCacheNamespace();
  let nextParsedContentRevision = 0;
  // Snapshot of what the mounted CodeView currently holds, for reconciling
  // the `items` prop into setItems/addItems/updateItem calls.
  let appliedIds: string[] = [];
  let appliedVersions = new Map<string, number>();

  let detectedTheme = $state<PierreTheme>(detectPierreTheme());
  const appliedTheme = $derived(theme ?? detectedTheme);

  $effect(() => {
    const observer = new MutationObserver(() => {
      detectedTheme = detectPierreTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      detectedTheme = detectPierreTheme();
    };
    media?.addEventListener("change", onMediaChange);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", onMediaChange);
    };
  });

  const editorLineHeight = $derived.by(() => {
    if (!root) return Math.round(13 * 1.6);
    const fontSize =
      Number.parseFloat(getComputedStyle(root).getPropertyValue("--psx-editor-font-size")) || 13;
    return Math.round(fontSize * 1.6);
  });

  function parseItem(item: DiffCodeViewItem): FileDiffMetadata | undefined {
    const contentVersion = item.contentVersion ?? item.version;
    const cached = parseCache.get(item.id);
    if (cached && cached.contentVersion === contentVersion) return cached.fileDiff;
    // Pierre treats equal cache keys as equal content without validating the
    // payload. contentVersion is only local to the owning document and can
    // reset when a path leaves and re-enters the diff, so pair it with a
    // mount namespace and a revision that advances on every parse-cache miss.
    const cacheKey = `${item.id}#${contentVersion}@${cacheNamespace}:${++nextParsedContentRevision}`;
    let fileDiff: FileDiffMetadata | undefined;
    try {
      if (item.oldFile && item.newFile) {
        fileDiff = processFile(item.patch, {
          oldFile: { ...item.oldFile, cacheKey: `${cacheKey}:old` },
          newFile: { ...item.newFile, cacheKey: `${cacheKey}:new` },
        });
        if (fileDiff) fileDiff.cacheKey = cacheKey;
      }
      fileDiff ??= parsePatchFiles(item.patch, cacheKey).flatMap((result) => result.files)[0];
    } catch {
      fileDiff = undefined;
    }
    parseCache.set(item.id, { contentVersion, fileDiff });
    return fileDiff;
  }

  function toCodeViewItem(item: DiffCodeViewItem): CodeViewDiffItem | undefined {
    const fileDiff = parseItem(item);
    if (!fileDiff) return undefined;
    return {
      id: item.id,
      type: "diff",
      fileDiff,
      collapsed: item.collapsed === true,
      version: item.version,
    };
  }

  $effect(() => {
    const element = root;
    if (!element) return;

    // With a worker pool, shiki tokenization runs off the main thread and
    // results are AST-cached by item cacheKey; without one (jsdom, worker
    // asset unavailable) pierre highlights on the main thread as before.
    const instance = new CodeView(undefined, getDiffWorkerPool());
    // Widen pierre's render window (default 200px above/below the viewport;
    // anything outside is torn down to a blank placeholder). WKWebView
    // scrolls on the compositor thread and delivers scroll events to the
    // main thread asynchronously, so the rendered window lags the true
    // offset and a trackpad flick outruns 200px — landing on released,
    // blank cards until the next frame catches up. The constructor takes no
    // virtualizer config, so mutate the field before setup.
    instance.config.overscrollSize = OVERSCROLL_SIZE;
    instance.setup(element);
    viewer = instance;

    return () => {
      instance.cleanUp();
      parseCache.clear();
      appliedIds = [];
      appliedVersions = new Map();
      if (viewer === instance) viewer = undefined;
    };
  });

  // Options and items feed the viewer through two separate effects, so
  // streaming item appends and collapse toggles hit only the cheap
  // reconcile path instead of re-running setOptions (whose object is
  // rebuilt, and therefore never reference-equal, on every run).
  $effect(() => {
    const instance = viewer;
    if (!instance) return;

    // CodeView's header callback is overloaded for file and diff items; this
    // viewer only ever holds diff items, so adapt our diff-only prop.
    const renderHeader = renderCustomHeader;
    const headerCallback = renderHeader
      ? (((fileOrDiff: FileDiffMetadata | FileContents) =>
          "hunks" in fileOrDiff ? renderHeader(fileOrDiff) : undefined) as NonNullable<
          CodeViewOptions<undefined>["renderCustomHeader"]
        >)
      : undefined;
    const options: CodeViewOptions<undefined> = {
      theme: PIERRE_APP_THEMES[appliedTheme],
      themeType: appliedTheme,
      // Only reached when the worker pool is unavailable and highlighting
      // falls back to the main thread; keep that path on the wasm engine too.
      preferredHighlighter: preferredShikiHighlighter(),
      diffStyle: layout === "split" ? "split" : "unified",
      diffIndicators: "none",
      overflow: wrap ? "wrap" : "scroll",
      // Card chrome and the fixed-height header row are height-neutral or
      // mirrored in itemMetrics; see separatorCss.ts for the contract.
      unsafeCSS: SEPARATOR_CSS + (headerCallback ? HEADER_CSS + CARD_CSS : ""),
      hunkSeparators: "line-info",
      lineDiffType: "word-alt",
      expandUnchanged: false,
      stickyHeaders,
      renderCustomHeader: headerCallback,
      // Owns the document inset and inter-file gap — pierre's docs require
      // these to come through layout, not CSS, so its size estimation and
      // scroll anchoring stay exact.
      layout: { paddingTop: inset, paddingBottom: inset, gap },
      // Deviations from pierre's defaults, mirrored from the CSS: our
      // editor-font line height, the restyled separator bars, the fixed
      // card-header row, and zeroed block spacing (--diffs-gap-block: 0
      // on the host — same pairing the pre-CodeView renderer used).
      itemMetrics: {
        lineHeight: editorLineHeight,
        hunkSeparatorHeight: SEPARATOR_HEIGHT,
        spacing: 0,
        paddingTop: 0,
        paddingBottom: 0,
        ...(headerCallback ? { diffHeaderHeight: HEADER_HEIGHT } : {}),
      },
    };
    instance.setOptions(options);
  });

  $effect(() => {
    // Runs after the options effect above (declaration order), so on mount
    // the viewer is configured before its first items land.
    const instance = viewer;
    if (!instance) return;
    reconcileItems(instance, items);
  });

  /**
   * Applies the `items` prop to the mounted viewer with the cheapest pierre
   * call available: append-only changes go through addItems (which preserves
   * measured layout), same-id version bumps through updateItem, and anything
   * else (removal, reorder) through a full setItems.
   */
  function reconcileItems(instance: CodeView, next: DiffCodeViewItem[]): void {
    const nextIds = next.map((item) => item.id);
    const appendOnly =
      appliedIds.length > 0 &&
      appliedIds.length <= nextIds.length &&
      appliedIds.every((id, index) => id === nextIds[index]);

    if (!appendOnly) {
      const records = next
        .map(toCodeViewItem)
        .filter((item): item is CodeViewDiffItem => item != null);
      instance.setItems(records);
    } else {
      const updates = next.slice(0, appliedIds.length);
      const additions = next.slice(appliedIds.length);
      for (const item of updates) {
        if (appliedVersions.get(item.id) === item.version) continue;
        const record = toCodeViewItem(item);
        if (record) instance.updateItem(record);
      }
      if (additions.length > 0) {
        const records = additions
          .map(toCodeViewItem)
          .filter((item): item is CodeViewDiffItem => item != null);
        if (records.length > 0) instance.addItems(records);
      }
    }

    appliedIds = nextIds;
    appliedVersions = new Map(next.map((item) => [item.id, item.version]));
    for (const id of parseCache.keys()) {
      if (!appliedVersions.has(id)) parseCache.delete(id);
    }
  }

  /**
   * Scrolls a file's header to the pinned-header position.
   *
   * "smooth-auto" uses pierre's critically-damped spring, which re-resolves
   * the destination and folds anchoring corrections in every frame — safe
   * over virtualized content where measured heights change mid-flight — and
   * falls back to instant for distances over ~10 viewports and under
   * prefers-reduced-motion.
   */
  export function scrollToItem(id: string, behavior: DiffCodeViewScrollBehavior = "instant"): void {
    // offset backs the target off by the document inset: headers pin at
    // --psx-diff-sticky-inset (not pierre's default viewport edge), and
    // pierre's aligned-position math ends `- offset`, so this lands the
    // card top exactly at the pin position instead of 12px under it.
    viewer?.scrollTo({ type: "item", id, align: "start", offset: inset, behavior });
  }

  /** Scrolls back to the top of the document. */
  export function scrollToTop(): void {
    viewer?.scrollTo({ type: "position", position: 0 });
  }
</script>

<div
  bind:this={root}
  class={`psx-diff-code-view ${className}`}
  style:--diffs-font-family="var(--psx-font-mono, ui-monospace, monospace)"
  style:--diffs-font-size="var(--psx-editor-font-size, 13px)"
  style:--diffs-line-height={`${editorLineHeight}px`}
  style:--diffs-background={DIFF_SURFACE_BACKGROUND}
  style:--psx-diff-sticky-inset={`${inset}px`}
  style:padding-inline={`${inset}px`}
>
  <!-- No surface-level inset mask here: each pinned header carries its own
       page-background backdrop extended over the inset band (HEADER_CSS
       ::after). A mask at this level painted over departing headers, making
       them vanish the moment they left the pin position instead of sliding
       out through the inset zone. -->
</div>

<style>
  .psx-diff-code-view {
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: auto;
    /* Vertical inset comes from pierre's layout.paddingTop/Bottom (it must,
       for exact height math); the matching horizontal inset is plain
       padding — widths are never estimated, so it cannot cause drift. */
    scrollbar-gutter: stable;
    background: var(--diffs-background);
    color: var(--psx-foreground-primary);

    /* Added/removed accents from the app diff tokens; pierre mixes the
       line backgrounds from these. See PatchDiff.svelte for the rationale. */
    --diffs-addition-color-override: var(
      --psx-diff-insert-foreground,
      light-dark(#1a7f37, #3fb950)
    );
    --diffs-deletion-color-override: var(
      --psx-diff-delete-foreground,
      light-dark(#cf222e, #f85149)
    );

    /* Code sits flush under the header with a 12px inline inset matching
       the header's padding, like the old per-file cards. Inline-only:
       block spacing is part of pierre's height model. */
    --diffs-gap-block: 0px;
    --diffs-gap-inline: 12px;
    --diffs-overflow-override: auto;
  }
</style>
