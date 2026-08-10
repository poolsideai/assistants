<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";

  interface Props {
    /**
     * Slot for custom content inside the bubble
     */
    children?: Snippet;
    /**
     * Whether the bubble content can be collapsed when it overflows
     */
    collapsible?: boolean;
    /**
     * Visual variant of the bubble
     * - "default": Standard user message bubble with brand color
     * - "enqueued": Grey/muted bubble for queued messages
     * - "steer": Accent-tinted bubble for messages injected into an active turn
     */
    variant?: "default" | "enqueued" | "steer";
    /**
     * Position of the nubbin (speech bubble tail)
     * - "top-right": Points up and to the right (default)
     * - "bottom-right": Points down and to the right
     */
    nubbinPosition?: "top-right" | "bottom-right";
  }

  let {
    children,
    collapsible = false,
    variant = "default",
    nubbinPosition = "top-right",
  }: Props = $props();

  const MAX_HEIGHT = 100; // Maximum height in pixels

  let bubbleContent = $state<HTMLElement>();
  let isOverflowing = $state(false);
  let expanded = $state(false);
  let codeBlockCut = $state(false);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function checkOverflow() {
    if (bubbleContent && collapsible) {
      const shouldOverflow = bubbleContent.scrollHeight > MAX_HEIGHT;
      if (isOverflowing !== shouldOverflow) {
        isOverflowing = shouldOverflow;
      }
      // Detect whether the bubble's max-height crops a code block —
      // i.e., the code block's top is above the cut and its bottom is below.
      // Only then do we want to show a code-block-scoped fade.
      const code = bubbleContent.querySelector(".highlightedCode");
      let newCut = false;
      if (code && shouldOverflow) {
        const bubbleRect = bubbleContent.getBoundingClientRect();
        const codeRect = code.getBoundingClientRect();
        const top = codeRect.top - bubbleRect.top;
        const bottom = codeRect.bottom - bubbleRect.top;
        newCut = top < bubbleRect.height && bottom > bubbleRect.height;
      }
      if (codeBlockCut !== newCut) {
        codeBlockCut = newCut;
      }
    }
  }

  onMount(() => {
    if (!collapsible) return;

    // Use a small delay to ensure the content has fully rendered
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const resizeObserver = new ResizeObserver(() => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    });

    if (bubbleContent) {
      resizeObserver.observe(bubbleContent);
    }

    return () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      resizeObserver.disconnect();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
  });

  function toggleExpand() {
    expanded = !expanded;
  }
</script>

