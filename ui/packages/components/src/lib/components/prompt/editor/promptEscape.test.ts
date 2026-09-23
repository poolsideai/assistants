import { describe, expect, it, vi } from "vitest";
import { handlePromptEscape } from "./promptEscape.js";

function escapeEvent(): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
}

describe("handlePromptEscape", () => {
  it("prevents the native Escape action when the prompt handles it", () => {
    const event = escapeEvent();

    expect(handlePromptEscape(event, () => true)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves idle Escape unhandled for the host window", () => {
    const event = escapeEvent();

    expect(handlePromptEscape(event, () => false)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it("only executes the prompt action once", () => {
    const execute = vi.fn(() => true);

    handlePromptEscape(escapeEvent(), execute);

    expect(execute).toHaveBeenCalledOnce();
  });
});
