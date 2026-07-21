<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    title?: string;
    description?: string;
    required: boolean;
    children: Snippet;
  }

  const { name, title, description, required, children }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
  <label for={name} class="text-psx-foreground-primary text-sm font-medium">
    {title ?? description}
    {#if required}<span class="text-psx-error-foreground">*</span>{/if}
  </label>
  {#if title}
    <div class="text-psx-foreground-secondary text-xs">{description}</div>
  {/if}
  {@render children()}
</div>
