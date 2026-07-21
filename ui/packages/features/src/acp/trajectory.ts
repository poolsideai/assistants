import type { ContentBlock, SessionNotification, SessionUpdate } from "@agentclientprotocol/sdk";
import type { ACPDumpEntry } from "./debugDump";
import { getSessionUpdateMessageId } from "./TurnMaterializer";

/**
 * View-model helpers for the ACP trajectory viewer.
 *
 * The raw data source is `acpConnectionPool.debug.dump(agentServer)` — a flat,
 * chronological list of `ACPDumpEntry` JSON-RPC frames (both directions) recorded
 * by {@link ACPDebugLog}. These pure functions turn that list into the list rows
 * the viewer renders, optionally scoped to one conversation and/or with streaming
 * chunks collapsed.
 *
 * Nothing here mutates the input entries.
 */

export type TrajectoryKind =
  | "message"
  | "thought"
  | "tool"
  | "permission"
  | "plan"
  | "lifecycle"
  | "fs"
  | "terminal"
  | "meta"
  | "other";

export interface TrajectoryRow {
  /** Position in the built list (assigned by {@link buildTrajectoryRows}). */
  index: number;
  direction: ACPDumpEntry["_direction"];
  type: ACPDumpEntry["_type"];
  method?: string;
  kind: TrajectoryKind;
  /** Human-readable title for the list row, e.g. "Assistant", "Run npm test". */
  title: string;
  /** Plain-text one-line content preview (never raw JSON). */
  summary: string;
  /** Muted protocol token for the row, e.g. "agent_message_chunk", "session/load". */
  proto: string;
  /** Number of raw frames represented by this row (>1 for a collapsed group). */
  chunkCount: number;
  /** The underlying raw frame(s). */
  entries: ACPDumpEntry[];
  /** Object rendered as JSON in the detail pane. */
  detail: unknown;
  /** True if this row starts a new turn (an outgoing `session/prompt` request). */
  turnStart: boolean;
  /** 1-based turn counter; 0 for frames before the first prompt (session setup). */
  turnNumber: number;
}

/** Streaming `session/update` kinds that the agent emits one delta per frame. */
const COALESCIBLE_CHUNKS = new Set([
  "user_message_chunk",
  "agent_message_chunk",
  "agent_thought_chunk",
]);

type ChunkUpdate = SessionUpdate & {
  content: ContentBlock;
  messageId?: string | null;
  _meta?: Record<string, unknown> | null;
};

// ---------------------------------------------------------------------------
// Frame inspection
// ---------------------------------------------------------------------------

function asNotificationUpdate(entry: ACPDumpEntry): SessionUpdate | null {
  if (entry._type !== "notification" || entry.method !== "session/update") return null;
  const params = entry.params as SessionNotification | undefined | null;
  return params?.update ?? null;
}

function asChunkUpdate(entry: ACPDumpEntry): ChunkUpdate | null {
  const update = asNotificationUpdate(entry);
  if (!update || !COALESCIBLE_CHUNKS.has(update.sessionUpdate)) return null;
  return update as ChunkUpdate;
}

/** The sessionId a frame is tagged with, if any (notifications, session-scoped
 * requests, and `session/new` responses all carry one; `initialize` and the
 * `session/new` request do not). */
export function entrySessionId(entry: ACPDumpEntry): string | null {
  const params = entry.params as { sessionId?: unknown } | undefined | null;
  const sid = params?.sessionId;
  return typeof sid === "string" && sid.length > 0 ? sid : null;
}

// ---------------------------------------------------------------------------
// Labels / kinds / summaries
// ---------------------------------------------------------------------------

function chunkKind(sessionUpdate: string): TrajectoryKind {
  return sessionUpdate === "agent_thought_chunk" ? "thought" : "message";
}

function kindForEntry(entry: ACPDumpEntry): TrajectoryKind {
  const update = asNotificationUpdate(entry);
  if (update) {
    const sub = update.sessionUpdate;
    if (COALESCIBLE_CHUNKS.has(sub)) return chunkKind(sub);
    if (sub === "tool_call" || sub === "tool_call_update") return "tool";
    if (sub === "plan") return "plan";
    return "meta";
  }
  const method = entry.method ?? "";
  if (method === "session/request_permission") return "permission";
  if (method.startsWith("fs/")) return "fs";
  if (method.startsWith("terminal/")) return "terminal";
  if (
    method === "initialize" ||
    method === "authenticate" ||
    method === "session/new" ||
    method === "session/load" ||
    method === "session/cancel"
  ) {
    return "lifecycle";
  }
  return "other";
}

