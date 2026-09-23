import { describe, expect, it } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  agentIconUrl,
  agentName,
  agentPickerIconProps,
  agentPickerIconUrl,
  agentPickerOverlayIconUrl,
  agentServerOptions,
  isClaudeAgent,
  selectedAgentServer,
  shouldResetSessionForAgentSelection,
} from "./agentConfig";

__POOL_SYNTHETIC_IMPORT_BASELINE__
  return {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    sessionAgentServer: "poolside",
    ...overrides,
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function registry(
  agents: Record<string, { id?: string; name: string } | string>,
): AcpAgentRegistryRepository {
  return {
    getAgent: (id: string) => {
      const agent = agents[id];
      return typeof agent === "string" ? { name: agent } : agent;
    },
  } as AcpAgentRegistryRepository;
}

describe("agent config menu helpers", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  it("uses Poolside and registry display names for agent labels", () => {
    const agents = registry({ codex: "Codex CLI" });

    expect(agentName(agents, "poolside")).toBe("Poolside");
    expect(agentName(agents, "local")).toBe("Poolside Local");
    expect(agentName(agents, "codex")).toBe("Codex CLI");
    expect(agentName(agents, "unknown")).toBe("unknown");
  });

  it("returns picker-only brand colours for Poolside and Anthropic agent icons", () => {
    const agents = registry({
      aliasedClaude: { id: "claude-acp", name: "Claude Agent" },
      codex: { id: "codex-acp", name: "Codex" },
    });

    expect(agentPickerIconProps(agents, "poolside")).toEqual({ class: "text-psx-vibrant" });
    expect(agentPickerIconProps(agents, "local")).toMatchObject({
      class: "text-psx-vibrant",
      overlayClass: "text-psx-foreground-tertiary",
    });
    expect(agentPickerIconProps(agents, "claude-acp")).toEqual({ class: "text-[#d97757]" });
    expect(agentPickerIconProps(agents, "aliasedClaude")).toEqual({
      class: "text-[#d97757]",
    });
    expect(agentPickerIconProps(agents, "codex")).toEqual({ class: "" });
    expect(agentPickerIconUrl(agents, "local")).not.toBe(agentIconUrl(agents, "local"));
  });

  it("exposes the local agent's badge overlay for native menu rasterization", () => {
    const agents = registry({ codex: { id: "codex-acp", name: "Codex" } });

    // The same overlay the DOM picker stacks over the roundel, so the native
    // menu composites an identical icon.
    expect(agentPickerOverlayIconUrl("local")).toBe(
      agentPickerIconProps(agents, "local").overlayIconUrl,
    );
    expect(agentPickerOverlayIconUrl("local")).toMatch(/^data:image\/svg\+xml,/);
    expect(agentPickerOverlayIconUrl("poolside")).toBeUndefined();
    expect(agentPickerOverlayIconUrl("codex")).toBeUndefined();
  });

  it("identifies Claude by server key or registry agent id", () => {
    const agents = registry({
      aliasedClaude: { id: "claude-acp", name: "Claude Agent" },
      codex: { id: "codex-acp", name: "Codex" },
    });

    expect(isClaudeAgent(agents, "claude-acp")).toBe(true);
    expect(isClaudeAgent(agents, "aliasedClaude")).toBe(true);
    expect(isClaudeAgent(agents, "codex")).toBe(false);
    expect(isClaudeAgent(agents, "unknown")).toBe(false);
  });

  it("resets the current draft when switching away from the selected session agent", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    ).toBe(true);
  });
});
