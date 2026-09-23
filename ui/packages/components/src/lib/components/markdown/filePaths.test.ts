__POOL_SYNTHETIC_IMPORT_BASELINE__
import { parseFilePathWithLine, stripMatchingQuotes } from "./filePaths.js";
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
