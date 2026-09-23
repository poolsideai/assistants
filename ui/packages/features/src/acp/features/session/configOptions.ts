__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACP_COLLABORATION_MODE_CATEGORY,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ACPCollaborationModeSurface,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function isCollaborationModeOption(option: SessionConfigOption | undefined): boolean {
  if (!isStringSelectConfigOption(option)) return false;
  if (option.category === ACP_COLLABORATION_MODE_CATEGORY) return true;
  // Categories are optional in ACP. Codex's canonical option id remains
  // unambiguous without one; Poolside's `agent_mode` does not, so it still
  // needs the category to stay distinct from an approval mode.
  if (option.category !== undefined && option.category !== null) return false;
  return [option.id, option.name].some(
    (identity) => normalizeConfigIdentity(identity) === "collaborationmode",
  );
}

export function isCollaborationModeConfigOption(
  option: SessionConfigOption | undefined,
): option is StringSelectSessionConfigOption {
  return isCollaborationModeOption(option);
}

// The option that owns build/plan on agents which keep it apart from the
// approval policy. Prefer the category because its id differs per agent
// (`collaboration_mode`, `agent_mode`); when the optional category is absent,
// only Codex's canonical collaboration identity is unambiguous enough to use.
export function findCollaborationModeConfigOption(
  configOptions: SessionConfigOption[],
): StringSelectSessionConfigOption | undefined {
  return configOptions.find(isCollaborationModeConfigOption);
}

// Both agents that ship one today offer exactly two values, one of them plan
// — a switch, which /plan and the plan chip can drive on their own. An agent
// that adds a third mode needs the picker instead: a two-way toggle could
// never reach the extra value.
export function isPlanToggleCollaborationOption(option: SessionConfigOption | undefined): boolean {
  if (!isCollaborationModeConfigOption(option)) return false;
  const values = selectOptionValues(option);
  return values.length === 2 && planValueForConfigOption(option) !== null;
}

