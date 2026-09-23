import type { SessionUpdate } from "@agentclientprotocol/sdk";
import { normalizeAgentServerName } from "../../agentServers";
import {
  getSessionUpdateMessageId,
  type SessionEvent,
  type TurnMaterializer,
} from "../../TurnMaterializer";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { stripInjectedContextFromText } from "./hostContext";
import type { ACPSession } from "./Session.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const INLINE_SESSION_TITLE_AGENT_SERVERS = new Set(["cursor", "devin"]);
type AgentMessageEvent = Extract<SessionEvent, { eventKind: "agent_message" }>;

__POOL_SYNTHETIC_IMPORT_BASELINE__
  private readonly completedInlineTitleMessages = new WeakSet<AgentMessageEvent>();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Agents that flatten history into plain text on session/load may derive
    // their replayed title from the flattened first message, so injected
    // context (handoff and host-context resources) can leak into an
    // agent-authored title. Strip it before the title reaches navigation
    // storage; a title that was nothing but injected context is dropped so the
    // stored title survives.
    const trimmedTitle = title ? stripInjectedContextFromText(title).trim() : undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  extractFromAgentMessage(
    materializer: TurnMaterializer,
    update: SessionUpdate,
    { replay = false }: { replay?: boolean } = {},
  ): void {
    if (
      !this.supportsInlineTitle() ||
      update.sessionUpdate !== "agent_message_chunk" ||
      update.content.type !== "text"
    ) {
      return;
    }

    const message = findAgentMessage(materializer.events, getSessionUpdateMessageId(update));
    const candidate = findFirstAgentMessage(materializer.events);
    if (!message || !candidate) return;
    if (message !== candidate) {
      this.finalizeInlineTitle(materializer, { replay });
      return;
    }
    this.extractFromMessage(candidate, { replay });
  }

  finalizeInlineTitle(
    materializer: TurnMaterializer,
    { replay = false }: { replay?: boolean } = {},
  ): void {
    if (!this.supportsInlineTitle()) return;
    const candidate = findFirstAgentMessage(materializer.events);
    if (!candidate) return;
    this.extractFromMessage(candidate, { replay, final: true });
  }

  private extractFromMessage(
    message: AgentMessageEvent,
    { replay, final = false }: { replay: boolean; final?: boolean },
  ): void {
    if (this.completedInlineTitleMessages.has(message)) return;
    const firstBlock = message.content[0];
    if (!firstBlock || firstBlock.type !== "text") {
      if (final) this.completedInlineTitleMessages.add(message);
      return;
    }

    const parsed = parseInlineSessionTitle(firstBlock.text, { final });
    if (!parsed) {
      if (final || /\r?\n/.test(firstBlock.text)) {
        this.completedInlineTitleMessages.add(message);
      }
      return;
    }

    // Cursor and Devin currently emit their attempted session title as the
    // first assistant message instead of a session_info_update. Consume that
    // compatibility header once, then use the normal title path. Replace the
    // materialized block rather than mutating the inbound ACP content object.
    this.completedInlineTitleMessages.add(message);
    message.content[0] = { ...firstBlock, text: parsed.message };
    if (replay) {
      if (this.session.replaySessionInfo) {
        this.session.replaySessionInfo = {
          ...this.session.replaySessionInfo,
          title: parsed.title,
        };
      }
      this.emit(parsed.title);
    } else {
      this.set(parsed.title);
    }
  }

  private supportsInlineTitle(): boolean {
    return INLINE_SESSION_TITLE_AGENT_SERVERS.has(
      normalizeAgentServerName(this.session.agentServer),
    );
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const fallbackTitle = titleFromPrompt(prompt);
    const currentTitle = this.session.sessionInfo?.title;
    if (currentTitle && currentTitle !== fallbackTitle) return;
    this.set(fallbackTitle);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

function findFirstAgentMessage(events: readonly SessionEvent[]): AgentMessageEvent | undefined {
  return events.find((event): event is AgentMessageEvent => event.eventKind === "agent_message");
}

function findAgentMessage(
  events: readonly SessionEvent[],
  messageId: string | null,
): AgentMessageEvent | undefined {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
    if (event?.eventKind === "agent_message" && event.messageId === messageId) {
      return event;
    }
  }
  return undefined;
}

export function parseInlineSessionTitle(
  text: string,
  { final = false }: { final?: boolean } = {},
): { title: string; message: string } | null {
  const lineBreak = text.match(/\r?\n/);
  let firstLine: string;
  let message: string;
  if (lineBreak?.index !== undefined) {
    if (lineBreak.index === 0) return null;
    firstLine = text.slice(0, lineBreak.index).trim();
    message = text.slice(lineBreak.index + lineBreak[0].length).replace(/^\r?\n/, "");
  } else {
    if (!final) return null;
    firstLine = text.trim();
    message = "";
  }

  if (firstLine.startsWith("**") && firstLine.endsWith("**")) {
    firstLine = firstLine.slice(2, -2).trim();
  }

  const titleMatch = /^title:\s*(.+)$/i.exec(firstLine);
  const title = titleMatch?.[1]?.trim();
  if (!title) return null;

  return { title, message };
}
