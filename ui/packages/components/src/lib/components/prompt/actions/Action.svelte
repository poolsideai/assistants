<script lang="ts">
  import type { Snippet } from "svelte";
  import { getMenus, getPrompt } from "../context/prompt.js";
  import { getMatchDecorationState } from "../../editor/index.js";
  import BaseAction, { type ActionProps } from "./BaseAction.svelte";
  import type { Except } from "type-fest";

  interface Props extends Except<ActionProps, "type"> {
    /**
     * If true, leave the menu open after the action runs. Useful when the
     * action triggers async work whose progress or error should be visible
     * inline in the menu (e.g. an auth flow that takes time and may fail).
     * @default false
     */
    keepOpen?: boolean;
    children?: Snippet;
  }

  let { onAction, keepOpen = false, children, ...rest }: Props = $props();

  const { editor } = getPrompt();
  const { close } = getMenus();

  function handleAction(e: KeyboardEvent | MouseEvent) {
    if (!keepOpen) {
      // Remove the trigger text that opened the menu (e.g. "/model" or
      // "/modelgpt" after filtering a pushed submenu) so it doesn't linger in
      // the prompt once the action has run.
      $editor?.executeCommand((state, dispatch) => {
        const decoration = getMatchDecorationState(state);
        if (decoration?.status === "match") {
          dispatch?.(state.tr.delete(decoration.range.from, decoration.range.to));
        }
        return true;
      });
      close();
    }
    onAction?.(e);
  }
</script>

<BaseAction {...rest} type="action" icon="enter" onAction={handleAction}>
  {@render children?.()}
</BaseAction>
