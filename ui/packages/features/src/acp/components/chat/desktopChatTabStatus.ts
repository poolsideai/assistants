__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

export interface DesktopChatStatusSession {
  sessionId: string | null;
  agentServer: string;
  isPrompting: boolean;
  isSending: boolean;
  pendingPermissionRequests: readonly unknown[];
}

export type DesktopChatConversationStatusGetter = (
  sessionId: string,
  agentServer: string,
) => ACPConversationLiveStatus;

export const emptyDesktopChatLiveStatus: ACPConversationLiveStatus = {
  working: false,
  waitingForUser: false,
  unread: false,
};

export function desktopChatLiveStatusForSession(
  session: DesktopChatStatusSession | null | undefined,
  getConversationStatus: DesktopChatConversationStatusGetter,
): ACPConversationLiveStatus {
  if (!session) return emptyDesktopChatLiveStatus;
  const localStatus = {
    working: session.isPrompting || session.isSending,
    waitingForUser: session.pendingPermissionRequests.length > 0,
  };
  if (session.sessionId) {
    const repositoryStatus = getConversationStatus(session.sessionId, session.agentServer);
    return {
      working: repositoryStatus.working || localStatus.working,
      waitingForUser: repositoryStatus.waitingForUser || localStatus.waitingForUser,
      unread: repositoryStatus.unread,
    };
  }

  return {
    ...localStatus,
    unread: false,
  };
}

export function desktopChatTabStatusKind(
  status: ACPConversationLiveStatus | null | undefined,
): DesktopChatTabStatusKind {
  const liveStatus = status ?? emptyDesktopChatLiveStatus;
  if (liveStatus.waitingForUser) return "waiting";
  if (liveStatus.unread) return "unread";
  return "default";
}
