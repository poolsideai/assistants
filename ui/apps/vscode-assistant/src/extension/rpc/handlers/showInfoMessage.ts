import { forceExhaustivenessCheck } from "@poolsideai/assistant/shared/language";
import { InfoMessageType } from "@poolsideai/rpc";
import * as vscode from "vscode";

export function showInfoMessage(message: string, typ: InfoMessageType = InfoMessageType.info) {
  switch (typ) {
    case InfoMessageType.info:
      vscode.window.showInformationMessage(`poolside: ${message}`);
      break;
    case InfoMessageType.error:
      vscode.window.showErrorMessage(`poolside: ${message}`);
      break;
    case InfoMessageType.warning:
      vscode.window.showWarningMessage(`poolside: ${message}`);
      break;
    default:
      forceExhaustivenessCheck(typ);
  }
}
