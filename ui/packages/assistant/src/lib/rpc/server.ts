import type { AnyMessage } from "@agentclientprotocol/sdk";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  getUserMCPServersRepo,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ACPConversationRepository,
  type ACPProjectRepository,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ACPSessionRepository,
  type ACPTransport,
  type LocalInferenceRepository,
} from "@poolsideai/features/acp";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { ACPApproval } from "@poolsideai/helperapi";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ACPNavDidChangeParams,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type LocalInferenceDidChangeParams,
} from "@poolsideai/helperapi/schemas";
import type {
  ActiveFileContext,
  AssistantTerminalTab,
  AssistantTerminalUpdate,
  Configuration,
  Keybindings,
  Language,
} from "@poolsideai/rpc";
import type {
  Assistant,
  AssistantMessage,
  JSONRPCNotifyBatchResult,
} from "@poolsideai/rpc/assistant";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { focusPrompt } from "../../shared/Helpers";
import { type AppStore } from "../store";
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type WebviewRPCListener = Pick<Window, "addEventListener" | "removeEventListener">;

// Host-driven conversation navigation (e.g. a clicked desktop notification).
// The RPC server has no handle on navigation state, so it broadcasts a window
// event for the runtime that owns activeConversationId (see DesktopRuntime).
export const SET_CURRENT_CONVERSATION_EVENT = "poolside:set-current-conversation";
type RPCMessageEvent = Pick<MessageEvent<AssistantMessage>, "data"> &
  Partial<Pick<MessageEvent, "source">>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
interface AssistantTerminalEventSink {
  terminalDidOpen(tab: AssistantTerminalTab): void;
  terminalDidUpdate(update: AssistantTerminalUpdate): void;
  terminalDidWrite(terminalId: string, data: string): void;
  terminalDidExit(terminalId: string, exitCode?: number): void;
  terminalDidClose(terminalId: string): void;
}

export class WebviewRPCServer implements Assistant {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    win: WebviewRPCListener,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    readonly appState: AppStore,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    readonly acpTransport: ACPTransport,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    readonly assistantTerminals: AssistantTerminalEventSink,
    readonly acpRepo?: ACPSessionRepository,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    readonly acpProjectRepo?: ACPProjectRepository,
    readonly acpConversationRepo?: ACPConversationRepository,
    readonly localInferenceRepo?: LocalInferenceRepository,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Native hosts dispatch with no source; browser hosts use this window or
    // its parent. Embedded visualization frames must never supply host events.
    if (e.source && e.source !== window && e.source !== window.parent) return;
    if (!e.data || typeof e.data !== "object") return;
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
  acpNavDidChange(params: ACPNavDidChangeParams): void {
    this.acpProjectRepo?.replaceProjects(params.state.projects ?? []);
    this.acpConversationRepo?.replaceConversations(params.state.conversations ?? []);
  }

  localInferenceDidChange(params: LocalInferenceDidChangeParams): void {
    this.localInferenceRepo?.applyDidChange(params);
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
  setCurrentConversation = (id: string) => {
    window.dispatchEvent(
      new CustomEvent(SET_CURRENT_CONVERSATION_EVENT, { detail: { conversationId: id } }),
    );
  };

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Helper-owned pending approvals (permission prompts + elicitations)
  // changed: reconcile the complete pushed set. This is how approval cards
  // appear, and how they disappear once answered on ANY surface.
  acpApprovalsDidChange(params: { pending: unknown[] }): void {
    this.acpRepo?.reconcileApprovals((params.pending ?? []) as ACPApproval[]);
  }

  // The user's MCP connector store changed — possibly on another surface or in
  // another app instance sharing it. Re-list the store (so any open connectors
  // UI reflects it) and re-inject the set into every live agent session.
  mcpServersDidChange(): void {
    void getUserMCPServersRepo().load();
    void this.acpRepo?.refreshMCPServersForAllSessions();
  }

  // App state handlers
  setConfiguration = (configuration: Configuration) => {
    this.appState.update((s) => ({ ...s, userSettings: { ...s.userSettings, ...configuration } }));
  };

  setContext = (context: ActiveFileContext) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.appState.update((state) => {
      const newState = { ...state, workspaces: context.workspaces };
      if (context.homeDirectory != null) {
        newState.homeDirectory = context.homeDirectory;
      }
      if (context.defaultCwd != null) {
        newState.defaultCwd = context.defaultCwd;
      }
      return newState;
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  };

  setKeybindings = (keybindings: Keybindings) => {
    this.appState.update((s) => ({ ...s, keybindings }));
  };

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
  };

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
  // Utility handlers
  focusInput = () => {
    focusPrompt();
  };

  acpAgentServerDidExit(params: { agentServer: string; error?: string }) {
    this.acpTransport.disconnect?.(params.agentServer);
    this.acpRepo?.handleAgentServerDidExit(params.agentServer, params.error);
  }

  assistantTerminalDidOpen(tab: AssistantTerminalTab): void {
    this.assistantTerminals.terminalDidOpen(tab);
  }

  assistantTerminalDidUpdate(params: AssistantTerminalUpdate): void {
    this.assistantTerminals.terminalDidUpdate(params);
  }

  assistantTerminalDidWrite(params: { terminalId: string; data: string }): void {
    this.assistantTerminals.terminalDidWrite(params.terminalId, params.data);
  }

  assistantTerminalDidExit(params: { terminalId: string; exitCode?: number }): void {
    this.assistantTerminals.terminalDidExit(params.terminalId, params.exitCode);
  }

  assistantTerminalDidClose(params: { terminalId: string }): void {
    this.assistantTerminals.terminalDidClose(params.terminalId);
  }

  jsonrpcNotify(params: AnyMessage) {
    this.acpTransport.receive(params);
  }

  jsonrpcNotifyBatch(params: AnyMessage[]): JSONRPCNotifyBatchResult {
    // Keep the protocol stream ordered and synchronous within the batch. The
    // session materializer's publishTranscript({ batched: true }) path then
    // exposes reactive snapshots on a bounded, frame-aligned cadence, so
    // receiving a native bridge batch never implies one DOM update per
    // notification.
    for (const [index, message] of params.entries()) {
      try {
        this.acpTransport.receive(message);
      } catch (error) {
        return {
          applied: index,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
    return { applied: params.length };
  }

  jsonrpcRequest(params: any): Promise<any> {
    return this.acpTransport.sendRequest(params);
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
