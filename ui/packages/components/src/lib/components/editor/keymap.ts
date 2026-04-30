import {
  chainCommands,
  createParagraphNear,
  deleteSelection,
  exitCode,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  newlineInCode,
  selectAll,
  selectNodeBackward,
  selectNodeForward,
  selectTextblockEnd,
  selectTextblockStart,
  splitBlock,
} from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import type { ContentMatch } from "prosemirror-model";
import { Plugin, Selection, type Command } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { isAppleUser, isMac } from "../../utils/platform.js";

function defaultBlockAt(match: ContentMatch) {
  for (let i = 0; i < match.edgeCount; i++) {
    const { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) return type;
  }
  return;
}

/**
 * When the selection is in a node with a truthy
 * [`code`](#model.NodeSpec.code) property in its spec, create a
 * default block above the code block, and move the cursor there.
 */
export const exitCodeAbove: Command = (state, dispatch) => {
  const { $head, $anchor } = state.selection;
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) return false;
  const above = $head.node(-1);
  const before = $head.index(-1);
  const type = defaultBlockAt(above.contentMatchAt(before));
  if (!type || !above.canReplaceWith(before, before, type)) return false;
  if (dispatch) {
    const pos = $head.before();
    const tr = state.tr.replaceWith(pos, pos, type.createAndFill()!);
    tr.setSelection(Selection.near(tr.doc.resolve(pos + 1), 1));
    dispatch(tr.scrollIntoView());
  }
  return true;
};

/**
 * When the selection is in a node with a truthy
 * [`code`](#model.NodeSpec.code) property in its spec, delete the
 * code block if it's empty or if the cursor is at the start of the document.
 */
const deleteCode: Command = (state, dispatch) => {
  const { selection, schema } = state;
  const { $anchor, $from, empty } = selection;
  if (!dispatch || !empty || $anchor.parent.type !== schema.nodes.code_block) {
    return false;
  }

  if ($anchor.pos === 1 || $anchor.parent.content.size === 0) {
    const tr = state.tr.delete($from.before(), $from.after());
    dispatch(tr);
    return true;
  }

  return false;
};

/**
 * When the cursor is on the last line of a code block that ends the document,
 * create a paragraph below and move there. Bound in the prompt editor's keymap
 * after history navigation, not in baseKeymap, so ArrowDown on a clean restored
 * prompt still steps through history first.
 */
export const exitTrailingCodeBlockBelow: Command = (state, dispatch) => {
  const { selection, schema } = state;
  const { $anchor, $from, empty } = selection;

  if (!dispatch || !empty || $anchor.parent.type !== schema.nodes.code_block) return false;

  // Only when on the last line of the code block
  const textAfter = $anchor.parent.textBetween($anchor.parentOffset, $anchor.parent.content.size);
  if (textAfter.includes("\n")) return false;

  // Check if code block is at the end of the document
  const pos = $from.after();
  if (pos !== state.doc.content.size) return false;

  const tr = state.tr.replaceWith(pos, pos, schema.nodes.paragraph.createAndFill()!);
  tr.setSelection(Selection.near(tr.doc.resolve(pos + 1), 1));
  dispatch(tr.scrollIntoView());
  return true;
};

const backspace = chainCommands(deleteSelection, joinBackward, selectNodeBackward, deleteCode);
const del = chainCommands(deleteSelection, joinForward, selectNodeForward);

export function shouldUseNativeMacWordNavigation(event: KeyboardEvent): boolean {
  return (
    isMac() &&
    event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    (event.key === "ArrowLeft" || event.key === "ArrowRight")
  );
}

function moveNativeMacWordNavigation(view: EditorView, event: KeyboardEvent): boolean {
  if (!shouldUseNativeMacWordNavigation(event)) return false;
  const selection = view.dom.ownerDocument.getSelection();
  if (!selection?.modify) return false;

  const alter = event.shiftKey ? "extend" : "move";
  const direction = event.key === "ArrowLeft" ? "backward" : "forward";
  selection.modify(alter, direction, "word");

  // Selection.modify updates the DOM selection; flush ProseMirror's observer so
  // editor state catches up before ProseMirror handles the next key event.
  (view as unknown as { domObserver?: { flush(): void } }).domObserver?.flush();
  return true;
}

export const nativeMacWordNavigation = new Plugin({
  props: {
    handleKeyDown: (view, event) => {
      return moveNativeMacWordNavigation(view, event);
    },
  },
});

const base = {
  "Shift-Enter": chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
  "Mod-Shift-Enter": exitCodeAbove,
  "Mod-Enter": exitCode,
  ArrowLeft: (state, dispatch) => {
    const { selection, schema } = state;
    const { $anchor, $from, empty } = selection;

    if (!dispatch || !empty || $anchor.parent.type !== schema.nodes["code_block"]) return false;

    // Check if cursor is at the beginning of the code block
    if ($anchor.parentOffset !== 0) return false;

    // Check if code block is at the start of the document
    const pos = $from.before();
    if (pos !== 0) return false;

    const tr = state.tr.replaceWith(pos, pos, schema.nodes.paragraph.createAndFill()!);
    tr.setSelection(Selection.near(tr.doc.resolve(pos + 1), 1));
    dispatch(tr.scrollIntoView());
    return true;
  },
  ArrowRight: (state, dispatch) => {
    const { selection, schema } = state;
    const { $anchor, $from, empty } = selection;

    // Only handle when selection is empty and in a code block
    if (!dispatch || !empty || $anchor.parent.type !== schema.nodes.code_block) return false;

    // Check if cursor is at the end of the code block
    if ($anchor.parentOffset !== $anchor.parent.content.size) return false;

    // Check if code block is at the end of the document
    const pos = $from.after();
    if (pos !== state.doc.content.size) return false;

    const tr = state.tr.replaceWith(pos, pos, schema.nodes.paragraph.createAndFill()!);
    tr.setSelection(Selection.near(tr.doc.resolve(pos + 1), 1));
    dispatch(tr.scrollIntoView());
    return true;
  },
  Backspace: backspace,
  "Mod-Backspace": backspace,
  "Shift-Backspace": backspace,
  Delete: del,
  "Mod-Delete": del,
  "Mod-a": selectAll,
} as const satisfies Record<string, Command>;

const bindings = isAppleUser()
  ? {
      ...base,
      "Ctrl-h": base["Backspace"],
      "Alt-Backspace": base["Mod-Backspace"],
      "Ctrl-d": base["Delete"],
      "Ctrl-Alt-Backspace": base["Mod-Delete"],
      "Alt-Delete": base["Mod-Delete"],
      "Alt-d": base["Mod-Delete"],
      "Ctrl-a": selectTextblockStart,
      "Ctrl-e": selectTextblockEnd,
    }
  : base;

export const baseKeymap = keymap(bindings);
