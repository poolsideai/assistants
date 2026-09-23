__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { Configuration, Keybindings, WorkspaceFolder } from "@poolsideai/rpc";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  var POOLSIDE_INITIAL_STATE: {
    accessToken?: string | undefined;
    keybindings?: Keybindings;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    userSettings?: Configuration;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    homeDirectory?: string;
  };
  var POOLSIDE_INITIAL_ACP_CHAT_STATE:
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        agentName?: string;
        agentIconUrl?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    | {
        kind: "session";
__POOL_SYNTHETIC_IMPORT_BASELINE__
        agentServer: string;
        sessionId: string;
        agentName?: string;
        agentIconUrl?: string;
        cwd?: string;
        workingDirectories?: string[];
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      }
    | undefined;
  var POOLSIDE_ASSISTANT_VIEW_MODE: "classic" | "acp-sidebar" | undefined;
  function acquireVsCodeApi<T = unknown>(): {
    getState(): T | undefined;
    setState(state: T | undefined): void;
    postMessage(message: unknown): void;
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
