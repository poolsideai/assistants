import { describe, expect, it } from "vitest";
import {
  conversationFitsWorkspaceFolders,
  workspacePathFitsWorkspaceFolders,
} from "./workspacePaths";

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

describe("conversationFitsWorkspaceFolders", () => {
  it("shows every conversation when no folder is open", () => {
    expect(conversationFitsWorkspaceFolders({ cwd: "/repo" }, [])).toBe(true);
    expect(conversationFitsWorkspaceFolders({ cwd: "/somewhere/else" }, [])).toBe(true);
    expect(conversationFitsWorkspaceFolders({ cwd: "" }, [])).toBe(true);
  });

  it("keeps conversations whose cwd is in an open folder", () => {
    expect(conversationFitsWorkspaceFolders({ cwd: "/repo/app" }, [{ path: "/repo" }])).toBe(true);
  });

  it("drops conversations from an unrelated folder", () => {
    expect(conversationFitsWorkspaceFolders({ cwd: "/other" }, [{ path: "/repo" }])).toBe(false);
  });

  it("matches on any of the conversation's working directories", () => {
    const conversation = { cwd: "/other", workingDirectories: ["/other", "/repo/app"] };

    expect(conversationFitsWorkspaceFolders(conversation, [{ path: "/repo" }])).toBe(true);
  });

  it("falls back to cwd when the conversation has no working directories", () => {
    expect(
      conversationFitsWorkspaceFolders({ cwd: "/repo", workingDirectories: [] }, [
        { path: "/repo" },
      ]),
    ).toBe(true);
  });

  it("drops a conversation with no cwd when a folder is open", () => {
    expect(conversationFitsWorkspaceFolders({ cwd: null }, [{ path: "/repo" }])).toBe(false);
  });
});
