__POOL_SYNTHETIC_IMPORT_BASELINE__
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { System } from "./system";
import { isDiffTab, isOpenInTab, isTextTab } from "./tabs";
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

// Working directory used by the assistant when no folder is open. A dedicated
// scratch directory keeps the agent's file tools inside a throwaway folder; the
// home directory used to serve this role, which put .ssh, .aws and AppData within
// reach of glob/grep/shell for anyone who had not set defaultWorkingDirectory.
export function getDefaultCwd(): string {
  const configured = vscode.workspace
    .getConfiguration("poolside")
    .get<string>("defaultWorkingDirectory");

  // A configured directory is the user's call, so it is returned as it stands - the
  // Visual Studio host does the same. Only the fallback below is ours to create, and
  // only the fallback may be replaced when creating it fails.
  const cwd = configured?.trim();
  if (cwd) return cwd;

  return ensureScratchDirectory();
}

// getDefaultCwd runs on every context refresh, and a cursor move is enough to trigger
// one, so the directory is resolved once per session rather than on every call:
// mkdirSync is synchronous and has no business on the extension host's hot path.
let ensuredScratchDirectory: string | undefined;

function ensureScratchDirectory(): string {
  if (ensuredScratchDirectory) return ensuredScratchDirectory;

  const scratch = scratchDirectory();
  try {
    fs.mkdirSync(scratch, { recursive: true });
    ensuredScratchDirectory = scratch;
  } catch {
    // The shell tool still needs somewhere writable to start; the temp directory
    // keeps it out of the user's profile when the scratch dir cannot be created.
    ensuredScratchDirectory = os.tmpdir();
  }
  return ensuredScratchDirectory;
}

function scratchDirectory(): string {
  const localAppData = process.env.LOCALAPPDATA;
  if (process.platform === "win32" && localAppData) {
    return path.join(localAppData, "poolside", "scratch");
  }
  return path.join(os.homedir(), ".poolside", "scratch");
}

const symbolAvailabilityCache = new Map<string, { version: number; available: boolean }>();

/**
 * Send context from the extension to the webview
 */
export async function sendActiveFileContext(system: System) {
  // Skip sending context if we're viewing a diff or review panel. We don't want that to become the
  // context for a subsequent prompt.
  const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
  if (activeTab && isDiffTab(activeTab)) {
    return;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
  const defaultCwd = getDefaultCwd();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const activeEditors = vscode.window.visibleTextEditors.filter((editor) =>
    isOpenInTab(editor.document),
  );
  const activeFiles = await Promise.all(
    activeEditors.map(async (editor) => {
      const document = editor.document;
      const content = document.getText();
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const selectedCode = document.getText(editor.selection) || "";
      const visibleRange = editor.visibleRanges[0];
      const { startLine, endLine } = vscodeRangeToAPIRange(visibleRange);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      let selection: Selection | undefined;
      if (!editor.selection.isEmpty) {
        const { startLine, endLine } = vscodeRangeToAPIRange(editor.selection);
        selection = [startLine, endLine];
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const cachedSymbols = symbolAvailabilityCache.get(document.uri.toString());
      let codeSymbolsAvailable = cachedSymbols?.available;
      if (cachedSymbols?.version !== document.version) {
        const rootDocumentSymbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
          "vscode.executeDocumentSymbolProvider",
          document.uri,
        );
        codeSymbolsAvailable = Array.isArray(rootDocumentSymbols) && rootDocumentSymbols.length > 0;
        symbolAvailabilityCache.set(document.uri.toString(), {
          version: document.version,
          available: codeSymbolsAvailable,
        });
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return {
        content,
        selectedCode,
        selection,
        cursorLine: vscodeLineToAPILine(editor.selection.active.line),
        visibleRange: { start: startLine, end: endLine },
        path: documentToContextPath(document),
        codeSymbolsAvailable,
      };
    }),
__POOL_SYNTHETIC_IMPORT_BASELINE__

  const isTextDocumentActive = activeTab && isTextTab(activeTab);
  const recentEditorIndex = isTextDocumentActive
    ? activeEditors.findIndex((editor) => editor.document.uri.fsPath === activeTab.input.uri.fsPath)
    : -1;
  const recentFile = recentEditorIndex >= 0 ? activeFiles[recentEditorIndex] : undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const context = {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    homeDirectory: os.homedir(),
    defaultCwd,
    activeFiles,
    recentFile,
  };
  system.assistant.rpc.setContext(context);
  system.acpChatPanels.setContext(context);
}
