import { getFilenameFromPath } from "../../shared/paths";
import type { ToolCall, ToolCallDiffContent } from "../../types";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function fromArray(values: unknown): string | undefined {
  if (!Array.isArray(values)) return;
  return values.find((value) => typeof value === "string" && value.length > 0) as
    | string
    | undefined;
}

export function getLocationPath(tool: ToolCall): string | undefined {
  return tool.locations?.find((location) => location.path)?.path;
}

export function getDiffPath(tool: ToolCall): string | undefined {
  const diff = tool.content?.find((item) => item.type === "diff");
  return diff?.type === "diff" ? diff.path : undefined;
}

export function getRawInputPath(tool: ToolCall): string | undefined {
  const rawInput = asRecord(tool.rawInput);
  if (!rawInput) return;

  const directPath = [
    rawInput.path,
    rawInput.file_path,
    rawInput.filePath,
    rawInput.cwd,
    rawInput.toPath,
    rawInput.to_path,
    rawInput.destination,
    rawInput.destinationPath,
    rawInput.target,
    rawInput.targetPath,
  ]
    .map(asString)
    .find(Boolean);

  if (directPath) return directPath;

  const arrayPath = [rawInput.paths, rawInput.files, rawInput.uris].map(fromArray).find(Boolean);
  if (arrayPath) return arrayPath;

  const nestedPath = [rawInput.file, rawInput.location, rawInput.resource]
    .map(asRecord)
    .flatMap((value) => [value?.path, value?.uri])
    .map(asString)
    .find(Boolean);

  return nestedPath;
}

export function getToolPath(tool: ToolCall): string | undefined {
  return getLocationPath(tool) ?? getDiffPath(tool) ?? getRawInputPath(tool);
}

/**
 * The full file contents a write/create tool is writing, read from its raw
 * input. A completed write's `content` only carries a short "Created file …"
 * summary (the materializer overwrites the initial block on completion), so the
 * raw input is the reliable source for showing what was actually written.
 */
export function getWrittenFileContents(tool: ToolCall): string | undefined {
  const rawInput = asRecord(tool.rawInput);
  if (!rawInput) return;
  return [rawInput.contents, rawInput.content, rawInput.text].map(asString).find(Boolean);
}

/**
 * Canonical tool ids (see {@link getToolName}) that list a directory's contents.
 * They arrive with ACP `kind: "read"` — the protocol has no dedicated "list"
 * kind — so without this the UI would render them as plain file reads. Extend
 * the set as agents expose equivalent directory-listing tools.
 */
const DIRECTORY_LISTING_TOOL_NAMES = new Set<string>(["list_directory"]);

/**
 * Aliases that fold an agent's tool name onto the canonical id the override
 * tables key off. Most names canonicalize by lowercasing alone (`Write` →
 * `write`, `Read` → `read`); add an entry only when agents disagree on the name
 * — e.g. Claude Code's directory lister is `LS` where Pool's is `list_directory`.
 */
const TOOL_NAME_ALIASES: Record<string, string> = {
  ls: "list_directory",
};

/**
 * The agent-reported tool name, normalized to a canonical lowercase id so the
 * override tables below key off a single spelling regardless of agent. Pool
 * exposes it at `_meta.tool_name` (snake_case); Claude Code nests it under
 * `_meta.claudeCode.toolName` (PascalCase). So a Pool `write` and a Claude
 * `Write` both resolve to `write`, and the same override applies to each.
 */
export function getToolName(tool: ToolCall): string | undefined {
  const meta = asRecord(tool._meta);
  if (!meta) return undefined;
  const raw = asString(meta.tool_name) ?? asString(asRecord(meta.claudeCode)?.toolName);
  if (raw === undefined) return undefined;
  const canonical = raw.toLowerCase();
  return TOOL_NAME_ALIASES[canonical] ?? canonical;
}

/**
 * Whether this tool call lists a directory rather than reading a file. ACP
 * reports it as `kind: "read"`, so it is distinguished only by its tool name
 * ({@link getToolName}, preserved across status updates by the materializer's
 * `_meta` merge).
 */
export function isDirectoryListing(tool: ToolCall): boolean {
  const name = getToolName(tool);
  return name !== undefined && DIRECTORY_LISTING_TOOL_NAMES.has(name);
}

/**
 * Canonical tool ids ({@link getToolName}) that write a whole file (create or
 * overwrite). ACP reports them as `kind: "edit"`; we surface the written
 * contents in the body since the completion message is only a short summary.
 */
const FILE_WRITE_TOOL_NAMES = new Set<string>(["write"]);

/** Whether this tool call writes a whole file's contents (create/overwrite). */
export function isFileWrite(tool: ToolCall): boolean {
  const name = getToolName(tool);
  return name !== undefined && FILE_WRITE_TOOL_NAMES.has(name);
}

/**
 * A synthetic new-file diff for a write/create tool, built from the contents in
 * its raw input (old text empty). On completion the agent replaces the diff
 * `content` block with a short "Created file …" summary, so deriving from the
 * raw input keeps both the header's diff stats and the body stable across the
 * tool's whole lifecycle instead of flickering off when that block disappears.
 */
export function getWrittenFileDiff(tool: ToolCall): ToolCallDiffContent | undefined {
  if (!isFileWrite(tool)) return undefined;
  const contents = getWrittenFileContents(tool);
  if (contents === undefined) return undefined;
  return { type: "diff", path: getToolPath(tool) ?? "", oldText: "", newText: contents };
}

/**
 * Header label overrides keyed by the canonical tool id ({@link getToolName}),
 * for tools whose ACP `kind` is too coarse — e.g. a file `write` arrives as
 * `kind: "edit"` (so creating a file reads as "Edit"), and a `list_directory`
 * arrives as `kind: "read"`. Extend as agents expose more specific tool names.
 */
const TOOL_NAME_LABELS: Record<string, string> = {
  list_directory: "List",
  write: "Create",
};

/** A display label derived from `_meta.tool_name`, when it should override the
 *  generic `kind` label (see {@link TOOL_NAME_LABELS}). */
export function getToolNameLabel(tool: ToolCall): string | undefined {
  const name = getToolName(tool);
  return name ? TOOL_NAME_LABELS[name] : undefined;
}

/**
 * Filename prefix the Pool agent binary uses when it spills an oversized MCP
 * tool result to `$TMPDIR/pool_mcp_output_<tool call id>` and reads it back
 * with a `read` tool call. The prefix is defined by the agent binary, not
 * this repo — keep it in sync if that changes.
 */
const MCP_OUTPUT_FILE_PREFIX = "pool_mcp_output_";

/**
 * Whether a path is one of those agent-generated MCP output temp files. A
 * matched read renders with a friendly "MCP tool output" name in the header
 * instead of the raw temp path, which otherwise reads as alarming.
 */
export function isMcpOutputFilePath(path: string): boolean {
  return getFilenameFromPath(path).startsWith(MCP_OUTPUT_FILE_PREFIX);
}
