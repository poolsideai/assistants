<script lang="ts" generics="T extends PropertyKey">
  import type { Snippet } from "svelte";
  import { getMenus } from "../context/prompt.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
  import type { Except } from "type-fest";

  interface Props extends Except<ActionBaseProps, "icon"> {
    value?: T;
    selected?: boolean;
    onSelect?: (value: T | undefined) => void;
    children?: Snippet;
  }

  let { value, selected, onSelect, children, ...rest }: Props = $props();

  const { pop } = getMenus();
</script>

<BaseAction
  {...rest}
  type="select"
  icon={selected ? "checked" : undefined}
  prominence="increased"
  onAction={() => {
    pop();
    onSelect?.(value);
  }}
>
  {@render children?.()}
</BaseAction>