<div class="prompt flex w-full justify-end pl-2 text-left leading-[1.5] text-psx-input-foreground">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="user-bubble relative max-w-full rounded-[18px]"
    class:variant-default={variant === "default"}
    class:variant-enqueued={variant === "enqueued"}
    class:variant-steer={variant === "steer"}
    class:cursor-pointer={isOverflowing && collapsible}
    onclick={() => {
      if (isOverflowing && collapsible) toggleExpand();
    }}
  >
    <!-- Draw the nubbin' -->
    <span
      class="pointer-events-none absolute right-[1px] h-[36px] w-[36px] nubbin overflow-hidden"
      class:top-[-3px]={nubbinPosition === "top-right"}
      class:nubbin-bottom={nubbinPosition === "bottom-right"}
      class:bg-psx-bubble-background={variant === "default"}
      class:nubbin-enqueued={variant === "enqueued"}
      class:nubbin-steer={variant === "steer"}
    ></span>

    <!-- Render the content -->
    <div
      class="bubble-content relative px-3 py-2"
      class:expanded={!collapsible || expanded}
      class:bubble-content-truncated={isOverflowing && !expanded}
      class:codeblock-cut={codeBlockCut && isOverflowing && !expanded}
      bind:this={bubbleContent}
    >
      {#if children}
        {@render children?.()}
      {/if}

      {#if collapsible && isOverflowing && !expanded}
        <div class="fade-overlay"></div>
      {/if}
      {#if collapsible && isOverflowing && expanded}
        <div class="collapse-overlay"></div>
      {/if}
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "#tailwind.css";

  .nubbin-bottom {
    bottom: -3px;
    transform: translate(-1px, -1px) scaleY(-1);
  }

  .bubble-content {
    @apply relative overflow-hidden;
    overflow-wrap: break-word;
    transition: max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .bubble-content-truncated {
    max-height: calc(4.2lh + 8px);
  }

  /* Both overlays cover the cropped edge by painting the bubble's own surface
     over it, so the text dissolves into the bubble instead of stopping
     mid-glyph. Only the paint differs per variant; the geometry is shared.
     --side-mask is a no-op until .codeblock-cut narrows the fade to the
     rounded side strips — it is a variable so the enqueued variant can
     intersect it with its own alpha ramp. */
  .fade-overlay,
  .collapse-overlay {
    @apply pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[18px] transition-opacity duration-300;
    --side-mask: linear-gradient(#000, #000);
    height: 2lh;
  }

  .collapse-overlay {
    @apply opacity-0;
  }

  /* When the bubble's max-height crops a code block, extend it to the bubble
     edge, mask the blue fade to the rounded side strips, and overlay a
     theme-aware fade scoped to the code block region. JS sets .codeblock-cut
     only when the code block actually intersects the cut. */
  .codeblock-cut {
    @apply rounded-b-[18px] pb-0;
  }

  .codeblock-cut .fade-overlay {
    --side-mask: linear-gradient(
      to right,
      black 0 12px,
      transparent 12px calc(100% - 12px),
      black calc(100% - 12px)
    );
    -webkit-mask-image: var(--side-mask);
    mask-image: var(--side-mask);
  }

  .codeblock-cut::after {
    content: "";
    @apply pointer-events-none absolute right-3 bottom-0 left-3;
    height: 1.5lh;
    background: linear-gradient(
      to bottom,
      transparent,
      color-mix(in srgb, var(--psx-editor-background), black 35%) 80%
    );
  }

  .bubble-content.expanded {
    max-height: fit-content;
  }

  .user-bubble:hover .fade-overlay {
    @apply opacity-50;
  }

  .user-bubble:hover .collapse-overlay {
    @apply opacity-50;
  }

  /* --psx-bubble-background is opaque, so the brand bubble can fade to it
     directly and back that with a solid strip for the last 8px. */
  .user-bubble.variant-default :is(.fade-overlay, .collapse-overlay) {
    @apply border-b-8 border-b-psx-bubble-background bg-gradient-to-b from-transparent to-psx-bubble-background;
  }

  /* The enqueued surface is a translucent hover colour over the chat
     background (see .variant-enqueued), so it cannot be used as a gradient
     stop the way the brand colour can: fading to it lays the hover colour down
     a second time, which tints the strip rather than hiding what it covers.
     The cropped line stayed fully legible and cut mid-glyph, and the tint
     stopped at the content box, leaving a seam where the nubbin met it.
     Paint the same composite the bubble uses and ramp its alpha with a mask
     instead — opaque for the last 8px, matching the brand bubble's strip. */
  .user-bubble.variant-enqueued :is(.fade-overlay, .collapse-overlay) {
    --alpha-ramp: linear-gradient(to bottom, transparent, #000 calc(100% - 8px));
    background:
      linear-gradient(var(--psx-chrome-hover), var(--psx-chrome-hover)),
      var(--psx-editor-background);
    -webkit-mask-image: var(--alpha-ramp), var(--side-mask);
    mask-image: var(--alpha-ramp), var(--side-mask);
    -webkit-mask-composite: source-in;
    mask-composite: intersect;
  }

  .user-bubble.variant-steer :is(.fade-overlay, .collapse-overlay) {
    --alpha-ramp: linear-gradient(to bottom, transparent, #000 calc(100% - 8px));
    background:
      linear-gradient(
        color-mix(in srgb, var(--psx-focus) 10%, transparent),
        color-mix(in srgb, var(--psx-focus) 10%, transparent)
      ),
      var(--psx-editor-background);
    -webkit-mask-image: var(--alpha-ramp), var(--side-mask);
    mask-image: var(--alpha-ramp), var(--side-mask);
    -webkit-mask-composite: source-in;
    mask-composite: intersect;
  }

  .user-bubble.variant-default {
    @apply text-psx-bubble-foreground;
    /* Tailwind doesn't support `background` shorthand */
    /* (this variable can be a gradient or a single color) */
    background: var(--psx-bubble-background);
    box-shadow: var(
      --psx-bubble-shadow,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0.05) 0px 10px 15px -3px,
      rgba(0, 0, 0, 0.05) 0px 4px 6px -4px
    );
  }

  .user-bubble.variant-enqueued {
    @apply text-psx-foreground-primary;
    /* --psx-chrome-hover is typically translucent, and the nubbin is a second
       paint of the same colour whose mask overlaps the bubble's rounded corner
       (the overlap avoids a hairline gap at the joint). Two translucent layers
       double-darken where they overlap, so pre-composite the hover colour over
       the chat surface and paint both bubble and nubbin fully opaque. */
    background:
      linear-gradient(var(--psx-chrome-hover), var(--psx-chrome-hover)),
      var(--psx-editor-background);
    /* Keep inline file/skill/command pills readable on the muted bubble
       background instead of using the brand bubble's foreground. */
    --psx-user-chip-fg: var(--psx-foreground-primary);
  }

  .user-bubble.variant-steer {
    @apply text-psx-foreground-primary;
    background:
      linear-gradient(
        color-mix(in srgb, var(--psx-focus) 10%, transparent),
        color-mix(in srgb, var(--psx-focus) 10%, transparent)
      ),
      var(--psx-editor-background);
    --psx-user-chip-fg: var(--psx-foreground-primary);
  }

  .nubbin-enqueued {
    /* Same opaque composite as .variant-enqueued so the overlap at the corner
       is invisible. */
    background:
      linear-gradient(var(--psx-chrome-hover), var(--psx-chrome-hover)),
      var(--psx-editor-background);
  }

  .nubbin-steer {
    background:
      linear-gradient(
        color-mix(in srgb, var(--psx-focus) 10%, transparent),
        color-mix(in srgb, var(--psx-focus) 10%, transparent)
      ),
      var(--psx-editor-background);
  }
</style>
