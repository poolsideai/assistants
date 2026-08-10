import { describe, expect, it } from "vitest";
import { visibleChangedTreePaths } from "./desktopFilesTreeChangedFilter";

const CHANGED = new Set(["added", "deleted", "modified", "renamed", "untracked"]);

function entries(...paths: string[]) {
  return paths.map((relativePath) => ({ relativePath }));
}

describe("visibleChangedTreePaths", () => {
  it("keeps changed files and their ancestor directories", () => {
    const paths = visibleChangedTreePaths(
      entries("docs/", "docs/readme.md", "src/", "src/app/", "src/app/main.ts", "src/clean.ts"),
      [{ path: "src/app/main.ts", status: "modified" }],
      CHANGED,
    );
    expect(paths).toEqual(["src/", "src/app/", "src/app/main.ts"]);
  });

  it("keeps ancestors of changes inside deferred directories that have no entry for the file", () => {
    // Only `ui/` and `ui/packages/` are loaded; the changed file lives deeper.
    const paths = visibleChangedTreePaths(
      entries("ui/", "ui/packages/", "other/", "other/file.ts"),
      [{ path: "ui/packages/features/src/deep.ts", status: "modified" }],
      CHANGED,
    );
    expect(paths).toEqual(["ui/", "ui/packages/"]);
  });

  it("keeps everything inside a changed (untracked) directory", () => {
    // git reports a wholly-untracked directory as a single `dir/` record.
    const paths = visibleChangedTreePaths(
      entries("new/", "new/a.ts", "new/nested/", "new/nested/b.ts", "old/", "old/c.ts"),
      [{ path: "new/", status: "untracked" }],
      CHANGED,
    );
    expect(paths).toEqual(["new/", "new/a.ts", "new/nested/", "new/nested/b.ts"]);
  });

  it("ignores non-changed statuses", () => {
    const paths = visibleChangedTreePaths(
      entries("a.ts", "logs/", "logs/x.log"),
      [{ path: "logs/", status: "ignored" }],
      CHANGED,
    );
    expect(paths).toEqual([]);
  });

  it("returns an empty list when nothing changed", () => {
    expect(visibleChangedTreePaths(entries("a.ts", "b/"), [], CHANGED)).toEqual([]);
  });

  it("preserves entry order", () => {
    const paths = visibleChangedTreePaths(
      entries("z.ts", "a/", "a/b.ts", "m.ts"),
      [
        { path: "m.ts", status: "untracked" },
        { path: "z.ts", status: "modified" },
        { path: "a/b.ts", status: "added" },
      ],
      CHANGED,
    );
    expect(paths).toEqual(["z.ts", "a/", "a/b.ts", "m.ts"]);
  });

  it("handles root-level changed files", () => {
    const paths = visibleChangedTreePaths(
      entries("README.md", "src/", "src/a.ts"),
      [{ path: "README.md", status: "modified" }],
      CHANGED,
    );
    expect(paths).toEqual(["README.md"]);
  });
});