export function collaborationModeSurface(
  configOptions: SessionConfigOption[],
): ACPCollaborationModeSurface {
  const option = findCollaborationModeConfigOption(configOptions);
  if (!option) return "none";
  return isPlanToggleCollaborationOption(option) ? "plan-toggle" : "picker";
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
function normalizeConfigIdentity(value: string | undefined): string {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

export function planValueForConfigOption(option: SessionConfigOption): string | null {
  const values = selectOptionValues(option);
  // Display names carry the semantics when an agent uses opaque wire ids.
  // Prefer them before the wire value, matching the prompt UI's appearance
  // resolver.
  return (
    values.find((value) => {
      const name = normalizeConfigIdentity(value.name);
      return name === "plan" || name === "planmode";
    })?.value ??
    values.find((value) => {
      const id = normalizeConfigIdentity(value.value);
      return id === "plan" || id === "planmode";
    })?.value ??
    null
  );
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// ---- Prompt-surface option classification ----
//
// Semantic buckets the prompt UI surfaces with dedicated affordances (icon,
// placement, and the compact promptbox footer); everything else stays in the
// generic config menu. The classification lives at the session layer (and is
// re-exported by components/chat/menus/config/configOptions.ts, which layers
// the icons and appearances on top) because session state depends on it too:
// mode-shaped options are excluded from last-used persistence.
export type PromptConfigKind = "model" | "mode" | "collaboration" | "effort" | "fast";

// Tokenize an option's id and name for keyword matching: lowercase, split on
// camelCase and separators, so "permissionMode", "approval_mode" and
// "Reasoning Effort" all expose their keywords.
function configTokens(option: SessionConfigOption): Set<string> {
  const raw = `${option.id} ${option.name}`.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return new Set(raw.split(/[^a-z0-9]+/).filter(Boolean));
}

// Classify an option by its exact (UX-only) category when present, else by
// keywords in its id/name — so any ACP server whose options are *named* like a
// model/mode/effort gets the dedicated affordances, not just the agents we
// know. "Fast mode" is surfaced whether the agent models it as a boolean or an
// on/off select. Returns null for options we leave to the generic config menu.
export function promptConfigKind(option: SessionConfigOption): PromptConfigKind | null {
  if (isFastConfigOption(option)) return "fast";
  if (option.type !== "select") return null;
  // A reserved category is the agent stating what the option IS, so it
  // dispatches before any keyword guessing: a permission selector named e.g.
  // "model_access_mode" must classify by its "mode" category, not by the
  // "model" token in its name — this classifier also gates last-used
  // persistence, and a mode mistaken for a model would both hijack the
  // picker's Model slot and persist behavioral session state as a default.
  switch (option.category) {
    case "model":
      return "model";
    // How the agent works (build vs plan), which agents that separate it
    // from the approval policy publish under its own category — Codex on
    // `collaboration_mode`, Poolside on `agent_mode`.
    case ACP_COLLABORATION_MODE_CATEGORY:
      return "collaboration";
    case "mode":
      return "mode";
    case "thought_level":
      return "effort";
  }
  const tokens = configTokens(option);
  if (tokens.has("model")) return "model";
  // Checked before "mode" because Codex's canonical collaboration name
  // carries the "mode" token too, and matching it as the permission selector
  // would hijack the mode control. The shared resolver only accepts that
  // canonical identity when ACP's optional category is absent; any other
  // category present on the option (checked above or not) defeats it.
  if (isCollaborationModeOption(option)) {
    return "collaboration";
  }
  if (tokens.has("mode")) return "mode";
  if (
    tokens.has("effort") ||
    tokens.has("thought") ||
    tokens.has("reasoning") ||
    tokens.has("thinking")
  ) {
    return "effort";
  }
  return null;
}

/**
 * Mode-shaped options ("mode" — the approval/permission policy — and
 * "collaboration" — build vs plan) describe how the current session behaves,
 * including permission-relaxing modes. They are recorded in memory like any
 * other explicit selection (probe preservation needs that), but they must not
 * persist as last-used defaults: one bypass-permissions session must not
 * silently become every future conversation's starting state.
 */
export function isBehavioralModeConfigOption(option: SessionConfigOption | undefined): boolean {
  if (!option) return false;
  const kind = promptConfigKind(option);
  return kind === "mode" || kind === "collaboration";
}

// Categories ACP reserves for model-tuning knobs (schema.ts's
// SessionConfigOptionCategory union) whose semantics are safe to remember
// across conversations even when the specific option falls outside
// promptConfigKind's classified kinds above — e.g. a "model_config"
// temperature slider, or a "thought_level" scale whose values don't match a
// known effort range.
const PERSISTABLE_CONFIG_CATEGORIES: ReadonlySet<string> = new Set([
  "model",
  "model_config",
  "thought_level",
]);

/**
 * Whether an explicit user selection on this option should also persist as
 * the agent's last-used default (the `persist` flag on
 * AgentRepository.recordUserConfigSelection), in addition to being recorded
 * in memory for this app run.
 *
 * Persisting is opt-in, not opt-out: an option's semantics must be known and
 * known-safe before one pick on it silently becomes every future
 * conversation's starting state. A generic "extras" surface lets users touch
 * uncategorized or custom-category options an agent defines (Goose's
 * `provider`, Claude's `agent` persona, an arbitrary `verbose_logging`
 * boolean) — those have unknown semantics to this client, so a selection
 * must not silently stick. That is the same reasoning that already excludes
 * behavioral-mode options: a bypass-permissions pick must not become every
 * future session's start state either.
 *
 * - Behavioral-mode options (permission mode, build/plan collaboration) are
 *   checked first and always lose, even if the option happens to also carry
 *   one of the safe categories below: how the agent may act *this session*
 *   must never leak into defaults, regardless of category.
 * - Model, effort, and fast are the prompt surface's classified kinds, with
 *   well-understood, conversation-independent semantics.
 * - "model_config" and "thought_level" are categories ACP reserves for other
 *   model-tuning knobs; safe by the same reasoning even when
 *   promptConfigKind doesn't recognize the specific option.
 * - Everything else — no category, or a custom/unknown one — does not
 *   persist.
 */
export function shouldPersistConfigSelection(option: SessionConfigOption): boolean {
  if (isBehavioralModeConfigOption(option)) return false;
  const kind = promptConfigKind(option);
  if (kind === "model" || kind === "effort" || kind === "fast") return true;
  return typeof option.category === "string" && PERSISTABLE_CONFIG_CATEGORIES.has(option.category);
}

const FAST_NAME_PATTERN = /(^|[\s_-])fast([\s_-]|$)/;

// Match fast mode by name: a boolean toggle or a flippable on/off select whose
// id/name says "fast". Unrelated boolean options stay unclassified so they keep
// living in the generic config menu.
export function isFastConfigOption(option: SessionConfigOption): boolean {
  const named = FAST_NAME_PATTERN.test(`${option.id} ${option.name}`.toLowerCase());
  if (!named) return false;
  if (option.type === "boolean") return true;
  if (option.type !== "select") return false;
  return fastToggleState(option).canToggle;
}

export type FastToggleState = {
  isBoolean: boolean;
  isOn: boolean;
  canToggle: boolean;
  onValue?: string;
  offValue?: string;
};

const OFF_VALUE_PATTERN = /^(off|disabled?|none|false|no)$/;
const ON_VALUE_PATTERN = /^(on|enabled?|true|yes|fast)$/;

// Resolve the on/off state of a fast option. Booleans are direct; selects are
// mapped by locating their off value (and treating the remaining value as on),
// so a two-state "On"/"Off" select behaves like a toggle.
export function fastToggleState(option: SessionConfigOption): FastToggleState {
  if (option.type === "boolean") {
    return { isBoolean: true, isOn: option.currentValue, canToggle: true };
  }
  if (option.type !== "select") {
    return { isBoolean: false, isOn: false, canToggle: false };
  }
  const values = selectOptionValues(option);
  const off = values.find((value) => matchesLabel(OFF_VALUE_PATTERN, value));
  const on =
    values.find((value) => matchesLabel(ON_VALUE_PATTERN, value)) ??
    values.find((value) => value !== off);
  const canToggle = Boolean(on && off && on.value !== off.value);
  const isOn = on ? option.currentValue === on.value : option.currentValue !== off?.value;
  return { isBoolean: false, isOn, canToggle, onValue: on?.value, offValue: off?.value };
}

function matchesLabel(pattern: RegExp, value: SessionConfigSelectOption): boolean {
  return pattern.test(value.value.toLowerCase()) || pattern.test(value.name.toLowerCase());
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!value) return option;
    if (option.type === "select") {
      if (!optionHasValue(option, value)) return option;
      return { ...option, currentValue: value };
    }
    // Booleans are stored as "true"/"false" strings (the store is
    // Record<string, string>); anything else is malformed and ignored.
    if (option.type === "boolean") {
      if (value !== "true" && value !== "false") return option;
      return { ...option, currentValue: value === "true" };
    }
    return option;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const planValue = planValueForConfigOption(option);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    values.find((value) => value.value !== planValue)?.value ??
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function currentConfigSelections(
  configOptions: SessionConfigOption[],
): Map<string, string | boolean> {
  const selections = new Map<string, string | boolean>();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (option.type === "select" || option.type === "boolean") {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// A captured selection is only re-applicable when the option still has the
// same shape and, for selects, still offers the captured value. Sending a
// vanished value would make the agent reject the whole restore.
export function selectionApplies(option: SessionConfigOption, value: string | boolean): boolean {
  if (option.type === "boolean") return typeof value === "boolean";
  if (option.type === "select") return typeof value === "string" && optionHasValue(option, value);
  return false;
}

// Overlay captured selections onto an agent's config response so the picker
// keeps showing the user's choice while the selections are re-applied over
// the wire, instead of flashing the agent's defaults. Callers must reconcile
// against the pre-merge options: applySessionConfigSelections skips values
// that already match currentValue, so comparing against the merged surface
// would suppress the wire calls.
export function mergeConfigSelections(
  configOptions: SessionConfigOption[],
  selections: Map<string, string | boolean>,
): SessionConfigOption[] {
  if (selections.size === 0) return configOptions;
  return configOptions.map((option) => {
    const value = selections.get(option.id);
    if (value === undefined || option.currentValue === value) return option;
    if (option.type === "select" && typeof value === "string" && optionHasValue(option, value)) {
      return { ...option, currentValue: value };
    }
    if (option.type === "boolean" && typeof value === "boolean") {
      return { ...option, currentValue: value };
    }
    return option;
  });
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  selections: Record<string, string | boolean>; // select/boolean config option id → currentValue
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const selections: Record<string, string | boolean> = {};
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (typeof v === "string" || typeof v === "boolean") selections[k] = v;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  reportedConfigOptions = configOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  reconcileConfigOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  reportedConfigOptions?: SessionConfigOption[];
  selections: Map<string, string | boolean>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  reconcileConfigOptions?: (
    reported: SessionConfigOption[],
    fallback: SessionConfigOption[],
  ) => SessionConfigOption[];
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let nextReportedConfigOptions = reportedConfigOptions;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const option = nextConfigOptions.find((candidate) => candidate.id === configId);
    const reported = nextReportedConfigOptions.find((candidate) => candidate.id === configId);
    if (!option || reported?.currentValue === value || !selectionApplies(option, value)) continue;
    const res =
      typeof value === "boolean"
        ? await conn.setSessionConfigOption({ sessionId, configId, value, type: "boolean" })
        : await conn.setSessionConfigOption({ sessionId, configId, value });
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const fallback =
      typeof value === "boolean"
        ? updateBooleanConfigOptionValue(nextConfigOptions, configId, value)
        : updateConfigOptionValue(nextConfigOptions, configId, value);
    nextReportedConfigOptions = res?.configOptions ?? fallback;
    nextConfigOptions = res?.configOptions
      ? (reconcileConfigOptions?.(res.configOptions, fallback) ?? res.configOptions)
      : fallback;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
