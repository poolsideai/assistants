<script lang="ts">
  import Icon, { type IconName, type IconProps } from "../../icon/index.js";
  import { getItems } from "../context/prompt.js";
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    icon?: IconProps | IconName | Snippet;
    children?: Snippet;
    forceMount?: boolean;
  }

  let { title, icon, forceMount, children }: Props = $props();

  const { items, filtered } = getItems();

  let shouldRender = $derived(forceMount || $items.size === 0 || $filtered?.items.size === 0);
</script>

{#if shouldRender}
  <div
    data-prompt-empty
    class="flex flex-col items-center justify-center gap-1 p-3 pt-3.5 text-psx-foreground-secondary"
    role="presentation"
  >
    {#if typeof icon === "function"}
      {@render icon()}
    {:else if icon}
      <Icon {...typeof icon === "string" ? { name: icon } : icon} class="text-3xl opacity-50" />
    {/if}
    {#if children}
      {@render children()}
    {:else if title}
      <span>{title}</span>
    {/if}
  </div>
{/if}

<style lang="postcss">
  @reference "#tailwind.css";
  :global(body.web-app) [data-prompt-empty] {
    @apply text-(--color-mono-900);
  }
</style>
