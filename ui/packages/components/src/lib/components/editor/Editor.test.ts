import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it } from "vitest";
import Harness from "./Editor.test.svelte";

function dispatchComposition(target: Element, type: "compositionstart" | "compositionend") {
  const Ctor = typeof CompositionEvent === "undefined" ? Event : CompositionEvent;
  target.dispatchEvent(new Ctor(type, { bubbles: true }));
}

describe("Editor composition tracking", () => {
  // Regression for PE-2456: isComposing was only snapshotted inside
  // dispatchTransaction, so a composition that started or ended without a
  // ProseMirror transaction (macOS predictive text cancelled by a caret
  // move) left the flag stale and the send button stuck disabled.
  it("syncs isComposing from composition DOM events without any transaction", async () => {
    render(Harness);
    const editor = screen.getByTestId("editor");
    const composing = screen.getByTestId("composing");

    expect(composing).toHaveTextContent("false");

    dispatchComposition(editor, "compositionstart");
    await tick();
    expect(composing).toHaveTextContent("true");

    dispatchComposition(editor, "compositionend");
    await tick();
    expect(composing).toHaveTextContent("false");
  });
});
