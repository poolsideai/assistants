<!--
  A self-contained demo used by VirtualList.stories.svelte. It owns its own
  scroll container (and the element ref passed to VirtualList), so each story
  instance is independent. Not part of the public API.
-->
<script lang="ts">
  import { VirtualList } from "./index.js";

  interface Props {
    /** Number of rows. */
    count?: number;
    /** Provide a scroll element (turn windowing on). When false, every row renders. */
    scroll?: boolean;
    threshold?: number;
    overscanPx?: number;
    estimateHeight?: number;
    gap?: number;
    /** Give rows differing heights to exercise measured (not just estimated) sizing. */
    variableHeight?: boolean;
    /** Scroll-container height in px. */
    height?: number;
  }

  let {
    count = 1000,
    scroll = true,
    threshold = 60,
    overscanPx = 300,
    estimateHeight = 56,
    gap = 8,
    variableHeight = false,
    height = 420,
  }: Props = $props();

  type Row = { id: string; n: number; lines: number };

  const items = $derived<Row[]>(
    Array.from({ length: count }, (_, n) => ({
      id: `row-${n}`,
      n,
      // Deterministic pseudo-variation so measured heights differ but stay stable.
      lines: variableHeight ? 1 + ((n * 7) % 5) : 1,
    })),
  );

  let scrollEl = $state<HTMLElement>();

  // Count of rows currently in the DOM, to make the "windowing" tangible.
  let renderedRows = $state(0);
  function trackRendered(node: HTMLElement) {
    const update = () => (renderedRows = node.querySelectorAll(".virtual-list__row").length);
    update();
    const mo = new MutationObserver(update);
    mo.observe(node, { childList: true, subtree: true });
    return () => mo.disconnect();
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center gap-2 text-xs text-psx-foreground-secondary">
    <span class="rounded bg-psx-panel px-1.5 py-0.5 font-mono">
      {renderedRows} / {count} rows in the DOM
    </span>
    <span>{scroll ? "windowed" : "flow (all rows)"}</span>
  </div>

  <div
    bind:this={scrollEl}
    {@attach trackRendered}
    class="rounded-lg border border-psx-border bg-psx-editor-background"
    style="height:{height}px; overflow-y:auto; scrollbar-gutter:stable;"
  >
    <VirtualList
      {items}
      key={(row) => row.id}
      scrollElement={scroll ? scrollEl : undefined}
      {threshold}
      {overscanPx}
      {estimateHeight}
      {gap}
    >
      {#snippet row(item)}
        <div
          class="px-3 py-2 text-sm"
          class:bg-psx-panel={item.n % 2 === 1}
          style="border-radius:6px;"
        >
          <div class="text-psx-foreground font-medium">Row {item.n}</div>
          {#each Array.from({ length: item.lines }) as _line, i (i)}
            <div class="text-xs text-psx-foreground-secondary">
              Line {i + 1} — a bit of content so the row has real height to measure.
            </div>
          {/each}
        </div>
      {/snippet}
    </VirtualList>
  </div>
</div>
