import { describe, expect, it } from "vitest";
import { ACP_CHAT_WORKSPACE_PATH } from "../../workspaceScope";
import { isConversationVisibleInSearch } from "./conversationSearchVisibility";

const projects = [{ path: "/code/assistant" }, { path: "/worktrees/assistant/feature" }];

describe("isConversationVisibleInSearch", () => {
  it("includes explicit projectless chats even though their cwd is a storage directory", () => {
    expect(
      isConversationVisibleInSearch(
        { cwd: "/state/chats/83a1300d", workspacePath: ACP_CHAT_WORKSPACE_PATH },
        projects,
      ),
    ).toBe(true);
  });

  it("includes conversations attached to an exact project or worktree", () => {
    expect(
      isConversationVisibleInSearch(
        { cwd: "/code/assistant", workspacePath: "/code/assistant" },
        projects,
      ),
    ).toBe(true);
    expect(
      isConversationVisibleInSearch(
        {
          cwd: "/worktrees/assistant/feature",
          workspacePath: "/worktrees/assistant/feature",
        },
        projects,
      ),
    ).toBe(true);
  });

  it("excludes orphaned sessions that the sidebar cannot place", () => {
    expect(
      isConversationVisibleInSearch(
        { cwd: "/state/chats/83a1300d", workspacePath: "/state/chats/83a1300d" },
        projects,
      ),
    ).toBe(false);
  });

  it("uses the owning workspace rather than the session cwd", () => {
    expect(
      isConversationVisibleInSearch(
        { cwd: "/code/assistant/packages/app", workspacePath: "/code/assistant" },
        projects,
      ),
    ).toBe(true);
    expect(
      isConversationVisibleInSearch(
        { cwd: "/code/assistant", workspacePath: "/code/removed-project" },
        projects,
      ),
    ).toBe(false);
  });

  it("excludes worktrees whose parent project is not visible", () => {
    expect(
      isConversationVisibleInSearch(
        {
          cwd: "/worktrees/removed/feature",
          workspacePath: "/worktrees/removed/feature",
        },
        [
          ...projects,
          {
            path: "/worktrees/removed/feature",
            isWorktree: true,
            parentPath: "/code/removed",
          },
        ],
      ),
    ).toBe(false);
  });
});
