/**
 * @module ConversationManager
 * @description Slimmed, ACP-only remnant of the legacy conversation engine. The
 * classic cloud conversation CRUD has been removed; what remains is the
 * minimal store + derived helpers still consumed by shared ACP UI (prompt
 * command menus, LegacyContexts, telemetry). Do not extend this module — use
 * repositories instead. Refer to ui/README.md for more.
 */

import { derived, get, writable } from "svelte/store";
import { appState } from "./store";

interface ConversationMessageOnClient {
  id: string;
  conversation_id: string;
  agent_id?: string;
  agent_session_id?: string;
  response?: { trimmed?: boolean };
}

export interface ConversationState {
  current: { id: string } | undefined;
  messages: ConversationMessageOnClient[];
}

export const emptyState: ConversationState = {
  current: undefined,
  messages: [],
};

const store = writable<ConversationState>(emptyState);

export const currentConversationType = derived(
  store,
  (conversationState): "agent" | "chat" | null => {
    const { messages } = conversationState;
    if (messages.length === 0) {
      return null; // Not locked for new conversations
    }
    const hasAgentMessage = messages.some(
      (msg) => msg.agent_id != null && msg.agent_session_id != null,
    );
    return hasAgentMessage ? "agent" : "chat";
  },
);

export const isCurrentConversationAgentic = derived(
  [store, currentConversationType, appState],
  ([$store, $lockedMode, $appState]): boolean => {
    const { current } = $store;

    if (!current || !current.id) {
      return $appState.isAgenticMode;
    }

    if ($lockedMode === "agent") return true;
    if ($lockedMode === "chat") return false;

    return $appState.isAgenticMode;
  },
);

export function getLastMessage() {
  return get(store).messages.at(-1);
}
