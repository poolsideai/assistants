import { afterEach, describe, expect, it, vi } from "vitest";
import { focusPromptIfUnchanged } from "./Helpers";

describe("deferred automatic prompt focus", () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
  });
  it("keeps a newly focused control and cancels stale conversation requests", () => {
    vi.useFakeTimers();
    const prompt = document.createElement("textarea");
    prompt.id = "prompt-editor";
    const search = document.createElement("input");
    document.body.append(prompt, search);
    focusPromptIfUnchanged(() => true);
    search.focus();
    vi.runAllTimers();
    expect(search).toHaveFocus();
    search.blur();
    focusPromptIfUnchanged(() => false);
    vi.runAllTimers();
    expect(prompt).not.toHaveFocus();
    const cancel = focusPromptIfUnchanged(() => true);
    cancel();
    vi.runAllTimers();
    expect(prompt).not.toHaveFocus();
    focusPromptIfUnchanged(() => true);
    vi.runAllTimers();
    expect(prompt).toHaveFocus();
  });
  it("does not take focus from an existing editable control", () => {
    vi.useFakeTimers();
    const prompt = document.createElement("textarea");
    prompt.id = "prompt-editor";
    const draft = document.createElement("input");
    document.body.append(prompt, draft);
    draft.focus();
    focusPromptIfUnchanged(() => true);
    vi.runAllTimers();
    expect(draft).toHaveFocus();
  });
});
