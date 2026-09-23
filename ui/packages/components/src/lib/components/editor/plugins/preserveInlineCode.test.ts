import { history, undo } from "prosemirror-history";
import type { Node } from "prosemirror-model";
import { EditorState, Plugin, type Transaction } from "prosemirror-state";
import { describe, expect, it } from "vitest";
import { schema } from "../../prompt/editor/schema.js";
import { preserveInlineCode } from "./preserveInlineCode.js";

const codeMark = schema.marks["code"].create();

function paragraph(...content: Node[]) {
  return schema.node("doc", null, [schema.node("paragraph", null, content)]);
}

function stateWith(doc: Node, plugins: Plugin[] = []) {
  return EditorState.create({ schema, doc, plugins: [...plugins, preserveInlineCode] });
}

/** Prepends unmarked text once, so the repair has to be mapped through it. */
const prependOnce = new Plugin({
  appendTransaction(transactions, _oldState, newState) {
    if (!transactions.some((transaction) => transaction.docChanged)) return null;
    if (newState.doc.textContent.startsWith("XX ")) return null;
    return newState.tr.insert(1, schema.text("XX "));
  },
});

/** Text runs of the document, tagged with whether they carry the code mark. */
function runs(state: EditorState) {
  const result: Array<{ text: string; code: boolean }> = [];
  state.doc.descendants((node) => {
    if (node.isText) {
      result.push({
        text: node.text ?? "",
        code: schema.marks["code"].isInSet(node.marks) !== undefined,
      });
    }
  });
  return result;
}

describe("preserveInlineCode", () => {
  // PE-2486: WebKit applies a macOS text substitution inside the `<code>`
  // element but moves the text after the caret out of it, so ProseMirror reads
  // back a span that ends at the substitution.
  it("re-marks the tail of an inline code span that an edit dropped", () => {
    const state = stateWith(paragraph(schema.text("cod e", [codeMark])));

    const next = state.apply(
      state.tr.replaceWith(4, 6, [schema.text(".", [codeMark]), schema.text(" e")]),
    );

    expect(runs(next)).toEqual([{ text: "cod. e", code: true }]);
  });

  it("re-marks text an edit inserted without the mark", () => {
    const state = stateWith(paragraph(schema.text("code", [codeMark])));

    const next = state.apply(state.tr.replaceWith(3, 3, schema.text("XY")));

    expect(runs(next)).toEqual([{ text: "coXYde", code: true }]);
  });

  it("leaves text typed after a span outside the mark", () => {
    const state = stateWith(paragraph(schema.text("code", [codeMark])));

    const next = state.apply(state.tr.replaceWith(5, 5, schema.text(" plain")));

    expect(runs(next)).toEqual([
      { text: "code", code: true },
      { text: " plain", code: false },
    ]);
  });

  it("leaves text typed before a span outside the mark", () => {
    const state = stateWith(paragraph(schema.text("code", [codeMark])));

    const next = state.apply(state.tr.replaceWith(1, 1, schema.text("plain ")));

    expect(runs(next)).toEqual([
      { text: "plain ", code: false },
      { text: "code", code: true },
    ]);
  });

  it("does not extend the mark across a neighbouring span", () => {
    const state = stateWith(
      schema.node("doc", null, [
        schema.node("paragraph", null, [
          schema.text("code", [codeMark]),
          schema.text(" and "),
          schema.text("more", [codeMark]),
        ]),
      ]),
    );

    const next = state.apply(state.tr.replaceWith(3, 3, schema.text("X")));

    expect(runs(next)).toEqual([
      { text: "coXde", code: true },
      { text: " and ", code: false },
      { text: "more", code: true },
    ]);
  });

  it("leaves a replaced span alone", () => {
    const state = stateWith(paragraph(schema.text("code", [codeMark])));

    const next = state.apply(state.tr.replaceWith(1, 5, schema.text("plain")));

    expect(runs(next)).toEqual([{ text: "plain", code: false }]);
  });

  it("ignores documents without inline code", () => {
    const state = stateWith(paragraph(schema.text("plain text")));

    const next = state.apply(state.tr.replaceWith(6, 6, schema.text("er")));

    expect(runs(next)).toEqual([{ text: "plainer text", code: false }]);
  });

  it("repairs a run another plugin moved in the same dispatch", () => {
    const state = stateWith(paragraph(schema.text("cod e", [codeMark])), [prependOnce]);

    const next = state.apply(
      state.tr.replaceWith(4, 6, [schema.text(".", [codeMark]), schema.text(" e")]),
    );

    expect(runs(next)).toEqual([
      { text: "XX ", code: false },
      { text: "cod. e", code: true },
    ]);
  });

  it("undoes the edit and its repair together", () => {
    const state = stateWith(paragraph(schema.text("cod e", [codeMark])), [history()]);
    const edited = state.apply(
      state.tr.replaceWith(4, 6, [schema.text(".", [codeMark]), schema.text(" e")]),
    );

    let undone = edited;
    undo(edited, (tr: Transaction) => {
      undone = edited.apply(tr);
    });

    expect(runs(undone)).toEqual([{ text: "cod e", code: true }]);
  });

  it("leaves a deletion inside a span alone", () => {
    const state = stateWith(paragraph(schema.text("code", [codeMark])));

    const next = state.apply(state.tr.delete(3, 4));

    expect(runs(next)).toEqual([{ text: "coe", code: true }]);
  });

  it("leaves a chip inserted into a span unmarked", () => {
    const state = stateWith(paragraph(schema.text("code", [codeMark])));
    const chip = schema.node("chip", { label: "file.ts", value: "file.ts", clipboard: "file.ts" });

    const next = state.apply(state.tr.replaceWith(3, 3, chip));

    expect(runs(next)).toEqual([
      { text: "co", code: true },
      { text: "de", code: true },
    ]);
    expect(next.doc.textContent).toContain("file.ts");
  });

  it("does not repair across a paragraph split", () => {
    const state = stateWith(paragraph(schema.text("code", [codeMark])));

    // Splitting mid-span and unmarking the new block leaves two paragraphs, so
    // there is no single run to restore
    const tr = state.tr.split(3);
    const next = state.apply(
      tr.removeMark(tr.doc.content.size - 3, tr.doc.content.size - 1, codeMark.type),
    );

    expect(runs(next)).toEqual([
      { text: "co", code: true },
      { text: "de", code: false },
    ]);
  });
});
