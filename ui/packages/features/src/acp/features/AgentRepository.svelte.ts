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
  poolsideAcpSessionClose,
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
import {
  mergeLocalInferenceModelConfigOptions,
  preserveLocalInferenceModelConfigOptionForAgent,
} from "../localInferenceModelOptions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { currentConfigSelections, mergeConfigSelections } from "./session/configOptions";
import {
  sessionSteeringTransport,
  supportsSessionSteering,
  type ACPSteerTransport,
} from "./session/steering";
__POOL_SYNTHETIC_IMPORT_BASELINE__
// How long a probe's config report stays trusted before ensureConfigProbe
// re-probes. ACP only reports config options on session/new, so without
// re-probing the new-conversation page would show the first probe's options
// for the whole app run — e.g. missing a model the agent's lab released an
// hour ago. Long enough that focus/page-open bursts coalesce into nothing,
// short enough that agent-side changes appear within minutes.
const AGENT_CONFIG_FRESH_MS = 10 * 60 * 1000;

// Grace period before a superseded config probe's agent-side session is
// closed. MCP-settings RPCs resolve their sessionId from the probe map before
// calling (including `_poolside/mcp/authenticate`, which spans a browser OAuth
// round-trip that typically completes right around the window-focus event
// that triggers rotation); an immediate close would fail those calls, so give
// in-flight requests time to drain against the old session first.
const SUPERSEDED_PROBE_CLOSE_DELAY_MS = 60 * 1000;

