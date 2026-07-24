import * as os from "os";
import * as vscode from "vscode";
import packageJSON from "../../package.json";
import { getPoolsideConfig } from "./configuration";
import { getDefaultCwd, getWorkspaces } from "./context";
import { mapContextToExtensionMode } from "./env";
import { getLanguages, serializeLanguages } from "./languages";
import { getKeybindings } from "./rpc/handlers/getKeybindings";
import type { System } from "./system";
import { getActiveTheme, getParsedFileIconTheme } from "./theme";

const capabilities = {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  terminalPanel: false,
  openWorkspace: true,
  addFolderToWorkspace: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * initialState builds a state object to be inserted in the webview HTML and used
 * as initial app state. It also sets that state in a svelte store on the extension
 * side so we can use it with the API client.
 */
/**
 * getEnvironment builds the local (no-network) environment descriptor used for
 * the poolside Helper LSP handshake and as part of the webview initial state.
 */
export function getEnvironment(system: System) {
  // indicate when we're running a development version, vs a packaged version
  const suffix =
    system.context.extensionMode === vscode.ExtensionMode.Development ? ".development" : "";

  return {
    assistantEnv: mapContextToExtensionMode(system.context),
    assistantHost: "vscode",
    assistantProduct: vscode.version.includes("insider") ? "VS Code - Insiders" : "VS Code",
    assistantHostVersion: vscode.version,
    assistantVersion: packageJSON.version + suffix,
    operatingSystem: process.platform,
    capabilities: capabilities,
  };
}

export function getInitialKeybindings() {
  return getKeybindings(packageJSON.contributes.commands.map((c) => c.command));
}

export async function getInitialAppState(system: System) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const defaultCwd = getDefaultCwd();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const [keybindings, colorTheme, fileIconTheme] = await Promise.all([
    getInitialKeybindings(),
    getActiveTheme(),
    getParsedFileIconTheme(),
  ]);

  return {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    homeDirectory: os.homedir(),
    defaultCwd,
    keybindings,
    colorTheme,
    fileIconTheme,
    languages: serializeLanguages(getLanguages()),
    environment: getEnvironment(system),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isEditorFocused: vscode.window.state.focused,
  };
}

export async function getInitialAppStateAsJSON(system: System) {
  return JSON.stringify(await getInitialAppState(system));
}
