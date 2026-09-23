import { describe, expect, it } from "vitest";
import { findMatchIndices, highlightSegments, type HighlightSegment } from "./highlightMatch.js";

function text(segments: readonly HighlightSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}

function matched(segments: readonly HighlightSegment[]): string[] {
  return segments.filter((segment) => segment.matched).map((segment) => segment.text);
}

// Each case below uses a distinct (value, indices) pair, so the module-level
// LRU cache cannot carry state between them and needs no reset hook.
describe("highlightSegments", () => {
  it("returns a single unmatched segment when there are no matches", () => {
    expect(highlightSegments("readme.md", [])).toEqual([{ text: "readme.md", matched: false }]);
  });

  it("returns no segments for an empty value", () => {
    expect(highlightSegments("", [0])).toEqual([]);
  });

  it("coalesces adjacent indices into one matched segment", () => {
    const segments = highlightSegments("readme.md", [0, 1, 2]);

    expect(segments).toEqual([
      { text: "rea", matched: true },
      { text: "dme.md", matched: false },
    ]);
  });

  it("splits non-adjacent matches into separate segments", () => {
    const segments = highlightSegments("readme.md", [0, 7]);

    expect(matched(segments)).toEqual(["r", "m"]);
    expect(text(segments)).toBe("readme.md");
  });

  // A repository can contain a file whose name is markup. Segments are rendered
  // as text nodes, so the payload must survive verbatim rather than being
  // parsed as HTML -- see HighlightedText.svelte.
  it("keeps markup in a filename as literal text", () => {
    const filename = `<img src=x onerror="alert(1)">.ts`;
    const segments = highlightSegments(filename, findMatchIndices(filename, "img"));

    expect(text(segments)).toBe(filename);
    expect(matched(segments)).toEqual(["img"]);
  });

  it("keeps markup intact when nothing matches", () => {
    const filename = "<script>alert(1)</script>.ts";

    expect(text(highlightSegments(filename, []))).toBe(filename);
  });

  it("returns cached segments for repeated calls", () => {
    const first = highlightSegments("readme.md", [0, 1]);
    const second = highlightSegments("readme.md", [0, 1]);

    expect(second).toBe(first);
  });

  it("does not conflate values that differ only around the cache-key separator", () => {
    const a = highlightSegments("a\u00000,1", [0]);
    const b = highlightSegments("a", [0, 1]);

    expect(text(a)).toBe("a\u00000,1");
    expect(text(b)).toBe("a");
  });
});

describe("findMatchIndices", () => {
  it("matches subsequences case-insensitively", () => {
    expect(findMatchIndices("ReadMe.md", "rdm")).toEqual([0, 3, 4]);
  });

  it("returns no indices for an empty term or text", () => {
    expect(findMatchIndices("readme.md", "")).toEqual([]);
    expect(findMatchIndices("", "readme")).toEqual([]);
  });
});
