__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  SessionConfigOption,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { failure, isSuccess, loading, success, waiting } from "@poolsideai/lib/async-state";
import { withClaudeSessionFeatures } from "../../claudePromptSuggestions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { mergeLocalInferenceModelConfigOptionDefinitionsForAgent } from "../../localInferenceModelOptions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  mergeConfigSelections,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    s.clearPromptSuggestion();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const [storedConfig] = await Promise.all([
      loadPersistedSessionConfig(s).catch(() => null),
      s.env.agents.loadCachedConfigFromStore(agentServer),
    ]);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const localModelDefinitions = this.localModelDefinitions();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const reportedConfigOptions = res.configOptions ?? [];
      s.configOptions = mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
        agentServer,
        reportedConfigOptions,
        localModelDefinitions,
      );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      await this.applyPersistedSessionConfig(gen, conn, storedConfig, reportedConfigOptions);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // Transport implementations may settle the load response independently
      // from replay delivery. Publish once more after persisted config is
      // restored so any replay updates accepted during that window cannot
      // remain materialized but invisible.
      s.replayMaterializer?.completeOpenToolCalls();
      if (s.replayMaterializer) {
        s.titles.finalizeInlineTitle(s.replayMaterializer, { replay: true });
      }
      s.sessionInfo = s.replaySessionInfo;
      s.publishTranscript();
      // A load that replays nothing means the agent could not restore any
      // history for this conversation, even though it accepted the load —
      // either the history is lost agent-side or the conversation never had a
      // completed turn. Record it here, where the replay has settled, so the
      // pane can say so instead of rendering the conversation as a brand-new
      // chat.
      s.restoredWithoutHistory = s.events.length === 0;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
   * Reconnect the current session with the helper's latest MCP server set.
   * Prefer session/resume so the transcript stays untouched; older agents fall
   * back to the existing session/load replay path.
   */
  async refreshMCPServers(gen: number): Promise<boolean> {
    const s = this.session;
    if (gen !== s.generation || s.sessionId === null) return false;
    s.clearPromptSuggestion();

    const sessionId = s.sessionId;
    const agentServer = s.agentServer;
    const cwd = s.sessionInfo?.cwd || s.cwd || s.loadingCwd || "/";
    const conn = await s.env.agents.useAgentServer(agentServer);
    if (gen !== s.generation || !conn) return false;

    const supportsResume =
      s.env.agents.capabilitiesFor(agentServer)?.sessionCapabilities?.resume != null;
    if (supportsResume) {
      try {
        const _meta = withClaudeSessionFeatures(
          agentServer,
          undefined,
          s.env.isClaudeAgent(agentServer),
        );
        const res = await conn.resumeSession({
          sessionId,
          cwd,
          mcpServers: [],
          ...(_meta ? { _meta } : {}),
        });
        if (gen !== s.generation) return false;

        // Some agents recreate the underlying session when its MCP server set
        // changes, so their resume response contains agent-wide defaults rather
        // than this conversation's selections. Capture those selections before
        // the response replaces the local config surface, then restore them
        // below. Capturing after resume settles (rather than before the call)
        // keeps a user config change that landed mid-resume as the winner.
        const { configSelections, modeSelection } = this.captureConfigSelections();
        const localModelDefinitions = this.localModelDefinitions();

        let configChanged = false;
        let reportedConfigOptions: SessionConfigOption[] | undefined;
        if (res.configOptions !== undefined) {
          reportedConfigOptions = res.configOptions ?? [];
          s.configOptions = mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
            agentServer,
            reportedConfigOptions,
            localModelDefinitions,
          );
          s.pendingConfigOptions = {};
          configChanged = true;
        }
        if (res.modes !== undefined) {
          s.modes = res.modes ?? null;
          configChanged = true;
        }
        if (configChanged) {
          await this.restoreSessionConfigSelections(
            gen,
            conn,
            configSelections,
            modeSelection,
            reportedConfigOptions,
          );
          if (gen !== s.generation) return false;
          s.metadataManager.refresh();
          void s.env.agents.upsertCachedConfig(agentServer, {
            configOptions: s.configOptions,
            availableCommands: s.availableCommands,
            modes: s.modes,
          });
        }
        s.env.agents.clearNonSessionError(agentServer);
        return true;
      } catch {
        // An agent can reject either resume or re-applying its previous config.
        // Loading the same session is the interoperable fallback.
      }
    }

    await this.loadExisting(gen, cwd, [], s.sessionInfo ?? undefined);
    return gen === s.generation && isSuccess(s.loadState);
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
        const _meta = withClaudeSessionFeatures(
          s.agentServer,
          undefined,
          s.env.isClaudeAgent(s.agentServer),
        );
        return await conn.loadSession({
          sessionId,
          cwd: candidate,
          mcpServers,
          ...(_meta ? { _meta } : {}),
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
    reportedConfigOptions = this.session.configOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // applySessionConfigSelections drops selections whose option no longer
    // exists or no longer offers the stored value.
    const selections = new Map(Object.entries(stored.selections));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        reportedConfigOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        reconcileConfigOptions: (reported, fallback) =>
          mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
            s.agentServer,
            reported,
            fallback,
          ),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!s.restoreRequired) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    s.clearPromptSuggestion();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const _meta = withClaudeSessionFeatures(
        agentServer,
        undefined,
        s.env.isClaudeAgent(agentServer),
      );
      const res = await conn.loadSession({
        sessionId,
        cwd,
        mcpServers: [],
        ...(_meta ? { _meta } : {}),
      });
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const { configSelections, modeSelection } = this.captureConfigSelections();
      const localModelDefinitions = this.localModelDefinitions();
      const reportedConfigOptions = res.configOptions ?? [];
      s.configOptions = mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
        agentServer,
        reportedConfigOptions,
        localModelDefinitions,
      );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      await this.restoreSessionConfigSelections(
        gen,
        conn,
        configSelections,
        modeSelection,
        reportedConfigOptions,
      );
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (s.replayMaterializer) {
        s.titles.finalizeInlineTitle(s.replayMaterializer, { replay: true });
      }
      s.sessionInfo = s.replaySessionInfo;
      s.restoreRequired = false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Snapshot the conversation's current config selections so they can be
  // re-applied after a resume/load response overwrites the local surface.
  // Options with a user change still in flight are skipped: that request
  // will land its own newer value, and re-applying the captured (older) one
  // would revert the user's choice.
  private captureConfigSelections(): {
    configSelections: Map<string, string | boolean>;
    modeSelection: string | null | undefined;
  } {
    const s = this.session;
    const configSelections = currentConfigSelections(s.configOptions);
    for (const [configId, pending] of Object.entries(s.pendingConfigOptions)) {
      if (pending.error === null) configSelections.delete(configId);
    }
    const modeConfig = findModeConfigOption(s.configOptions);
    return { configSelections, modeSelection: modeConfig ? null : s.modes?.currentModeId };
  }

  private localModelDefinitions(): SessionConfigOption[] {
    const s = this.session;
    const cached = s.env.agents.cachedConfigFor(s.agentServer)?.configOptions ?? [];
    return mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
      s.agentServer,
      s.configOptions,
      cached,
    );
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    configSelections: Map<string, string | boolean>,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    reportedConfigOptions = this.session.configOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // s.configOptions currently holds the agent's response (its defaults).
    // Show the captured selections immediately and reconcile against the
    // response over the wire, so the picker never flashes the defaults while
    // the restore is in flight.
    const agentConfigOptions = s.configOptions;
    s.configOptions = mergeConfigSelections(agentConfigOptions, configSelections);
    s.modes = syncModeFromConfigOptions(s.modes, s.configOptions);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      configOptions: agentConfigOptions,
      reportedConfigOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      reconcileConfigOptions: (reported, fallback) =>
        mergeLocalInferenceModelConfigOptionDefinitionsForAgent(s.agentServer, reported, fallback),
__POOL_SYNTHETIC_IMPORT_BASELINE__
        s.configOptions = mergeConfigSelections(configOptions, configSelections);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    s.modes = syncModeFromConfigOptions(s.modes, s.configOptions);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // A mode the agent no longer offers would be rejected; keep its default.
    if (s.modes && !s.modes.availableModes.some((mode) => mode.id === modeSelection)) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await conn.setSessionMode({ sessionId: s.sessionId, modeId: modeSelection });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
