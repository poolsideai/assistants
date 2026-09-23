__POOL_SYNTHETIC_IMPORT_BASELINE__
import { FILE_PATH_REGEX } from "./filePaths.js";
import { buildSlashTokenRegex, parseFilePathMatches } from "./markdownRendererUtils.js";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

describe("parseFilePathMatches", () => {
  const matchesIn = (text: string) => parseFilePathMatches(text, FILE_PATH_REGEX);

  it("reports the path span without its boundary character", () => {
    expect(matchesIn("see src/main.ts:42 here")).toEqual([
      {
        path: "src/main.ts",
        line: 42,
        column: undefined,
        pathStartIndex: 4,
        matchedTextLength: 14,
      },
    ]);
  });

  it("swallows a matching double-quote pair into the replaced span", () => {
    expect(matchesIn('open "src/main.ts" now')).toEqual([
      {
        path: "src/main.ts",
        line: undefined,
        column: undefined,
        pathStartIndex: 5,
        matchedTextLength: 13,
      },
    ]);
  });

  it("swallows a single-quote pair around a path with a line suffix", () => {
    expect(matchesIn("'src/main.ts:42:5'")).toEqual([
      {
        path: "src/main.ts",
        line: 42,
        column: 5,
        pathStartIndex: 0,
        matchedTextLength: 18,
      },
    ]);
  });

  it("swallows curly quote pairs", () => {
    const [match] = matchesIn("open “src/main.ts” now");
    expect(match.pathStartIndex).toBe(5);
    expect(match.matchedTextLength).toBe(13);
  });

  it("keeps an unclosed leading quote outside the span", () => {
    expect(matchesIn('"src/main.ts and more')).toEqual([
      {
        path: "src/main.ts",
        line: undefined,
        column: undefined,
        pathStartIndex: 1,
        matchedTextLength: 11,
      },
    ]);
  });

  it("keeps mismatched quotes outside the span", () => {
    const [match] = matchesIn("\"src/main.ts' oops");
    expect(match.pathStartIndex).toBe(1);
    expect(match.matchedTextLength).toBe(11);
  });

  it("does not swallow a leading parenthesis boundary", () => {
    // Parens are valid path characters (e.g. Next.js `(pages)/file.tsx`), so the
    // leading paren is captured into the path itself rather than treated as a
    // quote-like delimiter; unresolvable paths degrade to plain text downstream.
    expect(matchesIn("edit (src/main.ts) now")).toEqual([
      {
        path: "(src/main.ts",
        line: undefined,
        column: undefined,
        pathStartIndex: 5,
        matchedTextLength: 12,
      },
    ]);
  });

  it("keeps adjacent matches disjoint when they would share a quote", () => {
    const matches = matchesIn('"a.ts"b.ts"');
    expect(matches).toHaveLength(2);
    expect(matches[0].pathStartIndex).toBe(0);
    expect(matches[0].matchedTextLength).toBe(6);
    // The shared quote already belongs to the first span, so the second match
    // must not extend backwards over it.
    expect(matches[1].pathStartIndex).toBe(6);
    expect(matches[1].matchedTextLength).toBe(4);
  });

  it("swallows quotes independently for multiple quoted paths", () => {
    const matches = matchesIn('compare "a.ts" with "b/c.go:7"');
    expect(matches).toEqual([
      { path: "a.ts", line: undefined, column: undefined, pathStartIndex: 8, matchedTextLength: 6 },
      { path: "b/c.go", line: 7, column: undefined, pathStartIndex: 20, matchedTextLength: 10 },
    ]);
  });
});
