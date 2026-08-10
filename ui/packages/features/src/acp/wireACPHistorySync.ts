import type { ACPDebugCaptureAPI } from "./debugDump";
import {
  ACP_PENDING_CONVERSATION_AGENT_EVENT,
  ACP_SESSION_NEW_EVENT,
  ACP_SESSION_TITLE_EVENT,
  ACP_SESSION_TURN_EVENT,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

interface ACPHistorySyncTarget {
  refresh?: (cwd?: string) => Promise<void>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  upsertConversation?: (
    workspacePath: string,
    session: {
      id: string;
      sessionId: string | null;
      agentServer: string;
      cwd: string;
      title: string | null;
      updatedAt: string | null;
      source: "native_session";
      readOnly: false;
      errorMessage: null;
      cancellationReason: null;
      conversationId: null;
      conversationKind: null;
      agentId: null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      workingDirectories: string[];
      _meta: Record<string, unknown>;
    },
  ) => Promise<unknown>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  touchSession?: (conversationId: string) => void;
}

interface ACPHistorySyncOptions {
  emitter: EventTarget;
  history: ACPHistorySyncTarget;
  capture?: Pick<ACPDebugCaptureAPI, "bindConversationSession">;
  getCanRefresh?: () => boolean;
  getRefreshCwd?: () => string;
}

interface ACPSessionEventDetail {
  sessionId: string;
  agentServer: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  cwd?: string;
  workspacePath?: string;
  workingDirectories?: string[];
  userInitiated?: boolean;
  title?: string;
}

interface ACPPendingConversationAgentDetail {
  conversationId: string;
  agentServer: string;
  cwd: string;
  workspacePath?: string;
  workingDirectories?: string[];
}

export function wireACPHistorySync({
  emitter,
  history,
  capture,
  getCanRefresh = () => true,
  getRefreshCwd = () => "/",
}: ACPHistorySyncOptions): () => void {
  const upsertNewSession = (
    sessionId: string,
    agentServer: string,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    cwd?: string,
    workspacePath?: string,
    workingDirectories?: string[],
    title = "Untitled Conversation",
  ) => {
    if (!getCanRefresh()) return;
    const navWorkspacePath = workspacePath || cwd || getRefreshCwd();
    const navCwd = cwd || navWorkspacePath;
    if (history.upsertConversation) {
      void history.upsertConversation(navWorkspacePath, {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        sessionId,
        agentServer,
        cwd: navCwd,
        workingDirectories: cloneWorkingDirectories(workingDirectories, navCwd),
        title,
        updatedAt: new Date().toISOString(),
        source: "native_session",
        readOnly: false,
        errorMessage: null,
        cancellationReason: null,
        conversationId: null,
        conversationKind: null,
        agentId: null,
        _meta: {},
      });
      return;
    }
    void history.refresh?.(navWorkspacePath);
  };

  const handleSessionNew = (event: Event) => {
    const {
      sessionId,
      agentServer,
      cwd,
      workspacePath,
      workingDirectories,
      conversationId,
      title,
    } = (event as CustomEvent<ACPSessionEventDetail>).detail;
    capture?.bindConversationSession(agentServer, conversationId, sessionId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    upsertNewSession(
      sessionId,
      agentServer,
      conversationId,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      workspacePath,
      workingDirectories,
      title,
    );
  };

  const handleSessionTurn = (event: Event) => {
    const { conversationId } = (event as CustomEvent<{ conversationId: string }>).detail;
    if (!conversationId) return;
    history.touchSession?.(conversationId);
  };

  const handleSessionTitle = (event: Event) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      event as CustomEvent<ACPSessionEventDetail & { title: string }>
    ).detail;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  };

  const handlePendingConversationAgent = (event: Event) => {
    if (!history.upsertConversation) return;
    const { conversationId, agentServer, cwd, workspacePath, workingDirectories } = (
      event as CustomEvent<ACPPendingConversationAgentDetail>
    ).detail;
    void history
      .upsertConversation(workspacePath ?? cwd, {
        id: conversationId,
        sessionId: null,
        agentServer,
        cwd,
        workingDirectories: cloneWorkingDirectories(workingDirectories, cwd),
        title: "New conversation",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        source: "native_session",
        readOnly: false,
        errorMessage: null,
        cancellationReason: null,
        conversationId: null,
        conversationKind: null,
        agentId: null,
        _meta: {},
      })
      .catch((error) => {
        console.error("Failed to update pending ACP conversation agent", error);
      });
  };

  emitter.addEventListener(ACP_SESSION_NEW_EVENT, handleSessionNew);
  emitter.addEventListener(ACP_SESSION_TURN_EVENT, handleSessionTurn);
  emitter.addEventListener(ACP_SESSION_TITLE_EVENT, handleSessionTitle);
  emitter.addEventListener(ACP_PENDING_CONVERSATION_AGENT_EVENT, handlePendingConversationAgent);

  return () => {
    emitter.removeEventListener(ACP_SESSION_NEW_EVENT, handleSessionNew);
    emitter.removeEventListener(ACP_SESSION_TURN_EVENT, handleSessionTurn);
    emitter.removeEventListener(ACP_SESSION_TITLE_EVENT, handleSessionTitle);
    emitter.removeEventListener(
      ACP_PENDING_CONVERSATION_AGENT_EVENT,
      handlePendingConversationAgent,
    );
  };
}

function cloneWorkingDirectories(
  workingDirectories: readonly string[] | undefined,
  fallbackCwd: string,
): string[] {
  const source = workingDirectories?.length ? workingDirectories : [fallbackCwd].filter(Boolean);
  return Array.from(source);
}
