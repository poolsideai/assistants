<script lang="ts">
  import { onDestroy, tick, type Snippet } from "svelte";
  import {
    MAX_STREAM_RENDER_INTERVAL_MS,
    MIN_STREAM_RENDER_INTERVAL_MS,
    segmentStreamingMarkdown,
    type StreamingMarkdownSegment,
  } from "./streamingMarkdown.js";

  export interface StreamingMarkdownProps {
    source: string;
    /** False performs one canonical render of the complete source. */
    streaming?: boolean;
    children: Snippet<[segment: StreamingMarkdownSegment]>;
  }

  let { source, streaming = true, children }: StreamingMarkdownProps = $props();

  // ACP streams commonly deliver many chunks inside one browser frame. Delay
  // segmentation until a render slot so intermediate snapshots never reach
  // Marked or the DOM. Slow flushes automatically widen the interval.
  let renderedSource = $state(source);
  let pendingSource = source;
  let renderTimer: ReturnType<typeof setTimeout> | undefined;
  let renderInterval = MIN_STREAM_RENDER_INTERVAL_MS;
  let lastRenderStarted = performance.now();

  function cancelScheduledRender() {
    if (renderTimer !== undefined) clearTimeout(renderTimer);
    renderTimer = undefined;
  }

  function scheduleRender() {
    if (renderTimer !== undefined) return;
    const delay = Math.max(0, lastRenderStarted + renderInterval - performance.now());
    renderTimer = setTimeout(commitPendingSource, delay);
  }

  function commitPendingSource() {
    renderTimer = undefined;
    if (pendingSource === renderedSource) return;

    const started = performance.now();
    lastRenderStarted = started;
    renderedSource = pendingSource;

    void tick().then(() => {
      const flushDuration = performance.now() - started;
      renderInterval =
        flushDuration > 16
          ? Math.min(
              MAX_STREAM_RENDER_INTERVAL_MS,
              Math.max(MIN_STREAM_RENDER_INTERVAL_MS, flushDuration * 1.5),
            )
          : Math.max(MIN_STREAM_RENDER_INTERVAL_MS, renderInterval * 0.8);
      if (pendingSource !== renderedSource) scheduleRender();
    });
  }

  $effect(() => {
    const nextSource = source;
    pendingSource = nextSource;

    // Completion and non-append corrections must become canonical immediately.
    if (!streaming || !nextSource.startsWith(renderedSource)) {
      cancelScheduledRender();
      renderedSource = nextSource;
      lastRenderStarted = performance.now();
      renderInterval = MIN_STREAM_RENDER_INTERVAL_MS;
    } else if (nextSource !== renderedSource) {
      scheduleRender();
    }
  });

  onDestroy(cancelScheduledRender);

  let segments = $derived.by<StreamingMarkdownSegment[]>(() => {
    if (renderedSource.length === 0) return [];
    if (streaming) return segmentStreamingMarkdown(renderedSource);
    return [
      {
        key: "markdown-complete",
        source: renderedSource,
        renderSource: renderedSource,
        settled: true,
        renderMode: "markdown",
      },
    ];
  });
</script>

{#each segments as segment (segment.key)}
  {@render children(segment)}
{/each}
