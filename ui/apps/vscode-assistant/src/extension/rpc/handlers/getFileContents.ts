__POOL_SYNTHETIC_IMPORT_BASELINE__
import * as vscode from "vscode";

/**
 * getFileContents returns the contents of a file. If the file does not exist or if the given path
 * is a directory then undefined is returned
 */
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const uri = vscode.Uri.file(path);

  try {
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.type === vscode.FileType.Directory) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return;
  }

  const doc = await vscode.workspace.openTextDocument(uri);
  const content = doc.getText();

  return { path, content };
}
