import type { ClientSideConnection, SessionId, SessionInfoUpdate } from "@agentclientprotocol/sdk";

export const CODEX_GOAL_CONTROL_METHOD = "_codex/session/goal_control";

export type ACPGoalStatus =
  | "active"
  | "paused"
  | "blocked"
  | "usageLimited"
  | "budgetLimited"
  | "complete";

export interface ACPGoalState {
  source: "claude" | "codex";
  objective: string;
  status: ACPGoalStatus;
  controlMethod?: typeof CODEX_GOAL_CONTROL_METHOD;
  iterations?: number;
  lastReason?: string;
  setAt?: number;
  tokensAtStart?: number;
  createdAt?: number;
  tokenBudget?: number | null;
  timeUsedSeconds?: number;
}

export interface ACPClaudeGoalUpdate {
  sessionId: string;
  goal: ACPGoalState | null;
}

export type ACPClaudeGoalCommand = { action: "set"; objective: string } | { action: "clear" };

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNonNegativeNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function nonNegativeInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : undefined;
}

const CODEX_GOAL_STATUSES = new Set<ACPGoalStatus>([
  "active",
  "paused",
  "blocked",
  "usageLimited",
  "budgetLimited",
  "complete",
]);

/**
 * Extract a Codex goal state from one session_info_update.
 *
 * `undefined` means the update did not carry an authoritative goal field and
 * must not disturb the current state. `null` is an explicit clear.
 */
export function parseCodexGoalUpdate(
  update: Pick<SessionInfoUpdate, "_meta">,
): ACPGoalState | null | undefined {
  const codex = asRecord(update._meta?.codex);
  if (!codex || !Object.hasOwn(codex, "goal")) return undefined;
  if (codex.goal === null) return null;

  const value = asRecord(codex.goal);
  if (!value) return undefined;
  const objective = typeof value.objective === "string" ? value.objective.trim() : "";
  const status = value.status;
  if (
    !objective ||
    typeof status !== "string" ||
    !CODEX_GOAL_STATUSES.has(status as ACPGoalStatus)
  ) {
    return undefined;
  }

  const tokenBudget =
    value.tokenBudget === null ? null : finiteNonNegativeNumber(value.tokenBudget);
  return {
    source: "codex",
    objective,
    status: status as ACPGoalStatus,
    ...(value.controlMethod === CODEX_GOAL_CONTROL_METHOD
      ? { controlMethod: CODEX_GOAL_CONTROL_METHOD }
      : {}),
    ...(finiteNonNegativeNumber(value.createdAt) !== undefined
      ? { createdAt: finiteNonNegativeNumber(value.createdAt) }
      : {}),
    ...(tokenBudget !== undefined ? { tokenBudget } : {}),
    ...(finiteNonNegativeNumber(value.timeUsedSeconds) !== undefined
      ? { timeUsedSeconds: finiteNonNegativeNumber(value.timeUsedSeconds) }
      : {}),
  };
}

/** Parse Claude Code's filtered raw `active_goal` SDK notification. */
export function parseClaudeGoalUpdate(params: Record<string, unknown>): ACPClaudeGoalUpdate | null {
  const sessionId = params.sessionId;
  const message = asRecord(params.message);
  if (
    typeof sessionId !== "string" ||
    sessionId.length === 0 ||
    message?.type !== "active_goal" ||
    !Object.hasOwn(message, "value")
  ) {
    return null;
  }
  if (message.value === null) return { sessionId, goal: null };

  const value = asRecord(message.value);
  if (!value) return null;
  const objective = typeof value.condition === "string" ? value.condition.trim() : "";
  const iterations = nonNegativeInteger(value.iterations);
  const setAt = finiteNonNegativeNumber(value.set_at);
  const tokensAtStart = finiteNonNegativeNumber(value.tokens_at_start);
  if (
    !objective ||
    iterations === undefined ||
    setAt === undefined ||
    tokensAtStart === undefined
  ) {
    return null;
  }

  return {
    sessionId,
    goal: {
      source: "claude",
      objective,
      status: "active",
      iterations,
      setAt,
      tokensAtStart,
      ...(typeof value.last_reason === "string" && value.last_reason.trim()
        ? { lastReason: value.last_reason.trim() }
        : {}),
    },
  };
}

/**
 * Parse Claude's standalone goal command for clients that need to mirror its
 * session-local state. Some Claude SDK releases declare `active_goal` but do
 * not emit it at runtime, so the command is also used as a UI fallback.
 */
export function parseClaudeGoalCommand(text: string): ACPClaudeGoalCommand | null {
  const match = /^\/goal(?:\s+([\s\S]*))?$/.exec(text.trim());
  const argument = match?.[1]?.trim();
  if (!argument) return null;
  return argument === "clear" ? { action: "clear" } : { action: "set", objective: argument };
}

export interface ACPGoalControlRequest {
  sessionId: SessionId;
  action: "pause" | "clear";
}

export function controlCodexGoal(
  conn: ClientSideConnection,
  request: ACPGoalControlRequest,
): Promise<Record<string, never>> {
  return conn.request<Record<string, never>, ACPGoalControlRequest>(
    CODEX_GOAL_CONTROL_METHOD,
    request,
  );
}
