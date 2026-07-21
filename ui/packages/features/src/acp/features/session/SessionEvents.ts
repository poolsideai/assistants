import { get } from "svelte/store";
import { appState } from "../../hostAdapter";
import {
  acpSessionWorkspacePath,
  acpWorkingDirectories,
  acpWorkspaceFolders,
} from "../../workspaceScope";
import type { ACPSession } from "./Session.svelte";
import { ACP_PENDING_CONVERSATION_AGENT_EVENT } from "./types";

export class ACPSessionEvents {
  constructor(private readonly session: ACPSession) {}

  dispatchPendingConversationAgentChange(): void {
    const s = this.session;
    if (
      s.sessionId !== null ||
      !s.conversationId ||
      !s.isPendingConversationPersisted ||
      s.pendingHandoff !== null
    ) {
      return;
    }
    const state = get(appState);
    const workspaceFolders = acpWorkspaceFolders(state, s.cwd);
    s.env.emitter.dispatchEvent(
      new CustomEvent(ACP_PENDING_CONVERSATION_AGENT_EVENT, {
        detail: {
          conversationId: s.conversationId,
          agentServer: s.agentServer,
          cwd: s.cwd,
          workspacePath: acpSessionWorkspacePath(state, workspaceFolders, s.cwd, s.isChat),
          workingDirectories: acpWorkingDirectories(workspaceFolders, s.cwd),
        },
      }),
    );
  }
}
