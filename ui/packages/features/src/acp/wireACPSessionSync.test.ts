import { describe, expect, it, vi } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__
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

__POOL_SYNTHETIC_IMPORT_BASELINE__
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(new CustomEvent(ACP_SESSION_DELETE_EVENT, { detail: "s-123" }));

__POOL_SYNTHETIC_IMPORT_BASELINE__

    stop();
  });

  it("does not clear session when deleted session differs from current session", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(new CustomEvent(ACP_SESSION_DELETE_EVENT, { detail: "s-456" }));

__POOL_SYNTHETIC_IMPORT_BASELINE__

    stop();
  });

  it("does not clear session when deleted session belongs to another agent server", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: "s-123",
      sessionAgentServer: "poolside",
__POOL_SYNTHETIC_IMPORT_BASELINE__
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

__POOL_SYNTHETIC_IMPORT_BASELINE__

    stop();
  });

  it("does not clear session when current session is null", () => {
    const emitter = new EventTarget();
    const session = {
      sessionId: null,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };

    const stop = wireACPSessionSync({
      emitter,
      session,
    });

    emitter.dispatchEvent(new CustomEvent(ACP_SESSION_DELETE_EVENT, { detail: "s-123" }));

__POOL_SYNTHETIC_IMPORT_BASELINE__

    stop();
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
});
