import type { ACPDebugCaptureAPI } from "./debugDump";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
} from "./navTypes";

interface ACPSessionSyncTarget {
  sessionId: string | null;
  sessionAgentServer?: string | null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }
  };

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  emitter.addEventListener(ACP_SESSION_DELETE_EVENT, handleSessionDelete);
__POOL_SYNTHETIC_IMPORT_BASELINE__

  return () => {
    emitter.removeEventListener(ACP_SESSION_DELETE_EVENT, handleSessionDelete);
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
