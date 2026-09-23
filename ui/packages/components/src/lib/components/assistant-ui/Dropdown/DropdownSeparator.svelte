<script lang="ts">
  import { getContext } from "svelte";
  import { melt, createDropdownMenu } from "@melt-ui/svelte";

  interface Props {
    label?: string;
    index: number;
  }

  let { label, index }: Props = $props();

  const {
    elements: { separator },
  } = getContext<ReturnType<typeof createDropdownMenu>>("dropdown");
</script>

{#if index}
  <div use:melt={$separator} class="menu-separator"></div>
{/if}
{#if label}
  <div class="px-2 py-1 text-xs font-medium text-psx-foreground-secondary">
    {label}
  </div>
{/if}
