import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { describe, expect, it, vi } from "vitest";
import { schema } from "../../prompt/editor/schema.js";
import { getMatchDecorationState, matchDecoration } from "./matchDecoration.js";

describe("matchDecoration", () => {
  it("ends a rejected match without repeating callbacks on later input", () => {
    const onMatch = vi.fn();
    const onEnd = vi.fn();
    const view = new EditorView(document.createElement("div"), {
      state: EditorState.create({
        schema,
        plugins: [
          matchDecoration({
            rules: [
              {
                triggerRegExp: /(?<=^|\s)\/(?!\s)/g,
                queryRegExp: /^\S*(?:\s.*)?$/,
                shouldMatch: ({ query }) => !/\s/.test(query),
                onMatch,
                onEnd,
              },
            ],
          }),
        ],
      }),
    });

    try {
      view.dispatch(view.state.tr.insertText("look in my /tmp"));
      expect(getMatchDecorationState(view.state)?.status).toBe("match");
      expect(onMatch).toHaveBeenCalledTimes(1);

      view.dispatch(view.state.tr.insertText(" "));
      expect(getMatchDecorationState(view.state)?.status).toBe("idle");
      expect(onMatch).toHaveBeenCalledTimes(1);
      expect(onEnd).toHaveBeenCalledTimes(1);

      view.dispatch(view.state.tr.insertText("directory"));
      expect(getMatchDecorationState(view.state)?.status).toBe("idle");
      expect(onMatch).toHaveBeenCalledTimes(1);
      expect(onEnd).toHaveBeenCalledTimes(1);
    } finally {
      view.destroy();
    }
  });
});
