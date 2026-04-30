<script lang="ts">
  import type { Snippet } from "svelte";
  import { getMenus } from "../context/prompt.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";

  interface Props extends ActionBaseProps {
    onPop?: () => void;
    children?: Snippet;
  }

  let { onPop, children, ...rest }: Props = $props();

  const { pop } = getMenus();
</script>

<BaseAction
  icon="enter"
  {...rest}
  type="pop"
  onAction={() => {
    pop();
    onPop?.();
  }}
>
  {@render children?.()}
</BaseAction>
