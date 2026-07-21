import type { SessionId } from "@agentclientprotocol/sdk";
import { describe, expect, it, vi } from "vitest";
import { ACPConversationStatusRepositoryWriter } from "./ConversationStatusRepository.svelte";
import type { NotificationRepository } from "./NotificationRepository.svelte";

const sessionId = (id: string) => id as SessionId;

function notifications() {
  return {
    dismiss: vi.fn(),
    show: vi.fn().mockResolvedValue(undefined),
  } as unknown as NotificationRepository;
}

function syncSession(
  repo: ACPConversationStatusRepositoryWriter,
  opts: {
    conversationId: string;
    sessionId: SessionId | null;
    agentServer?: string;
    working?: boolean;
    waitingForUser?: boolean;
  },
) {
  repo.syncLiveSessions([
    {
      conversationId: opts.conversationId,
      sessionId: opts.sessionId,
      agentServer: opts.agentServer ?? "agent-a",
      working: opts.working ?? false,
      waitingForUser: opts.waitingForUser ?? false,
    },
  ]);
}

describe("ACPConversationStatusRepositoryWriter", () => {
  it("scopes working conversations to their agent across local and remote surfaces", () => {
    const repo = new ACPConversationStatusRepositoryWriter();
    syncSession(repo, {
      conversationId: "conversation-1",
      sessionId: sessionId("session-1"),
      working: true,
    });
    repo.syncRemoteStatuses([
      {
        sessionId: sessionId("remote-session"),
        agentServer: "agent-b",
        liveStatus: { working: true, waitingForUser: false, unread: false },
      },
    ]);
    expect(repo.hasWorkingConversationForAgent("agent-a")).toBe(true);
    expect(repo.hasWorkingConversationForAgent("agent-b")).toBe(true);
    expect(repo.hasWorkingConversationForAgent("agent")).toBe(false);
    repo.syncRemoteStatuses([]);
    expect(repo.hasWorkingConversationForAgent("agent-b")).toBe(false);
    expect(repo.hasWorkingConversationForAgent("agent-a")).toBe(true);
    repo.syncLiveSessions([]);
    expect(repo.hasWorkingConversationForAgent("agent-a")).toBe(false);
  });

  it("reports working conversations from local and remote surfaces", () => {
    const repo = new ACPConversationStatusRepositoryWriter();
    expect(repo.hasWorkingConversation).toBe(false);

    repo.syncRemoteStatuses([
      {
        sessionId: sessionId("remote-session"),
        agentServer: "agent-a",
        liveStatus: { working: true, waitingForUser: false, unread: false },
      },
    ]);
    expect(repo.hasWorkingConversation).toBe(true);

    repo.syncRemoteStatuses([]);
    syncSession(repo, {
      conversationId: "conversation-1",
      sessionId: sessionId("session-1"),
      working: true,
    });
    expect(repo.hasWorkingConversation).toBe(true);
  });

  it("syncs working and waiting status for live sessions", () => {
    const repo = new ACPConversationStatusRepositoryWriter();

    syncSession(repo, {
      conversationId: "conversation-1",
      sessionId: sessionId("session-1"),
      working: true,
      waitingForUser: true,
    });

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).toEqual({
      working: true,
      waitingForUser: true,
      unread: false,
    });
  });

  it("marks unread and sends a turn-completed notification", () => {
    const notificationRepo = notifications();
    const repo = new ACPConversationStatusRepositoryWriter(notificationRepo);
    syncSession(repo, { conversationId: "conversation-1", sessionId: sessionId("session-1") });

    repo.markUnread(sessionId("session-1"), "agent-a");

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).toEqual({
      working: false,
      waitingForUser: false,
      unread: true,
    });
    expect(notificationRepo.dismiss).toHaveBeenCalledWith(sessionId("session-1"), "agent-a");
    expect(notificationRepo.show).toHaveBeenCalledWith({
      type: "turn_completed",
      sessionId: sessionId("session-1"),
      agentServer: "agent-a",
    });
  });

  it("clears unread and dismisses notifications", () => {
    const notificationRepo = notifications();
    const repo = new ACPConversationStatusRepositoryWriter(notificationRepo);
    syncSession(repo, { conversationId: "conversation-1", sessionId: sessionId("session-1") });
    repo.markUnread(sessionId("session-1"), "agent-a");

    repo.clearUnread(sessionId("session-1"), "agent-a");

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a").unread).toBe(false);
    expect(notificationRepo.dismiss).toHaveBeenLastCalledWith(sessionId("session-1"), "agent-a");
  });

  it("marks and clears waiting-for-user status", () => {
    const notificationRepo = notifications();
    const repo = new ACPConversationStatusRepositoryWriter(notificationRepo);
    syncSession(repo, { conversationId: "conversation-1", sessionId: sessionId("session-1") });

    repo.markWaitingForUser({
      type: "elicitation",
      sessionId: sessionId("session-1"),
      agentServer: "agent-a",
    });

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).toEqual({
      working: false,
      waitingForUser: true,
      unread: true,
    });
    expect(notificationRepo.show).toHaveBeenCalledWith({
      type: "elicitation",
      sessionId: sessionId("session-1"),
      agentServer: "agent-a",
    });

    repo.clearWaitingForUser(sessionId("session-1"), "agent-a");

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).toEqual({
      working: false,
      waitingForUser: false,
      unread: true,
    });
    expect(notificationRepo.dismiss).toHaveBeenCalledWith(sessionId("session-1"), "agent-a");
  });

  it("preserves unread across live session sync", () => {
    const repo = new ACPConversationStatusRepositoryWriter();
    syncSession(repo, { conversationId: "conversation-1", sessionId: sessionId("session-1") });
    repo.markWaitingForUser({
      type: "elicitation",
      sessionId: sessionId("session-1"),
      agentServer: "agent-a",
    });

    syncSession(repo, {
      conversationId: "conversation-1",
      sessionId: sessionId("session-1"),
      working: true,
      waitingForUser: false,
    });

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).toEqual({
      working: true,
      waitingForUser: false,
      unread: true,
    });
  });

  it("keeps status identity stable when a sync changes nothing", () => {
    const repo = new ACPConversationStatusRepositoryWriter();
    syncSession(repo, {
      conversationId: "conversation-1",
      sessionId: sessionId("session-1"),
      working: true,
    });
    const before = repo.getConversationStatus(sessionId("session-1"), "agent-a");

    syncSession(repo, {
      conversationId: "conversation-1",
      sessionId: sessionId("session-1"),
      working: true,
    });

    // Same object, not just equal: syncLiveSessions runs on every session
    // update, and a fresh identity would re-derive every status reader.
    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).toBe(before);

    syncSession(repo, {
      conversationId: "conversation-1",
      sessionId: sessionId("session-1"),
      working: false,
    });

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).not.toBe(before);
    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a").working).toBe(false);
  });

  it("removes statuses for sessions that are no longer live", () => {
    const repo = new ACPConversationStatusRepositoryWriter();
    syncSession(repo, { conversationId: "conversation-1", sessionId: sessionId("session-1") });
    repo.markWaitingForUser({
      type: "elicitation",
      sessionId: sessionId("session-1"),
      agentServer: "agent-a",
    });

    repo.syncLiveSessions([]);

    expect(repo.getConversationStatus(sessionId("session-1"), "agent-a")).toEqual({
      working: false,
      waitingForUser: false,
      unread: false,
    });
  });
});
