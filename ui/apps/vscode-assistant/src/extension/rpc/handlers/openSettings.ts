import * as vscode from "vscode";
import { getExtensionIdentity } from "../../extensionIdentity";

__POOL_SYNTHETIC_IMPORT_BASELINE__
  vscode.commands.executeCommand(
    "workbench.action.openSettings",
    `@ext:${getExtensionIdentity().extensionId}${setting ? " " + setting : ""}`,
  );
}
