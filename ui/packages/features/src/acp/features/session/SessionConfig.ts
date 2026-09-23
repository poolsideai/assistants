__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { mergeLocalInferenceModelConfigOptionDefinitionsForAgent } from "../../localInferenceModelOptions";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  collaborationModeSurface,
  currentConfigSelections,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  findCollaborationModeConfigOption,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  mergeConfigSelections,
  planValueForConfigOption,
  shouldPersistConfigSelection,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { isStaleSessionError } from "./errors";
import type { ACPSession } from "./Session.svelte";
import type { ACPCollaborationModeSurface, ACPPendingConfigOption } from "./types";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export interface ACPSetConfigOptionOptions {
  /**
   * Whether this change is an explicit user choice (the default). Programmatic
   * reconciliation — e.g. the local-inference model sync switching the
   * session's model because the previous selection was deleted from disk —
   * passes false: the wire call and the local apply are identical, but nothing
   * is marked user-touched and nothing is recorded or persisted as a last-used
   * default, so machine-driven state changes cannot masquerade as user picks.
   */
  recordSelection?: boolean;
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
    this.resetInheritedPlanMode();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * applyCached, but re-impose the choices the user explicitly made on THIS
   * session, where the refreshed definitions still offer them. Background
   * refreshes (window-focus probes, probe streaming updates) use this:
   * applyCached alone pipes the cache through the configured defaults, which
   * would silently reset a draft's picker choices — and collapse divergent
   * same-agent drafts onto the single shared cache slot.
   *
   * Only user-touched options are preserved. Values the draft merely
   * inherited must keep tracking the cache, otherwise a newly remembered
   * last-used value (or a changed agent default) could never reach an open
   * draft.
   */
  applyCachedPreservingSelections(): void {
    const s = this.session;
    const touched = s.userSelectedConfigIds;
    const selections = new Map(
      [...currentConfigSelections(s.configOptions)].filter(([configId]) => touched.has(configId)),
    );
    const modeId = s.userSelectedMode ? (s.modes?.currentModeId ?? null) : null;
    this.applyCached();
    if (selections.size > 0) {
      s.configOptions = mergeConfigSelections(s.configOptions, selections);
      s.modes = syncModeFromConfigOptions(s.modes, s.configOptions);
    }
    // Legacy mode state without a mode config option: restore the user's
    // chosen mode directly when the refreshed list still offers it.
    if (
      modeId &&
      !findModeConfigOption(s.configOptions) &&
      s.modes?.availableModes.some((mode) => mode.id === modeId)
    ) {
      s.modes = updateSessionModeValue(s.modes, modeId);
    }
  }

  // Remember an explicit user choice, both on the session (so a background
  // re-apply keeps it here) and on the agent (so it survives a probe and, for
  // options with known-safe semantics, seeds the next new conversation — see
  // shouldPersistConfigSelection). Mode-shaped choices (permission mode,
  // build/plan collaboration — including the ones togglePlanMode routes
  // through setOption) and other options this client cannot classify are
  // session state, not defaults: they are recorded in memory only, never
  // persisted, so one permission-relaxing session — or one pick on an
  // unclassified "extras" option — cannot become every future conversation's
  // starting state.
  #recordUserSelection(configId: string, value: string | boolean): void {
    const s = this.session;
    s.userSelectedConfigIds = new Set(s.userSelectedConfigIds).add(configId);
    const option = s.configOptions.find((candidate) => candidate.id === configId);
    s.env.agents.recordUserConfigSelection(s.agentServer, configId, value, {
      persist: option !== undefined && shouldPersistConfigSelection(option),
    });
  }

  #recordUserModeSelection(modeId: string): void {
    const s = this.session;
    s.userSelectedMode = true;
    s.env.agents.recordUserModeSelection(s.agentServer, modeId);
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.#recordUserModeSelection(modeId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // A suspended session's agent side was closed while idle; reattach
      // before the wire call or it answers "session not found".
      if (s.suspended && !(await s.reattachSuspendedCore(gen))) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      try {
        await conn.setSessionMode({ sessionId, modeId });
      } catch (e) {
        this.markSuspendedOnStaleError(e);
        throw e;
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async setOption(
    configId: string,
    value: string,
    options: ACPSetConfigOptionOptions = {},
  ): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (options.recordSelection !== false) this.#recordUserSelection(configId, value);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        if (s.suspended && !(await s.reattachSuspendedCore(gen))) {
          this.clearPending(configId, requestId);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.markSuspendedOnStaleError(err);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async setBooleanOption(
    configId: string,
    value: boolean,
    options: ACPSetConfigOptionOptions = {},
  ): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (options.recordSelection !== false) this.#recordUserSelection(configId, value);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        if (s.suspended && !(await s.reattachSuspendedCore(gen))) {
          this.clearPending(configId, requestId);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.markSuspendedOnStaleError(err);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * A "session not found"-shaped rejection means the agent-side session is
   * gone (closed by another surface, or a close that raced a resume). Mark
   * the record suspended so the next interaction reattaches instead of
   * failing the same way again.
   */
  private markSuspendedOnStaleError(e: unknown): void {
    if (isStaleSessionError(normalizeACPError(e))) {
      this.session.suspended = true;
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const nextMode = this.isPlanModeActive ? planTarget.exitModeId : planTarget.planModeId;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
   * Plan mode reads from whichever option owns it. Agents that separate the
   * two publish plan on their collaboration option and leave only approval
   * policies on `mode`, so consulting `mode` alone would report "not planning"
   * for every one of them.
   */
  get isPlanModeActive(): boolean {
    const target = this.planModeTarget();
    if (!target) return false;
    if (target.kind === "config") {
      const option = this.session.configOptions.find((o) => o.id === target.configId);
      return option?.type === "select" && option.currentValue === target.planModeId;
    }
    return this.currentModeId === target.planModeId;
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
   * True when plan mode is owned by the collaboration option (build/plan).
   * Those agents keep `mode` purely about permissions, so plan state shows in
   * their own collaboration control rather than the full-width plan banner.
   */
  get planModeViaCollaboration(): boolean {
    const target = this.planModeTarget();
    return target?.kind === "config" && target.viaCollaboration;
  }

  get collaborationModeSurface(): ACPCollaborationModeSurface {
    return collaborationModeSurface(this.session.configOptions);
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
    s.configOptions = mergeLocalInferenceModelConfigOptionDefinitionsForAgent(
      s.agentServer,
      configOptions,
      s.configOptions,
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    | {
        kind: "config";
        configId: string;
        planModeId: string;
        exitModeId: string | null;
        viaCollaboration: boolean;
      }
    | { kind: "mode"; planModeId: string; exitModeId: string | null }
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // The collaboration option wins when it offers plan: on agents that have
    // both, that is where plan lives and `mode` is purely about permissions.
    const collaborationConfig = findCollaborationModeConfigOption(this.session.configOptions);
    const collaborationPlanModeId = collaborationConfig
      ? planValueForConfigOption(collaborationConfig)
      : null;
    if (collaborationConfig && collaborationPlanModeId) {
      return {
        kind: "config",
        configId: collaborationConfig.id,
        planModeId: collaborationPlanModeId,
        exitModeId: exitModeForConfigOption(collaborationConfig),
        viaCollaboration: true,
      };
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const modePlanModeId = modeConfig ? planValueForConfigOption(modeConfig) : null;
    if (modeConfig && modePlanModeId) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        planModeId: modePlanModeId,
__POOL_SYNTHETIC_IMPORT_BASELINE__
        viaCollaboration: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return {
        kind: "mode",
        planModeId: ACP_PLAN_MODE_ID,
        exitModeId: exitModeForModes(modes),
      };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * Plan mode is a conversation-local switch. The shared config cache still
   * carries its latest value so definitions can be reused, but an untouched
   * draft must start in the corresponding non-plan mode. A plan choice made
   * on this draft is user-selected and remains intact across cache refreshes.
   */
  private resetInheritedPlanMode(): void {
    const s = this.session;
    const target = this.planModeTarget();
    if (!target || !target.exitModeId || !this.isPlanModeActive) return;

    if (target.kind === "config") {
      if (s.userSelectedConfigIds.has(target.configId)) return;
      s.configOptions = updateConfigOptionValue(
        s.configOptions,
        target.configId,
        target.exitModeId,
      );
      s.modes = syncModeFromConfigOptions(s.modes, s.configOptions);
      return;
    }

    if (s.userSelectedMode) return;
    s.modes = updateSessionModeValue(s.modes, target.exitModeId);
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
