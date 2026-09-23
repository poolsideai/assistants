import type { Runtime } from "../runtime/shared/types";

export interface StaleSession {
  agentServer: string;
  sessionId: string;
}

export function resyncAfterReconnect(
  core: Pick<Runtime, "acpConversationRepo" | "acpRepo">,
  staleSessions: StaleSession[] = [],
): void {
  void core.acpConversationRepo.refresh({ showLoading: false });
  // Reconcile approval state that may have changed while the socket was down.
  void core.acpRepo.refreshApprovals();
  for (const stale of staleSessions) {
    void core.acpRepo.reloadLiveSession(stale.sessionId, stale.agentServer);
  }
}
