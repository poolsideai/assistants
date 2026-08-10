import type {
  ContentBlock,
  McpServer,
  SessionConfigOption,
  SessionId,
} from "@agentclientprotocol/sdk";
import {
  poolsideAcpNavAbortConversationHandoff,
  poolsideAcpNavGetProjectSettings,
  poolsideAcpNavPrepareConversationHandoff,
} from "@poolsideai/helperapi";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  withClaudeAppendSystemPrompt,
  withClaudeSessionFeatures,
} from "../../claudePromptSuggestions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { parseClaudeGoalCommand, type ACPGoalState } from "../../goals";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { mergeLocalInferenceModelConfigOptionDefinitionsForAgent } from "../../localInferenceModelOptions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  acpSessionWorkspacePath,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  applySessionConfigSelections,
  currentConfigSelections,
  mergeConfigSelections,
} from "./configOptions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { isAuthRequiredError, isStaleSessionError, isUnresumableSessionError } from "./errors";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { ACP_STEER_FALLBACK_META_KEY, steerSession, type ACPSteerOutcome } from "./steering";
import type { ACPQueuedPrompt, ACPSessionCancelOptions } from "./types";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type AgentSessionConfigOptions = {
  configOptions: SessionConfigOption[];
  reportedConfigOptions: SessionConfigOption[];
};

