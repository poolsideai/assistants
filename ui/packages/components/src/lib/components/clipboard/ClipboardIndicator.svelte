<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../icon/Icon.svelte";
  import type { Snippet } from "svelte";
  import { getClipboardContext } from "./Clipboard.svelte";
  import { scale, type ScaleParams } from "svelte/transition";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    copied?: Snippet;
  }

  let { copied, children, ...rest }: Props = $props();

  const context = getClipboardContext();

  const params = {
    duration: context.duration / 4,
    start: 0.6,
  } satisfies ScaleParams;
</script>

{#if context.copied}
  {#if copied}
    {@render copied()}
  {:else}
    <Icon aria-hidden="true" name="checked" {...rest}>
      {#snippet child({ props, children })}
        <span in:scale|global={params} {...props}>
          {@render children()}
        </span>
      {/snippet}
    </Icon>
  {/if}
{:else if children}
  {@render children()}
{:else}
  <Icon aria-hidden="true" name="copy" {...rest}>
    {#snippet child({ props, children })}
      <span in:scale|global={params} {...props}>
        {@render children()}
      </span>
    {/snippet}
  </Icon>
{/if}
