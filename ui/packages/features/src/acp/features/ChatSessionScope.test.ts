import { describe, expect, it, vi } from "vitest";
import type { SessionEvent } from "../TurnMaterializer";
import { ACPChatSessionScopeWriter } from "./ChatSessionScope.svelte";

describe("ACPChatSessionScopeWriter", () => {
  it("keeps the active conversation id stable when a draft is promoted", async () => {
    let activeConversationId: string | null = "conversation:1";
    const setActiveConversationId = vi.fn((id: string | null) => {
      activeConversationId = id;
    });
    const session = mockSession("conversation:1", () => {});
    const scope = new ACPChatSessionScopeWriter(
      mockRepo(session),
      () => activeConversationId,
      setActiveConversationId,
    );

    await scope.send("hello", undefined);

    expect(setActiveConversationId).not.toHaveBeenCalled();
    expect(activeConversationId).toBe("conversation:1");
  });

  it("materializes the active draft into the sidebar when the user starts typing", () => {
    const persistPendingConversation = vi.fn();
    const session = {
      ...mockSession("conversation:1", () => {}),
      persistPendingConversation,
    };
    const scope = new ACPChatSessionScopeWriter(mockRepo(session), () => "conversation:1");

    scope.ensureDraftPersisted();

    expect(persistPendingConversation).toHaveBeenCalledTimes(1);
  });

  it("allows changing a staged handoff target", () => {
    const session = {
      ...mockSession("conversation:1", () => {}),
      pendingHandoff: { handoffId: "handoff-1" },
    };
    const scope = new ACPChatSessionScopeWriter(mockRepo(session), () => "conversation:1");

    expect(scope.canChangeAgent).toBe(true);
    expect(scope.hasPendingHandoff).toBe(true);
  });

  it("allows changing agents before an auth-gated session exists", () => {
    const scope = new ACPChatSessionScopeWriter(mockRepo(null), () => "conversation:1");

    expect(scope.canChangeAgent).toBe(true);
  });

  it("derives isRemoteWorking from the pushed conversation live status", () => {
    const session = mockSession("conversation:1", () => {}) as any;
    session.sessionId = "sess-1";
    const conversations = mockConversations([
      {
        id: "conversation:1",
        sessionId: "sess-1",
        agentServer: "poolside",
        liveStatus: { working: true, waitingForUser: false, unread: false },
      },
    ]);
    const scope = new ACPChatSessionScopeWriter(
      mockRepo(session),
      () => "conversation:1",
      undefined,
      conversations,
    );

    // A turn is running for this conversation but was not started here.
    expect(scope.isRemoteWorking).toBe(true);

    // A locally-initiated turn is not "remote": the local prompt lifecycle
    // owns the affordances.
    session.isPrompting = true;
    session.isPromptActive = true;
    expect(scope.isRemoteWorking).toBe(false);
    session.isPrompting = false;
    session.isPromptActive = false;
    session.isSending = true;
    expect(scope.isRemoteWorking).toBe(false);
  });

  it("falls back to a sessionId match and reads false without status or repo", () => {
    const session = mockSession("conversation:other", () => {}) as any;
    session.sessionId = "sess-1";
    const conversations = mockConversations([
      {
        id: "conversation:nav",
        sessionId: "sess-1",
        agentServer: "poolside",
        liveStatus: { working: true, waitingForUser: false, unread: false },
      },
    ]);
    const repo = {
      ...mockRepo(session),
      getSessionByConversationId: () => session,
    } as any;

    const withFallback = new ACPChatSessionScopeWriter(
      repo,
      () => "conversation:other",
      undefined,
      conversations,
    );
    expect(withFallback.isRemoteWorking).toBe(true);

    const idleConversations = mockConversations([
      { id: "conversation:other", sessionId: "sess-1", agentServer: "poolside" },
    ]);
    const idle = new ACPChatSessionScopeWriter(
      repo,
      () => "conversation:other",
      undefined,
      idleConversations,
    );
    expect(idle.isRemoteWorking).toBe(false);

    const withoutRepo = new ACPChatSessionScopeWriter(repo, () => "conversation:other");
    expect(withoutRepo.isRemoteWorking).toBe(false);
  });

  it("derives prompt content support from the active agent before and after session creation", () => {
    const session = mockSession("conversation:1", () => {}) as any;
    const repo = mockRepo(session, {
      selected: { embeddedContext: true, image: true },
      poolside: { embeddedContext: false, image: false },
    });
    const scope = new ACPChatSessionScopeWriter(repo, () => "conversation:1");

    expect(scope.promptContentOptions).toEqual({
      supportsEmbeddedContext: false,
      supportsImages: false,
    });

    repo.agents.defaultAgentServer = "selected";
    session.sessionId = null;
    session.agentServer = "selected";
    expect(scope.promptContentOptions).toEqual({
      supportsEmbeddedContext: true,
      supportsImages: true,
    });
  });

  it("forces compact tool activity for Chats without changing project conversations", () => {
    const events: SessionEvent[] = [
      { eventKind: "user_message", messageId: "u1", content: [] },
      completedTool("read-1"),
      completedTool("read-2"),
      completedTool("read-3"),
    ];
    const chatSession = {
      ...mockSession("conversation:1", () => {}),
      events,
      turns: [],
      isChat: true,
      isPrompting: true,
      isPromptActive: true,
    };
    const chatScope = new ACPChatSessionScopeWriter(
      mockRepo(chatSession),
      () => "conversation:1",
      undefined,
      undefined,
      () => "detailed",
    );

    expect(chatScope.toolActivity).toBe("compact");
    expect(chatScope.timelineItems).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "event_group", live: true })]),
    );

    const projectSession = { ...chatSession, isChat: false };
    const projectScope = new ACPChatSessionScopeWriter(
      mockRepo(projectSession),
      () => "conversation:1",
      undefined,
      undefined,
      () => "detailed",
    );

    expect(projectScope.toolActivity).toBe("detailed");
    expect(projectScope.timelineItems.some((item) => item.kind === "event_group")).toBe(false);
  });

  // PE-2460: the history-unavailable notice replaces the transcript area, so
  // it must yield the moment a prompt starts (or the transcript gains events)
  // rather than sitting over the streaming turn.
  it("clears historyUnavailable while prompting, sending, or once events exist", () => {
    const session = {
      ...mockSession("conversation:1", () => {}),
      restoredWithoutHistory: true,
      isPrompting: false,
      isPromptActive: false,
      isSending: false,
    } as any;
    const scope = new ACPChatSessionScopeWriter(mockRepo(session), () => "conversation:1");

    expect(scope.historyUnavailable).toBe(true);

    session.isPrompting = true;
    session.isPromptActive = true;
    expect(scope.historyUnavailable).toBe(false);
    session.isPrompting = false;
    session.isPromptActive = false;

    session.isSending = true;
    expect(scope.historyUnavailable).toBe(false);
    session.isSending = false;

    // A late replay after the load settled fills the transcript; the notice
    // must not sit above real events.
    session.events = [{ eventKind: "user_message", messageId: "u1", content: [] }];
    expect(scope.historyUnavailable).toBe(false);
  });

  it("does not report historyUnavailable for an ordinary restored session", () => {
    const session = {
      ...mockSession("conversation:1", () => {}),
      restoredWithoutHistory: false,
    };
    const scope = new ACPChatSessionScopeWriter(mockRepo(session), () => "conversation:1");

    expect(scope.historyUnavailable).toBe(false);
  });

  it("only removes Claude child events when transcript tabs are available", () => {
    const session = mockSession("conversation:1", () => {}) as any;
    session.events = [
      {
        eventKind: "tool_call",
        toolCallId: "task-1",
        title: "Research",
        _meta: { claudeCode: { subagent: true } },
      },
      {
        eventKind: "agent_message",
        messageId: null,
        content: [{ type: "text", text: "Child output" }],
        _meta: { claudeCode: { parentToolUseId: "task-1" } },
      },
    ];

    const inlineScope = new ACPChatSessionScopeWriter(mockRepo(session), () => "conversation:1");
    const tabbedScope = new ACPChatSessionScopeWriter(
      mockRepo(session),
      () => "conversation:1",
      undefined,
      undefined,
      undefined,
      true,
    );

    expect(inlineScope.timelineEvents).toHaveLength(2);
    expect(tabbedScope.timelineEvents).toHaveLength(1);
    expect(tabbedScope.subagents.claudeEvents("claude:task-1")).toHaveLength(1);
  });

  it("keeps historical Codex subagents settled during local pre-send setup", () => {
    const session = mockSession("conversation:1", () => {}) as any;
    session.isSending = true;
    // A failed prior prompt can leave the materializer's open-turn boundary
    // stale until the next prompt reaches startTurn.
    session.activeTurnStartIndex = 0;
    session.events = [
      { eventKind: "user_message", messageId: "old-prompt", content: [] },
      {
        eventKind: "tool_call",
        toolCallId: "old-subagent",
        title: "Start subagent reviewer",
        rawInput: {
          agentThreadId: "thread-1",
          agentPath: "/root/reviewer",
          activityKind: "started",
        },
        _meta: {
          codex: {
            subagent: {
              threadId: "thread-1",
              path: "/root/reviewer",
              activity: "started",
            },
          },
        },
      },
    ];
    session.turns = [];
    const scope = new ACPChatSessionScopeWriter(mockRepo(session), () => "conversation:1");

    expect(scope.subagents.referenceForKey("codex:thread-1")?.status).toBe("completed");
  });

  it("does not treat a remote steer as a new subagent turn boundary", () => {
    const session = mockSession("conversation:1", () => {}) as any;
    session.sessionId = "sess-1";
    session.activeTurnStartIndex = null;
    session.events = [
      { eventKind: "user_message", messageId: "prompt", content: [] },
      {
        eventKind: "tool_call",
        toolCallId: "active-subagent",
        title: "Start subagent reviewer",
        rawInput: {
          agentThreadId: "thread-1",
          agentPath: "/root/reviewer",
          activityKind: "started",
        },
        _meta: {
          codex: {
            subagent: {
              threadId: "thread-1",
              path: "/root/reviewer",
              activity: "started",
            },
          },
        },
      },
      { eventKind: "user_message", messageId: "steer", content: [], steer: true },
    ];
    session.turns = [];
    const conversations = mockConversations([
      {
        id: "conversation:1",
        sessionId: "sess-1",
        agentServer: "poolside",
        liveStatus: { working: true, waitingForUser: false, unread: false },
      },
    ]);
    const scope = new ACPChatSessionScopeWriter(
      mockRepo(session),
      () => "conversation:1",
      undefined,
      conversations,
    );

    expect(scope.subagents.referenceForKey("codex:thread-1")?.status).toBe("running");
  });

  it("offers steering only for an active writable session with a supported transport", () => {
    const session = {
      ...mockSession("conversation:1", () => {}),
      sessionId: "session-1",
      isPrompting: true,
      isPromptActive: true,
      sessionInfo: { readOnly: false },
    };
    const repo = mockRepo(session);
    repo.agents.supportsSteering = vi.fn(() => true);
    const scope = new ACPChatSessionScopeWriter(repo, () => "conversation:1");

    expect(scope.canSteerPrompt).toBe(true);
    expect(repo.agents.supportsSteering).toHaveBeenCalledWith("poolside");
    session.sessionInfo.readOnly = true;
    expect(scope.canSteerPrompt).toBe(false);
    session.sessionInfo.readOnly = false;
    session.isPrompting = false;
    session.isPromptActive = false;
    expect(scope.canSteerPrompt).toBe(false);
  });
});

