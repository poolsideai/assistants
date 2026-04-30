<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    label?: string;
    style?: "outline" | "plain";
  }

  let { label, style = "plain", children, ...rest }: Props = $props();
</script>

{#if children || label}
  <span
    {...rest}
    title={label ? label : ""}
    class:outlined={style === "outline"}
    class:plain={style === "plain"}
  >
    {#if label}
      {label}
    {:else}
      {@render children?.()}
    {/if}
  </span>
{/if}

<style lang="postcss">
  @reference "#tailwind.css";
  span {
    word-spacing: -0.1em;
    @apply min-w-5 truncate text-center text-[90%] tracking-tight whitespace-nowrap;
  }

  .plain {
    @apply opacity-60;
  }

  .outlined {
    @apply rounded-sm border border-psx-input-border bg-psx-panel px-1;
  }
</style>
