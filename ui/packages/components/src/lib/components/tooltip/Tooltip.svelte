<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import type { Snippet } from "svelte";

  interface Props {
    text: string;
    show: boolean;
    children: Snippet;
  }

  const { text, show, children }: Props = $props();
  let isVisible = $state(false);
  let hoverTimeout: ReturnType<typeof setTimeout> | null = $state(null);

  function handleMouseEnter() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      isVisible = true;
    }, 600);
  }

  function handleMouseLeave() {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    isVisible = false;
  }

  $effect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="contents" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
  {@render children()}
  {#if show && isVisible}
    <div
      class="bg-alpha-500 text-mono-000 dark:text-mono-900 pointer-events-none absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 rounded-lg px-2 py-1 text-sm whitespace-nowrap shadow-lg backdrop-blur-md backdrop-blur-sm sm:block"
      in:fly={{ x: -8, duration: 300, easing: cubicOut }}
      out:fly={{ x: -8, duration: 200, easing: cubicOut }}
    >
      {text}
    </div>
  {/if}
</div>
