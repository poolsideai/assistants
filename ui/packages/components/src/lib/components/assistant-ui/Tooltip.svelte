<script lang="ts" module>
  import { writable } from "svelte/store";

  /*
   * macOS waits a beat before the first help tag, then shows the next one
   * straight away while you keep moving between controls, and only goes back to
   * waiting once you have paused. Every tooltip shares this grace window so
   * scanning a toolbar does not cost a second per control.
   */
  const GROUP_GRACE_MS = 1000;

  const withinGrace = writable(false);
  let graceTimer: ReturnType<typeof setTimeout> | undefined;

  function startGrace(): void {
    withinGrace.set(true);
    clearTimeout(graceTimer);
    graceTimer = setTimeout(() => withinGrace.set(false), GROUP_GRACE_MS);
  }
</script>

<script lang="ts">
  import { createTooltip, melt } from "@melt-ui/svelte";
  import type { Snippet } from "svelte";

  interface Props {
    text?: string | null;
    openDelay?: number;
    gutter?: number;
    placement?: "top" | "bottom" | "left" | "right";
    truncate?: boolean;
    hide?: boolean;
    class?: string;
    children?: Snippet;
    label?: Snippet;
    customUI?: boolean;
    /** Keep the tooltip open while the pointer is over its content, e.g. to click a link inside. */
    interactive?: boolean;
  }

  let {
    text = null,
    openDelay = 1000,
    gutter = 2,
    placement = "top",
    truncate = false,
    hide = false,
    class: className,
    children,
    label,
    customUI = false,
    interactive = false,
  }: Props = $props();

  const {
    elements: { trigger, content, arrow },
    states: { open },
    options: { openDelay: openDelayOption },
  } = createTooltip({
    positioning: {
      placement,
      gutter,
      fitViewport: true,
    },
    arrowSize: 6,
    openDelay,
    closeDelay: interactive ? 100 : 0,
    closeOnPointerDown: !interactive,
    disableHoverableContent: !interactive,
  });

  // Melt reads openDelay when the pointer lands, so keeping the store in step
  // with the shared grace window is enough to skip the wait on the next one.
  $effect(() => {
    openDelayOption.set($withinGrace ? 0 : openDelay);
  });

  // Opening one tooltip is what starts the grace window for the rest — measured
  // from when this one closes, so a long hover doesn't spend it.
  let wasOpen = false;
  $effect(() => {
    if ($open) {
      wasOpen = true;
      return;
    }
    if (wasOpen) {
      wasOpen = false;
      startGrace();
    }
  });
</script>

<span class={["trigger inline-flex", className]} use:melt={$trigger}>
  {@render children?.()}
</span>

<!-- NOTE:
     tooltips are flickering in Safari / Firefox
      due to `scrollTo()` being called by the `autoscroll` action's mutation observer
      whenever tooltips are toggled.
     so for web, we will always render the content, to mitigate the issue.
-->
{#if (text || label) && ($open || customUI) && !hide}
  <div use:melt={$content} class="tooltip-content z-50">
    {#if !customUI}
      <div
        use:melt={$arrow}
        class="tooltip-arrow border-t border-l data-[side=bottom]:mb-px data-[side=left]:ml-px data-[side=right]:mr-px data-[side=top]:mt-px"
      ></div>
    {/if}
    <p
      class="tip flex items-baseline gap-1.5 px-2 pt-1 pb-[5px] text-center text-xs leading-tight"
      class:truncate
    >
      {#if text}
        {text}
      {:else}
        {@render label?.()}
      {/if}
    </p>
  </div>
{/if}

<style lang="postcss">
  @reference "#tailwind.css";

  .tooltip-content {
    @apply rounded-[4px] border border-psx-tooltip-border/50 bg-psx-tooltip-background shadow-lg;
  }

  .tooltip-arrow {
    @apply border-psx-tooltip-border/50;
  }

  .tip {
    @apply text-psx-tooltip-foreground;
    overflow-wrap: anywhere;
  }

  :global(body.web-app) .tooltip-content {
    @apply rounded-[8px] border-transparent! bg-(--color-mono-000) shadow-(--shadow-border-popover) dark:bg-(--color-mono-200);
  }
</style>
