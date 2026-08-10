<script lang="ts" module>
  import type { GitGutterDecorations as GitDecorations } from "./types.js";

  const ITEM_ID = "file";
  const EMPTY_GIT_DECORATIONS: GitDecorations = {
    added: [],
    modified: [],
    deletedAfter: [],
  };
  const GUTTER_MARKER_CSS = `
    [data-indicators="bars"] [data-column-number][data-line-type="change-addition"]::before {
      background-color: color-mix(in srgb, var(--diffs-addition-base) 70%, transparent);
    }
    [data-indicators="bars"] [data-column-number][data-line-type="change-deletion"]::before {
      background-color: color-mix(in srgb, var(--diffs-deletion-base) 62%, transparent);
      background-image: none;
    }
    [data-indicators="bars"] [data-column-number][data-git-modified]::before {
      background-color: color-mix(in srgb, var(--diffs-modified-base) 54%, transparent);
      background-image: repeating-linear-gradient(
        45deg,
        transparent 0 calc(var(--psx-code-view-hatch-period) * 0.75),
        rgb(255 255 255 / 70%) calc(var(--psx-code-view-hatch-period) * 0.75)
          var(--psx-code-view-hatch-period)
      );
    }
  `;

  function lineIsInRanges(line: number, ranges: GitDecorations["added"]): boolean {
    return ranges.some((range) => line >= range.start && line <= range.end);
  }

  function updateRenderedLines(
    node: HTMLElement,
    startLine: number,
    decorations: GitDecorations,
  ): void {
    node.shadowRoot
      ?.querySelector<HTMLElement>("[data-file]")
      ?.setAttribute("data-indicators", "bars");
    const deletedLines = new Set(decorations.deletedAfter.map((after) => Math.max(1, after)));

    for (const gutter of node.shadowRoot?.querySelectorAll<HTMLElement>("[data-column-number]") ??
      []) {
      const lineIndex = Number.parseInt(gutter.dataset.lineIndex ?? "", 10);
      if (!Number.isFinite(lineIndex)) continue;
      const sourceLine = lineIndex + 1;
      const number = gutter.querySelector<HTMLElement>("[data-line-number-content]");
      if (number) number.textContent = String(startLine + lineIndex);

      const isModified = lineIsInRanges(sourceLine, decorations.modified);
      const isChanged = isModified || lineIsInRanges(sourceLine, decorations.added);
      const lineType = isChanged
        ? "change-addition"
        : deletedLines.has(sourceLine)
          ? "change-deletion"
          : "context";
      gutter.dataset.lineType = lineType;
      gutter.toggleAttribute("data-git-modified", isModified);
    }
  }
</script>

