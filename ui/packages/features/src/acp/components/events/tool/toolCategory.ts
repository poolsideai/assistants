__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * MCP-hosted tools report either:
 * - a namespaced tool name through `_meta` (see {@link getToolName}):
 *   `<server>__<tool>` for the Pool agent and `mcp__<server>__<tool>` for
 *   Claude Code; or
 * - an agent-owned dotted title such as
 *   `mcp.codex_apps.github.create_pull_request`.
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * The metadata form uses "__", which no built-in tool name contains. The
 * title form must contain both a server namespace and a final tool segment, so
 * ordinary names such as `mcp.json` are not claimed.
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function getMcpToolName(tool: ToolCall): string | undefined {
  const metadataName = getToolName(tool);
  if (metadataName?.includes("__")) return metadataName;

  const title = tool.title?.trim();
  return title && /^mcp\.[\w-]+(?:\.[\w-]+)+$/i.test(title) ? title : undefined;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  return getMcpToolName(tool) !== undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
