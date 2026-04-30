import { Plugin } from "prosemirror-state";

/**
 * Plugin to clear stored marks after content deletion to prevent marks from persisting
 * when all content is selected and deleted (e.g., cmd+a followed by delete/backspace).
 *
 * This addresses the issue where backtick/code marks remain active after clearing
 * the editor content, causing new typed text to appear inside code marks.
 */
export const clearStoredMarksPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    // Only process if there are actual changes
    if (!transactions.some((tr) => tr.docChanged)) return null;

    // Check if the document is now empty or contains only a single empty paragraph
    const isEmpty =
      newState.doc.content.size === 0 ||
      (newState.doc.content.size === 2 && // doc + empty paragraph
        newState.doc.firstChild?.type.name === "paragraph" &&
        newState.doc.firstChild.content.size === 0);

    // If document is empty and there are stored marks, clear them
    if (isEmpty && newState.storedMarks && newState.storedMarks.length > 0) {
      const tr = newState.tr;
      tr.setStoredMarks([]);
      return tr;
    }

    return null;
  },
});
