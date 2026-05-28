import { createContext } from "svelte";
import type { ACPConversationStatusRepository } from "../acp";
import { ElicitationRepository } from "./ElicitationRepository.svelte";

const [getElicitationContext, setContext] = createContext<ElicitationRepository>();

export function setElicitationContext(conversationStatus: ACPConversationStatusRepository) {
  return setContext(new ElicitationRepository(conversationStatus));
}

export { getElicitationContext };
