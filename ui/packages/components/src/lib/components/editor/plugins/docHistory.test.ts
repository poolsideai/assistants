import type { Node } from "prosemirror-model";
import { EditorState, TextSelection, type Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { schema } from "../../prompt/editor/schema.js";
import { docHistory, loadDocsMeta, restoreNextDoc, restorePreviousDoc } from "./docHistory.js";

describe("docHistory", () => {
  it("keeps navigating older prompts after reloading identical history", () => {
    const stateRef = createStateRef();
    const view = createView(stateRef);

    dispatch(
      stateRef,
      loadDocsMeta(stateRef.current.tr, [createDoc("first"), createDoc("second")]),
    );
    setSelectionAtStart(stateRef);

    expect(runCommand(stateRef, view, restorePreviousDoc)).toBe(true);
    expect(stateRef.current.doc.textContent).toBe("second");

    dispatch(
      stateRef,
      loadDocsMeta(stateRef.current.tr, [createDoc("first"), createDoc("second")]),
    );
    setSelectionAtStart(stateRef);

    expect(runCommand(stateRef, view, restorePreviousDoc)).toBe(true);
    expect(stateRef.current.doc.textContent).toBe("first");
  });

  it("keeps the cleared prompt state after reloading identical history", () => {
    const stateRef = createStateRef();
    const view = createView(stateRef);

    dispatch(
      stateRef,
      loadDocsMeta(stateRef.current.tr, [createDoc("first"), createDoc("second")]),
    );
    setSelectionAtStart(stateRef);

    expect(runCommand(stateRef, view, restorePreviousDoc)).toBe(true);
    expect(stateRef.current.doc.textContent).toBe("second");

    dispatch(
      stateRef,
      loadDocsMeta(stateRef.current.tr, [createDoc("first"), createDoc("second")]),
    );
    setSelectionAtEnd(stateRef);

    expect(runCommand(stateRef, view, restoreNextDoc)).toBe(true);
    expect(stateRef.current.doc.textContent).toBe("");
  });
});

function createStateRef() {
  return {
    current: EditorState.create({
      schema,
      plugins: [docHistory()],
    }),
  };
}

function createDoc(text: string): Node {
  return schema.node("doc", null, [
    schema.node("paragraph", null, text ? [schema.text(text)] : []),
  ]);
}

function createView(stateRef: { current: EditorState }) {
  return {
    get state() {
      return stateRef.current;
    },
    coordsAtPos: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  } as unknown as EditorView;
}

function dispatch(stateRef: { current: EditorState }, tr: Transaction) {
  stateRef.current = stateRef.current.applyTransaction(tr).state;
}

function runCommand(
  stateRef: { current: EditorState },
  view: EditorView,
  command: typeof restorePreviousDoc | typeof restoreNextDoc,
) {
  return command(
    stateRef.current,
    (tr) => {
      dispatch(stateRef, tr);
    },
    view,
  );
}

function setSelectionAtStart(stateRef: { current: EditorState }) {
  dispatch(
    stateRef,
    stateRef.current.tr.setSelection(TextSelection.create(stateRef.current.doc, 1)),
  );
}

function setSelectionAtEnd(stateRef: { current: EditorState }) {
  dispatch(
    stateRef,
    stateRef.current.tr.setSelection(
      TextSelection.create(stateRef.current.doc, stateRef.current.doc.content.size - 1),
    ),
  );
}
