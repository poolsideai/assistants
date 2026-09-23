import { describe, expect, it } from "vitest";
import {
  desktopSubagentTabOptions,
  desktopSubagentTabStatusKind,
  matchingDesktopSubagentTabId,
} from "./desktopSubagentTabs";

describe("desktopSubagentTabs", () => {
  it("matches only the same subagent in the same conversation", () => {
    const descriptors = {
      chat: { kind: "chat" as const },
      auth: {
        kind: "subagent-chat" as const,
        conversationId: "conversation-1",
        subagentKey: "claude:task-auth",
        title: "Auth researcher",
      },
      other: {
        kind: "subagent-chat" as const,
        conversationId: "conversation-2",
        subagentKey: "claude:task-auth",
        title: "Auth researcher",
      },
    };

    expect(matchingDesktopSubagentTabId(descriptors, "conversation-1", "claude:task-auth")).toBe(
      "auth",
    );
    expect(
      matchingDesktopSubagentTabId(descriptors, "conversation-1", "claude:task-other"),
    ).toBeUndefined();
  });

  it("creates closable agent tabs with a fallback title", () => {
    expect(desktopSubagentTabOptions("Auth researcher")).toEqual({
      title: "Auth researcher",
      icon: "agent",
      isClosable: true,
    });
    expect(desktopSubagentTabOptions("").title).toBe("Subagent");
  });

  it.each([
    ["running", false, "waiting"],
    ["in_progress", true, "waiting"],
    ["completed", true, "unread"],
    ["completed", false, "default"],
  ] as const)("maps %s with unread=%s to %s", (status, unread, expected) => {
    expect(desktopSubagentTabStatusKind(status, unread)).toBe(expected);
  });
});
