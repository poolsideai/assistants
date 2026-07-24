import type { ToolCall } from "../../../types";
import { getToolName } from "../../shared/toolPaths";

/**
 * MCP-hosted tools report either:
 * - a namespaced tool name through `_meta` (see {@link getToolName}):
 *   `<server>__<tool>` for the Pool agent and `mcp__<server>__<tool>` for
 *   Claude Code; or
 * - an agent-owned dotted title such as
 *   `mcp.codex_apps.github.create_pull_request`.
 *
 * The metadata form uses "__", which no built-in tool name contains. The
 * title form must contain both a server namespace and a final tool segment, so
 * ordinary names such as `mcp.json` are not claimed.
 */
export function getMcpToolName(tool: ToolCall): string | undefined {
  const metadataName = getToolName(tool);
  if (metadataName?.includes("__")) return metadataName;

  const title = tool.title?.trim();
  return title && /^mcp\.[\w-]+(?:\.[\w-]+)+$/i.test(title) ? title : undefined;
}

export function isMcpToolCall(tool: ToolCall): boolean {
  return getMcpToolName(tool) !== undefined;
}

/**
 * Agent skill invocations. Identified by the canonical `_meta.tool_name`
 * ("skill" for the Pool agent, "Skill" → "skill" for Claude Code), never the
 * free-form title (which is "Skill: `<name>`"). Skills also arrive as kind
 * "execute" from the Pool agent.
 */
export function isSkillToolCall(tool: ToolCall): boolean {
  return getToolName(tool) === "skill";
}
