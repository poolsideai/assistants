<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { getClipboardContext } from "./Clipboard.svelte";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    copied?: Snippet;
  }

  let { copied, children, ...rest }: Props = $props();

  const context = getClipboardContext();
</script>

<span {...rest}>
  {#if context.copied}
    {#if copied}
      {@render copied()}
    {:else}
      Copied
    {/if}
  {:else if children}
    {@render children()}
  {:else}
    Copy
  {/if}
</span>
