import type {
  AgentCapabilities,
  ClientSideConnection,
  InitializeResponse,
  SessionInfo,
} from "@agentclientprotocol/sdk";
import { normalizeAgentServerName } from "../agentServers";
import { normalizeACPError, type ACPRequestError } from "../errors";
import { sortConversationSummaries, type ACPConversationSummary } from "../navTypes";
import { normalizeSessionInfo } from "../sessionInfo";

type AgentCapabilitiesWithSessionDelete = AgentCapabilities & {
  sessionCapabilities?: AgentCapabilities["sessionCapabilities"] & {
    delete?: unknown;
  };
};

export type { ACPConversationSummary } from "../navTypes";

export interface SessionListFailure {
  agentServer: string;
  error: ACPRequestError;
}

export interface AggregatedSessionList {
  sessions: ACPConversationSummary[];
  // Servers whose session/list call failed or timed out. The sessions of the
  // remaining servers are still valid; callers should degrade, not fail.
  failures: SessionListFailure[];
  // Servers that returned a session list (possibly truncated at the safety
  // cap). Distinguishes "some servers answered" from "everything is down".
  listedServers: string[];
  // Servers whose full session list was retrieved (list supported, no error,
  // pagination exhausted below the safety cap). Only for these servers can a
  // missing session be interpreted as "deleted agent-side".
  completeServers: string[];
}

export interface ConversationListSource {
  list(cwd?: string): Promise<AggregatedSessionList>;
}

export function emptyAggregatedSessionList(): AggregatedSessionList {
  return { sessions: [], failures: [], listedServers: [], completeServers: [] };
}

interface AggregatedSessionListSourceOptions {
  // Per-server budget covering connect + all session/list pages.
  timeoutMs?: number;
  // Safety cap so a runaway agent store cannot make us page forever.
  maxSessionsPerServer?: number;
}

const DEFAULT_SESSION_LIST_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_SESSIONS_PER_SERVER = 2_000;
// Hard bound on pagination requests per server. The session cap alone cannot
// bound the loop: a buggy or hostile agent returning nextCursor with sparse
// pages would otherwise keep the abandoned loop issuing requests long after
// the caller's timeout rejected (the raced promise is never cancelled).
const MAX_SESSION_LIST_PAGES = 100;

type ServerListOutcome =
  | { status: "ok"; agentServer: string; sessions: ACPConversationSummary[]; complete: boolean }
  | { status: "skipped"; agentServer: string }
  | { status: "error"; agentServer: string; error: ACPRequestError };

export class AggregatedSessionListSource implements ConversationListSource {
  private readonly timeoutMs: number;
  private readonly maxSessionsPerServer: number;
  // In-flight per-(agentServer, cwd) requests. A timeout returns control to
  // the caller but cannot cancel the underlying request; deduping ensures a
  // hung server has at most one pending fan-out instead of one per refresh.
  private readonly inflight = new Map<string, Promise<ServerListOutcome>>();

