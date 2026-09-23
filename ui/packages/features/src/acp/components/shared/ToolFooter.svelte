<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

{#if children}
  <div class="flex flex-col">
    {@render children?.()}
  </div>
{/if}
