__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { getMenus, getPrompt } from "../context/prompt.js";
  import { getMatchDecorationState } from "../../editor/index.js";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /**
     * If true, leave the menu open after the action runs. Useful when the
     * action triggers async work whose progress or error should be visible
     * inline in the menu (e.g. an auth flow that takes time and may fail).
     * @default false
     */
    keepOpen?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let { onAction, keepOpen = false, children, ...rest }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const { editor } = getPrompt();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
