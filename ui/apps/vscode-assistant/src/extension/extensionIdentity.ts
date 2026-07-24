import * as vscode from "vscode";

// Default/legacy production id, used only as the pre-activation seed and in
// tests. The authoritative id at runtime comes from `context.extension.id`
// (see main.ts) and can differ when we publish under a new marketplace name.
export const POOLSIDE_EXTENSION_ID = "poolside-ai.poolside-assistant";
export const POOLSIDE_NAME = "poolside";
export const POOLSIDE_DEV_NAME = "poolside-dev";
export type PoolsideName = typeof POOLSIDE_NAME | typeof POOLSIDE_DEV_NAME;
export let POOLSIDE: PoolsideName = POOLSIDE_NAME;

export interface ExtensionIdentity {
  extensionId: string;
  poolsideName: PoolsideName;
  isDev: boolean;
  assistantTitle: string;
  viewTitle: string;
  devPortEnvName: "VITE_DEV_PORT" | "POOLSIDE_DEV_VITE_DEV_PORT";
  helperOutputChannelName: string;
  telemetryOutputChannelName: PoolsideName;
}

function titleForPoolsideName(poolsideName: ExtensionIdentity["poolsideName"]): string {
  return poolsideName === POOLSIDE_DEV_NAME ? "Poolside Dev" : "Poolside";
}

function buildIdentity(extensionId: string): ExtensionIdentity {
  // Detect the dev variant by suffix so any published marketplace name works
  // (a rename to `poolside-ai.<new-name>` keeps a `<new-name>-dev` dev build).
  const isDev = extensionId.endsWith("-dev");
  const poolsideName = isDev ? POOLSIDE_DEV_NAME : POOLSIDE_NAME;
  const title = titleForPoolsideName(poolsideName);

  return {
    // Pass through the real runtime id (from `context.extension.id`) so
    // marketplace / settings deep-links resolve under whatever name we ship as.
    extensionId,
    poolsideName,
    isDev,
    assistantTitle: isDev ? title : "Poolside Assistant",
    viewTitle: title,
    devPortEnvName: isDev ? "POOLSIDE_DEV_VITE_DEV_PORT" : "VITE_DEV_PORT",
    helperOutputChannelName: isDev ? "poolside Helper-dev" : "poolside Helper",
    telemetryOutputChannelName: poolsideName,
  };
}

let currentIdentity = buildIdentity(POOLSIDE_EXTENSION_ID);

export function configureExtensionIdentity(extensionId: string): ExtensionIdentity {
  currentIdentity = buildIdentity(extensionId);
  POOLSIDE = currentIdentity.poolsideName;
  return currentIdentity;
}

export function getExtensionIdentity(): ExtensionIdentity {
  return currentIdentity;
}

export function poolsideConfigurationKey(key: string): string {
  if (key.startsWith("poolside.")) {
    return `${POOLSIDE}.${key.slice("poolside.".length)}`;
  }
  return key;
}

export function poolsideConfigurationSection(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(POOLSIDE);
}
