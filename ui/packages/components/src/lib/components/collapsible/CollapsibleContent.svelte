__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type Props = CollapsibleContentProps & {
    /** Disable the height-reading reveal for bodies that mount expensive content. */
    animated?: boolean;
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let { children, animated = true, ...rest }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {#if animated}
        <div {...props} transition:revealTransition>
          {@render children?.()}
        </div>
      {:else}
        <div {...props}>
          {@render children?.()}
        </div>
      {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
