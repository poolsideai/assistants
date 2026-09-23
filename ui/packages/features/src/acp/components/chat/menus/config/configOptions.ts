import type {
  SessionConfigOption,
  SessionConfigSelectGroup,
  SessionConfigSelectOption,
} from "@agentclientprotocol/sdk";
import type { IconName } from "@poolsideai/components/icon";
import {
  fastToggleState,
  isFastConfigOption,
  promptConfigKind,
  shouldPersistConfigSelection,
  type FastToggleState,
  type PromptConfigKind,
} from "../../../../features/session/configOptions";

// The classification itself (which option is the model/mode/collaboration/
// effort/fast control) lives at the session layer, which also needs it;
// re-exported here so the menus keep one import for classification and the
// appearances layered on top of it. shouldPersistConfigSelection rides along:
// the star unpin handlers use it to decide whether the stored default value
// must be cleared with the pin (options the last-used auto-follow never
// writes must not keep an unmanaged default).
export { fastToggleState, isFastConfigOption, promptConfigKind, shouldPersistConfigSelection };
export type { FastToggleState, PromptConfigKind };

export type SelectOptionGroup = {
  name?: string;
  options: SessionConfigSelectOption[];
};

// The mode selectors that can sit at the left of the promptbox: what the agent
// may do without asking, and — when it offers more than a build/plan switch —
// how it goes about the work.
export type PromptModeKind = Extract<PromptConfigKind, "mode" | "collaboration">;
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function configIcon(option: SessionConfigOption): IconName {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    case "mode":
    case "collaboration":
      return "plan";
    case "model":
      return "sparkles";
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return "wand";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    default:
      return "config";
  }
}

export type ModeCategory = "normal" | "auto" | "plan" | "restricted" | "dangerous";
export type ConfigValueAppearance = { icon: IconName; category: ModeCategory | null };

