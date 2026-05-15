<script lang="ts">
  import type { Except } from "type-fest";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
  import { getItem } from "../context/item.js";
  import type { Snippet } from "svelte";
  import { Checkbox } from "../../checkbox/index.js";

  interface Props extends Except<ActionBaseProps, "icon" | "leading"> {
    checked: boolean;
    onToggle?: (value: boolean) => void;
    /**
     * Which side the checkbox renders on.
     * @default "trailing"
     */
    edge?: "leading" | "trailing";
    children?: Snippet;
  }

  let {
    checked = $bindable(),
    prominence = "increased",
    onToggle,
    edge = "trailing",
    children,
    accessories: ownAccessories,
    ...rest
  }: Props = $props();

  const { select, disabled } = getItem();
</script>

{#snippet checkbox()}
  <Checkbox
    {disabled}
    bind:checked
    onCheckedChange={onToggle}
    onclick={(e) => {
      e.stopPropagation();
      select();
    }}
  />
{/snippet}

{#snippet leadingCheckbox()}
  <span class="inline-flex size-[1.2em] shrink-0 items-center justify-center self-center">
    {@render checkbox()}
  </span>
{/snippet}

<BaseAction
  {...rest}
  {prominence}
  type="toggle"
  leading={edge === "leading" ? leadingCheckbox : undefined}
  onAction={() => {
    if (disabled) return;
    checked = !checked;
    onToggle?.(checked);
  }}
>
  {@render children?.()}
  {#snippet accessories()}
    {@render ownAccessories?.()}
    {#if edge === "trailing"}
      {@render checkbox()}
    {/if}
  {/snippet}
</BaseAction>
