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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    session.isPromptActive = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    session.isPromptActive = false;
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function completedTool(toolCallId: string): SessionEvent {
  return {
    eventKind: "tool_call",
    toolCallId,
    title: toolCallId,
    kind: "read",
    status: "completed",
  };
}

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      supportsSteering: () => false,
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isPrompting: false,
    isPromptActive: false,
    isSending: false,
    queuedPrompts: [],
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
