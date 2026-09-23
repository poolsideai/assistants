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
  if (!(err instanceof ACPError)) return false;
  if (err.code === -32002 && err.message.toLowerCase().includes("resource not found")) {
    return true;
  }
  // Agents answer calls on a session they no longer hold (closed via
  // session/close by this or another surface, or lost to an agent restart)
  // with a plain internal error, e.g. claude-agent-acp's "Session not found".
  // Treat it as stale so the restore-and-retry path reopens transparently.
  if (err.code !== -32603) return false;
  const detail = `${err.message} ${stringifyData(err.data)}`.toLowerCase();
  return detail.includes("session not found");
}

// An agent can refuse to prompt a session it just restored, in a way no
// reload can fix. `pool acp` keeps the record binding an ACP session to its
// backend session on disk; when that record is lost the agent replays no
// transcript and every prompt re-runs its "starting conversation" path, which
// collides with the backend session the first turn already created
// (PE-2460 / AGR-356). Retrying only repeats the collision, so callers rebind
// the conversation to a fresh session instead.
export function isUnresumableSessionError(err: ACPRequestError): boolean {
  if (!(err instanceof ACPError)) return false;
  if (err.code !== -32603) return false;
  const detail = `${err.message} ${stringifyData(err.data)}`.toLowerCase();
  if (detail.includes("agent_session_pkey")) return true;
  return detail.includes("duplicate key") && detail.includes("agent session");
}

function stringifyData(data: unknown): string {
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data) ?? "";
  } catch {
    return "";
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
