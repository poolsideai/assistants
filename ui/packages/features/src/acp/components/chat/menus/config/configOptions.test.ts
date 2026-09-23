__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  configValueAppearance,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  effortValueName,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  hasValueDescriptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  modeIconClass,
  orderClaudeModelValues,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  valueDescription,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Mistral Vibe and Goose ship a bare "thinking" id/name for the same
    // reasoning-depth control ("thinking_effort" already matched via the
    // "effort" token, and camelCase splitting means "thinkingEffort" does
    // too — this covers the bare word).
    expect(promptConfigKind(select("thinking"))).toBe("effort");
    expect(promptConfigKind(onOffSelect("level", "Thinking", "off"))).toBe("effort");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("keeps the collaboration mode apart from the approval mode", () => {
    // Codex and Poolside give the option different ids, and both names carry
    // the "mode" token — only the category tells the two selectors apart.
    expect(promptConfigKind(select("collaboration_mode", "collaboration_mode"))).toBe(
      "collaboration",
    );
    expect(promptConfigKind(select("agent_mode", "collaboration_mode"))).toBe("collaboration");
    // The approval option alongside it still classifies as the mode selector.
    expect(promptConfigKind(select("mode", "mode"))).toBe("mode");
  });

  it("falls back to the canonical collaboration identity when category is missing", () => {
    expect(promptConfigKind(select("collaboration_mode"))).toBe("collaboration");
    // An agent_mode option without the category is indistinguishable from an
    // approval mode by name, so it keeps the existing classification.
    expect(promptConfigKind(select("agent_mode"))).toBe("mode");
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Booleans only ever classify as "fast" (checked first); a "thinking"
    // boolean has no effort magnitude to render, so it stays unclassified
    // rather than picking up the new "thinking" effort token.
    expect(promptConfigKind(boolean("thinking"))).toBeNull();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("valueDescription", () => {
  it("returns the agent's description of a value", () => {
    expect(
      valueDescription({
        value: "opus",
        name: "Opus",
        description: "Opus 5 · Best for everyday, complex tasks",
      }),
    ).toBe("Opus 5 · Best for everyday, complex tasks");
  });

  it("drops a description that only repeats the name", () => {
    // Poolside publishes every model with its own name as the description;
    // rendering it as subtext would print the same string twice.
    expect(
      valueDescription({
        value: "anthropic/claude-opus-5",
        name: "anthropic/claude-opus-5",
        description: "anthropic/claude-opus-5",
      }),
    ).toBeNull();
    expect(valueDescription({ value: "a", name: "Plan", description: " plan " })).toBeNull();
  });

  it("treats missing and blank descriptions alike", () => {
    expect(valueDescription({ value: "a", name: "Low" })).toBeNull();
    expect(valueDescription({ value: "a", name: "Low", description: "   " })).toBeNull();
    expect(valueDescription({ value: "a", name: "Low", description: null })).toBeNull();
  });

  it("reports whether any value in a list carries subtext", () => {
    expect(
      hasValueDescriptions([
        { value: "a", name: "A", description: "A" },
        { value: "b", name: "B", description: "Does something" },
      ]),
    ).toBe(true);
    expect(hasValueDescriptions([{ value: "a", name: "A", description: "A" }])).toBe(false);
    expect(hasValueDescriptions([])).toBe(false);
  });
});

describe("orderClaudeModelValues", () => {
  it("orders models default first, then Fable, Opus, Sonnet, Haiku", () => {
    const ordered = orderClaudeModelValues([
      { value: "claude-haiku-4-5", name: "Haiku 4.5" },
      { value: "claude-sonnet-5", name: "Sonnet 5" },
      { value: "claude-opus-4-8", name: "Opus 4.8" },
      { value: "default", name: "Default (recommended)" },
      { value: "claude-fable-5", name: "Fable 5" },
    ]);

    expect(ordered.map((value) => value.value)).toEqual([
      "default",
      "claude-fable-5",
      "claude-opus-4-8",
      "claude-sonnet-5",
      "claude-haiku-4-5",
    ]);
  });

  it("keeps the agent order within a family and puts unknown families last", () => {
    const ordered = orderClaudeModelValues([
      { value: "claude-mystery-6", name: "Mystery 6" },
      { value: "claude-fable-5[1m]", name: "Fable 5 (1M context)" },
      { value: "claude-opus-4-8", name: "Opus 4.8" },
      { value: "claude-fable-5", name: "Fable 5" },
    ]);

    expect(ordered.map((value) => value.value)).toEqual([
      "claude-fable-5[1m]",
      "claude-fable-5",
      "claude-opus-4-8",
      "claude-mystery-6",
    ]);
  });

  it("recognizes a family by display name when the value is opaque", () => {
    const ordered = orderClaudeModelValues([
      { value: "model-b", name: "Sonnet 5" },
      { value: "model-a", name: "Opus 4.8" },
    ]);

    expect(ordered.map((value) => value.name)).toEqual(["Opus 4.8", "Sonnet 5"]);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const modes = [
    // Poolside
    { name: "Always ask", value: "read-only", category: "normal", icon: "ask" },
    { name: "Accept edits", value: "acceptEdits", category: "normal", icon: "apply" },
    { name: "Plan", value: "plan", category: "plan", icon: "plan" },
    {
      name: "Allow all",
      value: "always-allow",
      category: "dangerous",
      icon: "fast-forward",
    },
    // Claude
    { name: "Auto", value: "auto", category: "auto", icon: "shield" },
    { name: "Default", value: "default", category: "normal", icon: "ask" },
    { name: "Accept Edits", value: "accept-edits", category: "normal", icon: "apply" },
    { name: "Plan Mode", value: "planMode", category: "plan", icon: "plan" },
    { name: "Don't Ask", value: "dontAsk", category: "restricted", icon: "block" },
    {
      name: "Bypass Permissions",
      value: "bypassPermissions",
      category: "dangerous",
      icon: "fast-forward",
    },
    // Codex
    { name: "Read-only", value: "read-only", category: "restricted", icon: "block" },
    {
      name: "Agent",
      value: "workspace-write",
      category: "auto",
      icon: "shield",
    },
    {
      name: "Agent (full access)",
      value: "danger-full-access",
      category: "dangerous",
      icon: "fast-forward",
    },
  ] as const;

  it("maps every Poolside, Claude, and Codex mode to the approved category and icon", () => {
    for (const mode of modes) {
      const option = selectWith("mode", "mode", mode.value, [
        { value: mode.value, name: mode.name },
      ]);
      const appearance = modeAppearance(option);

      expect(appearance.category, mode.name).toBe(mode.category);
      expect(appearance.icon, mode.name).toBe(mode.icon);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("colours only Dangerous mode icons, leaving Auto neutral", () => {
    const dangerous = modeAppearance(
      selectWith("mode", "mode", "full-access", values("full-access")),
    );
    const auto = modeAppearance(selectWith("mode", "mode", "auto", values("auto")));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(modeIconClass(dangerous)).toContain("rose");
    expect(modeIconClass(auto)).toBe("");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("uses display names to distinguish agents that reuse the same wire value", () => {
    const poolside = selectWith("mode", "mode", "read-only", [
      { value: "read-only", name: "Always ask" },
    ]);
    const codex = selectWith("mode", "mode", "read-only", [
      { value: "read-only", name: "Read-only" },
    ]);

    expect(modeAppearance(poolside)).toMatchObject({ category: "normal", icon: "ask" });
    expect(modeAppearance(codex)).toMatchObject({ category: "restricted", icon: "block" });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("gives unknown modes a neutral generic icon without guessing a category", () => {
    const appearance = modeAppearance(
      selectWith("mode", "mode", "something-new", values("something-new")),
    );
    expect(appearance).toEqual({ category: null, icon: "config" });
__POOL_SYNTHETIC_IMPORT_BASELINE__
});
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("configValueAppearance", () => {
  it("preserves category icons for non-mode config values", () => {
    expect(configValueAppearance(select("model", "model"), "a")).toEqual({
      icon: "sparkles",
      category: null,
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__

  it("pairs the collaboration modes' plan and build glyphs", () => {
    const poolside = selectWith("agent_mode", "collaboration_mode", "build", [
      { value: "build", name: "Build" },
      { value: "plan", name: "Plan" },
    ]);
    const codex = selectWith("collaboration_mode", "collaboration_mode", "default", [
      { value: "default", name: "Default" },
      { value: "plan", name: "Plan" },
    ]);

    expect(configValueAppearance(poolside, "build")).toEqual({ category: null, icon: "code" });
    expect(configValueAppearance(poolside, "plan")).toEqual({ category: "plan", icon: "plan" });
    // Codex's non-plan value shares the permission taxonomy's "default" wire
    // value but means "carry out the work", not "prompt on first use".
    expect(configValueAppearance(codex, "default")).toEqual({ category: null, icon: "code" });
    expect(configValueAppearance(codex, "plan")).toEqual({ category: "plan", icon: "plan" });
  });

  it("leaves unknown collaboration values neutral", () => {
    const option = selectWith("collaboration_mode", "collaboration_mode", "review", [
      { value: "review", name: "Review" },
    ]);
    expect(configValueAppearance(option, "review")).toEqual({ category: null, icon: "config" });
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
    expect(bars?.levels.map((l) => l.name)).toEqual(["Low", "Medium", "High", "Extra High", "Max"]);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(bars?.auto?.name).toBe("Default");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("uses signal bars for Claude models that do not support xhigh", () => {
    const option = selectWith(
      "effort",
      "thought_level",
      "default",
      values("default", "low", "medium", "high", "max"),
    );
    const bars = effortBars(option);
    expect(bars?.levels.map((l) => l.name)).toEqual(["Low", "Medium", "High", "Max"]);
    expect(bars?.levels.map((l) => l.filled)).toEqual([1, 2, 3, 4]);
    expect(bars?.total).toBe(4);
    expect(bars?.auto).toEqual({ value: "default", name: "Default" });
    expect(bars?.isAuto).toBe(true);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(bars?.levels.map((l) => l.name)).toEqual(["Light", "Medium", "High", "Extra High"]);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("uses signal bars and the requested labels for current Codex effort options", () => {
    const option = selectWith(
      "reasoning_effort",
      "thought_level",
      "ultra",
      values("low", "medium", "high", "xhigh", "max", "ultra"),
    );
    const bars = effortBars(option);
    expect(bars?.levels.map((l) => l.value)).toEqual(["low", "medium", "high", "xhigh", "ultra"]);
    expect(bars?.levels.map((l) => l.name)).toEqual([
      "Light",
      "Medium",
      "High",
      "Extra High",
      "Ultra",
    ]);
    expect(bars?.levels.map((l) => l.filled)).toEqual([1, 2, 3, 4, 5]);
    expect(bars?.total).toBe(5);
    expect(bars?.activeFilled).toBe(5);
    expect(bars?.activeValue).toBe("ultra");
    expect(effortValueName(option)).toBe("Ultra");
  });

  it("folds a selected Codex max value into the visible Ultra tier", () => {
    const option = selectWith(
      "reasoning_effort",
      "thought_level",
      "max",
      values("low", "medium", "high", "xhigh", "max", "ultra"),
    );
    const bars = effortBars(option);
    expect(bars?.activeFilled).toBe(5);
    expect(bars?.activeValue).toBe("ultra");
    expect(effortValueName(option)).toBe("Ultra");
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
