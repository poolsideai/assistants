import { forceExhaustivenessCheck } from "@poolsideai/assistant/shared/language";
import { InfoMessageType } from "@poolsideai/rpc";
import * as vscode from "vscode";

export function showInfoMessage(message: string, typ: InfoMessageType = InfoMessageType.info) {
  switch (typ) {
    case InfoMessageType.info:
__POOL_SYNTHETIC_IMPORT_BASELINE__
      break;
    case InfoMessageType.error:
__POOL_SYNTHETIC_IMPORT_BASELINE__
      break;
    case InfoMessageType.warning:
__POOL_SYNTHETIC_IMPORT_BASELINE__
      break;
    default:
      forceExhaustivenessCheck(typ);
  }
}
