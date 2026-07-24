import * as vscode from "vscode";

/**
 * Current scheme: we remove the protocol except for untitled documents, which retain it.
 */

export function contextPathToVSCodeUri(path: string) {
  return path.startsWith("untitled:") || path.startsWith("file:")
    ? vscode.Uri.parse(path)
    : vscode.Uri.file(path);
}

export function documentToContextPath(document: vscode.TextDocument) {
  return document.isUntitled ? document.uri.toString() : document.uri.fsPath;
}
