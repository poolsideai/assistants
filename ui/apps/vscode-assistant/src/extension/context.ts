__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import * as os from "os";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import * as vscode from "vscode";
__POOL_SYNTHETIC_IMPORT_BASELINE__
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

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function getDefaultCwd(): string {
  const configured = vscode.workspace
    .getConfiguration("poolside")
    .get<string>("defaultWorkingDirectory");
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
