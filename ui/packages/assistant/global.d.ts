import type { ColorTheme, FileIconTheme } from "@poolsideai/components/providers";
import type { Configuration, Keybindings, WorkspaceFolder } from "@poolsideai/rpc";
import type { Environment } from "./src/lib/store";
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
    colorTheme?: ColorTheme;
    fileIconTheme?: FileIconTheme;
    userSettings?: Configuration;
    environment?: Environment;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    homeDirectory?: string;
  };
  var POOLSIDE_INITIAL_ACP_CHAT_STATE:
    | {
        kind: "pending";
        conversationId: string;
        agentServer?: string;
        agentName?: string;
        agentIconUrl?: string;
        cwd?: string;
        workingDirectories?: string[];
      }
    | {
        kind: "session";
        conversationId: string;
        agentServer: string;
        sessionId: string;
        agentName?: string;
        agentIconUrl?: string;
        cwd?: string;
        workingDirectories?: string[];
        readOnly?: boolean;
        fallbackCwds?: string[];
      }
    | undefined;
  var POOLSIDE_ASSISTANT_VIEW_MODE: "classic" | "acp-sidebar" | undefined;
  function acquireVsCodeApi<T = unknown>(): {
    getState(): T | undefined;
    setState(state: T | undefined): void;
    postMessage(message: unknown): void;
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
