<script lang="ts">
  import { Checkbox, type CheckboxRootProps } from "bits-ui";
  import Icon from "../icon/Icon.svelte";
  import { getDisplay } from "../../providers/index.js";

  type Props = CheckboxRootProps;

  let { class: className, checked = $bindable(false), ...rest }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const { customUI } = getDisplay();
</script>

<Checkbox.Root
  bind:checked
  {...rest}
  class={[
    className,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ]}
>
  {#snippet children({ checked, indeterminate })}
    {#if indeterminate}
      <Icon name="minus" size={12} />
    {:else if checked}
      <Icon name="checked" size={12} />
    {/if}
  {/snippet}
</Checkbox.Root>