// Resolve an individual value's icon independently from its text. Permission
// modes use the shared risk taxonomy below; all other config values retain
// their category icon. Colour stays separate so it can be applied to the glyph
// without also colouring the value label.
export function configValueAppearance(
  option: SessionConfigOption,
  value: string,
): ConfigValueAppearance {
  const kind = promptConfigKind(option);
  if (kind === "mode") return modeAppearance(option, value);
  if (kind === "collaboration") return collaborationAppearance(option, value);
  return { icon: configIcon(option), category: null };
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Poolside, Claude, and Codex use different names for the same permission
// semantics. The category drives the icon and the selected Dangerous warning.
export type ModeAppearance = ConfigValueAppearance;

const MODE_APPEARANCES: Record<ModeCategory, ModeAppearance> = {
  normal: { category: "normal", icon: "ask" },
  auto: { category: "auto", icon: "shield" },
  plan: { category: "plan", icon: "plan" },
  restricted: { category: "restricted", icon: "block" },
  dangerous: { category: "dangerous", icon: "fast-forward" },
};

const ACCEPT_EDITS_MODE: ModeAppearance = { category: "normal", icon: "apply" };
const UNKNOWN_MODE: ModeAppearance = { category: null, icon: "config" };
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Dangerous glyphs stay red in both triggers and picker rows. The class is
// applied directly to the icon so labels remain neutral.
export function modeIconClass(appearance: ConfigValueAppearance): string {
  return appearance.category === "dangerous" ? "text-rose-700/75 dark:text-rose-400/80" : "";
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Resolve the current mode by both its display name and wire value. Display
// names take precedence because they preserve distinctions such as Poolside's
// "Always ask" versus Codex's "Read-only" even if an agent uses an opaque or
// generic value internally. Matching is case/separator/punctuation insensitive.
export function modeAppearance(option: SessionConfigOption, value?: string): ModeAppearance {
  if (option.type !== "select") return UNKNOWN_MODE;
  const resolvedValue = value ?? option.currentValue;
  return modeValueAppearance(resolvedValue, selectValueName(option, resolvedValue));
}

function modeValueAppearance(rawValue: string, displayName: string): ModeAppearance {
  for (const candidate of [displayName, rawValue]) {
    const value = normalizeConfigValue(candidate);

    // Dangerous: no permission gates.
    if (
      value === "alwaysallow" ||
      value === "allowall" ||
      value === "fullaccess" ||
      value === "agentfullaccess" ||
      value === "yolo" ||
      value.startsWith("bypass")
    ) {
      return MODE_APPEARANCES.dangerous;
    }

    // Restricted: prohibited actions are denied instead of prompting.
    if (value === "dontask" || value === "readonly") {
      return MODE_APPEARANCES.restricted;
    }

    // Plan: reason and prepare work without carrying it out.
    if (value === "plan" || value === "planmode") {
      return MODE_APPEARANCES.plan;
    }

    // Auto: the agent or classifier decides whether it needs permission.
    if (value === "auto" || value === "agent" || value === "workspacewrite") {
      return MODE_APPEARANCES.auto;
    }

    // Normal: permission-prompting or partially gated modes.
    if (value === "acceptedits") {
      return ACCEPT_EDITS_MODE;
    }
    if (value === "default" || value === "alwaysask") {
      return MODE_APPEARANCES.normal;
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__

  // New modes should remain visibly neutral until their semantics are known.
  return UNKNOWN_MODE;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Carrying out the work, as opposed to planning it: Poolside calls it "Build",
// Codex "Default". It shares the command menu's plan/build glyph pair.
const BUILD_MODE: ConfigValueAppearance = { category: null, icon: "code" };

// Collaboration modes say how the agent works, not what it may do without
// asking, so they borrow the plan glyph but never the permission taxonomy's
// risk colouring. Names are matched before wire values for the same reason as
// permission modes: they survive agents whose values are opaque.
export function collaborationAppearance(
  option: SessionConfigOption,
  value?: string,
): ConfigValueAppearance {
  if (option.type !== "select") return UNKNOWN_MODE;
  const resolvedValue = value ?? option.currentValue;
  for (const candidate of [selectValueName(option, resolvedValue), resolvedValue]) {
    const normalized = normalizeConfigValue(candidate);
    if (normalized === "plan" || normalized === "planmode") return MODE_APPEARANCES.plan;
    if (normalized === "build" || normalized === "default" || normalized === "code") {
      return BUILD_MODE;
    }
  }
  return UNKNOWN_MODE;
}

// Agents may describe each value ("Opus 5 · Best for everyday, complex tasks",
// "Auto-approves workspace file reads and writes"), which pickers render as
// subtext under the name. Agents with nothing to add repeat the name as the
// description instead of omitting it (Poolside lists every model that way), so
// an equal description is dropped rather than printed twice.
export function valueDescription(value: SessionConfigSelectOption): string | null {
  const description = value.description?.trim();
  if (!description) return null;
  return description.toLowerCase() === value.name.trim().toLowerCase() ? null : description;
}

export function hasValueDescriptions(values: SessionConfigSelectOption[]): boolean {
  return values.some((value) => valueDescription(value) !== null);
}

// Claude's models group into named families with a canonical order; the picker
// presents them that way regardless of the order the agent lists them in: the
// default entry first, then Fable, Opus, Sonnet, Haiku. Families we do not
// know follow the known ones, and within a family the agent's order is kept
// (stable sort), so variants such as 1m-context models stay beside their base.
const CLAUDE_MODEL_FAMILIES = ["default", "fable", "opus", "sonnet", "haiku"] as const;

export function orderClaudeModelValues(
  values: SessionConfigSelectOption[],
): SessionConfigSelectOption[] {
  const familyRank = (value: SessionConfigSelectOption): number => {
    const text = `${value.value} ${value.name}`.toLowerCase();
    const rank = CLAUDE_MODEL_FAMILIES.findIndex((family) => text.includes(family));
    return rank === -1 ? CLAUDE_MODEL_FAMILIES.length : rank;
  };
  return values
    .map((value, index) => ({ value, index, rank: familyRank(value) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.value);
}

type KnownEffortRange = {
  // Values the agent must publish for this range to match.
  values: readonly string[];
  optionIds?: readonly string[];
  // Values shown as selectable magnitudes. Codex's internal `max` tier is
  // folded into its user-facing `ultra` tier.
  levels?: readonly string[];
  names?: Readonly<Record<string, string>>;
  autoName?: string;
  activeAliases?: Readonly<Record<string, string>>;
};

const CLAUDE_EFFORT_NAMES = {
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra High",
  max: "Max",
} as const;

// Known effort ranges, each ascending by reasoning depth. An agent's effort
// values must match one of these sets EXACTLY (plus an optional default/auto
// entry) to get ranked bar icons and agent-specific labels. If an agent adds a
// value we do not know, the list renders as given rather than guessing.
const KNOWN_EFFORT_RANGES: readonly KnownEffortRange[] = [
  {
    values: ["none", "minimal", "low", "medium", "high", "xhigh"],
  }, // Poolside thought level
  {
    values: ["low", "medium", "high", "xhigh", "max"],
    optionIds: ["effort"],
    names: CLAUDE_EFFORT_NAMES,
    autoName: "Default",
  }, // Claude effort for models that support xhigh
  {
    values: ["low", "medium", "high", "max"],
    optionIds: ["effort"],
    names: CLAUDE_EFFORT_NAMES,
    autoName: "Default",
  }, // Claude effort for models without xhigh
  {
    values: ["low", "medium", "high", "xhigh", "max", "ultra"],
    optionIds: ["reasoning_effort"],
    levels: ["low", "medium", "high", "xhigh", "ultra"],
    names: {
      low: "Light",
      medium: "Medium",
      high: "High",
      xhigh: "Extra High",
      ultra: "Ultra",
    },
    activeAliases: { max: "ultra" },
  }, // Current Codex reasoning effort
  {
    values: ["low", "medium", "high", "xhigh"],
    optionIds: ["reasoning_effort"],
    names: {
      low: "Light",
      medium: "Medium",
      high: "High",
      xhigh: "Extra High",
    },
  }, // Older Codex reasoning effort
  {
    values: ["low", "medium", "high", "xhigh"],
  }, // Other agents using the established four-level range
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const KNOWN_EFFORT_KEYS = new Set(KNOWN_EFFORT_RANGES.flatMap((range) => range.values));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  activeValue: string | null; // visible value carrying the selected checkmark
__POOL_SYNTHETIC_IMPORT_BASELINE__
  valueNames: ReadonlyMap<string, string>; // wire value to user-facing label
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let autoEntry: SessionConfigSelectOption | null = null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      autoEntry = value;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const matched = KNOWN_EFFORT_RANGES.find(
    (range) =>
      (!range.optionIds || range.optionIds.includes(option.id)) &&
      range.values.length === keys.size &&
      range.values.every((key) => keys.has(key)),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const visibleKeys = matched.levels ?? matched.values;
  const hasNone = visibleKeys[0] === "none";
  const total = hasNone ? visibleKeys.length - 1 : visibleKeys.length;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const levels = visibleKeys.map((key, index) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return {
      value: entry.value,
      name: matched.names?.[key] ?? entry.name,
      filled: hasNone ? index : index + 1,
    };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const auto = autoEntry
    ? { value: autoEntry.value, name: matched.autoName ?? autoEntry.name }
    : null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const activeKey = matched.activeAliases?.[current] ?? current;
  const activeLevel = levels.find(
    (level, index) =>
      normalizeConfigValue(level.value) === current || visibleKeys[index] === activeKey,
  );
  const valueNames = new Map<string, string>();
  if (auto) valueNames.set(auto.value, auto.name);
  for (const level of levels) valueNames.set(level.value, level.name);
  for (const [alias, target] of Object.entries(matched.activeAliases ?? {})) {
    const aliasEntry = byKey.get(alias);
    const targetIndex = visibleKeys.indexOf(target);
    const targetLevel = targetIndex >= 0 ? levels[targetIndex] : null;
    if (aliasEntry && targetLevel) valueNames.set(aliasEntry.value, targetLevel.name);
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    activeValue: isAuto ? (auto?.value ?? null) : (activeLevel?.value ?? null),
__POOL_SYNTHETIC_IMPORT_BASELINE__
    valueNames,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function effortValueName(option: SessionConfigOption, value?: string): string {
  const resolvedValue = value ?? (option.type === "select" ? option.currentValue : "");
  return (
    effortBars(option)?.valueNames.get(resolvedValue) ?? selectValueName(option, resolvedValue)
  );
}

export function optionGroups(option: SessionConfigOption): SelectOptionGroup[] {
  if (option.type !== "select") return [];
  if (option.options.length === 0) return [];
  const first = option.options[0];
  if (isSelectGroup(first)) {
    return (option.options as SessionConfigSelectGroup[]).map((group) => ({
      name: group.name,
      options: group.options,
    }));
  }
  return [{ options: option.options as SessionConfigSelectOption[] }];
}

export function selectedValueName(option: SessionConfigOption): string {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if (option.type !== "select") return "";
  const selected = optionGroups(option)
    .flatMap((group) => group.options)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

function isSelectGroup(
  option: SessionConfigSelectOption | SessionConfigSelectGroup,
): option is SessionConfigSelectGroup {
  return "options" in option;
}
