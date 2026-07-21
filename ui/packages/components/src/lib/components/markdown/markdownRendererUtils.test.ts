import { describe, expect, it } from "vitest";
import { FILE_PATH_REGEX } from "./filePaths.js";
import { buildSlashTokenRegex, parseFilePathMatches } from "./markdownRendererUtils.js";

describe("buildSlashTokenRegex", () => {
  it("matches slash-prefixed names", () => {
    const re = buildSlashTokenRegex(new Set(["compact"]));
    const matches = [..."run /compact now".matchAll(re)];
    expect(matches).toHaveLength(1);
    expect(matches[0][1]).toBe("/compact");
  });

  it("matches $-prefixed skill names literally without a slash", () => {
    const re = buildSlashTokenRegex(new Set(["$branch-and-open-pr"]));
    const matches = [..."$branch-and-open-pr please".matchAll(re)];
    expect(matches).toHaveLength(1);
    expect(matches[0][1]).toBe("$branch-and-open-pr");
  });

  it("matches the legacy /name invocation of a $ skill", () => {
    const re = buildSlashTokenRegex(new Set(["$uv"]));
    const matches = [..."run /uv now".matchAll(re)];
    expect(matches).toHaveLength(1);
    expect(matches[0][1]).toBe("/uv");
  });

  it("does not match $ skills invoked as /$name", () => {
    const re = buildSlashTokenRegex(new Set(["$uv"]));
    expect([..."/$uv".matchAll(re)]).toHaveLength(0);
  });

  it("requires token boundaries", () => {
    const re = buildSlashTokenRegex(new Set(["compact", "$uv"]));
    expect([..."path/compact".matchAll(re)]).toHaveLength(0);
    expect([..."/compacted".matchAll(re)]).toHaveLength(0);
    expect([..."x$uv".matchAll(re)]).toHaveLength(0);
  });

  it("matches mixed slash and $ names in one text", () => {
    const re = buildSlashTokenRegex(new Set(["compact", "$uv"]));
    const matches = [..."use /compact then $uv".matchAll(re)].map((m) => m[1]);
    expect(matches).toEqual(["/compact", "$uv"]);
  });

  it("escapes regex metacharacters in names", () => {
    const re = buildSlashTokenRegex(new Set(["$a.b"]));
    expect([..."$axb".matchAll(re)]).toHaveLength(0);
    expect([..."$a.b".matchAll(re)]).toHaveLength(1);
  });
});

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
