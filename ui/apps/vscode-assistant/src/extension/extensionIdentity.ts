import * as vscode from "vscode";

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const poolsideName = isDev ? POOLSIDE_DEV_NAME : POOLSIDE_NAME;
  const title = titleForPoolsideName(poolsideName);

  return {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
