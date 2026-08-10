import * as vscode from "vscode";

/**
 * Reveals VS Code's native Source Control (git) view. Backs the conversation
 * "Review" bar in the VS Code webview, which has no in-webview changes view of
 * its own (unlike the desktop app).
 */
export function revealSourceControl() {
  void vscode.commands.executeCommand("workbench.view.scm");
}
