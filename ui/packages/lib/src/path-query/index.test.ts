import { basename, classifyQuery, hasTrailingPathSeparator, joinPath } from "./index.js";

describe("classifyQuery", () => {
  it("identifies absolute paths", () => {
    expect(classifyQuery("/tmp/foo").mode).toBe("absolute");
    expect(classifyQuery("/").mode).toBe("absolute");
  });

  it("identifies user (~) paths", () => {
    expect(classifyQuery("~").mode).toBe("user");
    expect(classifyQuery("~/Documents").mode).toBe("user");
    expect(classifyQuery("~\\Documents").mode).toBe("user");
  });

  it("identifies relative (./) paths", () => {
    expect(classifyQuery(".").mode).toBe("relative");
    expect(classifyQuery("./").mode).toBe("relative");
    expect(classifyQuery("./src/foo").mode).toBe("relative");
    expect(classifyQuery(".\\").mode).toBe("relative");
    expect(classifyQuery(".\\src\\foo").mode).toBe("relative");
  });

  it("identifies Windows absolute paths when isWindows is true", () => {
    expect(classifyQuery("C:\\Users\\me\\file.txt", { isWindows: true }).mode).toBe("absolute");
    expect(classifyQuery("C:/Users/me/file.txt", { isWindows: true }).mode).toBe("absolute");
    expect(classifyQuery("\\\\server\\share\\file.txt", { isWindows: true }).mode).toBe("absolute");
    expect(classifyQuery("//server/share/file.txt", { isWindows: true }).mode).toBe("absolute");
  });

  it("does not treat drive-letter paths as absolute on POSIX", () => {
    expect(classifyQuery("C:\\Users\\me\\file.txt", { isWindows: false }).mode).toBe("fuzzy");
    expect(classifyQuery("C:/Users/me/file.txt").mode).toBe("fuzzy");
  });

  it("treats anything else as fuzzy", () => {
    expect(classifyQuery("foo").mode).toBe("fuzzy");
    expect(classifyQuery("pota/sw").mode).toBe("fuzzy");
    expect(classifyQuery("").mode).toBe("fuzzy");
  });

  it("strips surrounding quotes before classifying", () => {
    expect(classifyQuery('"/tmp/foo"').mode).toBe("absolute");
    expect(classifyQuery('"/tmp/foo').mode).toBe("absolute");
    expect(classifyQuery('"~/x y"').mode).toBe("user");
    expect(classifyQuery('"./x y"').mode).toBe("relative");
    expect(classifyQuery('"').quoted).toBe(true);
    expect(classifyQuery('"./x y/"').closedQuote).toBe(true);
    expect(classifyQuery('"./x y/').closedQuote).toBe(false);
  });

  it("returns the bare query without quotes", () => {
    expect(classifyQuery('"/tmp/x y/"').bare).toBe("/tmp/x y/");
    expect(classifyQuery('"/tmp/x y').bare).toBe("/tmp/x y");
    expect(classifyQuery("/tmp/x").bare).toBe("/tmp/x");
  });
});

describe("hasTrailingPathSeparator", () => {
  it("detects POSIX trailing slashes", () => {
    expect(hasTrailingPathSeparator("/tmp/")).toBe(true);
    expect(hasTrailingPathSeparator("foo/")).toBe(true);
  });

  it("detects Windows trailing backslashes", () => {
    expect(hasTrailingPathSeparator("C:\\Users\\")).toBe(true);
    expect(hasTrailingPathSeparator("foo\\")).toBe(true);
  });

  it("returns false when there is no trailing separator", () => {
    expect(hasTrailingPathSeparator("/tmp/foo")).toBe(false);
    expect(hasTrailingPathSeparator("foo")).toBe(false);
    expect(hasTrailingPathSeparator("")).toBe(false);
  });
});

describe("basename", () => {
  it("strips a directory prefix on POSIX", () => {
    expect(basename("/tmp/foo.txt")).toBe("foo.txt");
    expect(basename("foo/bar/baz")).toBe("baz");
  });

  it("strips a directory prefix on Windows", () => {
    expect(basename("C:\\Users\\me\\file.txt")).toBe("file.txt");
    expect(basename("a\\b\\c")).toBe("c");
  });

  it("ignores trailing separators", () => {
    expect(basename("/tmp/foo/")).toBe("foo");
    expect(basename("C:\\Users\\me\\")).toBe("me");
  });

  it("returns the value untouched when there are no separators", () => {
    expect(basename("foo")).toBe("foo");
    expect(basename("")).toBe("");
  });
});

describe("joinPath", () => {
  it("joins POSIX-style", () => {
    expect(joinPath("foo", "bar.txt")).toBe("foo/bar.txt");
    expect(joinPath("/foo", "bar")).toBe("/foo/bar");
  });

  it("joins Windows-style when dir uses backslashes only", () => {
    expect(joinPath("C:\\Users", "me")).toBe("C:\\Users\\me");
  });

  it("handles trailing separators on dir", () => {
    expect(joinPath("foo/", "bar")).toBe("foo/bar");
    expect(joinPath("C:\\Users\\", "me")).toBe("C:\\Users\\me");
  });

  it("treats `.` and empty dir as no prefix", () => {
    expect(joinPath(".", "bar")).toBe("bar");
    expect(joinPath("", "bar")).toBe("bar");
  });

  it("special-cases POSIX and Windows roots", () => {
    expect(joinPath("/", "etc")).toBe("/etc");
    expect(joinPath("\\", "Users")).toBe("\\Users");
  });
});
