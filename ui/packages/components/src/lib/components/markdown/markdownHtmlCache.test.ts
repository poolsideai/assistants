import { describe, expect, it } from "vitest";
import { getCachedMarkdownHtml, setCachedMarkdownHtml } from "./markdownHtmlCache.js";

describe("markdownHtmlCache", () => {
  it("evicts the least-recently-used HTML under a byte budget", () => {
    setCachedMarkdownHtml("v", "aaaa", "x".repeat(20), 120);
    setCachedMarkdownHtml("v", "bbbb", "y".repeat(20), 120);
    expect(getCachedMarkdownHtml("v", "aaaa")).toBe("x".repeat(20));

    setCachedMarkdownHtml("v", "cccc", "z".repeat(20), 120);

    expect(getCachedMarkdownHtml("v", "bbbb")).toBeUndefined();
    expect(getCachedMarkdownHtml("v", "aaaa")).toBe("x".repeat(20));
    expect(getCachedMarkdownHtml("v", "cccc")).toBe("z".repeat(20));
  });

  it("does not retain an entry larger than the budget", () => {
    setCachedMarkdownHtml("v", "source", "x".repeat(100), 20);

    expect(getCachedMarkdownHtml("v", "source")).toBeUndefined();
  });
});
