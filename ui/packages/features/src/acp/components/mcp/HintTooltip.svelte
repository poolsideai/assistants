<script lang="ts">
  import type { Snippet } from "svelte";
  import { createTooltip, melt } from "@melt-ui/svelte";

  // A small, snappy tooltip for inline label hints. The components-library
  // Tooltip is `hidden sm:block` (invisible in the narrow sidebar), so we use
  // melt directly. One instance per use, so it works inside {#each} rows.
  let { text, children }: { text: string; children: Snippet } = $props();

  const {
    elements: { trigger, content },
    states: { open },
  } = createTooltip({
    positioning: { placement: "top", gutter: 6 },
    openDelay: 150,
    closeDelay: 0,
    forceVisible: true,
  });
</script>

<span use:melt={$trigger} class="inline-flex cursor-help">
  {@render children()}
</span>
{#if $open}
  <div
    use:melt={$content}
    class="border-psx-border bg-psx-panel text-psx-foreground-secondary shadow-mid z-50 max-w-[240px] rounded-md border px-2.5 py-1.5 text-[11px] leading-snug"
  >
    {text}
  </div>
{/if}
