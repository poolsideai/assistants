import { describe, expect, it } from "vitest";
import { parseGitGutterDecorations } from "./gitGutterDecorations";

describe("parseGitGutterDecorations", () => {
  it("returns nothing for an empty patch", () => {
    const result = parseGitGutterDecorations("");
    expect(result.added).toEqual([]);
    expect(result.modified).toEqual([]);
    expect(result.deletedAfter).toEqual([]);
  });

  it("marks pure additions", () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -2,0 +3,2 @@
+new line one
+new line two
`;
    const result = parseGitGutterDecorations(patch);
    expect(result.added).toEqual([{ start: 3, end: 4 }]);
    expect(result.modified).toEqual([]);
    expect(result.deletedAfter).toEqual([]);
  });

  it("pairs removed+added runs as modified", () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -5,2 +5,2 @@ context
 unchanged
-old value
+new value
`;
    const result = parseGitGutterDecorations(patch);
    expect(result.modified).toEqual([{ start: 6, end: 6 }]);
    expect(result.added).toEqual([]);
    expect(result.deletedAfter).toEqual([]);
  });

  it("marks surplus added lines in a modified run as added", () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -3,1 +3,3 @@
-old
+new
+extra one
+extra two
`;
    const result = parseGitGutterDecorations(patch);
    expect(result.modified).toEqual([{ start: 3, end: 3 }]);
    expect(result.added).toEqual([{ start: 4, end: 5 }]);
  });

  it("records where deletions happened", () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -4,3 +4,1 @@
 kept
-gone one
-gone two
`;
    const result = parseGitGutterDecorations(patch);
    expect(result.added).toEqual([]);
    expect(result.modified).toEqual([]);
    expect(result.deletedAfter).toEqual([4]);
  });

  it("anchors a deletion before the first line at 0", () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -1,1 +0,0 @@
-first line gone
`;
    const result = parseGitGutterDecorations(patch);
    expect(result.deletedAfter).toEqual([0]);
  });

  it("handles multiple hunks", () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -1,1 +1,1 @@
-a
+A
@@ -10,0 +11,1 @@
+appended
`;
    const result = parseGitGutterDecorations(patch);
    expect(result.modified).toEqual([{ start: 1, end: 1 }]);
    expect(result.added).toEqual([{ start: 11, end: 11 }]);
  });

  it("ignores the no-newline marker", () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -1,1 +1,1 @@
-old
\\ No newline at end of file
+new
\\ No newline at end of file
`;
    const result = parseGitGutterDecorations(patch);
    expect(result.modified).toEqual([{ start: 1, end: 1 }]);
  });
});
