import { chainCommands } from "prosemirror-commands";
import { EditorState, TextSelection, type Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { describe, expect, it, vi } from "vitest";
import { schema } from "../prompt/editor/schema.js";
import { exitTrailingCodeBlockBelow, shouldUseNativeMacWordNavigation } from "./keymap.js";
import {
  docHistory,
  loadDocsMeta,
  restoreNextDoc,
  restorePreviousDoc,
} from "./plugins/docHistory.js";

vi.mock("../../utils/platform.js", () => ({
  isAppleUser: () => true,
  isMac: () => true,
}));

function keydown(init: Partial<KeyboardEvent> & { key: string }): KeyboardEvent {
  return {
    key: init.key,
    altKey: init.altKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    metaKey: init.metaKey ?? false,
    shiftKey: init.shiftKey ?? false,
  } as KeyboardEvent;
}

describe("exitTrailingCodeBlockBelow", () => {
  function createCodeBlockState(text: string, cursorOffset: number, dirty = true) {
    const doc = schema.node("doc", null, [
      schema.nodes.code_block.create(null, text ? schema.text(text) : null),
    ]);
    let state = EditorState.create({
      schema,
      doc,
      selection: TextSelection.create(doc, 1 + cursorOffset),
      plugins: [docHistory()],
    });
    if (dirty) {
      // Any doc-changing transaction marks the history plugin dirty, like typing would
      state = state.apply(state.tr.insertText(" ", 1).delete(1, 2));
    }
    return {
      get state() {
        return state;
      },
      dispatch(tr: Transaction) {
        state = state.apply(tr);
      },
    };
  }

  function createView(ref: { state: EditorState }) {
    return {
      get state() {
        return ref.state;
      },
      coordsAtPos: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    } as unknown as EditorView;
  }

  it("creates a paragraph below when on the last line of a trailing code block", () => {
    const text = "const value = 1;";
    const ref = createCodeBlockState(text, text.length);

    expect(exitTrailingCodeBlockBelow(ref.state, ref.dispatch)).toBe(true);
    expect(ref.state.doc.childCount).toBe(2);
    expect(ref.state.doc.child(1).type.name).toBe("paragraph");
    expect(ref.state.selection.$from.parent).toBe(ref.state.doc.child(1));
  });

  it("does nothing when the cursor is not on the last line", () => {
    const ref = createCodeBlockState("first\nsecond", 2);

    expect(exitTrailingCodeBlockBelow(ref.state, ref.dispatch)).toBe(false);
    expect(ref.state.doc.childCount).toBe(1);
  });

  it("lets history navigation win on a clean restored prompt", () => {
    const text = "const value = 1;";
    const ref = createCodeBlockState(text, text.length, false);
    const view = createView(ref);
    const arrowDown = chainCommands(restoreNextDoc, exitTrailingCodeBlockBelow);

    ref.dispatch(loadDocsMeta(ref.state.tr, [ref.state.doc, ref.state.doc]));
    ref.dispatch(ref.state.tr.setSelection(TextSelection.create(ref.state.doc, 1)));
    expect(restorePreviousDoc(ref.state, ref.dispatch, view)).toBe(true);
    ref.dispatch(
      ref.state.tr.setSelection(
        TextSelection.create(ref.state.doc, ref.state.doc.content.size - 1),
      ),
    );

    expect(arrowDown(ref.state, ref.dispatch, view)).toBe(true);
    // restoreNextDoc handled it: no exit paragraph was appended
    expect(ref.state.doc.childCount).toBe(1);
  });

  it("falls through to the code block exit on a dirty prompt", () => {
    const text = "const value = 1;";
    const ref = createCodeBlockState(text, text.length);
    const view = createView(ref);
    const arrowDown = chainCommands(restoreNextDoc, exitTrailingCodeBlockBelow);

    expect(arrowDown(ref.state, ref.dispatch, view)).toBe(true);
    expect(ref.state.doc.childCount).toBe(2);
    expect(ref.state.doc.child(1).type.name).toBe("paragraph");
  });
});

describe("editor keymap native mac word navigation", () => {
  it("preserves native Option+Arrow word navigation", () => {
    expect(shouldUseNativeMacWordNavigation(keydown({ key: "ArrowLeft", altKey: true }))).toBe(
      true,
    );
    expect(shouldUseNativeMacWordNavigation(keydown({ key: "ArrowRight", altKey: true }))).toBe(
      true,
    );
  });

  it("preserves native Shift+Option+Arrow word selection", () => {
    expect(
      shouldUseNativeMacWordNavigation(keydown({ key: "ArrowLeft", altKey: true, shiftKey: true })),
    ).toBe(true);
    expect(
      shouldUseNativeMacWordNavigation(
        keydown({ key: "ArrowRight", altKey: true, shiftKey: true }),
      ),
    ).toBe(true);
  });

  it("does not intercept unrelated shortcuts", () => {
    expect(shouldUseNativeMacWordNavigation(keydown({ key: "ArrowUp", altKey: true }))).toBe(false);
    expect(
      shouldUseNativeMacWordNavigation(keydown({ key: "ArrowLeft", altKey: true, metaKey: true })),
    ).toBe(false);
    expect(shouldUseNativeMacWordNavigation(keydown({ key: "ArrowLeft" }))).toBe(false);
  });
});
