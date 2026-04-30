__POOL_SYNTHETIC_IMPORT_BASELINE__
import { AssistantState } from "../../views/assistant";

export function ready(system: System) {
  system.assistant?.mark(AssistantState.READY);
}