__POOL_SYNTHETIC_IMPORT_BASELINE__
  private queuedPromptSequence = 0;
  private queuedSendScheduled = false;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  get hasQueuedSendPending(): boolean {
    return this.queuedSendScheduled || this.session.queuedPrompts.length > 0;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await this.session.serialize((gen) => this.promptCore(gen, text, content));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.session.restoreRequired = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await this.session.serialize((gen) =>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // The restart above took this session's agent-side state with it, so
        // reload it here rather than waiting for the agent's exit notification
        // to mark it — that races this retry and would make the reload a no-op.
        s.restoreRequired = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (this.session.isPromptActive && !this.session.sessionInfo?.readOnly) {
      this.session.clearPromptSuggestion();
      this.session.queuedPrompts = [
        ...this.session.queuedPrompts,
        {
          ...prompt,
          id: prompt.id ?? `queued-prompt-${++this.queuedPromptSequence}`,
        },
      ];
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  clearQueued(id?: string): void {
    if (id === undefined) {
      this.session.queuedPrompts = this.session.queuedPrompts.slice(1);
      return;
    }
    this.session.queuedPrompts = this.session.queuedPrompts.filter((prompt) => prompt.id !== id);
  }

  prioritizeQueued(id?: string): void {
    if (id === undefined) return;
    const index = this.session.queuedPrompts.findIndex((prompt) => prompt.id === id);
    if (index <= 0) return;
    const queued = this.session.queuedPrompts[index];
    this.session.queuedPrompts = [
      queued,
      ...this.session.queuedPrompts.filter((_, i) => i !== index),
    ];
  }

  sendQueued(id?: string): void {
    const s = this.session;
    if (s.isPromptActive || s.isSending || s.sessionInfo?.readOnly) {
      throw new Error("Cannot send queued prompt while the session is busy");
    }
    this.prioritizeQueued(id);
    this.sendQueuedPromptAfterCurrentTurn();
  }

  async steer(
    text: string,
    content: ContentBlock[] = textPromptContent(text),
  ): Promise<ACPSteerOutcome | null> {
    const s = this.session;
    if (s.sessionId === null || !s.isPromptActive || s.sessionInfo?.readOnly) return null;
    const generation = s.generation;
    const sessionId = s.sessionId;
    const agentServer = s.agentServer;
    const conn =
      s.env.agents.connectionFor(agentServer) ?? (await s.env.agents.activate(agentServer));
    if (!conn || s.generation !== generation || s.sessionId !== sessionId) return null;
    const transport = s.env.agents.steeringTransport(agentServer);
    if (!transport) return null;

    s.promptError = null;
    s.env.agents.clearNonSessionError(agentServer);
    s.addUserMessage(content, { steer: true });
    s.steeringRequestsInFlight += 1;
    s.env.publishLiveStatuses();
    let outcome: ACPSteerOutcome | null = null;
    try {
      const response = await steerSession(conn, { sessionId, prompt: content });
      if (s.generation !== generation || s.sessionId !== sessionId) return null;
      if (response.outcome === "failed") {
        throw new Error("The agent could not apply the steering prompt.");
      }
      if (
        response.outcome === "injected" ||
        response.outcome === "promptRequired" ||
        response.outcome === "startedNewTurn"
      ) {
        outcome = response.outcome;
      } else {
        throw new Error(`The agent returned an unknown steering result (${response.outcome}).`);
      }
    } catch (e) {
      if (s.generation !== generation || s.sessionId !== sessionId) return null;
      s.promptError = {
        error: normalizeACPError(e),
        prompt: text,
        content,
      };
      return null;
    } finally {
      if (s.generation === generation && s.sessionId === sessionId) {
        s.steeringRequestsInFlight = Math.max(0, s.steeringRequestsInFlight - 1);
        s.env.publishLiveStatuses();
        // A steer acknowledgement only confirms injection, but it can be the
        // last busy operation to settle if the prompt response raced it.
        // Whichever of promptCore or this request makes the session idle owns
        // advancing the ordinary queue; the active-state guard makes this safe
        // in either order. A promptRequired fallback owns the queue itself —
        // advancing here would let a queued prompt jump ahead of the steered
        // message.
        if (outcome !== "promptRequired") {
          this.sendQueuedPromptAfterCurrentTurn();
        }
      }
    }
    if (outcome === "promptRequired") {
      // The turn had already ended when the steer landed, and the agent left
      // the message undelivered. Send it as an ordinary prompt: the transcript
      // already shows it (addUserMessage above), and steerFallback tells the
      // helper it was already mirrored to the other surfaces at steer time.
      const delivered = await s.serialize((gen) =>
        this.promptCore(gen, text, content, { addUserMessage: false, steerFallback: true }),
      );
      // The fallback bails without a trace when the agent exits or cannot be
      // reactivated before it runs, yet the transcript already shows the
      // message as sent. Leave a retryable prompt error behind so the message
      // is not silently lost — unless the session was rebound meanwhile or
      // the bail recorded an error of its own.
      if (!delivered && s.sessionId === sessionId && s.promptError === null) {
        s.promptError = {
          error: normalizeACPError(
            new Error("The agent stopped before the message could be sent. Try again."),
          ),
          prompt: text,
          content,
        };
      }
    }
    return outcome;
  }

  async steerQueued(id?: string): Promise<ACPSteerOutcome | null> {
    const index =
      id === undefined ? 0 : this.session.queuedPrompts.findIndex((prompt) => prompt.id === id);
    const queued = index >= 0 ? this.session.queuedPrompts[index] : undefined;
    if (!queued) return null;
    // Clear first so the current turn's completion cannot race the extension
    // response and send the same queued prompt as a second, ordinary turn.
    this.session.queuedPrompts = this.session.queuedPrompts.filter((_, i) => i !== index);
    return this.steer(queued.text, queued.content);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async cancel({ sendQueuedPrompt = false }: ACPSessionCancelOptions = {}): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!sendQueuedPrompt) s.queuedPrompts = [];
    s.titles.finalizeInlineTitle(s.materializer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    try {
      const conn =
        s.env.agents.connectionFor(agentServer) ?? (await s.env.agents.activate(agentServer));
      if (!conn) return;
      await conn.cancel({ sessionId });
    } finally {
      if (sendQueuedPrompt) this.sendQueuedPromptAfterCurrentTurn();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Resolves true when the message reached the agent or was recorded for
  // retry (promptError, or a restarted session's draft), false when it was
  // abandoned because the session state moved on first — an agent exit or
  // rebind between enqueueing this call and running it. Callers that own a
  // message with no other trace (steer's promptRequired fallback) use false
  // to leave their own retryable error instead of losing it silently.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      steerFallback = false,
    }: { addUserMessage?: boolean; retryStaleSession?: boolean; steerFallback?: boolean } = {},
  ): Promise<boolean> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (gen !== s.generation || s.sessionId === null) return false;
    s.clearPromptSuggestion();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // A failed prompt's content never reached the agent (retryLastPrompt
    // resends it on the same assumption), and it already shows as a user
    // message in the transcript. Fold it into this prompt so typing a new
    // message after the error — instead of pressing retry — does not silently
    // drop the original message.
    const failedPrompt = s.promptError;
    const outgoingText = failedPrompt ? `${failedPrompt.prompt}\n\n${text}` : text;
    const outgoingContent = failedPrompt
      ? [...(failedPrompt.content ?? textPromptContent(failedPrompt.prompt)), ...content]
      : content;
    const standaloneClaudeSlashCommand =
      s.env.isClaudeAgent(agentServer) && isStandaloneSlashCommand(outgoingText, outgoingContent);
    const claudeGoalCommand = standaloneClaudeSlashCommand
      ? parseClaudeGoalCommand(outgoingText)
      : null;
    const hadClaudeGoal = s.goal?.source === "claude";
    let fallbackGoal: ACPGoalState | null = null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (gen !== s.generation || !conn) return false;
    if (!(await s.loader.restoreAfterReconnect(gen, conn))) return false;
    // A suspended session's agent-side resources were closed while idle;
    // reattach before prompting. On failure surface a retryable prompt error —
    // returning silently would drop the user's typed message.
    if (!(await s.reattachSuspendedCore(gen))) {
      if (gen === s.generation) {
        s.promptError = {
          error: normalizeACPError(new Error("Could not reconnect the session. Try again.")),
          prompt: outgoingText,
          content: outgoingContent,
        };
        return true;
      }
      return false;
    }
    if (gen !== s.generation) return false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Transcript size before this turn adds anything: an unresumable-session
    // failure is only recoverable by starting over when there is nothing to
    // start over from, and an agent may deliver a late replay after its load
    // settled — which would make restoredWithoutHistory alone stale.
    const eventsBeforeTurn = s.events.length;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let delivered = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (claudeGoalCommand?.action === "set") {
        fallbackGoal = {
          source: "claude",
          objective: claudeGoalCommand.objective,
          status: "active",
        };
        s.setGoal(fallbackGoal);
      }
      const res = await conn.prompt({
        sessionId,
        prompt: outgoingContent,
        ...(steerFallback ? { _meta: { [ACP_STEER_FALLBACK_META_KEY]: true } } : {}),
      });
      if (gen !== s.generation) return true;
      s.titles.finalizeInlineTitle(s.materializer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        s.restoredWithoutHistory = false;
        if (s.queuedPrompts.length === 0) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        if (
          claudeGoalCommand?.action === "clear" ||
          claudeGoalCommand?.action === "set" ||
          (hadClaudeGoal && !standaloneClaudeSlashCommand)
        ) {
          s.setGoal(null);
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (gen !== s.generation) return true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      } else if (
        s.restoredWithoutHistory &&
        eventsBeforeTurn === 0 &&
        isUnresumableSessionError(err)
      ) {
        await this.restartOnUnresumableSession(gen, outgoingText, outgoingContent);
__POOL_SYNTHETIC_IMPORT_BASELINE__
        s.restoreRequired = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
          delivered = await this.promptCore(gen, outgoingText, outgoingContent, {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            steerFallback,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          if (gen !== s.generation) return false;
          s.promptError = { error: err, prompt: outgoingText, content: outgoingContent };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        s.promptError = { error: err, prompt: outgoingText, content: outgoingContent };
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (fallbackGoal !== null && s.promptError !== null && s.goal === fallbackGoal) {
        s.setGoal(null);
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // Agents do not currently emit a terminal compaction phase when the
        // summarizer fails or the turn is cancelled. Never let that transient
        // state survive the turn and keep the conversation permanently active.
        s.extensions.poolside?.endTurn();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        s.titles.finalizeInlineTitle(s.materializer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return delivered;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Recovers a conversation whose agent-side session cannot be prompted again
  // (see isUnresumableSessionError). Only reached when the restore replayed no
  // transcript, so nothing is thrown away: the dead session id is dropped and
  // the same nav conversation is rebound to a fresh session — the helper
  // rebinds it from the `poolside/conversation_id` meta that sendCore sends —
  // keeping the sidebar entry and this conversation's config selections, and
  // letting the user's message land instead of dead-ending on an error that
  // would fail identically forever.
  private async restartOnUnresumableSession(
    gen: number,
    text: string,
    content: ContentBlock[],
  ): Promise<void> {
    const s = this.session;
    if (gen !== s.generation) return;
    console.warn("acp: agent could not resume this session; starting a fresh one", {
      agentServer: s.agentServer,
      sessionId: s.sessionId,
      conversationId: s.conversationId,
    });
    const cwd = s.sessionInfo?.cwd || s.cwd || "";
    // The conversation's title was derived from the prompt whose history is
    // gone, so it is the only trace of it the user has left. Carry it over
    // instead of letting the new session retitle the conversation (an absent
    // title would be stored as "Untitled Conversation").
    const existingTitle = s.sessionInfo?.title?.trim() || undefined;
    s.sessionId = null;
    s.sessionInfo = null;
    s.restoreRequired = false;
    s.restoredWithoutHistory = false;
    s.promptError = null;
    // The transcript already shows this prompt as a user message; the new
    // session must not add a second copy.
    await this.sendCore(gen, text, undefined, undefined, cwd, content, {
      skipOptimisticUserMessage: true,
      initialTitle: existingTitle,
    });
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    options: {
      skipOptimisticUserMessage?: boolean;
      initialTitle?: string | null;
      preserveAgentToolDefaults?: boolean;
    } = {},
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    s.clearPromptSuggestion();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let preparedHandoffId: string | null = null;
    let handoffCommitted = false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const pendingHandoff = startedWithoutSessionId ? s.pendingHandoff : null;
      // A draft whose earlier send failed before a session existed already
      // shows as a user message in the transcript. Fold it into this send so
      // prompting again after a first-turn error does not silently drop the
      // original message (retryAfterError consumes the draft itself and passes
      // skipOptimisticUserMessage, so it never merges here).
      const failedDraft =
        startedWithoutSessionId && !options.skipOptimisticUserMessage ? s.pendingDraftSend : null;
      const sendText = failedDraft ? `${failedDraft.text}\n\n${text}` : text;
      const sendContent = failedDraft ? [...failedDraft.content, ...content] : content;
      const initialPromptContent = pendingHandoff
        ? [...sendContent, pendingHandoff.context]
        : sendContent;
      const initialTitle =
        options.initialTitle === undefined ? pendingHandoff?.initialTitle : options.initialTitle;
      const preserveAgentToolDefaults = options.preserveAgentToolDefaults === true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const standaloneClaudeCommand =
        startedWithoutSessionId &&
        s.env.isClaudeAgent(s.agentServer) &&
        isStandaloneSlashCommand(sendText, initialPromptContent);
      const commandHostContext = standaloneClaudeCommand
        ? await this.initialHostContextBlock(sessionCwd)
        : null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        if (pendingHandoff) {
          try {
            await poolsideAcpNavPrepareConversationHandoff(pendingHandoff.prepareParams);
            preparedHandoffId = pendingHandoff.handoffId;
          } catch (error) {
            if (gen !== s.generation) return null;
            s.loadIntent = "new";
            s.loadState = failure(normalizeACPError(error));
            s.pendingDraftSend = {
              text: sendText,
              content: sendContent,
              sandboxDefinitionId,
              newSessionMeta,
              cwd: sessionCwd,
            };
            return null;
          }
        }
        const agentConfig = await this.createAgentSession(
          gen,
          sessionCwd,
          [],
          withClaudeSessionFeatures(
            s.agentServer,
            withClaudeAppendSystemPrompt(
              {
                ...newSessionMeta,
                ...(pendingHandoff
                  ? {
                      "poolside/handoff": {
                        sourceAgentServer: pendingHandoff.sourceAgentServer,
                        sourceSessionId: pendingHandoff.sourceSessionId,
                      },
                      "poolside/handoff_id": pendingHandoff.handoffId,
                    }
                  : {}),
                // The helper binds the nav conversation row to the new session id
                // synchronously at session/new (live status is keyed by session id
                // and silently unattachable until the binding lands); the client's
                // later history upsert only enriches metadata.
                "poolside/conversation_id": s.conversationId,
                ...(sandboxDefinitionId
                  ? { sandbox_definition_id: sandboxDefinitionId }
                  : preserveAgentToolDefaults
                    ? {}
                    : { enabled_tools: [] }),
              },
              commandHostContext?.resource.text ?? "",
            ),
            s.env.isClaudeAgent(s.agentServer),
          ),
          pendingConfigOptions,
        );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            text: sendText,
            content: sendContent,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        if (pendingHandoff) {
          handoffCommitted = true;
          if (s.pendingHandoff === pendingHandoff) {
            s.pendingHandoff = null;
          }
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        const newSessionTitle =
          initialTitle === undefined ? titleFromPrompt(sendText) : initialTitle;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          await this.applyPendingConfigOptions(
            gen,
            pendingConfigOptions,
            agentConfig?.configOptions ?? s.configOptions,
            agentConfig?.reportedConfigOptions,
          );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          s.promptError = {
            error: normalizeACPError(e),
            prompt: sendText,
            content: initialPromptContent,
          };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        const initialTitle = titleFromPrompt(sendText);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const promptContent =
        startedWithoutSessionId && !standaloneClaudeCommand
          ? await this.contentWithInitialHostContext(initialPromptContent, sessionCwd)
          : initialPromptContent;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      await this.promptCore(gen, sendText, promptContent, {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (titleSessionId && initialTitle === undefined) {
        void s.titles.fetch(sendText);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (preparedHandoffId !== null && !handoffCommitted) {
        try {
          await poolsideAcpNavAbortConversationHandoff({ handoffId: preparedHandoffId });
        } catch (error) {
          console.warn("Unable to abort prepared ACP conversation handoff", error);
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
    const s = this.session;
    if (this.queuedSendScheduled || s.isPromptActive) return;
    const queued = s.queuedPrompts[0];
    if (!queued) return;
    this.queuedSendScheduled = true;
    s.queuedPrompts = s.queuedPrompts.slice(1);
    void s.serialize(async (gen) => {
      this.queuedSendScheduled = false;
      return this.sendCore(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      );
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const context = await this.initialHostContextBlock(cwd);
    return context ? [...content, context] : content;
  }

  private async initialHostContextBlock(
    cwd: string,
  ): Promise<ReturnType<typeof hostContextBlock> | null> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!supportsEmbeddedContext) return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return hostContextBlock({
      assistantVersion: state.environment.assistantVersion,
      userPrompt,
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (state.environment.assistantHost !== "desktop" || this.session.isChat) return undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const projectPath = acpSessionWorkspacePath(state, workspaceFolders, cwd, this.session.isChat);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    _meta: Record<string, unknown> | undefined,
    pendingSelections: Map<string, string | boolean>,
  ): Promise<AgentSessionConfigOptions | null> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (gen !== s.generation) return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // The helper catalog is the source of truth for local models. Capture the
    // draft's catalog-backed option before session/new: the local agent may
    // return only the model it bootstrapped with, which is not enough to
    // validate and apply another downloaded model selected in the draft.
    const draftConfigOptions = s.configOptions;

__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (gen !== s.generation) return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (gen !== s.generation) return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // The response carries the agent's defaults; show the draft's selections
      // immediately so the picker never flashes those defaults while sendCore
      // re-applies the selections over the wire. For the local agent, retain
      // the catalog's full model definitions while preserving the response's
      // actual current value. That enriched response is returned for
      // reconciliation.
      const reportedConfigOptions = res.configOptions ?? [];
      const agentConfigOptions = mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
        agentServer,
        reportedConfigOptions,
        draftConfigOptions,
      );
      s.configOptions = mergeConfigSelections(agentConfigOptions, pendingSelections);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // A real session/new is as authoritative as a config probe; recording
      // it defers the next TTL-gated probe.
      s.env.agents.markAgentConfigFresh(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return { configOptions: agentConfigOptions, reportedConfigOptions };
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (gen !== s.generation) return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          workspacePath: acpSessionWorkspacePath(state, workspaceFolders, cwd, this.session.isChat),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    pendingConfigOptions: Map<string, string | boolean>,
    agentConfigOptions: SessionConfigOption[],
    reportedConfigOptions = agentConfigOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // s.configOptions already shows the draft's selections optimistically
      // (createAgentSession merged them); reconcile against the agent's raw
      // session/new config so the wire calls are not skipped as already
      // current. On failure, put the agent's real config back so the picker
      // does not keep showing a selection the agent rejected.
      let applied = agentConfigOptions;
      let configOptions: SessionConfigOption[] | null;
      try {
        configOptions = await applySessionConfigSelections({
          conn,
          sessionId: s.sessionId,
          configOptions: agentConfigOptions,
          reportedConfigOptions,
          selections: pendingConfigOptions,
          isCurrent: () => gen === s.generation && s.sessionId !== null,
          reconcileConfigOptions: (reported, fallback) =>
            mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
              s.agentServer,
              reported,
              fallback,
            ),
          onApplied: (options) => {
            applied = options;
            s.configOptions = mergeConfigSelections(applied, pendingConfigOptions);
          },
        });
      } catch (e) {
        if (gen === s.generation) s.configOptions = applied;
        throw e;
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

function isStandaloneSlashCommand(text: string, content: ContentBlock[]): boolean {
  return (
    /^\/[A-Za-z0-9][A-Za-z0-9:_-]*(?:\s|$)/.test(text) &&
    content.length === 1 &&
    content[0]?.type === "text" &&
    content[0].text === text
  );
}
