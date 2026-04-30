import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { Plugin, PluginKey, type Command } from "prosemirror-state";
import { isAppleUser } from "../../../utils/platform.js";

export function undoHistory() {
  let isKeyboardEvent = false;

  const keymapUndo: Command = (state, dispatch, view) => {
    isKeyboardEvent = true;
    return undo(state, dispatch, view);
  };

  const keymapRedo: Command = (state, dispatch, view) => {
    isKeyboardEvent = true;
    return redo(state, dispatch, view);
  };

  const disableNativeUndo = new Plugin({
    key: new PluginKey("disable-native-undo"),
    view: (view) => {
      /**
       * The execCommand method is deprecated, but it's still widely used for undo/redo operations (e.g., macOS menubar undo/redo).
       * Modern browsers are moving toward the beforeinput event for these operations, which is handled by the prosemirror-history plugin.
       */
      function patchExecCommand() {
        const originalExecCommand = document.execCommand;

        document.execCommand = (id, ...args) => {
          if (view.hasFocus()) {
            if (isKeyboardEvent) {
              isKeyboardEvent = false;
              return true;
            }

            if (id === "undo") {
              return undo(view.state, view.dispatch, view);
            } else if (id === "redo") {
              return redo(view.state, view.dispatch, view);
            }
          }

          return originalExecCommand.call(document, id, ...args);
        };

        return () => {
          document.execCommand = originalExecCommand;
        };
      }

      const unpatch = patchExecCommand();

      return {
        destroy() {
          unpatch();
        },
      };
    },
  });

  return [
    disableNativeUndo,
    history({ newGroupDelay: 200 }),
    keymap({
      "Mod-z": keymapUndo,
      "Shift-Mod-z": keymapRedo,
      ...(!isAppleUser() ? { "Mod-y": keymapRedo } : {}),
    }),
  ];
}
