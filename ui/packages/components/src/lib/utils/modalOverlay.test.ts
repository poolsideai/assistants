import { describe, expect, it } from "vitest";
import { insideModalOverlay } from "./modalOverlay.js";

describe("insideModalOverlay", () => {
  it("is true for a target inside an aria-modal dialog", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    const input = document.createElement("input");
    dialog.appendChild(input);
    document.body.appendChild(dialog);

    expect(insideModalOverlay(input)).toBe(true);
    expect(insideModalOverlay(dialog)).toBe(true);

    dialog.remove();
  });

  it("is false for a target outside any modal", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    expect(insideModalOverlay(button)).toBe(false);
    expect(insideModalOverlay(document.body)).toBe(false);

    button.remove();
  });

  it("is false for null and non-element targets", () => {
    expect(insideModalOverlay(null)).toBe(false);
    expect(insideModalOverlay(window)).toBe(false);
    expect(insideModalOverlay(document.createTextNode("text"))).toBe(false);
  });
});
