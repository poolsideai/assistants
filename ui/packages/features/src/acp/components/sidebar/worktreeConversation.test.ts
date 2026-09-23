import { describe, expect, it } from "vitest";
import { shouldCreateConversationAfterWorktreeCreation } from "./worktreeConversation";

describe("shouldCreateConversationAfterWorktreeCreation", () => {
  it("does not create a second conversation when the prepare step already started one", () => {
    expect(
      shouldCreateConversationAfterWorktreeCreation({
        createdPath: "/repo/worktrees/first",
__POOL_SYNTHETIC_IMPORT_BASELINE__
        isLoading: false,
      }),
    ).toBe(false);
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(
      shouldCreateConversationAfterWorktreeCreation({
        createdPath: "/repo/worktrees/first",
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
        isLoading: false,
      }),
    ).toBe(true);
  });

  it("does not create a fallback conversation while the session is loading", () => {
    expect(
      shouldCreateConversationAfterWorktreeCreation({
        createdPath: "/repo/worktrees/first",
__POOL_SYNTHETIC_IMPORT_BASELINE__
        isLoading: true,
      }),
    ).toBe(false);
  });
});
