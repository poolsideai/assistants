import type {
  ClientSideConnection,
  SessionConfigOption,
  SessionModeState,
} from "@agentclientprotocol/sdk";
import { describe, expect, it, vi } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  applyDefaultConfigOptions,
  applySessionConfigSelections,
  collaborationModeSurface,
  exitModeForConfigOption,
  findCollaborationModeConfigOption,
  isBehavioralModeConfigOption,
  mergeConfigSelections,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  planValueForConfigOption,
  promptConfigKind,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  shouldPersistConfigSelection,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("collaboration mode options", () => {
  it("recognizes canonical collaboration identity when the optional category is omitted", () => {
    const option = {
      id: "collaboration_mode",
      type: "select",
      name: "Collaboration mode",
      currentValue: "build",
      options: [
        { value: "build", name: "Build" },
        { value: "plan", name: "Plan" },
      ],
    } as SessionConfigOption;

    expect(findCollaborationModeConfigOption([option])).toBe(option);
    expect(collaborationModeSurface([option])).toBe("plan-toggle");
  });

  it("resolves an opaque Plan wire value by display name", () => {
    const option = {
      id: "collaboration_mode",
      type: "select",
      name: "Collaboration mode",
      currentValue: "building",
      options: [
        { value: "planning", name: "Plan" },
        { value: "building", name: "Build" },
      ],
    } as SessionConfigOption;

    expect(planValueForConfigOption(option)).toBe("planning");
    expect(exitModeForConfigOption(option)).toBe("building");
    expect(collaborationModeSurface([option])).toBe("plan-toggle");
  });
});

describe("isBehavioralModeConfigOption", () => {
  it("matches permission modes and collaboration modes but not other kinds", () => {
    const permissionMode = {
      id: "permission_mode",
      type: "select",
      name: "Mode",
      currentValue: "default",
      options: [
        { value: "default", name: "Always ask" },
        { value: "yolo", name: "Bypass permissions" },
      ],
    } as SessionConfigOption;
    const categorizedMode = {
      ...permissionMode,
      id: "approval",
      category: "mode",
    } as SessionConfigOption;
    const collaboration = {
      id: "collaboration_mode",
      type: "select",
      name: "Collaboration mode",
      currentValue: "build",
      options: [
        { value: "build", name: "Build" },
        { value: "plan", name: "Plan" },
      ],
    } as SessionConfigOption;

    expect(isBehavioralModeConfigOption(permissionMode)).toBe(true);
    expect(isBehavioralModeConfigOption(categorizedMode)).toBe(true);
    expect(isBehavioralModeConfigOption(collaboration)).toBe(true);

    // Model, effort, and fast options persist as last-used defaults; the
    // fast toggle carries the "mode" token but classifies as fast, and an
    // unknown option is not excluded either.
    const model = selectOption("model", "opus", ["opus", "sonnet"]);
    const effort = selectOption("reasoning_effort", "high", ["low", "high"]);
    const fastMode = {
      id: "fast_mode",
      type: "select",
      name: "Fast Mode",
      currentValue: "off",
      options: [
        { value: "on", name: "On" },
        { value: "off", name: "Off" },
      ],
    } as SessionConfigOption;

    expect(isBehavioralModeConfigOption(model)).toBe(false);
    expect(isBehavioralModeConfigOption(effort)).toBe(false);
    expect(isBehavioralModeConfigOption(fastMode)).toBe(false);
    expect(isBehavioralModeConfigOption(booleanOption("fast", true))).toBe(false);
    expect(isBehavioralModeConfigOption(selectOption("theme", "dark", ["dark", "light"]))).toBe(
      false,
    );
    expect(isBehavioralModeConfigOption(undefined)).toBe(false);
  });
});

describe("promptConfigKind reserved categories", () => {
  it("classifies a category-mode option as mode even when its name carries a model token", () => {
    // An agent's permission selector named around "model access": the
    // explicit reserved category must beat the "model" token, or the option
    // would hijack the picker's Model slot and persist a permission mode as
    // a last-used default.
    const option = {
      id: "model_access_mode",
      type: "select",
      name: "Model access mode",
      category: "mode",
      currentValue: "default",
      options: [
        { value: "default", name: "Always ask" },
        { value: "yolo", name: "Bypass permissions" },
      ],
    } as SessionConfigOption;

    expect(promptConfigKind(option)).toBe("mode");
    expect(isBehavioralModeConfigOption(option)).toBe(true);
    expect(shouldPersistConfigSelection(option)).toBe(false);
  });

  it("classifies a category-thought_level option as effort even when its name carries a model token", () => {
    const option = {
      id: "model_depth",
      type: "select",
      name: "Model depth",
      category: "thought_level",
      currentValue: "low",
      options: [
        { value: "low", name: "Low" },
        { value: "high", name: "High" },
      ],
    } as SessionConfigOption;

    expect(promptConfigKind(option)).toBe("effort");
    expect(shouldPersistConfigSelection(option)).toBe(true);
  });
});

