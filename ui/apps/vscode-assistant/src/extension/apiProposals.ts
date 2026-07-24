import * as commentJSON from "comment-json";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { ApiProposalStatus, System } from "./system";

const VSCODE_CONFIG_DIRS = [".vscode", ".vscode-insiders"];
const DEFAULT_CONFIG_DIR = ".vscode";

/**
 * ensureEnabled checks whether the `enable-proposed-api` flag is set for our extension in the
 * argv.json files across all VSCode variant config directories, enables it where needed, and
 * prompts the user to restart VSCode.
 */
export async function ensureEnabled(system: System) {
  if (vscode.env.remoteName != null) {
    // We don't support enabling API proposals in remote environments.
    // This is because the argv.json file is not shared between the local and remote environments.
    system.setApiProposalStatus(ApiProposalStatus.disabled);
    return;
  }

  const existingDirs = await getExistingConfigDirs();
  const dirsToCheck = existingDirs.length > 0 ? existingDirs : [DEFAULT_CONFIG_DIR];

  const enabledDirs: string[] = [];
  const updatedDirs: string[] = [];

  for (const configDir of dirsToCheck) {
    const argvJSONPath = getArgvJSONPath(configDir);
    const argvJSON = await readArgvJSON(argvJSONPath);

    if (isEnabled(argvJSON, system.context.extension.id)) {
      enabledDirs.push(configDir);
      continue;
    }

    const enableProposedAPI = (argvJSON["enable-proposed-api"] || []) as string[];
    const newArgvJSON = commentJSON.assign(argvJSON, {
      "enable-proposed-api": [...enableProposedAPI, system.context.extension.id],
    });

    const newFileContents = commentJSON.stringify(newArgvJSON, null, 2);
    await writeArgvJSON(argvJSONPath, newFileContents);
    updatedDirs.push(configDir);
  }

  // Check if enabled in a relevant dir for the current VSCode variant
  if (includesRelevantVscodeDir(enabledDirs)) {
    system.setApiProposalStatus(ApiProposalStatus.enabled);
    return;
  }

  const needsRestart = includesRelevantVscodeDir(updatedDirs);
  system.setApiProposalStatus(
    needsRestart ? ApiProposalStatus.pendingRestart : ApiProposalStatus.disabled,
  );
  if (needsRestart) {
    await promptRestart();
  }
}

function getArgvJSONPath(configDir: string): string {
  return path.join(os.homedir(), configDir, "argv.json");
}

async function configDirExists(dir: string): Promise<boolean> {
  const dirUri = vscode.Uri.file(path.join(os.homedir(), dir));
  try {
    await vscode.workspace.fs.stat(dirUri);
    return true;
  } catch {
    return false;
  }
}

async function getExistingConfigDirs(): Promise<string[]> {
  const dirChecks = await Promise.all(
    VSCODE_CONFIG_DIRS.map(async (dir) => ({ dir, exists: await configDirExists(dir) })),
  );
  return dirChecks.filter((check) => check.exists).map((check) => check.dir);
}

function isInsiders(): boolean {
  return vscode.env.appName.includes("Insiders");
}

// Returns true if any of the given dirs are relevant to the current VSCode variant.
// Insiders historically used .vscode, so either dir is relevant for Insiders.
function includesRelevantVscodeDir(dirs: string[]): boolean {
  if (dirs.length === 0) {
    return false;
  }
  if (isInsiders()) {
    return dirs.includes(".vscode") || dirs.includes(".vscode-insiders");
  }
  return dirs.includes(".vscode");
}

/**
 * promptRestart causes vscode to ask the user to restart in a totally normal way that is not at all
 * a massive hack
 */
async function promptRestart() {
  const v = vscode.workspace.getConfiguration().inspect("window.titleBarStyle");
  if (v == null) return;

  const value = vscode.workspace.getConfiguration().get("window.titleBarStyle");
  await vscode.workspace
    .getConfiguration()
    .update(
      "window.titleBarStyle",
      value === "native" ? "custom" : "native",
      vscode.ConfigurationTarget.Global,
    );
  vscode.workspace
    .getConfiguration()
    .update("window.titleBarStyle", v.globalValue, vscode.ConfigurationTarget.Global);
}

function isEnabled(argvJSON: commentJSON.CommentObject, extensionId: string) {
  const enableProposedAPI = (argvJSON["enable-proposed-api"] || []) as string[];
  return enableProposedAPI.includes(extensionId);
}

// readArgvJSON returns the parsed JSON contents of the user's argv.json or returns an empty version
// if not found or if the file is malformed.
async function readArgvJSON(argvJSONPath: string) {
  const argvJSONUri = vscode.Uri.file(argvJSONPath);
  try {
    const fileData = await vscode.workspace.fs.readFile(argvJSONUri);
    const json = new TextDecoder().decode(fileData);
    return commentJSON.parse(json) as commentJSON.CommentObject;
  } catch (_e) {
    return commentJSON.parse(blankArgvJSON) as commentJSON.CommentObject;
  }
}

// Write contents to the argv.json file
async function writeArgvJSON(argvJSONPath: string, contents: string) {
  const argvJSONUri = vscode.Uri.file(argvJSONPath);
  const data = new TextEncoder().encode(contents);
  await vscode.workspace.fs.writeFile(argvJSONUri, data);
}

// This is an empty argv.json file that we can write to enable API proposals if no existing file is
// present
const blankArgvJSON = `
// This configuration file allows you to pass permanent command line arguments to VS Code.
// Only a subset of arguments is currently supported to reduce the likelihood of breaking
// the installation.
//
// PLEASE DO NOT CHANGE WITHOUT UNDERSTANDING THE IMPACT
//
// NOTE: Changing this file requires a restart of VS Code.
{
  // Use software rendering instead of hardware accelerated rendering.
  // This can help in cases where you see rendering issues in VS Code.
  // "disable-hardware-acceleration": true,
  // Allows to disable crash reporting.
  // Should restart the app if the value is changed.
  // "enable-crash-reporter": true,
  "enable-proposed-api": [],
}
`;
