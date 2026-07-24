import type { ErrorObject } from "serialize-error";
import { System } from "../../system";

export function reportError(system: System, error: ErrorObject) {
  system.telemetry.reportErrorFromUI(error);
}
