__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { getMenus, getPrompt } from "../context/prompt.js";
  import { getMatchDecorationState } from "../../editor/index.js";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  export interface PushActionProps extends ActionBaseProps {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /** Canonical query to replace an abbreviated trigger match before opening the submenu. */
    completion?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  interface Props extends PushActionProps {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let { icon = "arrow-right", menu, completion, onPush, children, ...rest }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  onAction={handlePush}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
