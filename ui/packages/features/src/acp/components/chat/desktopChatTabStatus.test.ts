import { describe, expect, it, vi } from "vitest";
import {
  desktopChatLiveStatusForSession,
  desktopChatTabStatusKind,
  emptyDesktopChatLiveStatus,
} from "./desktopChatTabStatus";

describe("desktopChatTabStatus", () => {
  it.each([
    ["waiting", { working: true, waitingForUser: true, unread: true }, "waiting"],
    ["working with unread", { working: true, waitingForUser: false, unread: true }, "unread"],
    ["working only", { working: true, waitingForUser: false, unread: false }, "default"],
    ["unread", { working: false, waitingForUser: false, unread: true }, "unread"],
    ["default", { working: false, waitingForUser: false, unread: false }, "default"],
  ] as const)("maps %s live status to the tab status kind", (_name, liveStatus, expected) => {
    expect(desktopChatTabStatusKind(liveStatus)).toBe(expected);
  });

  it("merges repository and active-session live status for loaded sessions", () => {
    const getConversationStatus = vi.fn(() => ({
      working: false,
      waitingForUser: true,
      unread: false,
    }));

    expect(
      desktopChatLiveStatusForSession(
        {
          sessionId: "session-1",
          agentServer: "poolside",
          isPrompting: true,
          isSending: true,
          pendingPermissionRequests: [],
        },
        getConversationStatus,
      ),
    ).toEqual({ working: true, waitingForUser: true, unread: false });
    expect(getConversationStatus).toHaveBeenCalledWith("session-1", "poolside");
  });

  it("derives pending session live status locally", () => {
    const getConversationStatus = vi.fn();

    expect(
      desktopChatLiveStatusForSession(
        {
          sessionId: null,
          agentServer: "poolside",
          isPrompting: false,
          isSending: true,
          pendingPermissionRequests: [{}],
        },
        getConversationStatus,
      ),
    ).toEqual({ working: true, waitingForUser: true, unread: false });
    expect(getConversationStatus).not.toHaveBeenCalled();
  });

  it("falls back to empty status without an active session", () => {
    expect(desktopChatLiveStatusForSession(null, vi.fn())).toBe(emptyDesktopChatLiveStatus);
  });
});
