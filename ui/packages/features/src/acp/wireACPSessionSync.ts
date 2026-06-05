import type { ACPDebugCaptureAPI } from "./debugDump";
import {
  ACP_SESSION_CLOSE_EVENT,
  ACP_SESSION_DELETE_EVENT,
  type ACPClosedSession,
} from "./navTypes";

interface ACPSessionSyncTarget {
  sessionId: string | null;
  sessionAgentServer?: string | null;
  pendingConversationId?: string | null;
  clearActiveSession: () => void;
}

interface ACPSessionSyncOptions {
  emitter: EventTarget;
  session?: ACPSessionSyncTarget;
  capture?: Pick<ACPDebugCaptureAPI, "resetConversationCollecting" | "resetSessionCollecting">;
  // The session repository, when the host has one: a closed session's warm
  // record must be dropped, or reopening it hands out a record whose next
  // wire call hits the closed agent-side session.
  sessions?: { releaseClosedSession: (closed: ACPClosedSession) => void };
}

export function wireACPSessionSync({
  emitter,
  session,
  capture,
  sessions,
}: ACPSessionSyncOptions): () => void {
  const handleSessionDelete = (event: Event) => {
    const detail = (event as CustomEvent<string | { sessionId: string; agentServer?: string }>)
      .detail;
    const deletedSessionId = typeof detail === "string" ? detail : detail.sessionId;
    const deletedAgentServer = typeof detail === "string" ? undefined : detail.agentServer;
    if (
      session &&
      session.sessionId === deletedSessionId &&
      (!deletedAgentServer ||
        !session.sessionAgentServer ||
        session.sessionAgentServer === deletedAgentServer)
    ) {
      session.clearActiveSession();
    }
  };

  const handleSessionClose = (event: Event) => {
    const detail = (event as CustomEvent<ACPClosedSession>).detail;
    if (detail?.conversationId) {
      capture?.resetConversationCollecting(
        detail.agentServer,
        detail.conversationId,
        detail.sessionId ?? null,
      );
    } else if (detail?.sessionId) {
      capture?.resetSessionCollecting(detail.agentServer, detail.sessionId);
    }
    if (detail) {
      sessions?.releaseClosedSession(detail);
    }
    if (session && closedSessionMatches(session, detail)) {
      session.clearActiveSession();
    }
  };

  emitter.addEventListener(ACP_SESSION_DELETE_EVENT, handleSessionDelete);
  emitter.addEventListener(ACP_SESSION_CLOSE_EVENT, handleSessionClose);

  return () => {
    emitter.removeEventListener(ACP_SESSION_DELETE_EVENT, handleSessionDelete);
    emitter.removeEventListener(ACP_SESSION_CLOSE_EVENT, handleSessionClose);
  };
}

function closedSessionMatches(
  session: ACPSessionSyncTarget,
  detail: ACPClosedSession | undefined,
): boolean {
  if (!detail) return false;
  const sameAgentServer =
    !session.sessionAgentServer || session.sessionAgentServer === detail.agentServer;
  if (!sameAgentServer) return false;
  if (detail.sessionId && session.sessionId === detail.sessionId) return true;
  return Boolean(
    detail.conversationId &&
      session.sessionId === null &&
      session.pendingConversationId === detail.conversationId,
  );
}