  constructor(
    private readonly getAgentServers: () => string[],
    private readonly getConnection: (agentServer: string) => Promise<ClientSideConnection | null>,
    private readonly getInitializeResponse: (agentServer: string) => InitializeResponse | null,
    options: AggregatedSessionListSourceOptions = {},
  ) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_SESSION_LIST_TIMEOUT_MS;
    this.maxSessionsPerServer = options.maxSessionsPerServer ?? DEFAULT_MAX_SESSIONS_PER_SERVER;
  }

  async list(cwd = "/"): Promise<AggregatedSessionList> {
    const agentServers = Array.from(
      new Set(this.getAgentServers().map((name) => normalizeAgentServerName(name))),
    );

    // Every server is queried independently and concurrently: one failing,
    // unauthenticated, or hung server must not block or fail the others.
    const outcomes = await Promise.all(
      agentServers.map((agentServer) => this.listServer(agentServer, cwd)),
    );

    const result = emptyAggregatedSessionList();
    for (const outcome of outcomes) {
      if (outcome.status === "ok") {
        result.sessions.push(...outcome.sessions);
        result.listedServers.push(outcome.agentServer);
        if (outcome.complete) {
          result.completeServers.push(outcome.agentServer);
        }
      } else if (outcome.status === "error") {
        result.failures.push({ agentServer: outcome.agentServer, error: outcome.error });
      }
    }
    result.sessions.sort(sortConversationSummaries);
    return result;
  }

  private async listServer(agentServer: string, cwd: string): Promise<ServerListOutcome> {
    try {
      return await withTimeout(
        this.inflightListServerSessions(agentServer, cwd),
        this.timeoutMs,
        `Timed out listing sessions for agent "${agentServer}"`,
      );
    } catch (error) {
      return { status: "error", agentServer, error: normalizeACPError(error) };
    }
  }

  private inflightListServerSessions(agentServer: string, cwd: string): Promise<ServerListOutcome> {
    const key = `${agentServer}\0${cwd}`;
    const existing = this.inflight.get(key);
    if (existing) return existing;

    const request = this.listServerSessions(agentServer, cwd).finally(() => {
      if (this.inflight.get(key) === request) {
        this.inflight.delete(key);
      }
    });
    // Callers race a timeout and may stop listening before the request
    // settles; mark eventual rejections handled so they don't surface as
    // unhandled-rejection noise.
    request.catch(() => {});
    this.inflight.set(key, request);
    return request;
  }

  private async listServerSessions(agentServer: string, cwd: string): Promise<ServerListOutcome> {
    const conn = await this.getConnection(agentServer);
    if (!conn) {
      return { status: "skipped", agentServer };
    }

    const initResponse = this.getInitializeResponse(agentServer);
    if (!supportsSessionList(initResponse?.agentCapabilities ?? null)) {
      return { status: "skipped", agentServer };
    }

    const listAll = cwd === "/" || cwd === "";
    const sessions: ACPConversationSummary[] = [];
    let cursor: string | null = null;
    let complete = false;
    let pageCount = 0;

    // Cursor-based pagination per the ACP session/list spec: keep following
    // nextCursor until the agent reports the end of its results.
    do {
      const res = await conn.listSessions({
        ...(listAll ? {} : { cwd }),
        ...(cursor ? { cursor } : {}),
      });
      pageCount += 1;
      sessions.push(
        ...res.sessions.map((session) => {
          const info = normalizeSessionInfo(session as SessionInfo);
          return {
            ...info,
            id: session.sessionId,
            agentServer,
            workingDirectories: [info.cwd].filter(Boolean),
          };
        }),
      );
      cursor = res.nextCursor ?? null;
      if (!cursor) {
        complete = true;
      } else if (res.sessions.length === 0) {
        // A cursor alongside an empty page makes no forward progress toward
        // either cap; stop rather than page forever, and stay incomplete.
        break;
      }
    } while (
      cursor &&
      sessions.length < this.maxSessionsPerServer &&
      pageCount < MAX_SESSION_LIST_PAGES
    );

    // A single oversized page can overshoot the cap; enforce it as a hard
    // bound. A clamped list is incomplete regardless of what the agent said —
    // the dropped tail must not read as "deleted agent-side".
    if (sessions.length > this.maxSessionsPerServer) {
      sessions.length = this.maxSessionsPerServer;
      complete = false;
    }

    return { status: "ok", agentServer, sessions, complete };
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export function supportsSessionList(agentCapabilities: AgentCapabilities | null): boolean {
  return agentCapabilities?.sessionCapabilities?.list != null;
}

export function supportsSessionDelete(agentCapabilities: AgentCapabilities | null): boolean {
  return (
    (agentCapabilities as AgentCapabilitiesWithSessionDelete | null)?.sessionCapabilities?.delete !=
    null
  );
}
