<script lang="ts">
  import Icon from "../icon/Icon.svelte";
  import { ScrollManager } from "./ScrollManager.js";
  import { tick, type Snippet, untrack } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  interface Props {
    complete?: boolean;
    children?: Snippet;
    onExpandedChange?: (expanded: boolean) => void;
  }

  let { complete, children, onExpandedChange }: Props = $props();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let hasContent = $derived(children !== undefined);

  type DisplayMode = "Collapsed" | "Preview" | "Expanded";
  let displayMode = $state<DisplayMode>("Collapsed");
  let hasBeenCompleted = $state(false);
  let thinkingContainer = $state<HTMLDivElement>();
  let showFadeTop = $state(false);
  let showFadeBottom = $state(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let scrollManager: ScrollManager | undefined;
  let wasComplete = Boolean(complete);

  function handleClick() {
    if (displayMode === "Collapsed") {
      displayMode = "Expanded";
    } else if (displayMode === "Preview") {
      displayMode = "Expanded";
    } else {
      displayMode = "Collapsed";
    }
  }

  function toggleExpanded() {
    if (complete && hasBeenCompleted && displayMode === "Collapsed") {
      displayMode = "Expanded";
    } else {
      handleClick();
    }
  }

  function updateFades() {
    if (!thinkingContainer) return;

    if (displayMode === "Preview") {
      showFadeTop = true;
      showFadeBottom = true;
    } else {
      showFadeTop = thinkingContainer.scrollTop > 10;

      const isAtBottom =
        thinkingContainer.scrollHeight -
          thinkingContainer.scrollTop -
          thinkingContainer.clientHeight <
        10;
      showFadeBottom = !isAtBottom;
    }
  }

  $effect(() => {
    if (complete) {
      if (displayMode !== "Expanded") {
        displayMode = "Collapsed";
      }
      hasBeenCompleted = true;
    }
  });

  let isExpanded = $derived(displayMode === "Preview" || displayMode === "Expanded");

  // A collapsed transcript can be one of many on screen, so it owns no
  // observers or input listeners. Opening it creates the same pinned-scroll
  // manager as the main chat panel; the effect cleanup disconnects everything
  // immediately when it is collapsed again.
  $effect(() => {
    const container = thinkingContainer;
    const expanded = isExpanded;
    const completed = untrack(() => complete);
    if (!container || !expanded) {
      showFadeTop = false;
      showFadeBottom = false;
      return;
    }

    const manager = new ScrollManager(container, {
      onScroll: updateFades,
      // Completed thoughts are static. Avoid retaining a MutationObserver for
      // every completed block the user happens to leave expanded.
      observeMutations: !completed,
    });
    scrollManager = manager;

    // A live thought may already contain more than one viewport when opened.
    // Completed thoughts still open at their beginning for reading.
    if (!completed) manager.scrollToBottom();
    updateFades();

    return () => {
      if (scrollManager === manager) scrollManager = undefined;
      manager.disconnect();
    };
  });

  $effect(() => {
    const completed = Boolean(complete);
    if (completed && !wasComplete) {
      const manager = scrollManager;
      const finishAtBottom = manager?.attached === true;
      manager?.stopObservingMutations();

      // AgentThought flushes its buffered final snapshot in the same update.
      // Wait for that DOM commit before doing the last bottom chase, while
      // preserving the user's detached position if they had scrolled up.
      if (manager) {
        void tick().then(() => {
          if (scrollManager !== manager) return;
          if (finishAtBottom) manager.scrollToBottom();
          updateFades();
        });
      }
    }
    wasComplete = completed;
  });

  let wasExpanded = false;
  $effect(() => {
    if (isExpanded !== wasExpanded) {
      wasExpanded = isExpanded;
      onExpandedChange?.(isExpanded);
    }
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  data-chat-progress="true"
  class="thinking-parent flex min-h-6 flex-col overflow-clip text-psx-foreground-secondary focus-visible:outline-offset-2"
  class:expanded={isExpanded}
  class:unexpanded={!isExpanded}
  style="contain: paint layout;"
>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -- role="button" is
       applied whenever tabindex is (both gated on hasContent); the checker
       can't see through the dynamic role. -->
  <div
    class="thinking-header sticky top-0 z-10 flex items-center"
    role={hasContent ? "button" : undefined}
    tabindex={hasContent ? 0 : undefined}
    aria-expanded={hasContent ? isExpanded : undefined}
    data-disclosure={hasContent ? "" : undefined}
    onclick={hasContent ? toggleExpanded : undefined}
    onkeydown={hasContent
      ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpanded();
          }
        }
      : undefined}
  >
    <div
      class="group flex h-6 items-center gap-1.5 rounded-md pr-2 pl-0 text-base text-psx-foreground-secondary transition-colors select-none"
      class:cursor-pointer={hasContent}
      class:hover:bg-psx-background-secondary={hasContent}
      class:hover:text-psx-foreground-primary={hasContent}
    >
      <span
        class="flex w-4 shrink-0 items-center justify-center text-[10px] leading-none opacity-60"
        >•••</span
      >
      <span>{complete ? "Thought" : "Thinking"}</span>
      {#if hasContent}
        <Icon
          name="chevron"
          class={["transition-all", !isExpanded && "-rotate-90 opacity-0 group-hover:opacity-100"]}
        />
      {/if}
    </div>
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="thinking-container relative overflow-x-hidden overscroll-contain pl-[22px] wrap-anywhere [scrollbar-gutter:stable]"
    class:h-0={displayMode === "Collapsed"}
    class:h-[130px]={displayMode === "Preview"}
    class:h-auto={displayMode === "Expanded"}
    class:max-h-[300px]={displayMode === "Expanded"}
    class:overflow-y-auto={displayMode === "Expanded"}
    class:overflow-y-hidden={displayMode !== "Expanded"}
    class:opacity-0={displayMode === "Collapsed"}
    class:border-t-0={displayMode === "Collapsed"}
    class:fade-out-top={showFadeTop}
    class:fade-out-bottom={showFadeBottom && displayMode === "Preview"}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    class:cursor-pointer={displayMode === "Preview"}
    bind:this={thinkingContainer}
    onclick={(e) => {
      e.preventDefault();
      e.stopPropagation();

      if (displayMode === "Preview") {
        displayMode = "Expanded";
      }
    }}
  >
    {#if isExpanded}
      <div
        class="origin-top-left pt-2 text-sm opacity-90"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      >
        {@render children?.()}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  @reference "#tailwind.css";

  /* No intrinsic min-width here: text without soft-wrap opportunities (long
     unbroken runs, NBSP-joined sentences) would size the block to its
     min-content width and overflow the transcript column (PE-2431). The block
     keeps the column width and such runs wrap via overflow-wrap instead. */
  .expanded {
    max-width: 100%;
  }
  .unexpanded {
    width: fit-content;
  }

  .thinking-parent {
    transition:
      width 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      height 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .fade-out-top {
    mask-image: linear-gradient(to bottom, transparent, black 32px);
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 32px);
  }

  .fade-out-bottom {
    mask-image: linear-gradient(to bottom, black, black calc(100% - 32px), transparent);
    -webkit-mask-image: linear-gradient(to bottom, black, black calc(100% - 32px), transparent);
  }

  .fade-out-top.fade-out-bottom {
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 32px,
      black calc(100% - 32px),
      transparent
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent,
      black 32px,
      black calc(100% - 32px),
      transparent
    );
  }
</style>
