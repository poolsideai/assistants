<script lang="ts">
  import { Collapsible, type CollapsibleContentProps } from "bits-ui";
__POOL_SYNTHETIC_IMPORT_BASELINE__

  type Props = CollapsibleContentProps & {
    /** Disable the height-reading reveal for bodies that mount expensive content. */
    animated?: boolean;
  };

  let { children, animated = true, ...rest }: Props = $props();
</script>

<Collapsible.Content forceMount {...rest}>
  {#snippet child({ props, open })}
    {#if open}
      {#if animated}
        <div {...props} transition:revealTransition>
          {@render children?.()}
        </div>
      {:else}
        <div {...props}>
          {@render children?.()}
        </div>
      {/if}
    {/if}
  {/snippet}
</Collapsible.Content>