function previewText(value: string, max = 100): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length > max ? `${collapsed.slice(0, max)}…` : collapsed;
}

function contentBlocksText(blocks: ContentBlock[]): string {
  return blocks.map((block) => (block.type === "text" ? block.text : `[${block.type}]`)).join(" ");
}

function basename(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : path;
}

/** Turn a method/update token into a Title Cased label, e.g. "fs/read_text_file"
 * → "Fs Read Text File", "session/load" → "Load". */
function humanizeMethod(method: string): string {
  return method
    .replace(/^session\//, "")
    .replace(/[_/]/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function errorText(error: unknown): string {
  if (typeof error === "string") return previewText(error);
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return previewText(message);
  }
  return "error";
}

type ToolUpdate = Record<string, unknown>;

function hasDiffContent(u: ToolUpdate): boolean {
  return (
    Array.isArray(u.content) &&
    u.content.some((c) => (c as { type?: string } | null)?.type === "diff")
  );
}

/** The agents disagree on shape (Codex omits `kind`), so fall back to inferring
 * it from the title / rawInput / content. */
function toolKind(u: ToolUpdate): string {
  if (typeof u.kind === "string" && u.kind) return u.kind;
  const title = typeof u.title === "string" ? u.title.toLowerCase() : "";
  const rawInput = (u.rawInput ?? {}) as Record<string, unknown>;
  if (hasDiffContent(u) || /patch|apply|edit|write|create/.test(title)) return "edit";
  if (/exec|command|shell|bash|run/.test(title) || rawInput.cmd || rawInput.command)
    return "execute";
  if (
    rawInput.file_path ||
    rawInput.path ||
    (Array.isArray(u.locations) && u.locations.length > 0)
  ) {
    return "read";
  }
  return "";
}

function toolPath(u: ToolUpdate): string {
  const rawInput = (u.rawInput ?? {}) as Record<string, unknown>;
  if (typeof rawInput.file_path === "string") return rawInput.file_path;
  if (typeof rawInput.path === "string") return rawInput.path;
  if (Array.isArray(u.content)) {
    const diff = u.content.find((c) => (c as { type?: string } | null)?.type === "diff") as
      | { path?: string }
      | undefined;
    if (typeof diff?.path === "string") return diff.path;
  }
  if (Array.isArray(u.locations)) {
    const loc = u.locations[0] as { path?: string } | undefined;
    if (typeof loc?.path === "string") return loc.path;
  }
  return "";
}

/** A single lowercase snake_case identifier with no spaces — e.g. "exec_command",
 * "write_stdin", "apply_patch", "js" — is the raw tool-function name some agents
 * (Codex) send instead of a human title, so it is worth synthesizing past. */
function isBareToolName(title: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(title);
}

/**
 * Title for a tool_call row. The agent's own `title` is usually the best label
 * (e.g. "Read ui/README.md", "Write `fb/index.html`", "Edit a.ts, b.ts"), so
 * prefer it. Only when it is missing or a bare tool-function name do we
 * synthesize one from the tool kind and rawInput.
 */
function toolCallTitle(u: ToolUpdate): string {
  const title = typeof u.title === "string" ? u.title.trim() : "";
  if (title && !isBareToolName(title)) return previewText(title, 120);

  const rawInput = (u.rawInput ?? {}) as Record<string, unknown>;
  const meta = (u._meta ?? {}) as Record<string, unknown>;
  const claudeCode = (meta.claudeCode ?? {}) as Record<string, unknown>;
  const toolName =
    (typeof meta.tool_name === "string" && meta.tool_name) ||
    (typeof claudeCode.toolName === "string" && claudeCode.toolName) ||
    "";
  const path = toolPath(u);
  switch (toolKind(u)) {
    case "execute":
      return `Run ${previewText(String(rawInput.cmd ?? rawInput.command ?? title), 120)}`;
    case "read":
      return `Read ${basename(path) || humanizeMethod(title)}`.trim();
    case "edit": {
      const isNewFile =
        Array.isArray(u.content) &&
        u.content.some(
          (c) =>
            (c as { type?: string; oldText?: string } | null)?.type === "diff" &&
            !(c as { oldText?: string }).oldText,
        );
      return `${isNewFile ? "Create" : "Edit"} ${basename(path) || humanizeMethod(title)}`.trim();
    }
    case "fetch":
      return `Fetch ${previewText(String(rawInput.url ?? title), 80)}`;
    default:
      return toolName ? humanizeMethod(toolName) : title ? humanizeMethod(title) : "Tool";
  }
}

function toolOutputPreview(u: ToolUpdate): string {
  const parts: string[] = [];
  if (Array.isArray(u.content)) {
    for (const block of u.content as Array<Record<string, unknown>>) {
      if (block.type === "content") {
        const inner = block.content as { type?: string; text?: string } | undefined;
        if (inner?.type === "text" && inner.text) parts.push(inner.text);
      } else if (block.type === "diff" && typeof block.path === "string") {
        parts.push(`wrote ${basename(block.path)}`);
      }
    }
  }
  const rawOutput = (u.rawOutput ?? {}) as Record<string, unknown>;
  if (typeof rawOutput.observation === "string") parts.push(rawOutput.observation);
  return previewText(parts.join(" "));
}

/**
 * Map each tool_call's id to its human title so that later tool_call_update
 * frames — which carry no title of their own — can be labelled as the result of
 * that tool even when shown as their own row.
 */
function collectToolTitles(entries: ACPDumpEntry[]): Map<string, string> {
  const titles = new Map<string, string>();
  for (const entry of entries) {
    const update = asNotificationUpdate(entry);
    if (update?.sessionUpdate !== "tool_call") continue;
    const u = update as ToolUpdate;
    if (typeof u.toolCallId === "string") titles.set(u.toolCallId, toolCallTitle(u));
  }
  return titles;
}

interface RowText {
  title: string;
  summary: string;
  proto: string;
}

function protoToken(entry: ACPDumpEntry): string {
  const update = asNotificationUpdate(entry);
  return update ? update.sessionUpdate : (entry.method ?? "(unknown)");
}

function updateText(
  update: SessionUpdate,
  toolTitles: Map<string, string>,
): { title: string; summary: string } {
  const sub = update.sessionUpdate;
  const u = update as Record<string, unknown>;
  switch (sub) {
    case "user_message_chunk":
      return {
        title: "User",
        summary: previewText(contentBlocksText([u.content as ContentBlock])),
      };
    case "agent_message_chunk":
      return {
        title: "Assistant",
        summary: previewText(contentBlocksText([u.content as ContentBlock])),
      };
    case "agent_thought_chunk":
      return {
        title: "Thinking",
        summary: previewText(contentBlocksText([u.content as ContentBlock])),
      };
    case "tool_call": {
      const rawInput = (u.rawInput ?? {}) as Record<string, unknown>;
      return { title: toolCallTitle(u), summary: previewText(String(rawInput.description ?? "")) };
    }
    case "tool_call_update": {
      const id = typeof u.toolCallId === "string" ? u.toolCallId : "";
      const status = typeof u.status === "string" ? u.status : "";
      return {
        title: (id && toolTitles.get(id)) || "Tool result",
        summary: toolOutputPreview(u) || status,
      };
    }
    case "usage_update": {
      const used = typeof u.used === "number" ? u.used : 0;
      const size = typeof u.size === "number" ? u.size : 0;
      const pct = size ? Math.round((used / size) * 100) : null;
      return {
        title: "Context window",
        summary: `${used.toLocaleString("en-US")} / ${size.toLocaleString("en-US")} tokens${
          pct != null ? ` · ${pct}%` : ""
        }`,
      };
    }
    case "available_commands_update": {
      const commands = Array.isArray(u.availableCommands) ? u.availableCommands : [];
      return {
        title: "Available commands",
        summary: `${commands.length} command${commands.length === 1 ? "" : "s"}`,
      };
    }
    case "plan": {
      const planEntries = Array.isArray(u.entries) ? (u.entries as Array<{ status?: string }>) : [];
      const done = planEntries.filter((e) => e?.status === "completed").length;
      return {
        title: "Plan",
        summary: planEntries.length ? `${done}/${planEntries.length} done` : "",
      };
    }
    case "session_info_update":
      return { title: "Session info", summary: "" };
    default:
      return { title: humanizeMethod(sub), summary: "" };
  }
}

function requestText(entry: ACPDumpEntry): { title: string; summary: string } {
  const method = entry.method ?? "(unknown)";
  const params = (entry.params ?? {}) as Record<string, unknown>;
  const isResponse = entry._type === "response";
  switch (method) {
    case "initialize": {
      if (isResponse) {
        const agentInfo = (params.agentInfo ?? {}) as Record<string, unknown>;
        const name = agentInfo.title || agentInfo.name || "agent";
        return {
          title: "Initialize",
          summary: `agent ${name}${agentInfo.version ? ` v${agentInfo.version}` : ""}`,
        };
      }
      const clientInfo = (params.clientInfo ?? {}) as Record<string, unknown>;
      return {
        title: "Initialize",
        summary: `client ${clientInfo.name ?? "?"}${clientInfo.version ? ` v${clientInfo.version}` : ""}`,
      };
    }
    case "session/load":
      return {
        title: "Load session",
        summary: typeof params.cwd === "string" ? previewText(params.cwd) : "",
      };
    case "session/new":
      return {
        title: "New session",
        summary: typeof params.cwd === "string" ? previewText(params.cwd) : "",
      };
    case "session/prompt":
      return {
        title: "Prompt",
        summary: Array.isArray(params.prompt)
          ? previewText(contentBlocksText(params.prompt as ContentBlock[]))
          : "",
      };
    case "session/request_permission": {
      const toolCall = (params.toolCall ?? {}) as Record<string, unknown>;
      return {
        title: "Permission request",
        summary: typeof toolCall.title === "string" ? previewText(toolCall.title) : "",
      };
    }
    case "session/cancel":
      return { title: "Cancel", summary: "" };
    default:
      if (method.startsWith("fs/")) {
        return {
          title: humanizeMethod(method),
          summary: typeof params.path === "string" ? previewText(params.path) : "",
        };
      }
      if (method.startsWith("terminal/")) {
        return {
          title: humanizeMethod(method),
          summary: typeof params.command === "string" ? previewText(params.command) : "",
        };
      }
      return { title: humanizeMethod(method), summary: "" };
  }
}

function rowText(entry: ACPDumpEntry, toolTitles: Map<string, string>): RowText {
  const proto = protoToken(entry);
  if (entry.error) {
    return {
      title: `${humanizeMethod(entry.method ?? "request")} failed`,
      summary: errorText(entry.error),
      proto,
    };
  }
  const update = asNotificationUpdate(entry);
  if (update) return { ...updateText(update, toolTitles), proto };
  return { ...requestText(entry), proto };
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

type RowSeed = Omit<TrajectoryRow, "index" | "turnStart" | "turnNumber">;

function singleRow(entry: ACPDumpEntry, toolTitles: Map<string, string>): RowSeed {
  const { title, summary, proto } = rowText(entry, toolTitles);
  return {
    direction: entry._direction,
    type: entry._type,
    method: entry.method,
    kind: kindForEntry(entry),
    title,
    summary,
    proto,
    chunkCount: 1,
    entries: [entry],
    detail: entry,
  };
}

function mergeChunkContent(updates: ChunkUpdate[]): ContentBlock[] {
  const out: ContentBlock[] = [];
  for (const update of updates) {
    const block = update.content;
    if (!block) continue;
    const last = out[out.length - 1];
    if (block.type === "text" && last && last.type === "text") {
      out[out.length - 1] = { ...last, text: last.text + block.text };
    } else {
      out.push(block);
    }
  }
  return out;
}

function groupRow(group: ACPDumpEntry[]): RowSeed {
  const updates = group
    .map((entry) => asChunkUpdate(entry))
    .filter((update): update is ChunkUpdate => update !== null);
  const first = updates[0];
  const sub = first.sessionUpdate;
  const merged = mergeChunkContent(updates);
  const title =
    sub === "agent_thought_chunk"
      ? "Thinking"
      : sub === "user_message_chunk"
        ? "User"
        : "Assistant";
  return {
    direction: "incoming",
    type: "notification",
    method: "session/update",
    kind: chunkKind(sub),
    title,
    summary: previewText(contentBlocksText(merged)),
    proto: sub,
    chunkCount: group.length,
    entries: group,
    detail: {
      _collapsed: true,
      method: "session/update",
      sessionId: entrySessionId(group[0]),
      sessionUpdate: sub,
      messageId: getSessionUpdateMessageId(first),
      chunkCount: group.length,
      content: merged,
      rawEntries: group,
    },
  };
}

/**
 * Coalesce runs of consecutive streaming chunks that share the same update kind,
 * messageId, and sessionId into a single row. Any non-chunk frame breaks a run
 * (matching {@link TurnMaterializer}'s null-messageId contiguity rule). Non-chunk
 * frames pass through unchanged.
 */
export function collapseTrajectory(
  entries: ACPDumpEntry[],
  toolTitles: Map<string, string> = new Map(),
): RowSeed[] {
  const rows: RowSeed[] = [];
  let i = 0;
  while (i < entries.length) {
    const chunk = asChunkUpdate(entries[i]);
    if (!chunk) {
      rows.push(singleRow(entries[i], toolTitles));
      i += 1;
      continue;
    }
    const sub = chunk.sessionUpdate;
    const messageId = getSessionUpdateMessageId(chunk);
    const sessionId = entrySessionId(entries[i]);
    const group = [entries[i]];
    let j = i + 1;
    while (j < entries.length) {
      const next = asChunkUpdate(entries[j]);
      if (
        !next ||
        next.sessionUpdate !== sub ||
        getSessionUpdateMessageId(next) !== messageId ||
        entrySessionId(entries[j]) !== sessionId
      ) {
        break;
      }
      group.push(entries[j]);
      j += 1;
    }
    rows.push(group.length === 1 ? singleRow(entries[i], toolTitles) : groupRow(group));
    i = j;
  }
  return rows;
}

/** Build the final, index-assigned rows for the viewer. */
export function buildTrajectoryRows(
  entries: ACPDumpEntry[],
  options: { collapse: boolean },
): TrajectoryRow[] {
  const toolTitles = collectToolTitles(entries);
  const seeds = options.collapse
    ? collapseTrajectory(entries, toolTitles)
    : entries.map((entry) => singleRow(entry, toolTitles));
  // A turn begins at a user prompt. Live sessions send it as an outgoing
  // `session/prompt`; a loaded session replays the prompt as a
  // `user_message_chunk` notification (no `session/prompt` frame), so key on
  // either. They are mutually exclusive per turn, but guard against a stray
  // user_message_chunk echo right after a prompt so we never count one twice.
  let turnNumber = 0;
  let prevWasTurnStart = false;
  return seeds.map((seed, index) => {
    const isPromptTurn = seed.direction === "outgoing" && seed.method === "session/prompt";
    const isReplayedUserTurn = seed.proto === "user_message_chunk";
    const turnStart = isPromptTurn || (isReplayedUserTurn && !prevWasTurnStart);
    if (turnStart) turnNumber += 1;
    prevWasTurnStart = turnStart;
    return { ...seed, index, turnStart, turnNumber };
  });
}

// ---------------------------------------------------------------------------
// Scoping
// ---------------------------------------------------------------------------

const BOOTSTRAP_METHODS = new Set(["initialize", "session/new"]);

/**
 * For a pending conversation (sessionId not yet assigned), there is no sessionId
 * to filter by. Fall back to the tail of the buffer since the most recent
 * `initialize` / `session/new` boundary, which is the in-flight conversation.
 */
function tailSinceLastBoundary(entries: ACPDumpEntry[]): ACPDumpEntry[] {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].method && BOOTSTRAP_METHODS.has(entries[i].method as string)) {
      return entries.slice(i);
    }
  }
  return entries.slice();
}

