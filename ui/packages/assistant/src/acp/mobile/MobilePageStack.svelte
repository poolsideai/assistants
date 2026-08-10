<script lang="ts">
  import type { Snippet } from "svelte";
  import { cubicOut } from "svelte/easing";

  // Stack-style page container for the mobile shell: pushed pages slide in
  // from the right over the parked page, popped pages slide back out — the
  // familiar native navigation feel, without swipe gestures (animation only;
  // gesture-driven back has burned us before with scroll/edge conflicts).
  interface Props {
    /** Identity of the visible page; changing it runs the transition. */
    page: string;
    /** Stack depth of the visible page: deeper = push, shallower = pop. */
    depth: number;
    /** Renders the given page; parameterized so an outgoing page keeps its content. */
    children: Snippet<[string]>;
  }

  let { page, depth, children }: Props = $props();

  const DURATION_MS = 280;
  const PARKED_SHIFT = 28; // % the covered page slides toward, iOS-style.

  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Transition functions read `direction` when they fire; $effect.pre updates
  // it before the {#key} block swaps the DOM.
  let direction: 1 | -1 = 1;
  let previousDepth = depth;
  $effect.pre(() => {
    void page;
    direction = depth >= previousDepth ? 1 : -1;
    previousDepth = depth;
  });

  function pageIn(_node: Element) {
    const push = direction > 0;
    return {
      duration: reduceMotion ? 0 : DURATION_MS,
      easing: cubicOut,
      css: (_t: number, u: number) =>
        push
          ? `transform: translateX(${u * 100}%); z-index: 2;`
          : `transform: translateX(${-u * PARKED_SHIFT}%); z-index: 1;`,
    };
  }

  function pageOut(_node: Element) {
    const push = direction > 0;
    return {
      duration: reduceMotion ? 0 : DURATION_MS,
      easing: cubicOut,
      css: (_t: number, u: number) =>
        push
          ? `transform: translateX(${-u * PARKED_SHIFT}%); z-index: 1;`
          : `transform: translateX(${u * 100}%); z-index: 2;`,
    };
  }
</script>

<div class="mobile-page-stack">
  {#key page}
    <div class="mobile-page" in:pageIn out:pageOut>
      {@render children(page)}
    </div>
  {/key}
</div>

<style>
  .mobile-page-stack {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .mobile-page {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--psx-editor-background);
    will-change: transform;
  }
</style>
