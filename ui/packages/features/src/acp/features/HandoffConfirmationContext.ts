import { createContext } from "svelte";

export interface ACPHandoffConfirmationRequest {
  conversationId: string;
  targetAgentServer: string;
}

export interface ACPHandoffConfirmationController {
  request(confirmation: ACPHandoffConfirmationRequest): void;
}

const [getACPHandoffConfirmation, setACPHandoffConfirmation] =
  createContext<ACPHandoffConfirmationController>();

export { getACPHandoffConfirmation };

export function setACPHandoffConfirmationContext(
  controller: ACPHandoffConfirmationController,
): ACPHandoffConfirmationController {
  setACPHandoffConfirmation(controller);
  return controller;
}
