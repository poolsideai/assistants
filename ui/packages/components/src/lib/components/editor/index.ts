export type { Command, EditorState, Transaction } from "prosemirror-state";
export { deleteAll } from "./commands/deleteAll.js";
export { default as Editor } from "./Editor.svelte";
export type { EditorProps } from "./Editor.svelte";
export { baseKeymap, exitTrailingCodeBlockBelow, nativeMacWordNavigation } from "./keymap.js";
export { BaseNodeView } from "./nodes/BaseNodeView.js";
export { clearStoredMarksPlugin } from "./plugins/clearStoredMarks.js";
export { code } from "./plugins/code.js";
export {
  docHistory,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  restoreNextDoc,
  restorePreviousDoc,
  saveDocMeta,
} from "./plugins/docHistory.js";
export {
  closeMatch,
  getMatchDecorationState,
  matchDecoration,
  tryMatch,
  type MatchDecorationRule,
} from "./plugins/matchDecoration.js";
export { nodeObserver } from "./plugins/nodeObserver.js";
export { selectionDecoration } from "./plugins/selectionDecoration.js";
export { undoHistory } from "./plugins/undoHistory.js";
export type { NodeAttrs } from "./types/node.js";
