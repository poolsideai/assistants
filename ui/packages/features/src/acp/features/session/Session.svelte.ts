__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { ACPPromptSuggestion } from "../../claudePromptSuggestions";
import { normalizeACPError, type ACPRequestError } from "../../errors";
import { controlCodexGoal, type ACPGoalState } from "../../goals";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { ACPSessionConfig, type ACPSetConfigOptionOptions } from "./SessionConfig";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { ACPSteerOutcome } from "./steering";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACPCollaborationModeSurface,
  ACPGoalAction,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACPPendingHandoff,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACPSessionCancelOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  isChat = $state(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // True only when this live record was created to inspect an archived
  // conversation. A later normal open (after restore) may then safely clear
  // the transient read-only flag without overriding agent-authored metadata
  // on genuinely read-only sessions.
  readOnlyInspection = false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  historicalEvents: SessionEvent[] = [];
  historicalTurns: TurnMetadata[] = [];
  historicalPlan: Plan | null = null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Options the user explicitly chose on this session, as opposed to values
  // inherited from the agent's config cache. A background config refresh
  // preserves these and lets everything else track the cache.
  userSelectedConfigIds = $state.raw<Set<string>>(new Set());
  userSelectedMode = $state(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // The agent-side session was closed while idle (its subprocess released);
  // the transcript is still warm in memory. Reattach via session/resume before
  // the next wire interaction. See SessionRepository.closeIdleSessions.
  suspended = $state(false);
  // The in-flight session/close that suspended this session, if it has not
  // settled yet. Reattach awaits it so a resume cannot be overtaken and torn
  // down by a late-arriving close. Plain field: nothing renders it.
  pendingClose: Promise<void> | null = null;
  // A resume/reload is on the wire (refreshMCPServers). The idle sweep and
  // evictor treat this as protection so they cannot suspend or close the
  // session mid-resume. Plain field: consumed only by lifecycle checks.
  refreshInFlight = false;
  // This session's agent-side state was lost (the agent process restarted
  // under it, or a prompt hit a stale session): reload it before the next
  // wire interaction. Scoped per session, never per agent server — a session
  // created *after* the restart runs on the fresh process and has nothing to
  // reload. Agents that only materialize a transcript once a turn starts
  // (Codex writes its rollout then) fail session/load outright on such a
  // session, which used to swallow the user's very first prompt. Plain field:
  // consumed only by the loader.
  restoreRequired = false;
  // session/load restored this conversation and the agent replayed nothing at
  // all: its history is gone agent-side even though the sidebar still lists the
  // conversation. Surfaces read it so they stop presenting the conversation as
  // a fresh draft, and prompting reads it to decide that an unresumable-session
  // error is worth recovering from — there is no transcript left to lose.
  restoredWithoutHistory = $state(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  queuedPrompts = $state.raw<ACPQueuedPrompt[]>([]);
  steeringRequestsInFlight = $state(0);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  promptSuggestion = $state.raw<ACPPromptSuggestion | null>(null);
  goal = $state.raw<ACPGoalState | null>(null);
  pendingGoalAction = $state<ACPGoalAction | null>(null);
  goalActionError = $state.raw<ACPRequestError | null>(null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  handoffTargetAgentServer = $state<string | null>(null);
  pendingHandoff = $state.raw<ACPPendingHandoff | null>(null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  get queuedPrompt(): ACPQueuedPrompt | null {
    return this.queuedPrompts[0] ?? null;
  }

  get activeTurnStartIndex(): number | null {
    const localStartIndex = this.materializer.currentTurnStartIndex;
    return localStartIndex === null ? null : this.historicalEvents.length + localStartIndex;
  }

  get isSteering(): boolean {
    return this.steeringRequestsInFlight > 0;
  }

  get isPromptActive(): boolean {
    return this.isPrompting || this.isSteering;
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Holds either the visible-cadence delay, the hidden-cadence delay, or the
  // fallback paired with a requested animation frame. requestAnimationFrame is
  // suspended while the webview is hidden or occluded, so the fallback keeps a
  // pending visible flush from freezing indefinitely.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Publish a visible stream at roughly 30 fps. Immutable Markdown segments
  // and uncached live tails now bound the work per publication, so this keeps
  // token arrival feeling immediate without returning to per-chunk updates.
  private static readonly VISIBLE_TRANSCRIPT_FLUSH_MS = 32;
  // Streaming-chunk flush cadence while no surface displays this conversation.
  // Nothing on screen reads the snapshot, so per-frame array copies and
  // metadata extraction are wasted; the slow interval keeps the sidebar's
  // persisted metadata roughly fresh without the per-frame cost.
  private static readonly HIDDEN_TRANSCRIPT_FLUSH_MS = 1000;
  // Plain field, not $state: it only steers flush scheduling, and reading it
  // inside publishTranscript must never create a reactive dependency.
  private transcriptVisible = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isChat?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.isChat = opts.isChat ?? false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return this.config.isPlanModeActive;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  get planModeViaCollaboration(): boolean {
    return this.config.planModeViaCollaboration;
  }
  get collaborationModeSurface(): ACPCollaborationModeSurface {
    return this.config.collaborationModeSurface;
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
  addUserMessage(content: ContentBlock[] | string, options?: { steer?: boolean }): void {
    this.transcript.addUserMessage(content, options);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  seedHandoffHistory(
    events: readonly SessionEvent[],
    turns: readonly TurnMetadata[],
    plan: Plan | null,
    handoff: Extract<SessionEvent, { eventKind: "handoff" }>,
  ): void {
    this.seedHistoricalHistory([...events, handoff], turns, plan);
  }

  seedHistoricalHistory(
    events: readonly SessionEvent[],
    turns: readonly TurnMetadata[],
    plan: Plan | null,
    { persistMetadata = true }: { persistMetadata?: boolean } = {},
  ): void {
    this.historicalEvents = [...events];
    this.historicalTurns = [...turns];
    this.historicalPlan = plan;
    this.cancelTranscriptFlush();
    this.flushTranscript(persistMetadata);
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  applyCachedConfigPreservingSelections(): void {
    this.config.applyCachedPreservingSelections();
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.clearPromptSuggestion();
    this.goal = null;
    this.pendingGoalAction = null;
    this.goalActionError = null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  invalidateGeneration(): void {
    this.generation++;
    this.pendingGoalAction = null;
    this.goalActionError = null;
  }

  setPromptSuggestion(suggestion: ACPPromptSuggestion): void {
    this.promptSuggestion = suggestion;
  }

  clearPromptSuggestion(): void {
    this.promptSuggestion = null;
  }

  setGoal(goal: ACPGoalState | null): void {
    this.goal = goal;
    this.goalActionError = null;
  }

  pauseGoal(): Promise<void> {
    return this.runGoalAction("pause", async () => {
      const goal = this.goal;
      if (goal?.source !== "codex" || goal.controlMethod === undefined) {
        throw new Error("This agent does not support pausing goals from Poolside.");
      }
      const connection = await this.goalConnection();
      await controlCodexGoal(connection, {
        sessionId: this.requiredGoalSessionId(),
        action: "pause",
      });
    });
  }

  resumeGoal(): Promise<void> {
    return this.runGoalAction("resume", async () => {
      if (this.goal?.source !== "codex" || this.goal.status !== "paused") {
        throw new Error("This goal cannot be resumed.");
      }
      await this.issueGoalCommand("/goal resume");
    });
  }

  clearGoal(): Promise<void> {
    return this.runGoalAction("clear", async () => {
      const goal = this.goal;
      if (!goal) return;
      if (goal.source === "codex" && goal.controlMethod !== undefined) {
        const connection = await this.goalConnection();
        await controlCodexGoal(connection, {
          sessionId: this.requiredGoalSessionId(),
          action: "clear",
        });
        return;
      }
      if (goal.source !== "claude") {
        throw new Error("This agent does not support clearing goals from Poolside.");
      }
      await this.issueGoalCommand("/goal clear");
      this.setGoal(null);
    });
  }

  private async runGoalAction(action: ACPGoalAction, perform: () => Promise<void>): Promise<void> {
    if (this.pendingGoalAction !== null) return;
    const generation = this.generation;
    const sessionId = this.sessionId;
    if (sessionId === null) return;

    this.pendingGoalAction = action;
    this.goalActionError = null;
    try {
      await perform();
    } catch (error) {
      if (generation === this.generation && sessionId === this.sessionId) {
        this.goalActionError = normalizeACPError(error);
      }
      throw error;
    } finally {
      if (generation === this.generation && sessionId === this.sessionId) {
        this.pendingGoalAction = null;
      }
    }
  }

  private requiredGoalSessionId(): SessionId {
    if (this.sessionId === null) throw new Error("Cannot control a goal without a session.");
    return this.sessionId;
  }

  private async goalConnection() {
    await this.reattachIfSuspended();
    const connection =
      this.env.agents.connectionFor(this.agentServer) ??
      (await this.env.agents.activate(this.agentServer));
    if (!connection) throw new Error("Could not connect to the agent.");
    return connection;
  }

  private async issueGoalCommand(command: string): Promise<void> {
    if (this.promptError) {
      throw new Error("Resolve the current prompt error before changing the goal.");
    }
    if (this.isPromptActive && this.env.agents.supportsSteering(this.agentServer)) {
      // Any non-null outcome delivered the command: injected into the running
      // turn, or (at a turn boundary) sent as steer's ordinary-prompt
      // fallback, whose failure surfaces as a prompt error.
      const outcome = await this.steerPrompt(command);
      if (outcome === null) throw new Error("The agent could not apply the goal command.");
      const promptError = this.currentPromptError();
      if (promptError) throw promptError.error;
      return;
    }

    await this.prompt(command);
    const promptError = this.currentPromptError();
    if (promptError) throw promptError.error;
  }

  // Reading through a method prevents TypeScript from carrying the pre-await
  // null narrowing across the prompt, which may populate this reactive field.
  private currentPromptError(): ACPPromptError | null {
    return this.promptError;
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
  async refreshMCPServers(gen: number): Promise<boolean> {
    // Every resume path must let an in-flight suspending close settle first,
    // or the resume can be answered and then torn down by the late close.
    if (this.pendingClose) {
      await this.pendingClose;
      if (gen !== this.generation) return false;
    }
    // Flag the in-flight resume so the idle sweep / evictor cannot suspend or
    // close the session mid-resume — the inverse of the pendingClose barrier
    // above: that one orders resume after close, this one stops a new close
    // from starting while a resume is on the wire.
    this.refreshInFlight = true;
    try {
      const ok = await this.loader.refreshMCPServers(gen);
      // A successful resume/reload means the agent side is attached again, no
      // matter which flow triggered it (reattach, MCP-server refresh sweep).
      // Leaving `suspended` set here would make future idle sweeps and evicts
      // skip closing a session that is actually live.
      if (ok && gen === this.generation) {
        this.suspended = false;
      }
      return ok;
    } finally {
      this.refreshInFlight = false;
    }
  }

  /**
   * Reattach a suspended session, serialized so a prompt sent right after
   * queues behind the reattach instead of racing it.
   */
  reattachIfSuspended(): Promise<void> {
    if (!this.suspended) return Promise.resolve();
    return this.serialize(async (gen) => {
      await this.reattachSuspendedCore(gen);
    });
  }

  /**
   * Direct-call variant for code running inside `serialize` (promptCore —
   * calling reattachIfSuspended there would deadlock the queue) or on the
   * independent per-config queues (SessionConfig). Single-flight: concurrent
   * callers (claim-triggered reattach racing a config change) share one
   * resume instead of issuing overlapping ones. Reuses the resume-preferring
   * reconnect path, which keeps the warm transcript untouched and falls back
   * to session/load for older agents.
   */
  async reattachSuspendedCore(gen: number): Promise<boolean> {
    if (!this.suspended) return true;
    if (gen !== this.generation) return false;
    // refreshMCPServers awaits any in-flight suspending close and clears the
    // suspended flag on success.
    this.reattachInFlight ??= this.refreshMCPServers(gen).finally(() => {
      this.reattachInFlight = null;
    });
    return this.reattachInFlight;
  }

  private reattachInFlight: Promise<boolean> | null = null;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  clearQueuedPrompt(id?: string): void {
    this.prompting.clearQueued(id);
  }

  prioritizeQueuedPrompt(id?: string): void {
    this.prompting.prioritizeQueued(id);
  }

  sendQueuedPrompt(id?: string): void {
    this.prompting.sendQueued(id);
  }

  steerPrompt(
    text: string,
    content: ContentBlock[] = textPromptContent(text),
  ): Promise<ACPSteerOutcome | null> {
    return this.prompting.steer(text, content);
  }

  steerQueuedPrompt(id?: string): Promise<ACPSteerOutcome | null> {
    return this.prompting.steerQueued(id);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  cancel(options?: ACPSessionCancelOptions): Promise<void> {
    return this.prompting.cancel(options);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  setConfigOption(
    configId: string,
    value: string,
    options?: ACPSetConfigOptionOptions,
  ): Promise<void> {
    return this.config.setOption(configId, value, options);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  setBooleanConfigOption(
    configId: string,
    value: boolean,
    options?: ACPSetConfigOptionOptions,
  ): Promise<void> {
    return this.config.setBooleanOption(configId, value, options);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (
      this.sessionId !== null ||
      !this.conversationId ||
      this.isPendingConversationPersisted ||
      this.pendingHandoff !== null
    ) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  handleTurnEnded(): void {
    this.extensions.poolside?.endTurn();
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   * frame after a short visible cadence delay — or onto the slow hidden cadence
   * while no surface displays this conversation (see setTranscriptVisible);
   * every other caller publishes synchronously. Batching is a no-op
   * (synchronous) unless enabled at boot via enableAcpTranscriptBatching(), so
   * tests stay synchronous.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!this.transcriptVisible) {
      this.transcriptFlushTimeout = setTimeout(
        () => this.runScheduledTranscriptFlush(),
        ACPSession.HIDDEN_TRANSCRIPT_FLUSH_MS,
      );
      return;
    }
    this.transcriptFlushTimeout = setTimeout(
      () => this.requestTranscriptFlushFrame(),
      ACPSession.VISIBLE_TRANSCRIPT_FLUSH_MS,
    );
  }

  private requestTranscriptFlushFrame(): void {
    this.transcriptFlushTimeout = null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * Switch this session's streaming flush cadence between the responsive
   * visible and slow hidden schedules. Turning visible publishes any pending
   * hidden-cadence flush immediately, so the transcript is current the moment
   * the conversation appears on screen. Turning hidden reschedules a pending
   * visible update onto the slow cadence instead of letting it repaint an
   * occluded transcript.
   */
  setTranscriptVisible(visible: boolean): void {
    if (this.transcriptVisible === visible) return;
    this.transcriptVisible = visible;
    if (this.transcriptFlushHandle === null && this.transcriptFlushTimeout === null) return;
    if (visible) {
      this.runScheduledTranscriptFlush();
      return;
    }
    this.cancelTranscriptFlush();
    this.transcriptFlushTimeout = setTimeout(
      () => this.runScheduledTranscriptFlush(),
      ACPSession.HIDDEN_TRANSCRIPT_FLUSH_MS,
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
  private flushTranscript(persistMetadata = true): void {
    const historicalEventCount = this.historicalEvents.length;
    this.events = [...this.historicalEvents, ...this.materializer.events];
    this.turns = [
      ...this.historicalTurns,
      ...this.materializer.turns
        .filter((turn) => turn.endIndex >= turn.startIndex)
        .map((turn) => ({
          ...turn,
          startIndex: turn.startIndex + historicalEventCount,
          endIndex: turn.endIndex + historicalEventCount,
        })),
    ];
    this.plan = this.materializer.plan ?? this.historicalPlan;
    this.metadataManager.refresh({ persist: persistMetadata });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
