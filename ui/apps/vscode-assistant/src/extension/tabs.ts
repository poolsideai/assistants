import * as vscode from "vscode";

type DiffTab = vscode.Tab & {
  input: vscode.TabInputTextDiff;
};

type TextTab = vscode.Tab & {
  input: vscode.TabInputText;
};

/**
 * isDiffTab narrows the type of the given tab.input to detect whether it represents a diff view
 * @param tab {vscode.Tab}
 * @returns {tab is DiffTab}
 */
export function isDiffTab(tab: vscode.Tab): tab is DiffTab {
  return tab.input instanceof vscode.TabInputTextDiff;
}

/**
 * isTextTab narrows the type of the given tab.input to detect whether it represents a regular text
 * document
 * @param tab {vscode.Tab}
 * @returns {tab is TextTab}
 */
export function isTextTab(tab: vscode.Tab): tab is TextTab {
  return tab.input instanceof vscode.TabInputText;
}

export function isOpenInTab(document: vscode.TextDocument) {
  return vscode.window.tabGroups.all.some((tabGroup) => {
    return tabGroup.tabs.some((tab) => {
      return isTextTab(tab) && tab.input.uri.fsPath === document.uri.fsPath;
    });
  });
}