describe("shouldPersistConfigSelection", () => {
  it("persists the classified prompt-surface kinds: model, effort, and fast", () => {
    const model = selectOption("model", "opus", ["opus", "sonnet"]);
    const effort = selectOption("reasoning_effort", "high", ["low", "high"]);
    const fastSelect = {
      id: "fast_mode",
      type: "select",
      name: "Fast Mode",
      currentValue: "off",
      options: [
        { value: "on", name: "On" },
        { value: "off", name: "Off" },
      ],
    } as SessionConfigOption;
    const fastBoolean = booleanOption("fast_mode", true);

    expect(shouldPersistConfigSelection(model)).toBe(true);
    expect(shouldPersistConfigSelection(effort)).toBe(true);
    expect(shouldPersistConfigSelection(fastSelect)).toBe(true);
    expect(shouldPersistConfigSelection(fastBoolean)).toBe(true);
  });

  it("persists reserved model-tuning categories even when unclassified by promptConfigKind", () => {
    // Temperature-like: no keyword promptConfigKind recognizes, but the
    // category is one of ACP's reserved model-tuning buckets.
    const temperature = {
      id: "temperature",
      type: "select",
      name: "Temperature",
      category: "model_config",
      currentValue: "0.7",
      options: [
        { value: "0.2", name: "0.2" },
        { value: "0.7", name: "0.7" },
      ],
    } as SessionConfigOption;
    // thought_level: promptConfigKind already classifies this as "effort",
    // but it is also directly one of the reserved categories.
    const thoughtLevel = {
      id: "reasoning_scale",
      type: "select",
      name: "Reasoning Scale",
      category: "thought_level",
      currentValue: "tier1",
      options: [
        { value: "tier1", name: "Tier 1" },
        { value: "tier2", name: "Tier 2" },
      ],
    } as SessionConfigOption;

    expect(shouldPersistConfigSelection(temperature)).toBe(true);
    expect(shouldPersistConfigSelection(thoughtLevel)).toBe(true);
  });

  it("does not persist uncategorized or custom-category options an extras surface exposes", () => {
    // Uncategorized, provider-like (e.g. Goose's `provider`).
    const provider = selectOption("provider", "openai", ["openai", "anthropic"]);
    // Custom/unknown category (e.g. Claude's `agent` persona).
    const persona = {
      id: "agent",
      type: "select",
      name: "Agent",
      category: "_custom",
      currentValue: "default",
      options: [
        { value: "default", name: "Default" },
        { value: "careful", name: "Careful" },
      ],
    } as SessionConfigOption;

    expect(shouldPersistConfigSelection(provider)).toBe(false);
    expect(shouldPersistConfigSelection(persona)).toBe(false);
  });

  it("never persists mode/collaboration options, even one that bizarrely carries a safe category", () => {
    const permissionMode = selectOption("permission_mode", "default", ["default", "yolo"]);
    const collaboration = {
      id: "collaboration_mode",
      type: "select",
      name: "Collaboration mode",
      currentValue: "build",
      options: [
        { value: "build", name: "Build" },
        { value: "plan", name: "Plan" },
      ],
    } as SessionConfigOption;
    // Mode-shaped by its "mode" name token, but tagged with a reserved
    // model-tuning category — mode-kind must still win.
    const modeWithSafeCategory = {
      id: "agent_mode",
      type: "select",
      name: "Agent Mode",
      category: "model_config",
      currentValue: "build",
      options: [
        { value: "build", name: "Build" },
        { value: "plan", name: "Plan" },
      ],
    } as SessionConfigOption;

    expect(shouldPersistConfigSelection(permissionMode)).toBe(false);
    expect(shouldPersistConfigSelection(collaboration)).toBe(false);
    expect(shouldPersistConfigSelection(modeWithSafeCategory)).toBe(false);
  });

  it("does not persist other booleans that are not the fast toggle", () => {
    expect(shouldPersistConfigSelection(booleanOption("verbose_logging", true))).toBe(false);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("applyDefaultConfigOptions", () => {
  it("applies stored select values that the option still offers", () => {
    const options = [selectOption("model", "a", ["a", "b"])];
    const next = applyDefaultConfigOptions(options, { model: "b" });
    expect(next[0]).toMatchObject({ id: "model", currentValue: "b" });
  });

  it("ignores select values the option no longer offers", () => {
    const options = [selectOption("model", "a", ["a", "b"])];
    expect(applyDefaultConfigOptions(options, { model: "vanished" })[0]).toBe(options[0]);
  });

  it('applies boolean options from stored "true"/"false" strings', () => {
    const options = [booleanOption("fast", false), booleanOption("verbose", true)];
    const next = applyDefaultConfigOptions(options, { fast: "true", verbose: "false" });
    expect(next[0]).toMatchObject({ id: "fast", type: "boolean", currentValue: true });
    expect(next[1]).toMatchObject({ id: "verbose", type: "boolean", currentValue: false });
  });

  it("ignores malformed boolean values and untouched options", () => {
    const options = [booleanOption("fast", false), selectOption("model", "a", ["a"])];
    const next = applyDefaultConfigOptions(options, { fast: "yes please" });
    expect(next[0]).toBe(options[0]);
    expect(next[1]).toBe(options[1]);
  });

  it("returns the options untouched when there are no stored defaults", () => {
    const options = [booleanOption("fast", false)];
    expect(applyDefaultConfigOptions(options, {})).toBe(options);
  });
});

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("captures select and boolean option values and modeId", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      booleanOption("thinking", true),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      selections: { model: "model-b", permission_mode: "full_access", thinking: true },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("keeps string and boolean selection values and drops the rest", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      selections: { model: "model-a", thinking: false, bad: 42, alsobad: null },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(result).toEqual({ selections: { model: "model-a", thinking: false }, modeId: "plan" });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

describe("mergeConfigSelections", () => {
  it("overlays applicable selections onto the options", () => {
    const options = [
      selectOption("model", "model-b", ["model-a", "model-b"]),
      booleanOption("thinking", false),
    ];

    const merged = mergeConfigSelections(
      options,
      new Map<string, string | boolean>([
        ["model", "model-a"],
        ["thinking", true],
      ]),
    );

    expect(merged[0]).toMatchObject({ id: "model", currentValue: "model-a" });
    expect(merged[1]).toMatchObject({ id: "thinking", currentValue: true });
    // Inputs are not mutated.
    expect(options[0]).toMatchObject({ currentValue: "model-b" });
  });

  it("keeps options whose selection vanished, mismatches, or already matches", () => {
    const options = [
      selectOption("model", "model-b", ["model-b", "model-c"]),
      selectOption("mode", "default", ["default", "plan"]),
      booleanOption("thinking", true),
    ];

    const merged = mergeConfigSelections(
      options,
      new Map<string, string | boolean>([
        ["model", "model-a"], // value the agent no longer offers
        ["mode", "default"], // already current
        ["thinking", "true"], // type mismatch
        ["gone", "anything"], // option no longer exists
      ]),
    );

    expect(merged[0]).toBe(options[0]);
    expect(merged[1]).toBe(options[1]);
    expect(merged[2]).toBe(options[2]);
  });

  it("returns the same array when there are no selections", () => {
    const options = [selectOption("model", "model-a", ["model-a"])];
    expect(mergeConfigSelections(options, new Map())).toBe(options);
  });
});

describe("applySessionConfigSelections", () => {
  function mockConn() {
    return {
      setSessionConfigOption: vi.fn().mockResolvedValue(undefined),
    } as unknown as Pick<ClientSideConnection, "setSessionConfigOption">;
  }

  it("skips selections whose option or value no longer exists", async () => {
    const conn = mockConn();
    const configOptions = [selectOption("model", "model-b", ["model-b", "model-c"])];

    const result = await applySessionConfigSelections({
      conn,
      sessionId: "s-1",
      configOptions,
      selections: new Map<string, string | boolean>([
        ["model", "model-a"], // vanished value
        ["gone", "anything"], // vanished option
      ]),
      isCurrent: () => true,
    });

    expect(conn.setSessionConfigOption).not.toHaveBeenCalled();
    expect(result).toBe(configOptions);
  });

  it("skips selections whose value type no longer matches the option", async () => {
    const conn = mockConn();
    const configOptions = [
      selectOption("model", "model-a", ["model-a", "true"]),
      booleanOption("thinking", false),
    ];

    const result = await applySessionConfigSelections({
      conn,
      sessionId: "s-1",
      configOptions,
      selections: new Map<string, string | boolean>([
        ["model", true],
        ["thinking", "true"],
      ]),
      isCurrent: () => true,
    });

    expect(conn.setSessionConfigOption).not.toHaveBeenCalled();
    expect(result).toBe(configOptions);
  });

  it("re-applies boolean selections with the boolean wire type", async () => {
    const conn = mockConn();

    const result = await applySessionConfigSelections({
      conn,
      sessionId: "s-1",
      configOptions: [booleanOption("thinking", false)],
      selections: new Map<string, string | boolean>([["thinking", true]]),
      isCurrent: () => true,
    });

    expect(conn.setSessionConfigOption).toHaveBeenCalledWith({
      sessionId: "s-1",
      configId: "thinking",
      value: true,
      type: "boolean",
    });
    expect(result?.[0]).toMatchObject({ id: "thinking", currentValue: true });
  });

  it("applies a known selection when the agent omitted the option from its response", async () => {
    const conn = mockConn();
    const configOptions = [selectOption("model", "model-b", ["model-a", "model-b"])];

    const result = await applySessionConfigSelections({
      conn,
      sessionId: "s-1",
      configOptions,
      reportedConfigOptions: [],
      selections: new Map<string, string | boolean>([["model", "model-b"]]),
      isCurrent: () => true,
    });

    expect(conn.setSessionConfigOption).toHaveBeenCalledWith({
      sessionId: "s-1",
      configId: "model",
      value: "model-b",
    });
    expect(result).toEqual(configOptions);
  });
});
