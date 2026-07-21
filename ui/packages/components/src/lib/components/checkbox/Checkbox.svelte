<script lang="ts">
  import { Checkbox, type CheckboxRootProps } from "bits-ui";
  import Icon from "../icon/Icon.svelte";
  import { getDisplay } from "../../providers/index.js";

  type Props = CheckboxRootProps;

  let { class: className, checked = $bindable(false), ...rest }: Props = $props();

  const { customUI } = getDisplay();
</script>

<Checkbox.Root
  bind:checked
  {...rest}
  class={[
    className,
    customUI
      ? "flex size-4 shrink-0 appearance-none items-center justify-center rounded-md border border-black/10 bg-transparent text-psx-checkbox-foreground dark:border-white/10"
      : "flex size-3 shrink-0 appearance-none items-center justify-center rounded-[3px] border border-psx-checkbox-border bg-psx-checkbox-background text-psx-checkbox-foreground",
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
