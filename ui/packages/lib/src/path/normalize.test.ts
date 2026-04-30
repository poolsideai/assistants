import { normalize } from "./normalize.js";

describe("unix", () => {
  it("should normalize absolute path with dots", () => {
    expect(normalize("/foo/bar//baz/asdf/quux/..")).toBe("/foo/bar/baz/asdf");
  });

  it("should normalize absolute path with multiple slashes", () => {
    expect(normalize("/foo///bar//baz")).toBe("/foo/bar/baz");
  });

  it("should normalize absolute path with current directory references", () => {
    expect(normalize("/foo/./bar/./baz")).toBe("/foo/bar/baz");
  });

  it("should normalize absolute path with parent directory at start", () => {
    expect(normalize("/../foo/bar")).toBe("/foo/bar");
  });

  it("should normalize root path", () => {
    expect(normalize("/")).toBe("/");
  });

  it("should normalize root with slashes", () => {
    expect(normalize("///")).toBe("/");
  });

  it("should handle complex path with mixed separators", () => {
    expect(normalize("/foo/../bar/./baz//quux")).toBe("/bar/baz/quux");
  });
});

describe("windows", () => {
  it("should normalize path with backslashes", () => {
    expect(normalize("C:\\temp\\\\foo\\bar\\..\\")).toBe("C:/temp/foo/");
  });

  it("should normalize path with dots", () => {
    expect(normalize("C:\\foo\\bar\\..\\baz")).toBe("C:/foo/baz");
  });

  it("should normalize drive root", () => {
    expect(normalize("C:\\")).toBe("C:/");
  });

  it("should normalize drive with multiple slashes", () => {
    expect(normalize("C:\\\\\\foo\\\\bar")).toBe("C:/foo/bar");
  });

  it("should normalize UNC path", () => {
    expect(normalize("\\\\server\\share\\foo\\bar\\..\\baz")).toBe("//server/share/foo/baz");
  });
});

describe("relative paths", () => {
  it("should normalize relative path with dots", () => {
    expect(normalize("./src/../dist/file.js")).toBe("dist/file.js");
  });

  it("should normalize relative path with parent references", () => {
    expect(normalize("../foo/bar/../baz")).toBe("../foo/baz");
  });

  it("should normalize relative path with current directory", () => {
    expect(normalize("./foo/./bar")).toBe("foo/bar");
  });

  it("should normalize path starting with parent reference", () => {
    expect(normalize("../../foo/bar")).toBe("../../foo/bar");
  });

  it("should normalize relative path going up and down", () => {
    expect(normalize("foo/bar/../../baz")).toBe("baz");
  });

  it("should handle relative path that goes above start", () => {
    expect(normalize("foo/../..")).toBe("..");
  });
});

describe("edge cases", () => {
  it("should normalize current directory", () => {
    expect(normalize(".")).toBe(".");
  });

  it("should normalize parent directory", () => {
    expect(normalize("..")).toBe("..");
  });

  it("should normalize empty string", () => {
    expect(normalize("")).toBe(".");
  });

  it("should normalize single filename", () => {
    expect(normalize("file.ts")).toBe("file.ts");
  });

  it("should normalize path with only dots and slashes", () => {
    expect(normalize("././.")).toBe(".");
  });

  it("should normalize path with only parent references", () => {
    expect(normalize("../../..")).toBe("../../..");
  });

  it("should normalize mixed slashes and backslashes", () => {
    expect(normalize("foo\\bar/baz\\quux")).toBe("foo/bar/baz/quux");
  });

  it("should normalize path with trailing slash", () => {
    expect(normalize("foo/bar/")).toBe("foo/bar/");
  });

  it("should normalize path with only slashes", () => {
    expect(normalize("///")).toBe("/");
  });

  it("should handle complex relative path", () => {
    expect(normalize("./foo/../bar/./baz/../quux")).toBe("bar/quux");
  });
});
