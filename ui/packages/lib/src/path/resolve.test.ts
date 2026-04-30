import { resolve } from "./resolve.js";

describe("unix", () => {
  it("should resolve absolute paths", () => {
    expect(resolve("/foo/bar", "/baz/quux")).toBe("/baz/quux");
  });

  it("should resolve relative paths to absolute", () => {
    expect(resolve("/foo/bar", "baz", "quux")).toBe("/foo/bar/baz/quux");
  });

  it("should resolve with parent directory references", () => {
    expect(resolve("/foo/bar", "../baz")).toBe("/foo/baz");
  });

  it("should resolve with current directory references", () => {
    expect(resolve("/foo/bar", "./baz")).toBe("/foo/bar/baz");
  });

  it("should resolve multiple relative segments", () => {
    expect(resolve("/foo", "bar", "baz/quux", "../file.ts")).toBe("/foo/bar/baz/file.ts");
  });

  it("should resolve to root when going up too far", () => {
    expect(resolve("/foo", "../../..")).toBe("/");
  });

  it("should resolve single absolute path", () => {
    expect(resolve("/foo/bar/baz")).toBe("/foo/bar/baz");
  });

  it("should resolve with empty segments", () => {
    expect(resolve("/foo", "", "bar")).toBe("/foo/bar");
  });

  it("should resolve from root", () => {
    expect(resolve("/", "foo", "bar")).toBe("/foo/bar");
  });

  it("should handle multiple absolute paths", () => {
    expect(resolve("/foo", "/bar", "/baz")).toBe("/baz");
  });

  it("should resolve complex path with dots", () => {
    expect(resolve("/foo/bar", "../baz/./quux/../file.ts")).toBe("/foo/baz/file.ts");
  });
});

describe("windows", () => {
  it("should resolve absolute paths", () => {
    expect(resolve("C:\\foo\\bar", "C:\\baz\\quux")).toBe("C:/baz/quux");
  });

  it("should resolve Windows relative paths to absolute", () => {
    expect(resolve("C:\\foo\\bar", "baz", "quux")).toBe("C:/foo/bar/baz/quux");
  });

  it("should resolve with parent directory references", () => {
    expect(resolve("C:\\foo\\bar", "..\\baz")).toBe("C:/foo/baz");
  });

  it("should resolve to root when going up too far", () => {
    expect(resolve("C:\\foo", "..\\..\\..", "bar")).toBe("/bar");
  });

  it("should resolve different drives", () => {
    expect(resolve("C:\\foo", "D:\\bar")).toBe("D:/bar");
  });

  it("should resolve UNC paths", () => {
    expect(resolve("\\\\server\\share\\foo", "bar", "baz")).toBe("/server/share/foo/bar/baz");
  });

  it("should resolve UNC path with parent references", () => {
    expect(resolve("\\\\server\\share\\foo\\bar", "..\\baz")).toBe("/server/share/foo/baz");
  });

  it("should resolve different UNC paths", () => {
    expect(resolve("\\\\server1\\share\\foo", "\\\\server2\\share\\bar")).toBe(
      "/server2/share/bar",
    );
  });

  it("should handle mixed slashes and backslashes", () => {
    expect(resolve("C:\\foo/bar", "baz\\quux")).toBe("C:/foo/bar/baz/quux");
  });
});

describe("edge cases", () => {
  it("should resolve with trailing slashes", () => {
    expect(resolve("/foo/bar/", "baz/")).toBe("/foo/bar/baz");
  });

  it("should resolve with multiple slashes", () => {
    expect(resolve("/foo///bar", "baz//quux")).toBe("/foo/bar/baz/quux");
  });

  it("should resolve absolute path after relative paths", () => {
    expect(resolve("foo", "bar", "/baz")).toBe("/baz");
  });

  it("should resolve complex mixed paths", () => {
    expect(resolve("/foo", "../bar", "./baz", "quux/..", "file.ts")).toBe("/bar/baz/file.ts");
  });

  it("should handle path with only slashes", () => {
    expect(resolve("///")).toBe("/");
  });

  it("should resolve root with relative path", () => {
    expect(resolve("/", "../foo")).toBe("/foo");
  });
});

describe("mixed scenarios", () => {
  it("should resolve absolute Unix path after Windows path", () => {
    expect(resolve("C:\\foo", "/bar")).toBe("/bar");
  });

  it("should resolve Windows path after Unix path", () => {
    expect(resolve("/foo", "C:\\bar")).toBe("C:/bar");
  });

  it("should resolve many segments with mixed types", () => {
    expect(resolve("/a", "b", "../c", "./d", "e/f", "..", "g")).toBe("/a/c/d/e/g");
  });

  it("should resolve with absolute path in the middle", () => {
    expect(resolve("foo", "/bar", "baz")).toBe("/bar/baz");
  });

  it("should resolve UNC path after regular paths", () => {
    expect(resolve("/foo", "bar", "\\\\server\\share\\baz")).toBe("/server/share/baz");
  });
});
