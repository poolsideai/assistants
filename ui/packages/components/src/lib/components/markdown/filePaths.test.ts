import { describe, expect, it } from "vitest";
import { parseFilePathWithLine, stripMatchingQuotes } from "./filePaths.js";

describe("parseFilePathWithLine", () => {
  it("does not decode percent escapes in literal file paths", () => {
    expect(parseFilePathWithLine("src/a%2Fb.ts")).toEqual({
      path: "src/a%2Fb.ts",
    });
  });

  it("parses line and column suffixes", () => {
    expect(parseFilePathWithLine("src/main.ts:42:5")).toEqual({
      path: "src/main.ts",
      line: 42,
      column: 5,
    });
  });
});

describe("stripMatchingQuotes", () => {
  it("strips matching straight quote pairs", () => {
    expect(stripMatchingQuotes('"src/main.ts"')).toBe("src/main.ts");
    expect(stripMatchingQuotes("'src/main.ts'")).toBe("src/main.ts");
  });

  it("strips matching curly quote pairs", () => {
    expect(stripMatchingQuotes("“src/main.ts”")).toBe("src/main.ts");
    expect(stripMatchingQuotes("‘src/main.ts’")).toBe("src/main.ts");
  });

  it("leaves unquoted text unchanged", () => {
    expect(stripMatchingQuotes("src/main.ts")).toBe("src/main.ts");
    expect(stripMatchingQuotes("")).toBe("");
  });

  it("leaves mismatched or unclosed quotes unchanged", () => {
    expect(stripMatchingQuotes("\"src/main.ts'")).toBe("\"src/main.ts'");
    expect(stripMatchingQuotes('"src/main.ts')).toBe('"src/main.ts');
    expect(stripMatchingQuotes('“src/main.ts"')).toBe('“src/main.ts"');
  });

  it("leaves a bare quote pair unchanged", () => {
    expect(stripMatchingQuotes('""')).toBe('""');
  });
});
