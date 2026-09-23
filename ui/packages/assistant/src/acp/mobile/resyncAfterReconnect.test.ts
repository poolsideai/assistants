import { describe, expect, it, vi } from "vitest";

import { resyncAfterReconnect } from "./resyncAfterReconnect";

describe("resyncAfterReconnect", () => {
  it("refreshes conversations and approvals and reloads stale sessions", () => {
    const refreshConversations = vi.fn().mockResolvedValue(undefined);
    const refreshApprovals = vi.fn().mockResolvedValue(undefined);
    const reloadLiveSession = vi.fn().mockResolvedValue(undefined);
    const core = {
      acpConversationRepo: { refresh: refreshConversations },
      acpRepo: { refreshApprovals, reloadLiveSession },
    };

    resyncAfterReconnect(core as never, [
      { agentServer: "agent-a", sessionId: "session-1" },
      { agentServer: "agent-b", sessionId: "session-2" },
    ]);

    expect(refreshConversations).toHaveBeenCalledWith({ showLoading: false });
    expect(refreshApprovals).toHaveBeenCalledOnce();
    expect(reloadLiveSession.mock.calls).toEqual([
      ["session-1", "agent-a"],
      ["session-2", "agent-b"],
    ]);
  });
});
