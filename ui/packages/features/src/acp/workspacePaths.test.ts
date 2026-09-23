import { describe, expect, it } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

describe("workspacePathFitsWorkspaceFolders", () => {
  it("matches exact workspace folders", () => {
    expect(workspacePathFitsWorkspaceFolders("/repo/worktree", [{ path: "/repo/worktree" }])).toBe(
      true,
    );
  });

  it("matches projects that contain an open workspace folder", () => {
    expect(workspacePathFitsWorkspaceFolders("/repo", [{ path: "/repo/packages/app" }])).toBe(true);
  });

  it("matches workspaces contained by an open workspace folder", () => {
    expect(workspacePathFitsWorkspaceFolders("/repo/worktree", [{ path: "/repo" }])).toBe(true);
  });

  it("does not match sibling worktrees", () => {
    expect(
      workspacePathFitsWorkspaceFolders("/repo-worktree-a", [{ path: "/repo-worktree-b" }]),
    ).toBe(false);
  });

  it("normalizes trailing slashes and windows drive casing", () => {
    expect(
      workspacePathFitsWorkspaceFolders("C:\\repo\\worktree\\", [{ path: "c:/repo/worktree" }]),
    ).toBe(true);
  });
});
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
