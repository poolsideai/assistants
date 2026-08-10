import * as vscode from "vscode";
__POOL_SYNTHETIC_IMPORT_BASELINE__

export async function openFile(path: string, line?: number, column?: number): Promise<void> {
  if (path === "") return;
  const uri = contextPathToVSCodeUri(path);

  if (line === undefined) {
    await vscode.commands.executeCommand("vscode.open", uri);
    return;
  }

  // vscode uses 0-indexed positions; chat references are 1-indexed.
  const zeroBasedLine = Math.max(0, line - 1);
  const zeroBasedColumn = Math.max(0, (column ?? 1) - 1);
  const position = new vscode.Position(zeroBasedLine, zeroBasedColumn);
  const selection = new vscode.Range(position, position);

  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document, { selection });
}
