import * as vscode from "vscode";

export function openExternalURL(url: string) {
  vscode.env.openExternal(vscode.Uri.parse(url));
}