// Backoff after a failed probe. Failures record no freshness, so without this
// every window focus would retry a broken agent — reconnecting, respawning the
// subprocess, and (for quiet refreshes) doing it invisibly.
const AGENT_CONFIG_FAILURE_BACKOFF_MS = 2 * 60 * 1000;

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// A cache entry's payload, detached from Svelte proxies and without the
// identity fields the store owns.
type ACPConfigCacheSnapshot = Omit<ACPConfigCacheEntry, "agentServer" | "cachedAt">;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type ACPAuthenticationProbeResult = "authenticated" | "pending" | "failed";

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * agent: connection, capabilities, auth, and config cache. Whether a session
 * must be reloaded after its agent restarted is per-session state, on
 * ACPSession.restoreRequired.
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
  // Whether the default agent is pinned: pinned defaults are deliberate, so
  // the last-used auto-follow (recording sites) must leave them alone.
  defaultAgentServerPinned = $state(false);
  defaultConfigOptionsByAgentServer = $state.raw<Record<string, Record<string, string>>>({});
  // Config option ids the user pinned per agent (mirror of the store's
  // `pinned_config_options`). A pinned key keeps its default value: the
  // last-used persist skips it until it is unpinned.
  pinnedConfigOptionsByAgentServer = $state.raw<Record<string, string[]>>({});
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
  // Whether a given in-flight refresh suppresses error banners. Keyed by the
  // refresh itself so a loud caller can tell it must not reuse a quiet one.
  configRefreshQuiet = new WeakMap<Promise<void>, boolean>();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // When the agent last reported config (probe response, probe streaming
  // update, or a real session/new). Drives the ensureConfigProbe TTL; not
  // persisted, so every app run starts with one probe.
  agentConfigFreshAt = new Map<string, number>();
  // When a probe last failed, so a broken agent isn't retried on every focus.
  agentConfigFailedAt = new Map<string, number>();
  // Config values the user explicitly chose, per agent. The cache's
  // currentValues cannot serve this purpose: they hold whatever the agent
  // last reported for untouched options, so preserving them wholesale would
  // pin the agent's first-seen defaults forever and stop a changed
  // agent-side default from ever reaching the UI.
  userConfigSelections = new Map<string, Map<string, string | boolean>>();
  userModeSelections = new Map<string, string>();
  // Superseded probe sessions awaiting their close drain window, kept so a
  // webview teardown that eats the timer doesn't strand them forever.
  pendingProbeCloses = new Map<string, Set<SessionId>>();
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
  steeringTransport(agentServer: string): ACPSteerTransport | null {
    agentServer = normalizeAgentServerName(agentServer);
    return sessionSteeringTransport(this.getInitializeResponse(agentServer));
  }

  supportsSteering(agentServer: string): boolean {
    agentServer = normalizeAgentServerName(agentServer);
    return supportsSessionSteering(this.getInitializeResponse(agentServer));
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
      this.clearNonSessionError(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      delete next[agentServer];
      this.authInProgressFor = next;
    }
  }

  async probeAuthentication(
    methodId: string,
    agentServer = this.defaultAgentServer,
  ): Promise<ACPAuthenticationProbeResult> {
    agentServer = normalizeAgentServerName(agentServer);
    if (this.authInProgressFor[agentServer]) return "pending";
    const conn = await this.connectServer(agentServer, { surfaceErrors: true });
    if (!conn) return "failed";

    this.authInProgressFor = { ...this.authInProgressFor, [agentServer]: true };
    try {
      await conn.authenticate({ methodId });
      this.clearAuthRequired(agentServer);
      this.clearNonSessionError(agentServer);
      return "authenticated";
    } catch (e) {
      const error = normalizeACPError(e);
      if (isAuthRequiredError(error)) {
        this.markAuthRequired(agentServer);
        this.clearNonSessionError(agentServer);
        return "pending";
      }
      this.setNonSessionError(agentServer, error);
      return "failed";
    } finally {
      const next = { ...this.authInProgressFor };
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
    const normalizedAgentServer = normalizeAgentServerName(agentServer);
    const reactiveDefaults = this.defaultConfigOptionsByAgentServer[normalizedAgentServer];
    if (reactiveDefaults) return reactiveDefaults;

__POOL_SYNTHETIC_IMPORT_BASELINE__
    return resolved[normalizedAgentServer]?.default_config_options ?? {};
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  pinnedConfigOptionsFor(agentServer = this.defaultAgentServer): string[] {
    const normalizedAgentServer = normalizeAgentServerName(agentServer);
    const reactivePinned = this.pinnedConfigOptionsByAgentServer[normalizedAgentServer];
    if (reactivePinned) return reactivePinned;

    const resolved = resolveAgentServers(get(appState).userSettings.acpAgentServers);
    return resolved[normalizedAgentServer]?.pinned_config_options ?? [];
  }

  /** Whether the user pinned `configId`'s default for this agent. */
  isPinnedConfigOption(agentServer: string, configId: string): boolean {
    return this.pinnedConfigOptionsFor(agentServer).includes(configId);
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
    const sessionId = this.configProbeSessionIds.get(agentServer);
    if (sessionId) {
      // "Stale to one consumer" is not "gone agent-side": a fetch that raced
      // a probe rotation forgets the healthy replacement, which would then
      // leak when the next refresh has no predecessor to close. Drain first —
      // another surface (a second webview, the VS Code sidebar) may still be
      // mid-RPC on this id.
      this.#closeSupersededProbe(agentServer, sessionId);
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.agentConfigFreshAt.delete(agentServer);
    // A restart or a forced re-probe is a deliberate retry: don't hold it
    // behind a backoff from the failure that prompted it.
    this.agentConfigFailedAt.delete(agentServer);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.agentConfigFreshAt.delete(agentServer);
      this.agentConfigFailedAt.delete(agentServer);
      this.userConfigSelections.delete(agentServer);
      this.userModeSelections.delete(agentServer);
      this.pendingProbeCloses.delete(agentServer);
      // configRefreshQuiet is keyed by the refresh promise and weakly held,
      // so it needs no explicit cleanup here.
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Absent pin param: the store preserves the current pinned state, so a
    // last-used write through here never pins or unpins on its own — and is
    // skipped entirely at dequeue while the store's fresh state says the
    // default is pinned (see #persistDefaultAgentServer).
    return this.#persistDefaultAgentServer(agentServer, undefined);
  }

  /**
   * Pin `agentServer` as the default agent: the default becomes this agent
   * AND stays put — every last-used recording site skips its write while the
   * pin holds. Serialized through the agent-servers persist queue.
   */
  async setPinnedDefaultAgentServer(
    agentServer: string,
  ): Promise<{ agentServers: ACPAgentServers; defaultAgentServer?: string }> {
    return this.#persistDefaultAgentServer(agentServer, true);
  }

  /**
   * Release the default-agent pin. The default agent itself is unchanged; it
   * simply resumes following the last explicitly used agent.
   */
  async unpinDefaultAgentServer(): Promise<{
    agentServers: ACPAgentServers;
    defaultAgentServer?: string;
  }> {
    return this.#persistDefaultAgentServer(undefined, false);
  }

  // Shared writer for the default agent and its pin. `agentServer` undefined
  // leaves the stored default untouched (unpin); `pinned` undefined leaves
  // the stored pin untouched (the plain last-used write) — the store
  // preserves either field when its param is absent.
  async #persistDefaultAgentServer(
    agentServer: string | undefined,
    pinned: boolean | undefined,
  ): Promise<{ agentServers: ACPAgentServers; defaultAgentServer?: string }> {
    const normalized =
      agentServer === undefined ? undefined : normalizeAgentServerName(agentServer);
    const previousDefault = this.defaultAgentServer;
    const previousPinned = this.defaultAgentServerPinned;
    // Optimistic and immediate; the store write serializes behind any other
    // in-flight agent-server persist (see #enqueueAgentServersPersist).
    if (normalized !== undefined) {
      this.defaultAgentServer = preferredAgentServer(this.agentServerNames, normalized);
    }
    if (pinned !== undefined) this.defaultAgentServerPinned = pinned;
    return this.#enqueueAgentServersPersist(async () => {
      try {
        const state = await poolsideAcpNavListAgentServers({});
        const agentServers = (state.agentServers ?? {}) as ACPAgentServers;
        // An absent pin param marks the last-used follow (setDefaultAgentServer):
        // its callers gate on an in-memory pin mirror that can be stale — a
        // window that never saw another window's pin would MOVE the pinned
        // default, leaving the pin fixing the wrong agent. So re-check the
        // store's fresh flag at dequeue, mirroring #isPinnedInStore for
        // config options, and heal the mirrors from the store instead of
        // writing. Explicit pin/unpin writes (pinned defined) proceed
        // regardless — they are the deliberate acts the pin protects.
        if (pinned === undefined && state.default_agent_server_pinned === true) {
          const names = agentServerNames(agentServers);
          this.defaultAgentServer = preferredAgentServer(names, state.defaultAgentServer);
          this.defaultAgentServerPinned = true;
          return { agentServers, defaultAgentServer: state.defaultAgentServer };
        }
        const res = await poolsideAcpNavSetAgentServers({
          agentServers,
          defaultAgentServer: normalized,
          default_agent_server_pinned: pinned,
        });
        const resAgentServers = (res.agentServers ?? {}) as ACPAgentServers;
        const names = agentServerNames(resAgentServers);
        this.defaultAgentServer = preferredAgentServer(names, res.defaultAgentServer);
        // Absent on the wire means unpinned (the store omits a false flag).
        this.defaultAgentServerPinned = res.default_agent_server_pinned === true;
        return {
          agentServers: resAgentServers,
          defaultAgentServer: res.defaultAgentServer,
        };
      } catch (error) {
        // Mirror the config-pin path's rollback: a failed persist must not
        // leave the optimistic mirrors claiming a default/pin the store
        // refused.
        this.defaultAgentServer = previousDefault;
        this.defaultAgentServerPinned = previousPinned;
        throw error;
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Runs inside the persist queue: re-lists the store's freshest state,
  // merges only this call's change into it, and writes the whole map back.
  // It writes the default value WITHOUT consulting `pinned_config_options`,
  // so its only caller (#persistLastUsedConfigOption) performs the
  // dequeue-time pin check first; any new caller must do the same — or pin
  // deliberately through setPinnedDefaultConfigOption — or it would silently
  // overwrite a pinned default.
  async #persistDefaultConfigOption(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    previousDefaults: Record<string, Record<string, string>>,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    try {
      const state = await poolsideAcpNavListAgentServers({});
      const current = (state.agentServers ?? {}) as ACPAgentServers;
      const resolved = resolveAgentServers(current);
      const base = resolved[agentServer];
      if (!base) {
        this.defaultConfigOptionsByAgentServer = previousDefaults;
        return;
      }
      const next: ACPAgentServers = {
        ...current,
        [agentServer]: {
          ...base,
          default_config_options: {
            ...(base.default_config_options ?? {}),
            [configId]: value,
          },
        },
      };
      const res = await poolsideAcpNavSetAgentServers({
        agentServers: next,
      });
      const savedAgentServers = (res.agentServers ?? {}) as ACPAgentServers;
      this.syncDefaultConfigOptions(savedAgentServers);
      appState.update((state) => ({
        ...state,
        userSettings: {
          ...state.userSettings,
          acpAgentServers: savedAgentServers,
        },
      }));
    } catch (error) {
      this.defaultConfigOptionsByAgentServer = previousDefaults;
      throw error;
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * Pin `configId` to `value` for this agent: the star's pressed state. The
   * write carries BOTH the default value and the pinned-list membership, so
   * one queue round trip lands the pair atomically. While pinned, the
   * last-used auto-follow leaves the key alone (see
   * #persistLastUsedConfigOption); how defaults APPLY to new sessions is
   * unchanged — pinning only decides who may write the default.
   */
  async setPinnedDefaultConfigOption(
    agentServer: string,
    configId: string,
    value: string,
  ): Promise<void> {
    agentServer = normalizeAgentServerName(agentServer);
    // Optimistic and immediate; the store write serializes behind any other
    // in-flight agent-server persist (see #enqueueAgentServersPersist).
    const previousDefaults = this.defaultConfigOptionsByAgentServer;
    const previousPinned = this.pinnedConfigOptionsByAgentServer;
    this.defaultConfigOptionsByAgentServer = {
      ...previousDefaults,
      [agentServer]: {
        ...this.defaultConfigOptionsFor(agentServer),
        [configId]: value,
      },
    };
    const optimisticPinned = this.pinnedConfigOptionsFor(agentServer);
    this.pinnedConfigOptionsByAgentServer = {
      ...previousPinned,
      [agentServer]: optimisticPinned.includes(configId)
        ? optimisticPinned
        : [...optimisticPinned, configId],
    };
    return this.#enqueueAgentServersPersist(() =>
      this.#persistPinnedConfigOption(
        agentServer,
        configId,
        { value },
        previousDefaults,
        previousPinned,
      ),
    );
  }

  /**
   * Release the pin on `configId`. By default the default value itself stays
   * — the key simply resumes being overwritten by the last-used auto-follow.
   *
   * `clearValue` removes the stored default value in the same write. Callers
   * pass it for options the auto-follow will never manage (behavioral modes
   * and uncategorized/custom-category options — the inverse of
   * shouldPersistConfigSelection): applyDefaultConfigOptions applies EVERY
   * stored default to new sessions, so a kept value on a follow-less key
   * would silently seed every future conversation — e.g. a pinned-then-
   * unpinned "Bypass permissions" — with no UI left to clear it.
   */
  async unpinDefaultConfigOption(
    agentServer: string,
    configId: string,
    options: { clearValue?: boolean } = {},
  ): Promise<void> {
    agentServer = normalizeAgentServerName(agentServer);
    const clearValue = options.clearValue === true;
    const previousDefaults = this.defaultConfigOptionsByAgentServer;
    const previousPinned = this.pinnedConfigOptionsByAgentServer;
    this.pinnedConfigOptionsByAgentServer = {
      ...previousPinned,
      [agentServer]: this.pinnedConfigOptionsFor(agentServer).filter((id) => id !== configId),
    };
    if (clearValue) {
      const { [configId]: _cleared, ...remaining } = this.defaultConfigOptionsFor(agentServer);
      this.defaultConfigOptionsByAgentServer = {
        ...previousDefaults,
        [agentServer]: remaining,
      };
    }
    return this.#enqueueAgentServersPersist(() =>
      this.#persistPinnedConfigOption(
        agentServer,
        configId,
        null,
        previousDefaults,
        previousPinned,
        clearValue,
      ),
    );
  }

  // Runs inside the persist queue: re-lists the store's freshest state,
  // merges only this call's pin change — and, when pinning, the default
  // value — into the agent's entry, and writes the whole map back. `pin`
  // null means unpin; `clearValue` (unpin only) removes the stored default
  // value in the same write, for options the last-used auto-follow would
  // never overwrite (see unpinDefaultConfigOption).
  async #persistPinnedConfigOption(
    agentServer: string,
    configId: string,
    pin: { value: string } | null,
    previousDefaults: Record<string, Record<string, string>>,
    previousPinned: Record<string, string[]>,
    clearValue = false,
  ): Promise<void> {
    const restore = () => {
      this.defaultConfigOptionsByAgentServer = previousDefaults;
      this.pinnedConfigOptionsByAgentServer = previousPinned;
    };
    try {
      const state = await poolsideAcpNavListAgentServers({});
      const current = (state.agentServers ?? {}) as ACPAgentServers;
      const resolved = resolveAgentServers(current);
      const base = resolved[agentServer];
      if (!base) {
        restore();
        return;
      }
      const storedPinned = base.pinned_config_options ?? [];
      const nextPinned = pin
        ? storedPinned.includes(configId)
          ? storedPinned
          : [...storedPinned, configId]
        : storedPinned.filter((id) => id !== configId);
      const { pinned_config_options: _stored, ...baseConfig } = base;
      const nextConfig: ACPAgentServers[string] = pin
        ? {
            ...baseConfig,
            default_config_options: {
              ...(base.default_config_options ?? {}),
              [configId]: pin.value,
            },
          }
        : baseConfig;
      if (!pin && clearValue) {
        const { [configId]: _clearedValue, ...remainingDefaults } =
          nextConfig.default_config_options ?? {};
        // An emptied defaults map is dropped entirely rather than persisted
        // as {} (like the pin list below).
        if (Object.keys(remainingDefaults).length > 0) {
          nextConfig.default_config_options = remainingDefaults;
        } else {
          delete nextConfig.default_config_options;
        }
      }
      // An empty pin list is dropped entirely rather than persisted as [].
      if (nextPinned.length > 0) nextConfig.pinned_config_options = nextPinned;
      const res = await poolsideAcpNavSetAgentServers({
        agentServers: { ...current, [agentServer]: nextConfig },
      });
      const savedAgentServers = (res.agentServers ?? {}) as ACPAgentServers;
      this.syncDefaultConfigOptions(savedAgentServers);
      appState.update((state) => ({
        ...state,
        userSettings: {
          ...state.userSettings,
          acpAgentServers: savedAgentServers,
        },
      }));
    } catch (error) {
      restore();
      throw error;
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    defaultAgentServerPinned?: boolean,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.syncDefaultConfigOptions(get(appState).userSettings.acpAgentServers);
    // Only an explicit value syncs the pin mirror: most callers reconfigure
    // names/default without knowing the pin state, and must not clear it.
    if (defaultAgentServerPinned !== undefined) {
      this.defaultAgentServerPinned = defaultAgentServerPinned;
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
  private syncDefaultConfigOptions(agentServers?: ACPAgentServers): void {
    const resolved = Object.entries(resolveAgentServers(agentServers));
    this.defaultConfigOptionsByAgentServer = Object.fromEntries(
      resolved.map(([agentServer, config]) => [
        agentServer,
        { ...(config.default_config_options ?? {}) },
      ]),
    );
    this.pinnedConfigOptionsByAgentServer = Object.fromEntries(
      resolved.map(([agentServer, config]) => [
        agentServer,
        [...(config.pinned_config_options ?? [])],
      ]),
    );
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // refreshed from the agent on first use, again whenever ensureConfigProbe
  // runs with the last agent report gone stale (new-conversation page open,
  // window focus), when the user restarts the agent, or via the streaming
  // session updates routed through `handleConfigProbeSessionUpdate`.
  //
  // Option *definitions* in the cache belong to the agent, but the
  // currentValues are user state: sessionless drafts write their picker
  // selections straight into the cache. Refreshes therefore preserve cached
  // selections that are still valid instead of resetting them to the agent's
  // defaults (see preserveCachedSelections).
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   * Ensure a throwaway config probe exists for this agent and that the agent
   * reported config recently (AGENT_CONFIG_FRESH_MS). ACP does not currently
   * expose a sessionless getConfig call, so a probe is implemented by
   * creating an agent-side session and using its returned config/options.
   * It is never represented as an ACPSession. A stale probe is re-run — and
   * its predecessor's agent-side session closed — so the options behind the
   * new-conversation page track the agent instead of freezing at the first
   * probe of the app run.
   */
  async ensureConfigProbe(
    agentServer = this.defaultAgentServer,
    cwd = "/",
    options: { quiet?: boolean } = {},
  ): Promise<void> {
    agentServer = normalizeAgentServerName(agentServer);
    // A failed probe records no freshness, so without a backoff every focus
    // would retry a broken or offline agent — respawning its subprocess each
    // time, invisibly when quiet.
    if (this.#isAgentConfigFailureRecent(agentServer)) return;
    if (this.configProbeSessionIdsByAgentServer[agentServer]) {
      if (this.isAgentConfigFresh(agentServer)) return;
      // Rotating the probe strands the predecessor's agent-side session when
      // the agent cannot close-and-reopen sessions (the helper's close is a
      // silent no-op then). For those agents keep the run's first probe —
      // stale options beat leaking a session per rotation.
      if (!this.#supportsProbeRotation(agentServer)) return;
    }
    await this.refreshCachedConfig(agentServer, cwd, { quiet: options.quiet });
  }

  // Mirror of the helper's supportsSessionClose predicate (acpproxy
  // process.go): session/close plus a reopen path. Without both, the
  // helper's CloseSession succeeds without closing anything.
  #supportsProbeRotation(agentServer: string): boolean {
    const capabilities = this.capabilitiesFor(agentServer);
    if (capabilities?.sessionCapabilities?.close == null) return false;
    return capabilities.sessionCapabilities.resume != null || capabilities.loadSession === true;
  }

  /**
   * Record that the agent just reported its config (a probe response or a
   * real session/new), so ensureConfigProbe can skip re-probing until the
   * report goes stale.
__POOL_SYNTHETIC_IMPORT_BASELINE__
  markAgentConfigFresh(agentServer: string): void {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.agentConfigFreshAt.set(agentServer, Date.now());
    this.agentConfigFailedAt.delete(agentServer);
  }

  isAgentConfigFresh(agentServer: string): boolean {
    const freshAt = this.agentConfigFreshAt.get(normalizeAgentServerName(agentServer));
    return freshAt !== undefined && Date.now() - freshAt < AGENT_CONFIG_FRESH_MS;
  }

  #markAgentConfigFailed(agentServer: string): void {
    this.agentConfigFailedAt.set(normalizeAgentServerName(agentServer), Date.now());
  }

  #isAgentConfigFailureRecent(agentServer: string): boolean {
    const failedAt = this.agentConfigFailedAt.get(normalizeAgentServerName(agentServer));
    return failedAt !== undefined && Date.now() - failedAt < AGENT_CONFIG_FAILURE_BACKOFF_MS;
  }

  /**
   * Record a config value the user explicitly chose, so a later probe keeps
   * it instead of reverting to the agent's default for a new session. Values
   * the user never touched are deliberately not recorded: those must track
   * the agent, so a lab changing its default default reaches the picker.
   *
   * Every explicit choice also persists as the agent's last-used value (via
   * the same per-agent store applyDefaultConfigOptions reads), so a new
   * conversation starts from whatever the user picked last — unless the
   * caller passes `persist: false` (options whose semantics are not known to
   * be safe to seed future conversations with: mode-shaped behavioral session
   * state, and uncategorized/custom-category options; see
   * shouldPersistConfigSelection). The in-memory recording always happens.
   */
  recordUserConfigSelection(
    agentServer: string,
    configId: string,
    value: string | boolean,
    options: { persist?: boolean } = {},
  ): void {
    agentServer = normalizeAgentServerName(agentServer);
    const selections = this.userConfigSelections.get(agentServer) ?? new Map();
    selections.set(configId, value);
    this.userConfigSelections.set(agentServer, selections);
    if (options.persist === false) return;
    this.#persistLastUsedConfigOption(agentServer, configId, String(value));
  }

  // Every write to the agent-servers store (a last-used config option, a
  // remembered default agent) round-trips list → merge own change → set over
  // the WHOLE map, so two in-flight persists would each read a state missing
  // the other's change and the later set would drop the earlier one on disk.
  // All such persists therefore serialize through this one queue; in-memory
  // optimistic updates stay immediate, outside the queue.
  #agentServersPersistQueue: Promise<unknown> = Promise.resolve();

  #enqueueAgentServersPersist<T>(job: () => Promise<T>): Promise<T> {
    const result = this.#agentServersPersistQueue.catch(() => {}).then(job);
    this.#agentServersPersistQueue = result;
    return result;
  }

  #persistLastUsedConfigOption(agentServer: string, configId: string, value: string): void {
    void this.#enqueueAgentServersPersist(async () => {
      // Checked at run time (not enqueue time) so a queued duplicate of a
      // value an earlier write just landed is skipped too.
      if (this.defaultConfigOptionsFor(agentServer)[configId] === value) return;
      // Pinned keys are deliberate defaults: the last-used auto-follow skips
      // them. Read from the store's fresh state at dequeue (not the mirror at
      // enqueue) so a pin that landed while this write sat queued still wins.
      if (await this.#isPinnedInStore(agentServer, configId)) return;
      const previousDefaults = this.defaultConfigOptionsByAgentServer;
      this.defaultConfigOptionsByAgentServer = {
        ...previousDefaults,
        [agentServer]: {
          ...this.defaultConfigOptionsFor(agentServer),
          [configId]: value,
        },
      };
      // Failures log and move on — persistence must never break the
      // selection itself.
      await this.#persistDefaultConfigOption(agentServer, configId, value, previousDefaults).catch(
        (error: unknown) => {
          console.error("Failed to persist last-used ACP config option", error);
        },
      );
    });
  }

  // Whether the store's freshest state marks `configId` pinned for this
  // agent. An unreadable store proves no pin; the persist that follows
  // surfaces its own failure.
  async #isPinnedInStore(agentServer: string, configId: string): Promise<boolean> {
    try {
      const state = await poolsideAcpNavListAgentServers({});
      const resolved = resolveAgentServers((state.agentServers ?? {}) as ACPAgentServers);
      return resolved[agentServer]?.pinned_config_options?.includes(configId) ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Persist a full agent-server map edit (the settings panel adding,
   * removing, or reconfiguring agents) through the same serialized queue as
   * the default writers above. A plain whole-map set from a component
   * snapshot could land in the middle of a default-persist's list → set round
   * trip — or carry a snapshot taken before one committed — and silently drop
   * a freshly written `default_config_options` key from disk. The panel edits
   * server entries themselves and never touches `default_config_options` or
   * `pinned_config_options`, so inside the queue both fields are re-read from
   * the store's freshest state for every entry that survives the edit;
   * entries the panel added or removed keep the panel's shape.
   *
   * The set runs through the caller-supplied transport (the host RPC's
   * setACPAgentServers) rather than the helperapi call the default writers
   * use. Both land on the helper's same `poolside/acpNav/setAgentServers`
   * store method — which is why one queue serializes them — but the host RPC
   * also performs host-side effects the panel save must keep: the desktop
   * host re-caches its initial webview state and both the desktop and VS Code
   * hosts re-notify the helper's runtime configuration.
   *
   * Returns the map that was written, so the caller can mirror it into app
   * state instead of its stale snapshot.
   */
  async saveAgentServers(
    agentServers: ACPAgentServers,
    set: (agentServers: ACPAgentServers) => Promise<void>,
  ): Promise<ACPAgentServers> {
    return this.#enqueueAgentServersPersist(async () => {
      const state = await poolsideAcpNavListAgentServers({});
      const current = (state.agentServers ?? {}) as ACPAgentServers;
      const next: ACPAgentServers = Object.fromEntries(
        Object.entries(agentServers).map(([name, config]) => {
          const fresh = current[name];
          // An entry the panel just added has no stored counterpart; keep it.
          if (!fresh) return [name, config];
          // The store's defaults and pins win wholesale — including their
          // absence, in case a concurrent writer removed them.
          const {
            default_config_options: _stale,
            pinned_config_options: _stalePinned,
            ...panelConfig
          } = config;
          const merged: ACPAgentServers[string] = { ...panelConfig };
          if (fresh.default_config_options) {
            merged.default_config_options = fresh.default_config_options;
          }
          if (fresh.pinned_config_options) {
            merged.pinned_config_options = fresh.pinned_config_options;
          }
          return [name, merged];
        }),
      );
      await set(next);
      this.syncDefaultConfigOptions(next);
      return next;
    });
  }

  recordUserModeSelection(agentServer: string, modeId: string): void {
    this.userModeSelections.set(normalizeAgentServerName(agentServer), modeId);
  }

  userConfigSelectionsFor(agentServer: string): Map<string, string | boolean> {
    return this.userConfigSelections.get(normalizeAgentServerName(agentServer)) ?? new Map();
  }

  userModeSelectionFor(agentServer: string): string | null {
    return this.userModeSelections.get(normalizeAgentServerName(agentServer)) ?? null;
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
    options: { fresh?: boolean; quiet?: boolean } = {},
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const quiet = options.quiet === true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Reuse an in-flight refresh only when it will report failures at least
    // as loudly as this caller needs. A loud caller (opening a conversation,
    // confirming a login) riding on a background probe would otherwise have
    // its error swallowed, so it chains its own refresh behind instead.
    const canReuse =
      existing && !options.fresh && (quiet || !this.configRefreshQuiet.get(existing));
    if (canReuse) return existing;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      .then(() => this.refreshCachedConfigCore(agentServer, cwd || "/", quiet))
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.configRefreshQuiet.delete(refresh);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.configRefreshQuiet.set(refresh, quiet);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // A quiet refresh is a background freshness probe (window focus): its
  // failures must not paint error banners on conversations the user never
  // touched — e.g. a wake-from-sleep focus hitting a stale agent connection.
  // Callers that need failures surfaced never reuse a quiet refresh (see
  // refreshCachedConfig), so quietness is fixed for the life of one probe.
  // Success always clears a stale banner, quiet or not.
  private async refreshCachedConfigCore(
    agentServer: string,
    cwd: string,
    quiet = false,
  ): Promise<void> {
    const conn = await this.connectServer(agentServer, { surfaceErrors: !quiet });
    if (!conn) {
      this.#markAgentConfigFailed(agentServer);
      return;
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
      const previousProbeSessionId = this.configProbeSessionIds.get(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (previousProbeSessionId && previousProbeSessionId !== res.sessionId) {
        this.#closeSupersededProbe(agentServer, previousProbeSessionId);
      }
      const cached = this.configCacheByAgentServer[agentServer];
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const configOptions = preserveCachedSelections(
        preserveLocalInferenceModelConfigOptionForAgent(
          agentServer,
          res.configOptions ?? [],
          cached?.configOptions ?? [],
        ),
        this.userConfigSelectionsFor(agentServer),
      );
      this.markAgentConfigFresh(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
        configOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
        modes: preserveCachedModeSelection(
          res.modes ?? null,
          this.userModeSelectionFor(agentServer),
        ),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        authoritativeDefinitions: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // The agent answered, so any banner from an earlier failure is stale.
      this.clearNonSessionError(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.#markAgentConfigFailed(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (!isAuthRequiredError(err)) {
        if (!quiet) this.setNonSessionError(agentServer, err);
        return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // Auth-required detection is matched on message shape, so a transient
      // upstream 401 can look like a logout. Acting on that in the background
      // would replace the composer with a login panel on a conversation the
      // user never touched — and stick, since the focus refresher skips
      // auth-required agents. Leave it to the paths the user drove.
      if (quiet) return;
      this.markAuthRequired(agentServer);
      this.clearNonSessionError(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Close a probe the client has stopped using, after a drain window for
  // in-flight RPCs still bound to its id (MCP settings resolves its session
  // from the probe map, including an authenticate that spans a browser OAuth
  // round-trip). Closing twice, or closing an evicted session, no-ops
  // helper-side. Any ids whose timer was eaten by a webview teardown are
  // flushed on the next rotation.
  #closeSupersededProbe(agentServer: string, sessionId: SessionId): void {
    const pending = this.pendingProbeCloses.get(agentServer) ?? new Set<SessionId>();
    for (const stranded of pending) {
      if (stranded === sessionId) continue;
      pending.delete(stranded);
      void this.#closeProbeSession(agentServer, stranded);
    }
    pending.add(sessionId);
    this.pendingProbeCloses.set(agentServer, pending);
    setTimeout(() => {
      if (!this.pendingProbeCloses.get(agentServer)?.delete(sessionId)) return;
      void this.#closeProbeSession(agentServer, sessionId);
    }, SUPERSEDED_PROBE_CLOSE_DELAY_MS);
  }

  #closeProbeSession(agentServer: string, sessionId: SessionId): Promise<void> {
    return poolsideAcpSessionClose({ agentServer, sessionId })
      .then(() => {})
      .catch((e: unknown) => console.debug("Failed to close ACP config probe", e));
  }

  /**
   * Merge agent-reported option definitions over a cache entry a concurrent
   * writer produced from older ones, keeping that writer's selections. Writes
   * through to the store so a restart can't resurrect the stale definitions.
   */
  #reassertDefinitions(
    agentServer: string,
    snapshot: ACPConfigCacheSnapshot,
    current: ACPConfigCacheEntry,
  ): ACPConfigCacheEntry {
    const configOptions = mergeConfigSelections(
      snapshot.configOptions,
      currentConfigSelections(current.configOptions),
    );
    const merged: ACPConfigCacheEntry = {
      agentServer,
      configOptions,
      availableCommands:
        current.availableCommands.length > 0
          ? current.availableCommands
          : snapshot.availableCommands,
      modes: syncModeFromConfigOptions(current.modes ?? snapshot.modes, configOptions),
      promptCapabilities: snapshot.promptCapabilities,
      agentInfo: snapshot.agentInfo,
      cachedAt: new Date().toISOString(),
    };
    this.configCacheByAgentServer = {
      ...this.configCacheByAgentServer,
      [agentServer]: merged,
    };
    void poolsideAcpNavUpsertConfigCache({
      agentServer,
      configOptions: merged.configOptions,
      availableCommands: merged.availableCommands,
      modes: merged.modes,
      promptCapabilities: merged.promptCapabilities,
      agentInfo: merged.agentInfo,
    }).catch((error: unknown) => console.error("Failed to persist ACP config cache", error));
    return merged;
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
      // The option *definitions* came straight from the agent, so they win
      // over a concurrent write that republished older ones. Only the paths
      // that just read them off the wire may set this.
      authoritativeDefinitions?: boolean;
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
      // A concurrent writer (e.g. a draft picker selection landing while this
      // persist round-tripped) replaced our optimistic entry.
      const current = this.configCacheByAgentServer[agentServer];
      if (current !== fallback) {
        // Keep the newer state instead of clobbering it with this call's
        // echo; the concurrent writer persists its own snapshot.
        if (!value.authoritativeDefinitions || !current) return current ?? fallback;
        // Except when we hold agent-reported definitions: a draft's picker
        // write republishes whatever definitions that draft held, which may
        // predate the ones we just read off the wire. Dropping ours would
        // hide a newly released option until the next probe — and freshness
        // is already recorded, so that could be the whole TTL.
        return this.#reassertDefinitions(agentServer, snapshot, current);
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
        next.configOptions = preserveCachedSelections(
          preserveLocalInferenceModelConfigOptionForAgent(
            agentServer,
            params.update.configOptions,
            cached.configOptions,
          ),
          this.userConfigSelectionsFor(agentServer),
        );
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // Only a config report defers the next probe. Commands and mode
        // pushes say nothing about the option set, and an agent that emits
        // them periodically on the idle probe would hold the TTL open
        // forever, so the options would never refresh again.
        this.markAgentConfigFresh(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          // This describes the throwaway probe session, so it must not
          // override a mode the user chose — that value seeds the next new
          // conversation.
          const modeId = this.userModeSelectionFor(agentServer) ?? params.update.currentModeId;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            next.configOptions = updateConfigOptionValue(next.configOptions, modeConfig.id, modeId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            ? updateSessionModeValue(next.modes, modeId)
            : { currentModeId: modeId, availableModes: [] };
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
      // Only a config_option_update carries definitions from the agent; the
      // other kinds just republish what was already cached.
      authoritativeDefinitions: params.update.sessionUpdate === "config_option_update",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Re-apply the user's explicit choices onto a fresh agent config report where
// they are still valid. Only recorded user selections are re-applied: the
// cache's other currentValues are just the agent's last-reported defaults, so
// preserving those too would pin the first-seen default forever and stop an
// agent-side default change from ever reaching the picker.
// mergeConfigSelections drops selections whose option or value vanished from
// the fresh definitions.
function preserveCachedSelections(
  fresh: SessionConfigOption[],
  userSelections: Map<string, string | boolean>,
): SessionConfigOption[] {
  if (userSelections.size === 0) return fresh;
  return mergeConfigSelections(fresh, userSelections);
}

// Same as preserveCachedSelections for legacy mode state: keep the user's
// chosen mode when the fresh report still offers it.
function preserveCachedModeSelection(
  fresh: SessionModeState | null,
  userModeId: string | null,
): SessionModeState | null {
  if (!fresh || !userModeId || fresh.currentModeId === userModeId) return fresh;
  if (!fresh.availableModes.some((mode) => mode.id === userModeId)) return fresh;
  return { ...fresh, currentModeId: userModeId };
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
function snapshotConfigCacheValue(value: ACPConfigCacheSnapshot): ACPConfigCacheSnapshot {
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
