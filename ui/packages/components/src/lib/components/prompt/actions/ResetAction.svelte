<script lang="ts">
  import type { Snippet } from "svelte";
  import { getMenus, getPrompt } from "../context/prompt.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";

  interface Props extends ActionBaseProps {
    onReset?: () => void;
    children?: Snippet;
  }

  let { onReset, children, ...rest }: Props = $props();

  const { reset } = getPrompt();
  const { close } = getMenus();
</script>

<BaseAction
  icon="enter"
  {...rest}
  type="reset"
  onAction={() => {
    reset();
    close();
    onReset?.();
  }}
>
  {@render children?.()}
</BaseAction>
