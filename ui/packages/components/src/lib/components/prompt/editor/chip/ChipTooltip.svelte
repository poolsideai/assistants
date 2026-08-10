<script lang="ts">
  import { createTooltip, melt } from "@melt-ui/svelte";
  import type { Snippet } from "svelte";

  interface Props {
    text?: string;
    tooltipContent?: Snippet;
    /** Pass `false` to disable the tooltip entirely. */
    show?: boolean;
    children: Snippet;
  }

  const { text, tooltipContent, show = true, children }: Props = $props();

  const {
    elements: { trigger, content, arrow },
    states: { open },
  } = createTooltip({
    positioning: { placement: "top", gutter: 6, fitViewport: true },
    arrowSize: 6,
    openDelay: 400,
    closeDelay: 0,
    closeOnPointerDown: true,
    disableHoverableContent: true,
  });
</script>

<span class="inline-flex" use:melt={$trigger}>
  {@render children()}
</span>

{#if show && $open && (tooltipContent || text)}
  <div use:melt={$content} class="tooltip-content z-50">
    <div use:melt={$arrow} class="tooltip-arrow"></div>
    {#if tooltipContent}
      {@render tooltipContent()}
    {:else if text}
      <p class="tooltip-text">{text}</p>
    {/if}
  </div>
{/if}

<style lang="postcss">
  @reference "#tailwind.css";

  .tooltip-content {
    @apply rounded-[4px] border border-psx-tooltip-border/50 bg-psx-tooltip-background shadow-lg;
  }

  .tooltip-arrow {
    @apply border-t border-l border-psx-tooltip-border/50;
  }

  .tooltip-text {
    @apply max-w-md truncate px-2 py-1 text-xs leading-tight text-psx-tooltip-foreground;
    overflow-wrap: anywhere;
  }
</style>