/**
 * Reduce the shared per-agent-server buffer to one conversation's frames.
 *
 * `ACPDebugLog` keys frames only by agent server and never clears them, so a
 * single buffer accumulates every conversation. Filtering strictly by
 * `params.sessionId` would silently drop the protocol handshake (`initialize`
 * request/response and the `session/new` request carry no sessionId — only the
 * `session/new` response does). So we take all sessionId-tagged frames for the
 * conversation, then walk backwards from the first of them to include the
 * leading bootstrap frames, stopping if we reach a frame tagged with a different
 * session. Frames tagged with a different session inside the range are excluded.
 *
 * The "All frames" view bypasses this entirely.
 */
export function scopeTrajectoryToConversation(
  entries: ACPDumpEntry[],
  sessionId: string | null,
): ACPDumpEntry[] {
  if (entries.length === 0) return [];
  if (!sessionId) return tailSinceLastBoundary(entries);

  const matched: number[] = [];
  for (let i = 0; i < entries.length; i++) {
    if (entrySessionId(entries[i]) === sessionId) matched.push(i);
  }
  if (matched.length === 0) return [];

  const last = matched[matched.length - 1];
  let start = matched[0];
  while (start > 0) {
    const prevSessionId = entrySessionId(entries[start - 1]);
    if (prevSessionId !== null && prevSessionId !== sessionId) break;
    start -= 1;
  }

  const out: ACPDumpEntry[] = [];
  for (let i = start; i <= last; i++) {
    const sid = entrySessionId(entries[i]);
    if (sid !== null && sid !== sessionId) continue;
    out.push(entries[i]);
  }
  return out;
}
