import * as vscode from "vscode";
import { getExtensionIdentity } from "../../extensionIdentity";

export function openSettings(setting?: string) {
  vscode.commands.executeCommand(
    "workbench.action.openSettings",
    `@ext:${getExtensionIdentity().extensionId}${setting ? " " + setting : ""}`,
  );
}
