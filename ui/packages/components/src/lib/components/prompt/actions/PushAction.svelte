<script lang="ts">
  import type { Snippet } from "svelte";
  import { getMenus, getPrompt } from "../context/prompt.js";
  import { getMatchDecorationState } from "../../editor/index.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
  import { getItem } from "../context/item.js";

  export interface PushActionProps extends ActionBaseProps {
    menu: string;
    /** Canonical query to replace an abbreviated trigger match before opening the submenu. */
    completion?: string;
    onPush?: () => void;
  }

  interface Props extends PushActionProps {
    children?: Snippet;
  }

  let { icon = "arrow-right", menu, completion, onPush, children, ...rest }: Props = $props();

  const { disabled } = getItem();
  const { push } = getMenus();
  const { editor } = getPrompt();

  function handlePush(): void {
    const baseQuery = completion ? `${completion.trimEnd()} ` : undefined;
    let completedMatch = false;

    if (baseQuery && $editor) {
      $editor.executeCommand((state, dispatch) => {
        const decoration = getMatchDecorationState(state);
        if (decoration?.status !== "match") return true;

        completedMatch = true;
        push(menu, baseQuery);
        dispatch?.(
          state.tr.insertText(
            `${decoration.trigger}${baseQuery}`,
            decoration.range.from,
            decoration.range.to,
          ),
        );
        return true;
      });
    }

    if (!completedMatch) push(menu);
    onPush?.();
  }
</script>

<BaseAction
  prominence={disabled ? undefined : "increased"}
  {...rest}
  {icon}
  type="push"
  onAction={handlePush}
>
  {@render children?.()}
</BaseAction>