<script lang="ts">
  import { CodeView as PierreCodeView, type CodeViewOptions } from "@pierre/diffs";
  import { preferredShikiHighlighter } from "../../utils/shikiEngine.js";
  import { createCacheNamespace } from "./cacheNamespace.js";
  import { getDiffWorkerPool } from "./diffWorkerPool.js";
  import type { GitGutterDecorations } from "./types.js";
  import {
    detectPierreTheme,
    DIFF_SURFACE_BACKGROUND,
    PIERRE_APP_THEMES,
    type PierreTheme,
  } from "./pierreTheme.js";

  interface Props {
    content: string;
    filename?: string;
    startLine?: number;
    gitDecorations?: GitGutterDecorations;
    wrap?: boolean;
    theme?: PierreTheme;
    fontFamily?: string;
    fontSize?: number;
    class?: string;
  }

  let {
    content,
    filename = "file.txt",
    startLine = 1,
    gitDecorations = EMPTY_GIT_DECORATIONS,
    wrap = false,
    theme,
    fontFamily = "var(--psx-font-mono)",
    fontSize = 13,
    class: className = "",
  }: Props = $props();

  let root = $state<HTMLDivElement>();
  let viewer = $state.raw<PierreCodeView>();
  let detectedTheme = $state<PierreTheme>(detectPierreTheme());
  let workerPoolFallback = $state(0);
  let version = 0;
  let hasItems = false;
  let pendingLine: number | undefined;
  let pendingFocus = false;

  // cacheKey ties into pierre's worker highlight cache (and line-split
  // cache), so option-only re-renders — theme flips, git decorations,
  // font changes — reuse the highlighted AST instead of re-tokenizing.
  // Pierre treats equal cache keys as equal content without validating the
  // payload, so the revision must advance on every content change and the
  // mount namespace keeps keys unique across the process-wide cache.
  const cacheNamespace = createCacheNamespace();
  let cacheKeyContent: string | undefined;
  let cacheKeyFilename: string | undefined;
  let cacheKeyRevision = 0;

  function fileCacheKey(name: string, contents: string): string {
    if (contents !== cacheKeyContent || name !== cacheKeyFilename) {
      cacheKeyContent = contents;
      cacheKeyFilename = name;
      ++cacheKeyRevision;
    }
    return `${cacheNamespace}:${name}#${cacheKeyRevision}`;
  }

  const appliedTheme = $derived(theme ?? detectedTheme);
  const resolvedFontFamily = $derived.by(() => {
    const configured = fontFamily.trim();
    const fallback = "var(--psx-font-mono, ui-monospace, monospace)";
    if (!configured) return fallback;
    if (configured.includes("--psx-font-mono")) return configured;
    return `${configured}, ${fallback}`;
  });
  const normalizedStartLine = $derived(Math.max(1, Math.round(startLine)));
  const normalizedFontSize = $derived(Math.min(24, Math.max(8, Math.round(fontSize))));
  const lineHeight = $derived(Math.round(normalizedFontSize * 1.6));
  const hatchPeriod = $derived.by(() => {
    const verticalPhase = lineHeight / Math.SQRT2;
    return verticalPhase / Math.max(1, Math.round(verticalPhase / 4));
  });

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

  $effect(() => {
    const element = root;
    if (!element) return;

    // With a worker pool, pierre paints the visible window as plain text
    // immediately and swaps in shiki tokens highlighted off the main
    // thread; without one (jsdom, worker asset unavailable) it tokenizes
    // the whole file synchronously on the main thread before first paint.
    const workerPool = getDiffWorkerPool();
    const instance = new PierreCodeView(undefined, workerPool);
    instance.setup(element);
    hasItems = false;
    viewer = instance;

    // Pierre re-renders when pool init succeeds but not when it fails (its
    // initialize().then(rerender) chain has no catch), which would leave
    // this view blank until the next external render trigger. Force one:
    // a failed pool reports isWorkingPool() false, so the re-render paints
    // synchronously on the main thread instead.
    if (workerPool && !workerPool.isInitialized()) {
      workerPool.initialize().catch(() => {
        workerPoolFallback += 1;
      });
    }

    return () => {
      instance.cleanUp();
      hasItems = false;
      if (viewer === instance) viewer = undefined;
    };
  });

  $effect(() => {
    const instance = viewer;
    if (!instance) return;
    // Re-render (via the version bump below) after a failed pool init.
    void workerPoolFallback;

    const currentStartLine = normalizedStartLine;
    const currentDecorations = gitDecorations;
    const options: CodeViewOptions<undefined> = {
      theme: PIERRE_APP_THEMES[appliedTheme],
      themeType: appliedTheme,
      // Only reached when the worker pool is unavailable and highlighting
      // falls back to the main thread; keep that path on the wasm engine too.
      preferredHighlighter: preferredShikiHighlighter(),
      disableFileHeader: true,
      diffIndicators: "bars",
      overflow: wrap ? "wrap" : "scroll",
      unsafeCSS: GUTTER_MARKER_CSS,
      layout: { paddingTop: 0, paddingBottom: 12, gap: 0 },
      itemMetrics: {
        lineHeight,
        spacing: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      onPostRender(node, _file, phase) {
        if (phase !== "unmount") updateRenderedLines(node, currentStartLine, currentDecorations);
      },
    };

    instance.setOptions(options);
    instance.setItems([
      {
        id: ITEM_ID,
        type: "file",
        file: { name: filename, contents: content, cacheKey: fileCacheKey(filename, content) },
        version: ++version,
      },
    ]);
    hasItems = true;
    scrollToPendingLine(instance);
    if (pendingFocus) focusRoot();
  });

  export function revealLine(lineNumber: number): void {
    pendingLine = lineNumber;
    if (viewer) scrollToPendingLine(viewer);
  }

  export function focus(): void {
    pendingFocus = true;
    focusRoot();
  }

  function scrollToPendingLine(instance: PierreCodeView): void {
    if (pendingLine == null || !hasItems) return;
    const lineNumber = Math.max(1, pendingLine - normalizedStartLine + 1);
    instance.scrollTo({
      type: "line",
      id: ITEM_ID,
      lineNumber,
      align: "center",
      behavior: "instant",
    });
    pendingLine = undefined;
  }

  function focusRoot(): void {
    if (!root) return;
    pendingFocus = false;
    root.focus({ preventScroll: true });
  }
</script>

<div
  bind:this={root}
  class={`psx-file-code-view ${className}`}
  style:--diffs-font-family={resolvedFontFamily}
  style:--diffs-font-size={`${normalizedFontSize}px`}
  style:--diffs-line-height={`${lineHeight}px`}
  style:--diffs-background={DIFF_SURFACE_BACKGROUND}
  style:--psx-code-view-hatch-period={`${hatchPeriod}px`}
></div>

<style>
  .psx-file-code-view {
    min-height: 0;
    min-width: 0;
    overflow: auto;
    background: var(--diffs-background);
    color: var(--psx-foreground-primary);
  }
</style>
