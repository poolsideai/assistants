import { describe, expect, it, vi } from "vitest";
import type { ACPDebugCaptureAPI } from "../../debugDump";
import { acpLogCaptureMenuAction } from "./acpLogCapture";

function capture(collecting: boolean): ACPDebugCaptureAPI {
  return {
    state: () => ({ collecting: false, pendingConversations: [], sessions: [] }),
    subscribe: () => () => {},
    setConversationCollecting: vi.fn(),
    resetConversationCollecting: vi.fn(),
    isConversationCollecting: () => collecting,
    bindConversationSession: vi.fn(),
    setSessionCollecting: vi.fn(),
    resetSessionCollecting: vi.fn(),
    isCollecting: () => false,
  };
}

describe("acpLogCaptureMenuAction", () => {
  it("stops collecting for just this conversation while collection is on", async () => {
    const api = capture(true);
    const request = vi.fn();
    const action = acpLogCaptureMenuAction(
      api,
      {
        agentServer: "codex",
        conversationId: "conversation-1",
        sessionId: "session-1",
      },
      request,
    );

    expect(action).toMatchObject({ name: "Stop Collecting ACP Events", disabled: false });
    await action.callback();
    expect(api.setConversationCollecting).toHaveBeenCalledWith(
      "codex",
      "conversation-1",
      "session-1",
      false,
    );
    expect(request).not.toHaveBeenCalled();
  });

  it("requests confirmation before collecting while collection is off", async () => {
    const api = capture(false);
    const request = vi.fn();
    const action = acpLogCaptureMenuAction(
      api,
      {
        agentServer: "codex",
        conversationId: "conversation-1",
        sessionId: "session-1",
      },
      request,
    );

    expect(action).toMatchObject({ name: "Collect ACP Events…", disabled: false });
    await action.callback();
    expect(request).toHaveBeenCalledWith({
      agentServer: "codex",
      conversationId: "conversation-1",
      sessionId: "session-1",
    });
    expect(api.setConversationCollecting).not.toHaveBeenCalled();
  });

  it("can start collecting before the first prompt creates a session", async () => {
    const api = capture(false);
    const request = vi.fn();
    const action = acpLogCaptureMenuAction(
      api,
      {
        agentServer: "codex",
        conversationId: "conversation-1",
        sessionId: null,
      },
      request,
    );

    expect(action).toMatchObject({ name: "Collect ACP Events…", disabled: false });
    await action.callback();
    expect(request).toHaveBeenCalledWith({
      agentServer: "codex",
      conversationId: "conversation-1",
      sessionId: null,
    });
  });

  it("is disabled without a capture API", () => {
    expect(
      acpLogCaptureMenuAction(
        undefined,
        {
          agentServer: "codex",
          conversationId: "conversation-1",
          sessionId: "session-1",
        },
        vi.fn(),
      ),
    ).toMatchObject({ disabled: true });
  });
});
