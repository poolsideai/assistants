<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    active: boolean;
    source: boolean;
    style?: string;
    motion?: "transform" | "section";
    children: Snippet;
  }

  let { active, source, style, motion = "transform", children }: Props = $props();
</script>

<div
  data-reorderable-motion-content
  class={[
    "relative",
    active && motion === "section"
      ? "transition-[opacity,transform] duration-[180ms] ease-out"
      : "",
    active && motion === "transform"
      ? "transition-[opacity,transform] duration-[120ms] ease-out will-change-transform"
      : "",
    source ? "pointer-events-none opacity-0" : "",
  ]}
  {style}
>
  {@render children()}
</div>
