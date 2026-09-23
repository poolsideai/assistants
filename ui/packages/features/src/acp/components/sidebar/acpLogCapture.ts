import type { ACPDebugCaptureAPI } from "../../debugDump";
import type { ContextMenuAction } from "./ContextMenu.svelte";

export interface ACPLogCaptureTarget {
  agentServer: string;
  conversationId: string;
  sessionId: string | null;
}

export function acpLogCaptureMenuAction(
  capture: ACPDebugCaptureAPI | undefined,
  target: ACPLogCaptureTarget,
  requestConfirmation: (target: ACPLogCaptureTarget) => void,
): ContextMenuAction {
  const collecting =
    capture !== undefined &&
    capture.isConversationCollecting(target.agentServer, target.conversationId, target.sessionId);

  return {
    name: collecting ? "Stop Collecting ACP Events" : "Collect ACP Events…",
    icon: "bug",
    disabled: !capture,
    callback: () => {
      if (!capture) return;
      if (collecting) {
        capture.setConversationCollecting(
          target.agentServer,
          target.conversationId,
          target.sessionId,
          false,
        );
      } else {
        requestConfirmation(target);
      }
    },
  };
}
