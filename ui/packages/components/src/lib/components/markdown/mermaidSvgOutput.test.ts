import { describe, expect, it } from "vitest";
import mermaidOutput from "./__fixtures__/mermaidOutput.json" with { type: "json" };
import { sanitizeMermaidSvg } from "./mermaidSvg.js";

/**
 * Real mermaid 11 output, captured from Chromium with the same options
 * HighlightedCode passes to `mermaid.initialize` (securityLevel "strict",
 * htmlLabels off). jsdom cannot render mermaid itself -- it has no `getBBox` --
 * so the renderer's output is pinned here instead.
 *
 * These guard the half of the change that is not about blocking anything: a
 * sanitizer that quietly deletes diagram content passes every "is it safe" test
 * while leaving users with blank boxes. Regenerate with a browser render if the
 * mermaid version or its options change.
 */
const diagrams = Object.entries(mermaidOutput as Record<string, string>);

function parse(svg: string): Document {
  return new DOMParser().parseFromString(svg, "image/svg+xml");
}

function count(doc: Document, selector: string): number {
  return doc.querySelectorAll(selector).length;
}

function visibleText(doc: Document): string {
  return (doc.documentElement.textContent ?? "").replace(/\s+/g, "");
}

describe.each(diagrams)("sanitizing the %s diagram", (_name, svg) => {
  const before = parse(svg);
  const after = parse(sanitizeMermaidSvg(svg));

  it("keeps every path and marker", () => {
    expect(count(after, "path")).toBe(count(before, "path"));
    expect(count(after, "marker")).toBe(count(before, "marker"));
  });

  it("keeps every shape and text node", () => {
    expect(count(after, "rect")).toBe(count(before, "rect"));
    expect(count(after, "text")).toBe(count(before, "text"));
  });

  it("keeps the theme stylesheet", () => {
    expect(count(after, "style")).toBe(count(before, "style"));
  });

  it("loses no label text", () => {
    expect(visibleText(after)).toBe(visibleText(before));
  });

  it("emits no foreignObject, so none is dropped", () => {
    expect(count(before, "foreignObject")).toBe(0);
    expect(count(after, "foreignObject")).toBe(0);
  });
});
