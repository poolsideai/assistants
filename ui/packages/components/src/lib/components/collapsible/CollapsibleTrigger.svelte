<script lang="ts">
  import { Collapsible, type CollapsibleTriggerProps } from "bits-ui";
  import type { ButtonProps, ButtonVariants } from "../button/Button.svelte";
  import { Button } from "../button/index.js";

  type Props = ButtonProps & CollapsibleTriggerProps;

  let { child: _child, children, class: className, appearance, shape, ...rest }: Props = $props();

  let variants = $derived<ButtonVariants>({ appearance, shape });
</script>

<!-- data-disclosure marks this as an inline-content disclosure (as opposed to
     a floating menu/combobox trigger, which also carries aria-expanded): the
     chat ScrollManager keys off it to keep a clicked-open row stationary
     instead of chasing the bottom. -->
<Collapsible.Trigger {...rest} data-disclosure class={[className, "group"]}>
  {#snippet child({ props })}
    {#if _child}
      {@render _child({ props: { ...props, ...rest }, ...variants })}
    {:else}
      <Button {...props} {...variants}>
        {@render children?.()}
      </Button>
    {/if}
  {/snippet}
</Collapsible.Trigger>
