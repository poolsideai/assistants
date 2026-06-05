import { describe, expect, it, vi } from "vitest";
import {
  ACP_PENDING_CONVERSATION_AGENT_EVENT,
  ACP_SESSION_NEW_EVENT,
  ACP_SESSION_TITLE_EVENT,
  ACP_SESSION_TURN_EVENT,
} from "./features/Session.svelte";
import { wireACPHistorySync } from "./wireACPHistorySync";

describe("wireACPHistorySync", () => {
  function mockHistory() {
    return {
      refresh: vi.fn().mockResolvedValue(undefined),
      hideSession: vi.fn(),
      showSession: vi.fn(),
      updateSessionTitle: vi.fn(),
      touchSession: vi.fn(),
    };
  }

  it("refreshes history on new sessions and patches titles in place", () => {
    const emitter = new EventTarget();
    const history = mockHistory();

    const stop = wireACPHistorySync({
      emitter,
      history,
      getRefreshCwd: () => "/workspace",
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_NEW_EVENT, {
        detail: { sessionId: "s-123", agentServer: "default", conversationId: "conv-1" },
      }),
    );
    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_TITLE_EVENT, {
        detail: {
          sessionId: "s-123",
          agentServer: "default",
          conversationId: "conv-1",
          title: "Renamed session",
        },
      }),
    );

    expect(history.showSession).toHaveBeenCalledWith("conv-1");
    expect(history.refresh).toHaveBeenCalledWith("/workspace");
    expect(history.updateSessionTitle).toHaveBeenCalledWith("conv-1", "Renamed session");

    stop();
  });

  it("binds pending capture to the session as soon as the session is created", () => {
    const emitter = new EventTarget();
    const history = mockHistory();
    const capture = { bindConversationSession: vi.fn() };

    const stop = wireACPHistorySync({
      emitter,
      history,
      capture,
      getCanRefresh: () => false,
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_NEW_EVENT, {
        detail: {
          sessionId: "s-123",
          agentServer: "claude-acp",
          conversationId: "conv-1",
        },
      }),
    );

    expect(capture.bindConversationSession).toHaveBeenCalledWith("claude-acp", "conv-1", "s-123");

    stop();
  });

  it("upserts new sessions under their session cwd", () => {
    const emitter = new EventTarget();
    const history = {
      ...mockHistory(),
      upsertConversation: vi.fn().mockResolvedValue(undefined),
    };

    const stop = wireACPHistorySync({
      emitter,
      history,
      getRefreshCwd: () => "/workspace",
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_NEW_EVENT, {
        detail: {
          sessionId: "s-123",
          conversationId: "conv-1",
          agentServer: "claude-acp",
          cwd: "/workspace/worktree",
        },
      }),
    );

    expect(history.upsertConversation).toHaveBeenCalledWith(
      "/workspace/worktree",
      expect.objectContaining({
        sessionId: "s-123",
        id: "conv-1",
        agentServer: "claude-acp",
        cwd: "/workspace/worktree",
      }),
    );

    stop();
  });

  it("uses the supplied first prompt title when upserting a new session", () => {
    const emitter = new EventTarget();
    const history = {
      ...mockHistory(),
      upsertConversation: vi.fn().mockResolvedValue(undefined),
    };

    const stop = wireACPHistorySync({
      emitter,
      history,
      getRefreshCwd: () => "/workspace",
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_NEW_EVENT, {
        detail: {
          sessionId: "s-123",
          conversationId: "conv-2",
          agentServer: "claude-acp",
          cwd: "/workspace/worktree",
          title: "First prompt title",
        },
      }),
    );

    expect(history.upsertConversation).toHaveBeenCalledWith(
      "/workspace/worktree",
      expect.objectContaining({
        id: "conv-2",
        sessionId: "s-123",
        title: "First prompt title",
      }),
    );

    stop();
  });

  it("touches the conversation when the user starts a turn", () => {
    const emitter = new EventTarget();
    const history = mockHistory();

    const stop = wireACPHistorySync({
      emitter,
      history,
      getRefreshCwd: () => "/workspace",
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_TURN_EVENT, {
        detail: { conversationId: "conv-1" },
      }),
    );

    expect(history.touchSession).toHaveBeenCalledWith("conv-1");

    stop();
  });

  it("updates the pending conversation agent before a session exists", () => {
    const emitter = new EventTarget();
    const history = {
      ...mockHistory(),
      upsertConversation: vi.fn().mockResolvedValue(undefined),
    };

    const stop = wireACPHistorySync({
      emitter,
      history,
      getRefreshCwd: () => "/workspace",
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_PENDING_CONVERSATION_AGENT_EVENT, {
        detail: {
          conversationId: "conv-1",
          agentServer: "claude-acp",
          cwd: "/workspace/worktree",
        },
      }),
    );

    expect(history.upsertConversation).toHaveBeenCalledWith(
      "/workspace/worktree",
      expect.objectContaining({
        id: "conv-1",
        sessionId: null,
        agentServer: "claude-acp",
        // A just-created draft is stamped "now" so it sorts to the top.
        updatedAt: expect.any(String),
      }),
    );

    stop();
  });

  it("skips refresh when session history is unsupported", () => {
    const emitter = new EventTarget();
    const history = mockHistory();

    const stop = wireACPHistorySync({
      emitter,
      history,
      getCanRefresh: () => false,
      getRefreshCwd: () => "/workspace",
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_NEW_EVENT, {
        detail: { sessionId: "s-123", agentServer: "default", conversationId: "conv-1" },
      }),
    );

    expect(history.showSession).toHaveBeenCalledWith("conv-1");
    expect(history.refresh).not.toHaveBeenCalled();

    stop();
  });

  it("removes listeners when disposed", () => {
    const emitter = new EventTarget();
    const history = mockHistory();

    const stop = wireACPHistorySync({
      emitter,
      history,
      getRefreshCwd: () => "/workspace",
    });

    stop();
    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_NEW_EVENT, {
        detail: { sessionId: "s-123", agentServer: "default", conversationId: "conv-1" },
      }),
    );
    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_TITLE_EVENT, {
        detail: {
          sessionId: "s-123",
          agentServer: "default",
          conversationId: "conv-1",
          title: "Renamed session",
        },
      }),
    );

    expect(history.refresh).not.toHaveBeenCalled();
    expect(history.hideSession).not.toHaveBeenCalled();
    expect(history.showSession).not.toHaveBeenCalled();
    expect(history.updateSessionTitle).not.toHaveBeenCalled();
  });
});
