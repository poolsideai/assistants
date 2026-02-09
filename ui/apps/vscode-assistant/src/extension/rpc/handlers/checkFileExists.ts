import * as vscode from "vscode";

/**
 * checkFileExists returns true if the file exists and is a file (not a directory), false otherwise
 */
export async function checkFileExists(path: string): Promise<boolean> {
  const uri = vscode.Uri.file(path);

  try {
    const stat = await vscode.workspace.fs.stat(uri);
    return stat.type === vscode.FileType.File;
  } catch (_e) {
    return false;
  }
}
