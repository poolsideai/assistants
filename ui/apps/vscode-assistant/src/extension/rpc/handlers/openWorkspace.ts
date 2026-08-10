import * as vscode from "vscode";

export async function openWorkspace(path: string): Promise<void> {
  if (!path.trim()) return;
  await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(path), {
    forceNewWindow: true,
  });
}
