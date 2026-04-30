<script lang="ts">
  import Spinner from "../../spinner/Spinner.svelte";
  import { getItems, getMenus } from "../context/prompt.js";
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    children?: Snippet;
  }

  let { title, children }: Props = $props();

  const { search } = getMenus();

  const { items, filtered } = getItems();

  let shouldRender = $derived(!$search && ($items.size === 0 || $filtered?.items.size === 0));
</script>

{#if shouldRender}
  <div
    data-prompt-loading
    class="flex flex-col items-center justify-center gap-1 p-3 pt-3.5 text-psx-foreground-secondary"
    role="presentation"
  >
    <Spinner size={20} />
    {#if children}
      {@render children()}
    {:else if title}
      <span>{title}</span>
    {/if}
  </div>
{/if}
