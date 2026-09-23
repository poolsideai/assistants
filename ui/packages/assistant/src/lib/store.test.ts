import type { WorkspaceFolder } from "@poolsideai/rpc";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { describe, expect, it } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__

describe("workspaceFromCwd", () => {
  it("creates a workspace folder from an ACP cwd", () => {
    expect(workspaceFromCwd("/Users/poolie/project")).toEqual({
      path: "/Users/poolie/project",
      name: "project",
      index: -1,
    });
  });

  it("ignores empty and root cwd fallbacks", () => {
    expect(workspaceFromCwd("")).toBeUndefined();
    expect(workspaceFromCwd("/")).toBeUndefined();
  });
});

describe("appStateUpdates.ensureWorkspaceForCwd", () => {
  it("populates workspaces from cwd when the host did not provide workspace folders", () => {
    const state = { workspaces: [] as WorkspaceFolder[] } as AppState;

    expect(appStateUpdates.ensureWorkspaceForCwd("/Users/poolie/project")(state)).toMatchObject({
      workspaces: [{ path: "/Users/poolie/project", name: "project", index: -1 }],
    });
  });

  it("replaces a previous cwd-derived workspace when the ACP session cwd changes", () => {
    const state = {
      workspaces: [{ path: "/Users/poolie/old-project", name: "old-project", index: -1 }],
    } as AppState;

    expect(appStateUpdates.ensureWorkspaceForCwd("/Users/poolie/project")(state)).toMatchObject({
      workspaces: [{ path: "/Users/poolie/project", name: "project", index: -1 }],
    });
  });

  it("leaves host-provided workspace folders alone", () => {
    const state = {
      workspaces: [{ path: "/workspace", name: "workspace", index: 0 }],
    } as AppState;

    expect(appStateUpdates.ensureWorkspaceForCwd("/Users/poolie/project")(state)).toBe(state);
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
});
