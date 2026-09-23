import { describe, expect, it, vi } from "vitest";
import { reconcileMarkdownDom } from "./reconcileMarkdownDom.js";

describe("reconcileMarkdownDom", () => {
  it("preserves compatible elements and text nodes", () => {
    const current = document.createElement("div");
    current.innerHTML = '<p class="old">Initial</p>';
    const next = document.createElement("div");
    next.innerHTML = '<p class="new">Updated</p><ul><li>One</li></ul>';
    const paragraph = current.querySelector("p");
    const text = paragraph?.firstChild;

    reconcileMarkdownDom(current, next);

    expect(current.querySelector("p")).toBe(paragraph);
    expect(paragraph?.firstChild).toBe(text);
    expect(paragraph).toHaveClass("new");
    expect(paragraph).not.toHaveClass("old");
    expect(paragraph?.textContent).toBe("Updated");
    expect(current.querySelector("li")?.textContent).toBe("One");
  });

  it("reports incompatible and removed subtrees before detaching them", () => {
    const current = document.createElement("div");
    current.innerHTML = "<p>Replace</p><aside>Remove</aside>";
    const next = document.createElement("div");
    next.innerHTML = "<h2>Replacement</h2>";
    const beforeRemove = vi.fn();

    reconcileMarkdownDom(current, next, { beforeRemove });

    expect(beforeRemove).toHaveBeenCalledTimes(2);
    expect(current.innerHTML).toBe("<h2>Replacement</h2>");
  });
});
