<script lang="ts">
  import type { Except } from "type-fest";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
  import { getItem } from "../context/item.js";
  import type { Snippet } from "svelte";
  import { Checkbox } from "../../checkbox/index.js";

__POOL_SYNTHETIC_IMPORT_BASELINE__
    checked: boolean;
    onToggle?: (value: boolean) => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    children?: Snippet;
  }

  let {
    checked = $bindable(),
    prominence = "increased",
    onToggle,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    children,
    accessories: ownAccessories,
    ...rest
  }: Props = $props();

  const { select, disabled } = getItem();
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<BaseAction
  {...rest}
  {prominence}
  type="toggle"
__POOL_SYNTHETIC_IMPORT_BASELINE__
  onAction={() => {
    if (disabled) return;
    checked = !checked;
    onToggle?.(checked);
  }}
>
  {@render children?.()}
  {#snippet accessories()}
    {@render ownAccessories?.()}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {/snippet}
</BaseAction>
