import * as os from "os";
import * as vscode from "vscode";
import packageJSON from "../../package.json";
import { getPoolsideConfig } from "./configuration";
import { getDefaultCwd, getWorkspaces } from "./context";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { getLanguages, serializeLanguages } from "./languages";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { System } from "./system";
import { getActiveTheme, getParsedFileIconTheme } from "./theme";

__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // indicate when we're running a development version, vs a packaged version
  const suffix =
    system.context.extensionMode === vscode.ExtensionMode.Development ? ".development" : "";

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
export function getInitialKeybindings() {
  return getKeybindings(packageJSON.contributes.commands.map((c) => c.command));
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  };
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}
