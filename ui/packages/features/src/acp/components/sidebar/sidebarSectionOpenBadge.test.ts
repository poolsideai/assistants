import { describe, expect, it } from "vitest";
import type { ACPConversationSummary } from "../../navTypes";
import { ACP_CHAT_WORKSPACE_PATH } from "../../workspaceScope";
import {
  activeConversationSidebarSection,
  shouldShowSidebarSectionOpenBadge,
  sidebarSectionToggleLabel,
} from "./sidebarSectionOpenBadge";

function conversation(id: string, workspacePath?: string): ACPConversationSummary {
  const cwd = workspacePath ?? "";
  return {
    id,
    sessionId: `session-${id}`,
    agentServer: "poolside",
    workingDirectories: [cwd],
    workspacePath,
    cwd,
    title: `Conversation ${id}`,
    updatedAt: null,
    source: "native_session",
    readOnly: false,
    errorMessage: null,
    cancellationReason: null,
    conversationId: id,
    conversationKind: "agentic",
    agentId: null,
    _meta: {},
  };
}

describe("sidebar section Open badges", () => {
  it("identifies whether the selected conversation belongs to Chats or Projects", () => {
    const chats = conversation("chat", ACP_CHAT_WORKSPACE_PATH);
    const project = conversation("project", "/repo");

    expect(activeConversationSidebarSection([chats, project], (session) => session === chats)).toBe(
      "chats",
    );
    expect(
      activeConversationSidebarSection([chats, project], (session) => session === project),
    ).toBe("projects");
    expect(activeConversationSidebarSection([chats, project], () => false)).toBeNull();
  });

  it("uses the selected live session to classify summaries whose workspace has not persisted yet", () => {
    const pendingChat = conversation("pending-chat");

    expect(
      activeConversationSidebarSection(
        [pendingChat],
        () => true,
        (session) => (session === pendingChat ? true : undefined),
      ),
    ).toBe("chats");
  });

  it("shows Open only on the collapsed section containing the active conversation", () => {
    expect(shouldShowSidebarSectionOpenBadge("projects", true, "projects")).toBe(true);
    expect(shouldShowSidebarSectionOpenBadge("projects", false, "projects")).toBe(false);
    expect(shouldShowSidebarSectionOpenBadge("chats", true, "projects")).toBe(false);
    expect(shouldShowSidebarSectionOpenBadge("projects", true, null)).toBe(false);
  });

  it("includes the open status in the collapsed section toggle label", () => {
    expect(sidebarSectionToggleLabel("chats", true, true)).toBe(
      "Expand Chats, contains open conversation",
    );
    expect(sidebarSectionToggleLabel("projects", false, false)).toBe("Collapse Projects");
  });
});
