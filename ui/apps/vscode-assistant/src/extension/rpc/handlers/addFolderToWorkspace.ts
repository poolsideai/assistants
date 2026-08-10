import * as vscode from "vscode";

export async function addFolderToWorkspace(path: string): Promise<void> {
  if (!path.trim()) return;
  const uri = vscode.Uri.file(path);
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.some((folder) => folder.uri.fsPath === uri.fsPath)) return;
  vscode.workspace.updateWorkspaceFolders(folders.length, 0, { uri });
}
