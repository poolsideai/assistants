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
  poolsideAcpApprovalsList,
  poolsideAcpApprovalsRespond,
  poolsideAcpNavGetConversationHistory,
  poolsideAcpSessionClose,
  type ACPApproval,
} from "@poolsideai/helperapi";
import type {
  ACPCompactionNotification,
  ACPTurnEndedNotification,
  LocalInferenceState,
} from "@poolsideai/helperapi/schemas";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { createContext, untrack } from "svelte";
import { SvelteMap } from "svelte/reactivity";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { CLAUDE_AGENT_SERVER, type ACPPromptSuggestion } from "../claudePromptSuggestions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { ACPClaudeGoalUpdate } from "../goals";
import {
  currentModelConfigValue,
  mergeLocalInferenceModelConfigOptions,
} from "../localInferenceModelOptions";
import { newConversationID, type ACPClosedSession } from "../navTypes";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ACPPendingPermissionRequest,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { handoffContextContent } from "./session/handoffContext";
import { materializeConversationHistory } from "./session/handoffHistory";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Coalescing window for connector-set refreshes: long enough that the local
// repository listener and the helper's didChange broadcast for the same
// mutation share one sweep, short enough to feel immediate.
const MCP_SERVERS_REFRESH_COALESCE_MS = 300;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  private static readonly INACTIVE_SESSION_CACHE_LIMIT = 3;
  // Sessions idle this long have their agent-side resources closed (the
  // per-session subprocess) while the warm record stays in memory; the next
  // interaction reattaches via session/resume. Kills the idle-agent energy
  // drain without giving up the warm-transcript UX.
  private static readonly IDLE_SESSION_CLOSE_MS = 10 * 60 * 1000;
  private static readonly IDLE_SESSION_SWEEP_INTERVAL_MS = 60 * 1000;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // The conversation id is the stable route; replacing its value is how a
  // handoff changes the active agent-side session. SvelteMap makes that route
  // change reactive without invalidating readers for nested transcript updates.
  private liveSessions = new SvelteMap<string, ACPSession>();
  private sessionRecency = new Map<string, number>();
  private nextSessionRecency = 0;
  // Wall-clock timestamp of when each session was last seen active (protected
  // from eviction). Drives the idle close; entries follow liveSessions.
  private sessionIdleSince = new Map<string, number>();
  private idleSweepTimer: ReturnType<typeof setInterval> | null = null;
  // Conversations some surface is currently displaying, reference-counted so
  // overlapping panes compose. Once any claim has ever been registered,
  // sessions for unclaimed conversations flush their transcripts on the slow
  // hidden cadence (ACPSession.setTranscriptVisible). Hosts that never claim
  // (tests, headless embeddings) keep every session on the visible cadence.
  //
  // The latch is deliberately one-way: after the first claim, releasing every
  // claim means "no conversation is on screen" (e.g. the chat tab is hidden),
  // so the slow cadence for all sessions is the desired steady state. A host
  // that displays transcripts through a surface that does not claim must not
  // mount a claiming surface (like ChatPane) at any point, or its unclaimed
  // sessions will drop to the hidden cadence permanently.
  private visibleConversationClaims = new Map<string, number>();
  private transcriptVisibilityDriven = false;
  // Permission requests for sessions with no live record on this surface
  // (broadcast prompts for conversations that are not open here). They render
  // through pendingApprovals and merge into a session's chat scope once that
  // conversation is opened.
  private unboundPermissionRequests = $state.raw<ACPPendingPermissionRequest[]>([]);
  // Every pending permission request on this surface (unbound + per-session),
  // refreshed on each publish. A snapshot rather than a $derived because the
  // request arrays mutate on their sessions without replacing map entries.
  private pendingApprovalsSnapshot = $state.raw<ACPPendingPermissionRequest[]>([]);
  // Incremented whenever an authoritative helper snapshot arrives. Failed
  // optimistic responses only restore their local card if no newer snapshot
  // has already decided its state.
  private approvalsRevision = 0;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  private readonly identifiesClaudeAgent: (agentServer: string) => boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isClaudeAgent: (agentServer) => this.identifiesClaudeAgent(agentServer),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    identifiesClaudeAgent: (agentServer: string) => boolean = (agentServer) =>
      normalizeAgentServerName(agentServer) === CLAUDE_AGENT_SERVER,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.identifiesClaudeAgent = identifiesClaudeAgent;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      getUnbound: () => this.unboundPermissionRequests,
      setUnbound: (requests) => {
        this.unboundPermissionRequests = requests;
      },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    options: { preserveSelections?: boolean } = {},
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (options.preserveSelections) {
        session.applyCachedConfigPreservingSelections();
      } else {
        session.applyCachedConfig();
      }
    }
  }

  /**
   * TTL-gated config re-probe for every agent currently backing a sessionless
   * draft, so an open new-conversation page tracks agent-side option changes
   * (e.g. a newly released model) instead of trusting the cache until the
   * next prompt. Called on window focus; ensureConfigProbe no-ops while the
   * agent's last config report is fresh, so focus bursts are cheap. Agents in
   * auth-required state are skipped — the login flow already re-probes on
   * confirmation.
   */
  refreshStaleConfigForLocalSessions(preferredConversationId?: string | null): void {
    // An agent mid-turn is off limits: the helper runs a readiness preflight
    // on every session/new and restarts the shared agent process when the
    // provider reports not-ready (the local agent does this when its runtime
    // is down), which would kill the running turn in another conversation.
    const busyAgentServers = new Set<string>();
    for (const session of this.liveSessions.values()) {
      if (session.isSending || session.isPrompting) {
        busyAgentServers.add(session.agentServer);
      }
    }

    const cwdByAgentServer = new Map<string, string>();
    // Prefer the conversation the user is actually looking at: probe cwd
    // varies by caller and the agent may scope config to it, so an
    // abandoned draft shouldn't decide what the visible page sees.
    const ordered = [...this.liveSessions.values()].sort(
      (a, b) =>
        Number(b.conversationId === preferredConversationId) -
        Number(a.conversationId === preferredConversationId),
    );
    for (const session of ordered) {
      if (session.sessionId !== null) continue;
      const agentServer = session.agentServer;
      if (cwdByAgentServer.has(agentServer)) continue;
      if (this.agents.authRequiredForAgent(agentServer)) continue;
      if (busyAgentServers.has(agentServer)) continue;
      cwdByAgentServer.set(agentServer, session.cwd);
    }
    for (const [agentServer, cwd] of cwdByAgentServer) {
      const before = this.agents.cachedConfigFor(agentServer);
      void this.agents.ensureConfigProbe(agentServer, cwd, { quiet: true }).then(() => {
        // Untouched cache means the probe was fresh (or failed): skip the
        // re-apply so a plain focus can never rewrite draft state. When it
        // did refresh, preserve each draft's own selections — re-applying
        // defaults would revert explicit picks on every rotation.
        if (this.agents.cachedConfigFor(agentServer) === before) return;
        this.applyCachedConfigToLocalSessionsForAgent(agentServer, undefined, {
          preserveSelections: true,
        });
      });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   *
   * The merge is a local-only mutation of session.configOptions, so if it
   * changes the model's currentValue (e.g. the previously selected model was
   * deleted, or the first downloaded model just became the selection), the
   * agent is told about the new value via setConfigOption. Otherwise the
   * picker would show a model the agent never actually switched to.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const previousValue = currentModelConfigValue(session.configOptions);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const nextValue = currentModelConfigValue(session.configOptions);
      if (nextValue !== null && nextValue !== previousValue) {
        const conversationId = session.conversationId;
        // Machine state changed the effective model (the selection was
        // deleted, or the first download became selectable) — not a user
        // pick. recordSelection: false keeps the wire call and local apply
        // while recording nothing as user-touched and persisting no
        // last-used default.
        void session
          .setConfigOption("model", nextValue, { recordSelection: false })
          .catch((error: unknown) => {
            console.error(
              `Failed to sync local inference model selection to agent for conversation ${conversationId}`,
              error,
            );
          });
      }
    }
  }

  /**
   * Live sessions for an agent that are mid-turn on any connected surface,
   * e.g. to warn before unloading the local model out from under an active
   * response.
   */
  promptingSessionsForAgent(agentServer: string): ACPSession[] {
    agentServer = normalizeAgentServerName(agentServer);
    const sessions: ACPSession[] = [];
    for (const session of this.liveSessions.values()) {
      if (session.agentServer !== agentServer) continue;
      const remotelyWorking =
        session.sessionId !== null &&
        this.conversationStatus.getConversationStatus(session.sessionId, agentServer).working;
      if (session.isPromptActive || session.isSending || remotelyWorking) sessions.push(session);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return sessions;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /** Includes conversations on other surfaces, even if never opened in this window. */
  hasActiveConversationsForAgent(agentServer: string): boolean {
    agentServer = normalizeAgentServerName(agentServer);
    if (this.conversationStatus.hasWorkingConversationForAgent(agentServer)) return true;
    for (const session of this.liveSessions.values()) {
      if (session.agentServer !== agentServer) continue;
      if (
        session.isPromptActive ||
        session.isSending ||
        session.compacting ||
        session.prompting.hasQueuedSendPending
      )
        return true;
    }
    return false;
  }

  /** Whether any conversation is doing work that must finish before an app restart. */
  get hasActiveConversations(): boolean {
    if (this.conversationStatus.hasWorkingConversation) return true;
    for (const session of this.liveSessions.values()) {
      if (
        session.isPromptActive ||
        session.isSending ||
        session.compacting ||
        session.prompting.hasQueuedSendPending
      )
        return true;
      if (session.sessionId === null) continue;
    }
    return false;
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
        this.sessionRecency.delete(key);
        this.sessionIdleSince.delete(key);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.touchSession(record.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.sessionRecency.delete(key);
      this.sessionIdleSince.delete(key);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * Claim that a surface is displaying this conversation, keeping its session
   * on the responsive visible flush cadence; every unclaimed session drops to the slow
   * hidden cadence. Returns a release function (idempotent) for the caller's
   * effect cleanup.
   */
  claimVisibleConversation(conversationId: string): () => void {
    this.transcriptVisibilityDriven = true;
    this.ensureIdleSweepTimer();
    this.touchSession(conversationId);
    this.visibleConversationClaims.set(
      conversationId,
      (this.visibleConversationClaims.get(conversationId) ?? 0) + 1,
    );
    this.applyTranscriptVisibility();
    // Reattach a suspended session eagerly while the user is looking at it,
    // so the resume latency is paid before their next prompt rather than on it.
    const claimed = this.liveSessions.get(conversationId);
    if (claimed?.suspended) {
      void claimed.reattachIfSuspended();
    }
    if (this.evictInactiveSessions()) {
      this.publishLiveStatuses();
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const count = this.visibleConversationClaims.get(conversationId) ?? 0;
      if (count <= 1) {
        this.visibleConversationClaims.delete(conversationId);
      } else {
        this.visibleConversationClaims.set(conversationId, count - 1);
      }
      this.touchSession(conversationId);
      this.applyTranscriptVisibility();
      if (this.evictInactiveSessions()) {
        this.publishLiveStatuses();
      }
    };
  }

  private transcriptVisibleFor(conversationId: string): boolean {
    return !this.transcriptVisibilityDriven || this.visibleConversationClaims.has(conversationId);
  }

  private applyTranscriptVisibility(): void {
    for (const session of this.liveSessions.values()) {
      session.setTranscriptVisible(this.transcriptVisibleFor(session.conversationId));
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Fold any held (unbound) requests into their now-live session first, so a
    // single source — the session's own pendingPermissionRequests — drives the
    // inline card, the waiting indicator, and cancellation for it.
    this.bindUnboundRequests();
    this.evictInactiveSessions();
    // Runs on every session update of every session, so keep the snapshot's
    // identity stable when nothing changed — reassigning $state.raw here would
    // re-derive every approvals reader once per streaming chunk.
    const nextApprovals = [
      ...this.unboundPermissionRequests,
      ...Array.from(this.liveSessions.values()).flatMap(
        (record) => record.pendingPermissionRequests,
      ),
    ];
    if (!shallowArrayEquals(this.pendingApprovalsSnapshot, nextApprovals)) {
      this.pendingApprovalsSnapshot = nextApprovals;
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        working: record.isPromptActive || record.isSending,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * Fold any held (unbound) permission requests into a now-live session so a
   * single source — the session's own pendingPermissionRequests — drives its
   * inline card, waiting indicator, and cancellation. Requests whose
   * conversation is still not open here stay unbound. Runs on every publish;
   * unbound is almost always empty, so the scan is cheap.
   */
  private bindUnboundRequests(): void {
    if (this.unboundPermissionRequests.length === 0) return;
    let remaining = this.unboundPermissionRequests;
    for (const record of this.liveSessions.values()) {
      if (record.sessionId === null) continue;
      const mine = remaining.filter(
        (request) =>
          request.sessionId === record.sessionId &&
          normalizeAgentServerName(request.agentServer) === record.agentServer,
      );
      if (mine.length === 0) continue;
      record.pendingPermissionRequests = [...record.pendingPermissionRequests, ...mine];
      remaining = remaining.filter((request) => !mine.includes(request));
    }
    if (remaining !== this.unboundPermissionRequests) {
      this.unboundPermissionRequests = remaining;
    }
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
    options: { isChat?: boolean; isPendingConversationPersisted?: boolean } = {},
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.touchSession(existing.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          isChat: options.isChat === true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      existing.invalidateGeneration();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (options.isChat !== undefined) {
        existing.isChat = options.isChat;
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.touchSession(session.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const applyToPendingTarget = () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // Preserving selections makes this a no-op for an untouched draft
        // (its values came from the cache moments ago) while keeping any
        // pick the user managed to make before the background load/probe
        // settled.
        target.applyCachedConfigPreservingSelections();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
    void this.agents
      .loadOrInitCachedConfig(agentServer, session.cwd)
      .then(applyToPendingTarget)
      .then(() =>
        // A persisted cache makes the load above a no-op, but auth-required
        // state is runtime-only: agents report it by failing a (probe)
        // session/new. Ensure a recent probe (TTL-gated) so the login banner
        // appears when the user switches here, not after their first message
        // fails — and so the cached options shown on this page track the
        // agent (e.g. a newly released model) instead of freezing at the
        // first probe of the app run.
        this.agents.ensureConfigProbe(agentServer, session.cwd),
      )
      // The probe may have refreshed the cache; mirror it into the still-
      // pending session so the visible options aren't stale until recreation.
      .then(applyToPendingTarget);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * Stage an idle Poolside conversation for another ACP agent. ACP session ids
   * remain agent-local; the Poolside conversation id is the stable identity
   * shared by both legs.
   *
   * Confirmation only freezes the source transcript and routes a local target
   * draft so the agent and handoff boundary update immediately. The target ACP
   * session is created later, when the user sends their next prompt; that real
   * prompt carries the frozen handoff context and commits the durable leg.
   */
  async handoffSession(conversationId: string, targetAgentServer: string): Promise<ACPSession> {
    const routedSession = this.liveSessions.get(conversationId);
    const stagedHandoff = routedSession?.pendingHandoff ?? null;
    const source = stagedHandoff?.sourceSession ?? routedSession;
    if (!routedSession || !source || source.sessionId === null) {
      throw new Error("Only an active ACP session can be handed off");
    }

    targetAgentServer = normalizeAgentServerName(targetAgentServer);
    if (!this.agents.agentServerNames.includes(targetAgentServer)) {
      throw new Error(`ACP agent server \"${targetAgentServer}\" is not configured`);
    }
    if (stagedHandoff && (routedSession.isPromptActive || routedSession.isSending)) {
      throw new Error("Wait for the current handoff attempt to finish first");
    }
    if (targetAgentServer === source.agentServer) {
      if (!stagedHandoff) {
        throw new Error("The conversation is already using that ACP agent");
      }
      if (this.liveSessions.get(conversationId) !== routedSession) {
        throw new Error("The active conversation changed while cancelling the handoff");
      }

      // No target session exists yet, so choosing the source agent simply
      // cancels the staged route and exposes the original live leg again.
      routedSession.cancelTranscriptFlush();
      routedSession.invalidateGeneration();
      routedSession.queue.reset();
      this.liveSessions.set(conversationId, source);
      source.setTranscriptVisible(this.transcriptVisibleFor(conversationId));
      this.touchSession(conversationId);
      this.publishLiveStatuses();
      return source;
    }
    this.assertSessionCanHandoff(source);

    const sourceSessionId = source.sessionId;
    const sourceAgentServer = source.agentServer;
    const cwd = source.sessionInfo?.cwd ?? source.cwd ?? "/";
    source.handoffTargetAgentServer = targetAgentServer;

    try {
      await this.agents.loadOrInitCachedConfig(targetAgentServer, cwd);
      if (this.liveSessions.get(conversationId) !== routedSession) {
        throw new Error("The active conversation changed while preparing the handoff");
      }
      this.assertSessionCanHandoff(source, targetAgentServer);

      const createdAt = new Date().toISOString();
      const nextHandoffId = `handoff:${crypto.randomUUID()}`;
      const frozenLocalEvents = [...source.materializer.events];
      // Cancelled turns that never materialized an event have
      // endIndex < startIndex; they carry no replayable range, and a persisted
      // one would poison the leg for stricter readers.
      const frozenLocalTurns = source.materializer.turns.filter(
        (turn) => turn.endIndex >= turn.startIndex,
      );
      const frozenLocalPlan = source.materializer.plan;
      const frozenVisibleEvents = [...source.events];
      const frozenVisibleTurns = [...source.turns];
      const frozenVisiblePlan = source.plan;

      const targetSession = new ACPSession({
        env: this.sessionEnv,
        sessionId: null,
        agentServer: targetAgentServer,
        cwd,
        conversationId,
        isChat: source.isChat,
        // This stable conversation already exists in navigation storage under
        // the source binding. Draft persistence must not rewrite it as a
        // sessionless target before the handoff transaction commits.
        isPendingConversationPersisted: true,
      });
      targetSession.applyCachedConfig();
      targetSession.setTranscriptVisible(this.transcriptVisibleFor(conversationId));
      targetSession.seedHandoffHistory(frozenVisibleEvents, frozenVisibleTurns, frozenVisiblePlan, {
        eventKind: "handoff",
        sourceAgentServer,
        sourceSessionId,
        targetAgentServer,
        createdAt,
      });

      const handoffContent = handoffContextContent(
        {
          agentServer: sourceAgentServer,
          sessionId: sourceSessionId,
          cwd,
          title: source.sessionInfo?.title,
          events: frozenVisibleEvents,
          plan: frozenVisiblePlan,
          metadata: source.metadata,
        },
        targetAgentServer,
        this.agents.promptCapabilitiesFor(targetAgentServer)?.embeddedContext === true,
      );

      targetSession.pendingHandoff = {
        handoffId: nextHandoffId,
        sourceAgentServer,
        sourceSessionId,
        targetAgentServer,
        context: handoffContent,
        initialTitle: source.sessionInfo?.title ?? undefined,
        sourceSession: source,
        prepareParams: {
          handoffId: nextHandoffId,
          conversationId,
          sourceAgentServer,
          sourceSessionId,
          targetAgentServer,
          events: frozenLocalEvents,
          turns: frozenLocalTurns,
          plan: frozenLocalPlan,
          createdAt,
        },
      };

      this.liveSessions.set(conversationId, targetSession);
      this.touchSession(conversationId);

      // The routed session remains agent-owned, but it is no longer this
      // conversation's live leg on this client. On a redirect this invalidates
      // the broken staged target while retaining the original source above.
      routedSession.cancelTranscriptFlush();
      routedSession.invalidateGeneration();
      routedSession.queue.reset();
      this.publishLiveStatuses();
      return targetSession;
    } finally {
      source.handoffTargetAgentServer = null;
    }
  }

  private assertSessionCanHandoff(
    session: ACPSession,
    activeHandoffTargetAgentServer?: string,
  ): void {
    const live =
      session.sessionId === null
        ? null
        : this.conversationStatus.getConversationStatus(session.sessionId, session.agentServer);
    if (
      session.isPromptActive ||
      session.isSending ||
      (session.handoffTargetAgentServer !== null &&
        session.handoffTargetAgentServer !== activeHandoffTargetAgentServer) ||
      session.queuedPrompts.length > 0 ||
      session.pendingPermissionRequests.length > 0 ||
      live?.working ||
      live?.waitingForUser
    ) {
      throw new Error("Wait for the current turn and any approval request to finish first");
    }
    if (session.sessionInfo?.readOnly) {
      throw new Error("A read-only conversation cannot be handed off");
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isChat: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      isChat: opts.isChat,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    session.setTranscriptVisible(this.transcriptVisibleFor(session.conversationId));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.touchSession(session.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      session.invalidateGeneration();
__POOL_SYNTHETIC_IMPORT_BASELINE__
      session.materializer.cancelOpenToolCalls(new Date());
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // Mark the sessions that actually lost agent-side state. A conversation
        // started after this exit gets a session on the fresh process and must
        // not be dragged through session/load: for agents that materialize a
        // transcript only once a turn starts, that load fails and takes the
        // user's first prompt down with it.
        session.restoreRequired = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      session.steeringRequestsInFlight = 0;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      session.setGoal(null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    options: {
      fallbackCwds?: string[];
      isChat?: boolean;
      readOnlyInspection?: boolean;
    } = {},
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // Archived previews deliberately seed a read-only session. Restoring the
      // conversation reopens that same cached record from a writable nav
      // summary, so remove only the transient inspection flag. Do not clear
      // read-only state on ordinary cached sessions: the agent may have set it
      // authoritatively through session metadata.
      if (liveRecord.readOnlyInspection && !options.readOnlyInspection) {
        liveRecord.readOnlyInspection = false;
        if (liveRecord.sessionInfo) {
          liveRecord.sessionInfo = {
            ...liveRecord.sessionInfo,
            readOnly: seedInfo?.readOnly ?? false,
          };
        }
      }
      if (options.isChat !== undefined) {
        liveRecord.isChat = options.isChat;
      }
      this.touchSession(liveRecord.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      isChat: options.isChat === true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    session.readOnlyInspection = options.readOnlyInspection === true;
    session.setTranscriptVisible(this.transcriptVisibleFor(session.conversationId));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.touchSession(session.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await session.serialize(async (gen: number) => {
      await this.hydrateConversationHistory(session, gen);
      if (gen !== session.generation) return;
      await session.loadExisting(gen, cwd, mcpServers, seedInfo, options.fallbackCwds ?? []);
    });
    this.evictInactiveSessions();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.touchSession(session.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await session.serialize(async (gen: number) => {
      await this.hydrateConversationHistory(session, gen);
      if (gen !== session.generation) return;
      await session.loadExisting(gen, cwd, [], session.sessionInfo ?? undefined);
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  private async hydrateConversationHistory(session: ACPSession, gen: number): Promise<void> {
    try {
      const history = await poolsideAcpNavGetConversationHistory({
        conversationId: session.conversationId,
      });
      if (gen !== session.generation) return;
      const materialized = materializeConversationHistory(history);
      if (materialized.skippedLegs > 0) {
        console.warn(
          `Skipped ${materialized.skippedLegs} unsupported or corrupt ACP conversation history leg(s)`,
        );
      }
      session.seedHistoricalHistory(materialized.events, materialized.turns, materialized.plan, {
        persistMetadata: false,
      });
    } catch (error) {
      // Persisted cross-agent history enriches the active ACP leg. A helper
      // upgrade or corrupt legacy row must not make the agent's own session
      // impossible to open.
      console.warn("Unable to load ACP conversation history", error);
    }
  }

  /**
   * Re-inject the user's connector set into every live agent session after the
   * connector store changes. Triggers burst — a local mutation fires both the
   * in-webview repository listener and the helper's mcpServers/didChange
   * broadcast, and a multi-step flow (replace = delete + upsert) lands several
   * broadcasts — so calls arriving while a sweep is pending share one sweep.
   */
  refreshMCPServersForAllSessions(): Promise<void> {
    this.pendingMCPServersRefresh ??= new Promise<void>((resolve) => {
      setTimeout(() => {
        this.pendingMCPServersRefresh = null;
        // Skip suspended records: resuming them just to deliver the new
        // connector set would respawn their subprocess (which the next idle
        // sweep would close again), and a reattach passes an empty MCP list
        // for the helper to fill with the current set anyway.
        const sessions = [...this.liveSessions.values()].filter(
          (session) => session.sessionId !== null && !session.suspended,
        );
        void Promise.all(
          sessions.map((session) =>
            session.serialize(async (gen: number) => {
              // The record may have become suspended while this refresh waited
              // behind another serialized operation. Recheck at execution time
              // so a stale queued sweep cannot resurrect an idle subprocess.
              if (session.suspended) return;
              await session.refreshMCPServers(gen);
            }),
          ),
        ).then(() => resolve());
      }, MCP_SERVERS_REFRESH_COALESCE_MS);
    });
    return this.pendingMCPServersRefresh;
  }

  private pendingMCPServersRefresh: Promise<void> | null = null;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    session.setTranscriptVisible(this.transcriptVisibleFor(session.conversationId));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.touchSession(session.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  private touchSession(conversationId: string): void {
    if (!this.liveSessions.has(conversationId)) return;
    this.sessionRecency.set(conversationId, ++this.nextSessionRecency);
    // Any touch — including every incoming session update, so also turns
    // broadcast from other surfaces — resets the idle clock. The sweep's own
    // protected-session stamping only covers states it can see locally.
    this.sessionIdleSince.set(conversationId, Date.now());
  }

  private evictInactiveSessions(): boolean {
    // Hosts that do not claim visible conversations cannot distinguish active
    // from inactive sessions. Preserve their historical behavior rather than
    // evicting records that a headless consumer may still be displaying.
    if (!this.transcriptVisibilityDriven) return false;

    const inactive = Array.from(this.liveSessions.values())
      .filter((session) => !this.sessionIsProtectedFromEviction(session))
      .sort(
        (a, b) =>
          (this.sessionRecency.get(a.conversationId) ?? 0) -
          (this.sessionRecency.get(b.conversationId) ?? 0),
      );
    const evictionCount = inactive.length - ACPSessionRepositoryWriter.INACTIVE_SESSION_CACHE_LIMIT;
    if (evictionCount <= 0) return false;

    for (const session of inactive.slice(0, evictionCount)) {
      // The session is persisted agent history and has no live work. Removing
      // the repository's strong reference lets its transcript/materializer be
      // collected; selecting it again follows the normal loadSession path.
      session.cancelTranscriptFlush();
      session.invalidateGeneration();
      session.queue.reset();
      // Release the agent-side resources too: the record is gone, so nothing
      // here can reattach cheaply, and reopening goes through loadSession
      // anyway. Close even when the record is suspended — a reattach may be
      // in flight and about to recreate the agent side, and re-closing an
      // already-gone session is a helper-level no-op. The helper also no-ops
      // for agents that can't close or couldn't reopen.
      if (session.sessionId !== null) {
        void this.closeAgentSession(session.agentServer, session.sessionId);
      }
      this.liveSessions.delete(session.conversationId);
      this.sessionRecency.delete(session.conversationId);
      this.sessionIdleSince.delete(session.conversationId);
    }
    return true;
  }

  /**
   * Close the agent-side session of every warm record that has sat idle past
   * IDLE_SESSION_CLOSE_MS, keeping the record in memory marked `suspended` for
   * a cheap session/resume reattach. Only agents that advertise resume are
   * suspended — for others the subprocess stays until eviction, where reopen
   * uses the full loadSession path. Runs on a coarse timer; exposed for tests.
   */
  closeIdleSessions(now: number = Date.now()): void {
    if (!this.transcriptVisibilityDriven) return;
    for (const session of this.liveSessions.values()) {
      if (session.suspended) continue;
      if (this.sessionIsProtectedFromEviction(session)) {
        this.sessionIdleSince.set(session.conversationId, now);
        continue;
      }
      const sessionId = session.sessionId;
      if (sessionId === null) continue;
      const idleSince = this.sessionIdleSince.get(session.conversationId);
      if (idleSince === undefined) {
        this.sessionIdleSince.set(session.conversationId, now);
        continue;
      }
      if (now - idleSince < ACPSessionRepositoryWriter.IDLE_SESSION_CLOSE_MS) continue;
      const sessionCapabilities = this.agents.capabilitiesFor(
        session.agentServer,
      )?.sessionCapabilities;
      // Without close the helper would no-op and `suspended` would lie about
      // the subprocess; without resume the reattach would need a full reload.
      if (sessionCapabilities?.close == null || sessionCapabilities.resume == null) continue;
      session.suspended = true;
      const close = this.closeAgentSession(session.agentServer, sessionId).then((ok) => {
        // A failed close leaves the agent side live; keeping `suspended`
        // would exempt the session from every future sweep and strand the
        // subprocess. Revert so the next sweep retries.
        if (!ok && session.suspended) {
          session.suspended = false;
        }
      });
      // Expose the in-flight close so a reattach racing it (user opens the
      // conversation right as it suspends) waits instead of resuming a
      // session the late close would tear down.
      session.pendingClose = close;
      void close.finally(() => {
        if (session.pendingClose === close) {
          session.pendingClose = null;
        }
      });
    }
  }

  /**
   * Drop the warm record for a conversation whose agent-side session was
   * closed by another flow (archive, delete). Keeping it would hand out a
   * record whose next wire call hits the closed session; dropping it routes a
   * reopen through the normal load path, which recreates the agent side.
   */
  releaseClosedSession(closed: ACPClosedSession): void {
    const record =
      (closed.conversationId ? this.liveSessions.get(closed.conversationId) : undefined) ??
      (closed.sessionId
        ? this.sessionFor(closed.sessionId, normalizeAgentServerName(closed.agentServer))
        : null);
    if (!record) return;
    record.cancelTranscriptFlush();
    record.invalidateGeneration();
    record.queue.reset();
    this.liveSessions.delete(record.conversationId);
    this.sessionRecency.delete(record.conversationId);
    this.sessionIdleSince.delete(record.conversationId);
    this.publishLiveStatuses();
  }

  private ensureIdleSweepTimer(): void {
    if (this.idleSweepTimer !== null) return;
    this.idleSweepTimer = setInterval(
      () => this.closeIdleSessions(),
      ACPSessionRepositoryWriter.IDLE_SESSION_SWEEP_INTERVAL_MS,
    );
  }

  private closeAgentSession(agentServer: string, sessionId: SessionId): Promise<boolean> {
    return poolsideAcpSessionClose({ agentServer, sessionId }).then(
      () => true,
      (e: unknown) => {
        console.warn("acp: failed to close agent session", e);
        return false;
      },
    );
  }

  /**
   * Stop background work. The app-level repository lives for the webview's
   * lifetime, so production never calls this; tests and embedding hosts use
   * it to avoid leaking the idle-sweep interval.
   */
  dispose(): void {
    if (this.idleSweepTimer !== null) {
      clearInterval(this.idleSweepTimer);
      this.idleSweepTimer = null;
    }
  }

  private sessionIsProtectedFromEviction(session: ACPSession): boolean {
    if (session.sessionId === null) return true;
    if (this.visibleConversationClaims.has(session.conversationId)) return true;
    if (isLoading(session.loadState)) return true;
    if (session.isPromptActive || session.isSending || session.compacting) return true;
    // A resume/reload on the wire: suspending or closing now could let the
    // just-answered resume be torn down by the racing close.
    if (session.refreshInFlight) return true;
    // A turn driven from another surface (e.g. mobile remote) never sets the
    // local prompting flags; it reaches the status repository through the
    // helper-pushed liveStatus on conversation summaries (ingested via
    // syncRemoteStatuses) and, for approvals, the reconciled waitingForUser.
    // Dropping — and since evict/idle now close the agent session, killing —
    // that turn from here would cancel remote work. untrack:
    // publishLiveStatuses (a caller) also WRITES this status store; a tracked
    // read here would let an effect that publishes depend on state it mutates
    // and re-run itself.
    {
      const sessionId = session.sessionId;
      const status = untrack(() =>
        this.conversationStatus.getConversationStatus(sessionId, session.agentServer),
      );
      if (status.working || status.waitingForUser) return true;
    }
    if (session.queuedPrompts.length > 0 || session.pendingDraftSend || session.promptError)
      return true;
    if (session.setupStatus !== null) return true;
    if (session.pendingPermissionRequests.length > 0) return true;
    if (Object.keys(session.pendingConfigOptions).length > 0) return true;
    return (
      session.sessionId !== null &&
      this.elicitation?.hasPendingForSession(session.sessionId, session.agentServer) === true
    );
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
      // If so, apply to same-agent local sessions once the cache settles —
      // preserving each draft's own selections, since a probe's pushes
      // (e.g. an initial current_mode_update on session/new) describe the
      // throwaway session, not the user's draft state.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.applyCachedConfigToLocalSessionsForAgent(agentServer, undefined, {
          preserveSelections: true,
        });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    session.clearPromptSuggestion();
    this.touchSession(session.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (session) this.touchSession(session.conversationId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Store-backed approvals answer through the helper. Remove the card
    // optimistically so it feels instant (matching the elicitation path); the
    // helper is authoritative — the first valid answer wins there and the
    // shrunken set is pushed back via approvals/didChange. An invalid or failed
    // response restores the card unless a newer authoritative snapshot already
    // decided its state, so a transport failure cannot leave the agent blocked
    // with a hidden approval. already_resolved (another surface won) lands on
    // the same removal.
    const storeBacked = this.findStoreBackedRequest(requestId);
    if (storeBacked?.approval) {
      const approval = storeBacked.approval;
      const approvalsRevision = this.approvalsRevision;
      this.removeStoreBackedRequest(requestId);
      void poolsideAcpApprovalsRespond({
        ...approval,
        optionId: String(optionId),
        ...(overrideRules && overrideRules.length > 0 ? { overrideRules } : {}),
      })
        .then(({ outcome }) => {
          if (outcome === "invalid") {
            this.restoreStoreBackedRequest(storeBacked, approvalsRevision);
          }
        })
        .catch((error) => {
          console.error("acp: approvals respond failed", error);
          this.restoreStoreBackedRequest(storeBacked, approvalsRevision);
        });
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
  /**
   * Reconcile the helper-pushed pending approval set (the single source of
   * truth for permission prompts and elicitations) into per-session and
   * unbound request lists. Store-backed entries are fully replaced on every
   * push — re-delivery after a reconnect is idempotent, an approval answered
   * anywhere disappears everywhere, and duplicates are structurally
   * impossible. Legacy (SDK-delivered) and debug-dump requests are preserved.
   */
  reconcileApprovals(pending: ACPApproval[]): void {
    this.approvalsRevision++;
    const permissions = pending.filter((approval) => approval.kind === "permission");
    const desired = permissions.map((approval) => this.approvalToPendingRequest(approval));
    const desiredIds = new Set(desired.map((request) => request.id));

    // Reuse existing objects for unchanged ids so cards keep DOM state.
    const existingById = new Map<string, ACPPendingPermissionRequest>();
    for (const session of this.liveSessions.values()) {
      for (const request of session.pendingPermissionRequests) {
        if (request.approval) existingById.set(request.id, request);
      }
    }
    for (const request of this.unboundPermissionRequests) {
      if (request.approval) existingById.set(request.id, request);
    }

    const place = new Map<ACPSession | null, ACPPendingPermissionRequest[]>();
    for (const request of desired) {
      const resolved = existingById.get(request.id) ?? request;
      const session = this.sessionFor(request.sessionId, request.agentServer);
      const bucket = place.get(session) ?? [];
      bucket.push(resolved);
      place.set(session, bucket);
    }

    for (const session of this.liveSessions.values()) {
      const kept = session.pendingPermissionRequests.filter((request) => !request.approval);
      const mine = place.get(session) ?? [];
      const next = [...kept, ...mine];
      if (!sameRequestList(session.pendingPermissionRequests, next)) {
        session.pendingPermissionRequests = next;
      }
    }
    const keptUnbound = this.unboundPermissionRequests.filter((request) => !request.approval);
    this.unboundPermissionRequests = [...keptUnbound, ...(place.get(null) ?? [])];

    // Waiting notifications: fire for newly-arrived approvals, dismiss when a
    // session's store-backed approvals are all gone.
    for (const request of desired) {
      if (!existingById.has(request.id)) {
        this.conversationStatus.markWaitingForUser({
          type: "approval",
          sessionId: request.sessionId,
          agentServer: request.agentServer,
          toolCall: request.toolCall,
        });
      }
    }
    for (const [id, request] of existingById) {
      if (!desiredIds.has(id)) {
        this.conversationStatus.clearWaitingForUser(request.sessionId, request.agentServer);
      }
    }

    this.elicitation?.reconcileApprovals(
      pending.filter((approval) => approval.kind === "elicitation"),
    );
    this.publishLiveStatuses();
  }

  /**
   * Pull the current pending approval set from the helper and reconcile.
   * Called at boot and periodically as a reconnect safety net; steady-state
   * changes arrive via the approvals/didChange push.
   */
  async refreshApprovals(): Promise<void> {
    try {
      const { pending } = await poolsideAcpApprovalsList();
      this.reconcileApprovals(pending ?? []);
    } catch (error) {
      console.debug("acp: approvals list failed", error);
    }
  }

  private approvalToPendingRequest(approval: ACPApproval): ACPPendingPermissionRequest {
    const agentServer = normalizeAgentServerName(approval.agentServer);
    return {
      id: `approval:permission:${agentServer}:${approval.sessionId}:${approval.id}`,
      agentServer,
      sessionId: approval.sessionId as SessionId,
      toolCall: (approval.permission?.toolCall ?? {
        toolCallId: approval.id,
      }) as ACPPendingPermissionRequest["toolCall"],
      options: (approval.permission?.options ?? []) as ACPPendingPermissionRequest["options"],
      approval: {
        agentServer: approval.agentServer,
        sessionId: approval.sessionId,
        kind: "permission",
        id: approval.id,
      },
    };
  }

  private findStoreBackedRequest(requestId: string): ACPPendingPermissionRequest | undefined {
    for (const session of this.liveSessions.values()) {
      const request = session.pendingPermissionRequests.find(({ id }) => id === requestId);
      if (request) return request.approval ? request : undefined;
    }
    return this.unboundPermissionRequests.find(
      (request) => request.id === requestId && request.approval,
    );
  }

  private removeStoreBackedRequest(requestId: string): void {
    for (const session of this.liveSessions.values()) {
      if (session.pendingPermissionRequests.some(({ id }) => id === requestId)) {
        session.pendingPermissionRequests = session.pendingPermissionRequests.filter(
          ({ id }) => id !== requestId,
        );
      }
    }
    this.unboundPermissionRequests = this.unboundPermissionRequests.filter(
      ({ id }) => id !== requestId,
    );
    this.publishLiveStatuses();
  }

  private restoreStoreBackedRequest(
    request: ACPPendingPermissionRequest,
    approvalsRevision: number,
  ): void {
    if (
      this.approvalsRevision !== approvalsRevision ||
      this.findStoreBackedRequest(request.id) != null
    ) {
      return;
    }
    const session = this.sessionFor(request.sessionId, request.agentServer);
    if (session) {
      session.pendingPermissionRequests = [...session.pendingPermissionRequests, request];
    } else {
      this.unboundPermissionRequests = [...this.unboundPermissionRequests, request];
    }
    this.conversationStatus.markWaitingForUser({
      type: "approval",
      sessionId: request.sessionId,
      agentServer: request.agentServer,
      toolCall: request.toolCall,
    });
    this.publishLiveStatuses();
  }

  /**
   * Every pending permission request on this surface, including ones held for
   * conversations with no live session here (broadcast prompts that arrived
   * before the conversation was opened).
   */
  get pendingApprovals(): ACPPendingPermissionRequest[] {
    return this.pendingApprovalsSnapshot;
  }

  /**
   * A broadcast permission prompt was answered (or abandoned) on another
   * surface. Broadcasts are raced first-response-wins, so this surface may
   * still be showing it with no other signal to clear it — resolve the
   * matching request (bound or held unbound) as cancelled so its card comes
   * down and the in-flight ACP request completes. Keyed by the identity every
   * surface shares: (sessionId, agentServer, toolCallId). A no-op if this
   * surface answered it already or never had it.
   */
  resolvePermissionExternally(
    sessionId: string,
    agentServer: string | undefined,
    toolCallId: string,
  ): void {
    this.permissions.resolveByToolCall(
      sessionId as SessionId,
      normalizeAgentServerName(agentServer ?? DEFAULT_AGENT_SERVER),
      toolCallId,
      this.liveSessions.values(),
    );
  }

  /** Pending permission requests held for a session that has no live record. */
  unboundPermissionRequestsFor(
    sessionId: SessionId,
    agentServer: string,
  ): ACPPendingPermissionRequest[] {
    const server = normalizeAgentServerName(agentServer);
    return this.unboundPermissionRequests.filter(
      (request) =>
        request.sessionId === sessionId && normalizeAgentServerName(request.agentServer) === server,
    );
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   * `params.sessionId` identifies the ACP session; `params.id` only
   * correlates the started and completed phases of one compaction.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const session = params.sessionId
      ? this.sessionFor(params.sessionId as SessionId, agentServer)
      : this.uniquePromptingSessionFor(agentServer);
    session?.handleCompactionUpdate(params);
  }

  /** Clear transient per-turn extension state on every connected surface. */
  handleTurnEnded(agentServer: string, params: ACPTurnEndedNotification): void {
    this.sessionFor(params.sessionId as SessionId, agentServer)?.handleTurnEnded();
  }

  /** Compatibility fallback for helpers that predate session-scoped compaction notifications. */
  private uniquePromptingSessionFor(agentServer: string): ACPSession | null {
    agentServer = normalizeAgentServerName(agentServer);
    const candidates = Array.from(this.liveSessions.values()).filter(
      (session) => session.agentServer === agentServer && session.isPromptActive,
    );
    return candidates.length === 1 ? candidates[0] : null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  handlePromptSuggestion(agentServer: string, suggestion: ACPPromptSuggestion): void {
    const session = this.sessionFor(suggestion.sessionId as SessionId, agentServer);
    if (!session) return;
    this.touchSession(session.conversationId);
    session.setPromptSuggestion(suggestion);
  }

  handleGoalUpdate(agentServer: string, update: ACPClaudeGoalUpdate): void {
    const session = this.sessionFor(update.sessionId as SessionId, agentServer);
    if (!session) return;
    this.touchSession(session.conversationId);
    session.setGoal(update.goal);
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
function shallowArrayEquals<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((item, i) => item === b[i]);
}

// Same requests, same order, same objects — reconcile skips the assignment so
// unchanged sessions don't re-render their approval cards on every push.
function sameRequestList(
  a: ACPPendingPermissionRequest[],
  b: ACPPendingPermissionRequest[],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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
  identifiesClaudeAgent?: (agentServer: string) => boolean,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const repo = new ACPSessionRepositoryWriter(
    conversationStatus,
    elicitation,
    identifiesClaudeAgent,
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