function completedTool(toolCallId: string): SessionEvent {
  return {
    eventKind: "tool_call",
    toolCallId,
    title: toolCallId,
    kind: "read",
    status: "completed",
  };
}

function mockRepo(
  session: unknown,
  capabilitiesByAgentServer: Record<
    string,
    { embeddedContext?: boolean; image?: boolean } | undefined
  > = {},
) {
  return {
    agents: {
      defaultAgentServer: "poolside",
      isConfigCacheLoadingFor: () => false,
      authInProgressForAgent: () => false,
      nonSessionErrorFor: () => null,
      // Resolves from the live connection or the persisted config cache.
      promptCapabilitiesFor: (agentServer: string) =>
        capabilitiesByAgentServer[agentServer] ?? null,
      supportsSteering: () => false,
    },
    getSessionByConversationId: (conversationId: string | null | undefined) =>
      conversationId === "conversation:1" ? session : null,
  } as any;
}

function mockConversations(
  sessions: Array<{
    id: string;
    sessionId: string | null;
    agentServer: string;
    liveStatus?: { working: boolean; waitingForUser: boolean; unread: boolean };
  }>,
) {
  return { sessions } as any;
}

function mockSession(conversationId: string, send: () => void) {
  return {
    conversationId,
    sessionId: null,
    agentServer: "poolside",
    events: [] as SessionEvent[],
    isPrompting: false,
    isPromptActive: false,
    isSending: false,
    queuedPrompts: [],
    serialize: async (fn: (gen: number) => Promise<string | null>) => fn(0),
    sendCore: async (
      _gen: number,
      _text: string,
      _sandboxDefinitionId: string | undefined,
      _newSessionMeta: Record<string, unknown> | undefined,
      _cwd: string,
      _content: unknown[],
    ) => {
      send();
      return "s-new";
    },
  };
}
