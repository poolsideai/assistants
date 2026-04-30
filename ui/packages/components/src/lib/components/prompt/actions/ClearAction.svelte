<script lang="ts">
  import type { Snippet } from "svelte";
  import { getMenus, getPrompt } from "../context/prompt.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";

  interface Props extends ActionBaseProps {
    onClear?: () => void;
    behavior?: "always" | "when-focused";
__POOL_SYNTHETIC_IMPORT_BASELINE__
    children?: Snippet;
  }

  let { onClear, children, behavior = "when-focused", disabled = false, ...rest }: Props = $props();

  const { close } = getMenus();
  const { editor, clear } = getPrompt();

  const shouldClear = $derived(
    behavior === "always" || (behavior === "when-focused" && $editor?.hasFocus()),
  );
</script>

<BaseAction
  type="clear"
  icon="enter"
  {...rest}
  onAction={() => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (shouldClear) clear();
    close();
    onClear?.();
  }}
>
  {@render children?.()}
</BaseAction>
