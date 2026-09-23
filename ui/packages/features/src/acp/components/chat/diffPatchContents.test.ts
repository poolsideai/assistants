import { describe, expect, it } from "vitest";
import { patchMatchesContents } from "./diffPatchContents";

const OLD = "one\ntwo\nthree\nfour\nfive\n";
const NEW = "one\ntwo\nTHREE\nfour\nfive\n";
const PATCH =
  "diff --git a/f.txt b/f.txt\n" +
  "--- a/f.txt\n" +
  "+++ b/f.txt\n" +
  "@@ -1,5 +1,5 @@\n" +
  " one\n two\n-three\n+THREE\n four\n five\n";

describe("patchMatchesContents", () => {
  it("accepts a patch consistent with both sides", () => {
    expect(patchMatchesContents(PATCH, OLD, NEW)).toBe(true);
  });

  it("rejects drifted new-side contents", () => {
    expect(patchMatchesContents(PATCH, OLD, "one\ntwo\nTHREE\nfour\nFIVE\n")).toBe(false);
  });

  it("rejects drifted old-side contents", () => {
    expect(patchMatchesContents(PATCH, "one\n2\nthree\nfour\nfive\n", NEW)).toBe(false);
  });

  it("rejects hunks referring past the end of the file", () => {
    const patch = "@@ -9,1 +9,1 @@\n-nine\n+NINE\n";
    expect(patchMatchesContents(patch, OLD, NEW)).toBe(false);
  });

  it("handles multiple hunks with correct offsets", () => {
    const oldSide = "a\nb\nc\nd\ne\nf\ng\nh\n";
    const newSide = "A\nb\nc\nd\ne\nf\ng\nH\n";
    const patch = "@@ -1,2 +1,2 @@\n-a\n+A\n b\n" + "@@ -7,2 +7,2 @@\n g\n-h\n+H\n";
    expect(patchMatchesContents(patch, oldSide, newSide)).toBe(true);
  });

  it("handles files without a trailing newline", () => {
    const patch = "@@ -1,2 +1,2 @@\n one\n-two\n+TWO\n" + "\\ No newline at end of file\n";
    expect(patchMatchesContents(patch, "one\ntwo", "one\nTWO")).toBe(true);
  });

  it("rejects truncated placeholder lines", () => {
    const patch = "@@ -1,1 +1,1 @@\n-one\n+[line omitted: 99999 bytes]\n";
    // The '+'-prefixed placeholder will not match real contents.
    expect(patchMatchesContents(patch, OLD, NEW)).toBe(false);
  });
});
