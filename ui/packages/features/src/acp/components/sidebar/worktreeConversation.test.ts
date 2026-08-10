import { describe, expect, it } from "vitest";
import { shouldCreateConversationAfterWorktreeCreation } from "./worktreeConversation";

describe("shouldCreateConversationAfterWorktreeCreation", () => {
  it("does not create a second conversation when the prepare step already started one", () => {
    expect(
      shouldCreateConversationAfterWorktreeCreation({
        createdPath: "/repo/worktrees/first",
        firstConversationPath: "/repo/worktrees/first",
        isLoading: false,
      }),
    ).toBe(false);
  });

  it("uses the first worktree conversation instead of the current conversation", () => {
    expect(
      shouldCreateConversationAfterWorktreeCreation({
        createdPath: "/repo/worktrees/first",
        firstConversationPath: "/repo/worktrees/first",
        isLoading: false,
      }),
    ).toBe(false);
  });

  it("keeps the fallback for flows without a matching first conversation", () => {
    expect(
      shouldCreateConversationAfterWorktreeCreation({
        createdPath: "/repo/worktrees/first",
        firstConversationPath: "/repo/worktrees/newer",
        isLoading: false,
      }),
    ).toBe(true);
  });

  it("does not create a fallback conversation while the session is loading", () => {
    expect(
      shouldCreateConversationAfterWorktreeCreation({
        createdPath: "/repo/worktrees/first",
        firstConversationPath: null,
        isLoading: true,
      }),
    ).toBe(false);
  });
});
