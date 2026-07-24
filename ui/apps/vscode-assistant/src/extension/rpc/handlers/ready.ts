import { System } from "../../system";
import { AssistantState } from "../../views/assistant";

export function ready(system: System) {
  system.assistant?.mark(AssistantState.READY);
}
