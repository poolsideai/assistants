__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACPNavDidChangeParams,
  LocalInferenceDidChangeParams,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ActiveFileContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  AssistantTerminalUpdate,
  Configuration,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  Keybindings,
__POOL_SYNTHETIC_IMPORT_BASELINE__
} from "./host";

/**
 * Assistant encodes all RPC methods that can be sent from an extension host to the webview based
 * assistant instance
 */
export interface Assistant {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * The user's MCP connector store changed — possibly on another surface or in
   * another app instance sharing it. The webview re-lists the store and
   * re-injects connectors into its live agent sessions.
   */
  mcpServersDidChange(): void;
  focusInput(): void;
  setConfiguration(configuration: Configuration): void;
  setContext(context: ActiveFileContext): void;
  setCurrentConversation(id: string): void;
  setKeybindings(keybindings: Keybindings): void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  acpNavDidChange(params: ACPNavDidChangeParams): void;
  localInferenceDidChange(params: LocalInferenceDidChangeParams): void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  assistantTerminalDidUpdate(params: AssistantTerminalUpdate): void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  jsonrpcNotify(params: any): void;
  jsonrpcNotifyBatch(params: any[]): JSONRPCNotifyBatchResult;
  jsonrpcRequest(params: any): Promise<any>;
}

export interface JSONRPCNotifyBatchResult {
  /** Number of messages applied in order before success or the first failure. */
  applied: number;
  error?: string;
}

/**
 * AssistantClient is the interface which should be implemented to respond to messages from the host
 * process to the assistant webview
 */
export type AssistantClient = Client<Assistant>;

type AssistantMessages = Messages<Assistant>;
export type AssistantMessage = AssistantMessages[keyof AssistantMessages];

type AssistantResponses = Responses<Assistant>;
export type AssistantResponse = AssistantResponses[keyof AssistantResponses];

export type AssistantError = Error<AssistantResponse>;

export function isError(m: AssistantResponse | AssistantError): m is AssistantError {
  return m.payload.hasOwnProperty("error");
}
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
// poolside/mcpOAuthURL externally; the
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
  // The user MCP connector store changed (any surface or app instance sharing
  // it) — the webview re-lists it and re-injects its live agent sessions.
  "poolside/mcpServers/didChange": "mcpServersDidChange",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

const COALESCIBLE_ACP_TEXT_CHUNKS = new Set([
  "user_message_chunk",
  "agent_message_chunk",
  "agent_thought_chunk",
]);

interface ParsedACPTextChunk {
  content: Record<string, unknown>;
  envelope: Record<string, unknown>;
  message: Record<string, unknown>;
  params: Record<string, unknown>;
  sequence: number | undefined;
  signature: string;
  text: string;
  update: Record<string, unknown>;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function without(source: Record<string, unknown>, keys: readonly string[]) {
  return Object.fromEntries(Object.entries(source).filter(([key]) => !keys.includes(key)));
}

function parseACPTextChunk(value: unknown): ParsedACPTextChunk | undefined {
  const envelope = record(value);
  const message = record(envelope?.message);
  const params = record(message?.params);
  const update = record(params?.update);
  const content = record(update?.content);
  if (
    !envelope ||
    !message ||
    !params ||
    !update ||
    !content ||
    message.method !== "session/update" ||
    typeof update.sessionUpdate !== "string" ||
    !COALESCIBLE_ACP_TEXT_CHUNKS.has(update.sessionUpdate) ||
    content.type !== "text" ||
    typeof content.text !== "string"
  ) {
    return undefined;
  }

  const sequence = typeof envelope.sessionSeq === "number" ? envelope.sessionSeq : undefined;
  const signature = JSON.stringify([
    without(envelope, ["message", "sessionSeq"]),
    without(message, ["params"]),
    without(params, ["update"]),
    without(update, ["content"]),
    without(content, ["text"]),
  ]);

  return {
    content,
    envelope,
    message,
    params,
    sequence,
    signature,
    text: content.text,
    update,
  };
}

function consecutive(previous: number | undefined, next: number | undefined): boolean {
  if (previous === undefined || next === undefined) return previous === next;
  return next === previous + 1;
}

function rebuildACPTextChunk(chunk: ParsedACPTextChunk, text: string): unknown {
  return {
    ...chunk.envelope,
    message: {
      ...chunk.message,
      params: {
        ...chunk.params,
        update: {
          ...chunk.update,
          content: {
            ...chunk.content,
            text,
          },
        },
      },
    },
  };
}

/**
 * Coalesces only adjacent, gapless ACP text chunks that carry identical
 * routing/message metadata. The last envelope supplies the session sequence,
 * so the Desktop bridge advances to the same cursor while doing one webview
 * RPC round trip for a streaming burst. Images, tool updates, lifecycle
 * messages, sequence gaps, and metadata changes remain distinct and ordered.
 */
export interface CoalescedACPNotificationBatch {
  notifications: unknown[];
  /** Original notification count represented by each coalesced notification. */
  sourceCounts: number[];
}

export function appliedSourceNotificationCount(
  sourceCounts: readonly number[],
  appliedMessages: number,
): number {
  return sourceCounts
    .slice(0, Math.max(0, Math.min(appliedMessages, sourceCounts.length)))
    .reduce((total, count) => total + count, 0);
}

export function coalesceACPTextChunkNotificationBatch(
  notifications: readonly unknown[],
): CoalescedACPNotificationBatch {
  const result: unknown[] = [];
  const sourceCounts: number[] = [];
  let pending:
    | {
        chunk: ParsedACPTextChunk;
        count: number;
        parts: string[];
        sequence: number | undefined;
        signature: string;
      }
    | undefined;

  const flush = () => {
    if (!pending) return;
    result.push(rebuildACPTextChunk(pending.chunk, pending.parts.join("")));
    sourceCounts.push(pending.count);
    pending = undefined;
  };

  for (const notification of notifications) {
    const chunk = parseACPTextChunk(notification);
    if (!chunk) {
      flush();
      result.push(notification);
      sourceCounts.push(1);
      continue;
    }

    if (
      pending &&
      pending.signature === chunk.signature &&
      consecutive(pending.sequence, chunk.sequence)
    ) {
      pending.chunk = chunk;
      pending.count += 1;
      pending.parts.push(chunk.text);
      pending.sequence = chunk.sequence;
      continue;
    }

    flush();
    pending = {
      chunk,
      count: 1,
      parts: [chunk.text],
      sequence: chunk.sequence,
      signature: chunk.signature,
    };
  }

  flush();
  return { notifications: result, sourceCounts };
}
