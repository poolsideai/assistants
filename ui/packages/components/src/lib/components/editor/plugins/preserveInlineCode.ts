import type { MarkType, Node } from "prosemirror-model";
import { Plugin, type Transaction } from "prosemirror-state";

interface Range {
  from: number;
  to: number;
}

/**
 * Keep an inline code span whole when it is edited from the inside.
 *
 * ProseMirror takes the marks of a typed change from the DOM the browser
 * produced, so an editing operation that restructures the `<code>` element can
 * drop the mark from text that was inside it. WebKit does that for macOS text
 * substitutions (smart dashes, double-space to full stop) applied mid-span:
 * the replacement lands inside the element but the tail after the caret is
 * moved out of it, so `code` silently becomes `cod.` followed by unformatted
 * ` e` (PE-2486).
 *
 * Nothing about the edit asked for the span to end there, so re-apply the mark
 * across the run that was being edited. Edits that start at a run boundary are
 * left alone — that is how you deliberately type your way out of inline code.
 */
export const preserveInlineCode = new Plugin({
  appendTransaction(transactions, _oldState, newState) {
    const codeType = newState.schema.marks["code"];
    if (!codeType) return null;

    const ranges: Range[] = [];
    transactions.forEach((transaction, index) => {
      const range = editedCodeRun(transaction, codeType);
      if (!range) return;

      // Later transactions in the same dispatch move the run again
      let { from, to } = range;
      for (let next = index + 1; next < transactions.length; next++) {
        from = transactions[next].mapping.map(from, 1);
        to = transactions[next].mapping.map(to, -1);
      }
      if (to > from) ranges.push({ from, to });
    });

    const tr = newState.tr;
    let repaired = false;
    for (const { from, to } of ranges) {
      if (!isSplitRun(newState.doc, from, to, codeType)) continue;
      tr.addMark(from, to, codeType.create());
      repaired = true;
    }

    return repaired ? tr : null;
  },
});

/**
 * The inline code run a transaction edited from the inside, in the coordinates
 * of the document the transaction produced. Null when the transaction changed
 * nothing, started outside a run, or replaced the run itself.
 */
function editedCodeRun(transaction: Transaction, codeType: MarkType): Range | null {
  if (!transaction.docChanged) return null;

  // Only the first step is considered: browser-driven text input arrives as a
  // single replacement, and later steps of a composite change have no position
  // in the pre-transaction document.
  const step = transaction.steps[0];
  if (!step) return null;

  let changeStart = -1;
  step.getMap().forEach((oldStart) => {
    if (changeStart === -1) changeStart = oldStart;
  });
  if (changeStart === -1) return null;

  const run = codeRunAt(transaction.before, changeStart, codeType);
  if (!run) return null;

  // Mapping the run start after insertions keeps text typed at the start
  // outside the mark; mapping the run end before them keeps text typed at the
  // end outside too, while still following content that replaced part of the
  // run.
  const from = transaction.mapping.map(run.from, 1);
  const to = transaction.mapping.map(run.to, -1);
  return to > from ? { from, to } : null;
}

/** The contiguous code-marked run strictly containing `pos`, if there is one. */
function codeRunAt(doc: Node, pos: number, codeType: MarkType): Range | null {
  const $pos = doc.resolve(pos);
  const parent = $pos.parent;
  if (!parent.isTextblock) return null;

  const parentStart = $pos.start();
  let from = -1;
  let to = -1;
  let offset = 0;

  for (let index = 0; index < parent.childCount; index++) {
    const child = parent.child(index);
    const childStart = parentStart + offset;
    offset += child.nodeSize;

    if (codeType.isInSet(child.marks)) {
      if (from === -1) from = childStart;
      to = childStart + child.nodeSize;
      continue;
    }

    if (from !== -1 && pos > from && pos < to) return { from, to };
    from = -1;
    to = -1;
  }

  return from !== -1 && pos > from && pos < to ? { from, to } : null;
}

/** True when the range spans one textblock of text that lost the code mark. */
function isSplitRun(doc: Node, from: number, to: number, codeType: MarkType): boolean {
  const $from = doc.resolve(from);
  const $to = doc.resolve(to);
  if (!$from.sameParent($to)) return false;

  let split = false;
  let repairable = true;
  doc.nodesBetween(from, to, (node) => {
    if (node.isText) {
      if (!codeType.isInSet(node.marks)) split = true;
      return false;
    }
    // A chip dropped into the middle of a span is content of its own, not a
    // formatting loss to undo
    if (node.isInline) repairable = false;
    return repairable;
  });
  return split && repairable;
}
