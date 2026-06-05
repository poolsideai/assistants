import { describe, expect, it, vi } from "vitest";
import { ACP_SESSION_CLOSE_EVENT, ACP_SESSION_DELETE_EVENT } from "./navTypes";
import { wireACPSessionSync } from "./wireACPSessionSync";

describe("wireACPSessionSync", () => {
  it("releases the closed session's warm record from the session repository", () => {
    const emitter = new EventTarget();
    const sessions = { releaseClosedSession: vi.fn() };

    const stop = wireACPSessionSync({ emitter, sessions });

    const closed = { sessionId: "s-123", agentServer: "poolside", conversationId: "c-1" };
    emitter.dispatchEvent(new CustomEvent(ACP_SESSION_CLOSE_EVENT, { detail: closed }));

    expect(sessions.releaseClosedSession).toHaveBeenCalledWith(closed);

    stop();
  });

  it("clears active session when deleted session matches current session", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
      clearActiveSession: vi.fn(),
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(new CustomEvent(ACP_SESSION_DELETE_EVENT, { detail: "s-123" }));

    expect(session.clearActiveSession).toHaveBeenCalled();

    stop();
  });

  it("does not clear session when deleted session differs from current session", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
      clearActiveSession: vi.fn(),
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(new CustomEvent(ACP_SESSION_DELETE_EVENT, { detail: "s-456" }));

    expect(session.clearActiveSession).not.toHaveBeenCalled();

    stop();
  });

  it("does not clear session when deleted session belongs to another agent server", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
      sessionAgentServer: "poolside",
      clearActiveSession: vi.fn(),
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_DELETE_EVENT, {
        detail: { sessionId: "s-123", agentServer: "other" },
      }),
    );

    expect(session.clearActiveSession).not.toHaveBeenCalled();

    stop();
  });

  it("does not clear session when current session is null", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: null,
      clearActiveSession: vi.fn(),
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(new CustomEvent(ACP_SESSION_DELETE_EVENT, { detail: "s-123" }));

    expect(session.clearActiveSession).not.toHaveBeenCalled();

    stop();
  });

  it("clears active session when closed session matches current session", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
      sessionAgentServer: "poolside",
      clearActiveSession: vi.fn(),
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_CLOSE_EVENT, {
        detail: { sessionId: "s-123", agentServer: "poolside" },
      }),
    );

    expect(session.clearActiveSession).toHaveBeenCalled();

    stop();
  });

  it("stops event collection when a session is closed", () => {
    const emitter = new EventTarget();
    const capture = {
      resetConversationCollecting: vi.fn(),
      resetSessionCollecting: vi.fn(),
    };

    const stop = wireACPSessionSync({ emitter, capture });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_CLOSE_EVENT, {
        detail: { sessionId: "s-123", agentServer: "poolside" },
      }),
    );

    expect(capture.resetSessionCollecting).toHaveBeenCalledWith("poolside", "s-123");

    stop();
  });

  it("stops pending event collection when a pending conversation is closed", () => {
    const emitter = new EventTarget();
    const capture = {
      resetConversationCollecting: vi.fn(),
      resetSessionCollecting: vi.fn(),
    };

    const stop = wireACPSessionSync({ emitter, capture });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_CLOSE_EVENT, {
        detail: {
          sessionId: null,
          conversationId: "conversation:123",
          agentServer: "poolside",
        },
      }),
    );

    expect(capture.resetConversationCollecting).toHaveBeenCalledWith(
      "poolside",
      "conversation:123",
      null,
    );
    expect(capture.resetSessionCollecting).not.toHaveBeenCalled();

    stop();
  });

  it("clears pending active session when closed conversation matches pending conversation", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: null,
      sessionAgentServer: "poolside",
      pendingConversationId: "conversation:123",
      clearActiveSession: vi.fn(),
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_CLOSE_EVENT, {
        detail: { conversationId: "conversation:123", agentServer: "poolside" },
      }),
    );

    expect(session.clearActiveSession).toHaveBeenCalled();

    stop();
  });

  it("does not clear session when closed session belongs to another agent server", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
      sessionAgentServer: "poolside",
      clearActiveSession: vi.fn(),
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(
      new CustomEvent(ACP_SESSION_CLOSE_EVENT, {
        detail: { sessionId: "s-123", agentServer: "other" },
      }),
    );

    expect(session.clearActiveSession).not.toHaveBeenCalled();

    stop();
  });
});
