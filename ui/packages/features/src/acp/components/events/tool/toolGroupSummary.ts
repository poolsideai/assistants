import type { TurnMetadata } from "../../../TurnMaterializer";
import type { ToolCall } from "../../../types";
import type { SessionEventGroupItem } from "../../SessionEventsState.svelte";
import { getDiffPath, getLocationPath, getRawInputPath } from "../../shared/toolPaths";
import { isExecCommandToolCall } from "./execCommandTool";
import { isMcpToolCall, isSkillToolCall } from "./toolCategory";

type ToolCallKind = NonNullable<ToolCall["kind"]>;

/**
 * The category a tool is counted under in a group label — broader than ACP's
 * ToolCallKind so recognized MCP tools and skills read as themselves instead of
 * masquerading as shell commands.
 */
type ToolGroupKind = ToolCallKind | "mcp" | "skill";

const EDIT_KINDS = new Set<ToolCall["kind"]>(["edit", "delete", "move"]);

export function summarizeToolGroup(events: SessionEventGroupItem[], turn?: TurnMetadata): string {
  const tools = events
    .map((item) => item.event)
    .filter((event): event is ToolCall => event.eventKind === "tool_call");
  const editedFiles = new Set<string>();
  let commandCount = 0;
  let mcpCount = 0;
  let skillCount = 0;

  for (const tool of tools) {
    if (EDIT_KINDS.has(tool.kind)) {
      for (const path of getEditedPaths(tool)) {
        editedFiles.add(path);
      }
      // Counted as an edit; don't also tally it as a command/MCP/skill. Without
      // this, an edit-kind MCP/skill tool lands in two categories at once.
      continue;
    }
    // MCP tools and skills are broken out from the command count so the summary
    // reads "…, used 2 MCP tools" rather than lumping them into "ran N commands".
    if (isMcpToolCall(tool)) {
      mcpCount++;
    } else if (isSkillToolCall(tool)) {
      skillCount++;
    } else if (isExecCommandToolCall(tool) || tool.kind === "execute") {
      commandCount += commandInvocationCount(tool);
    }
  }

  const parts: string[] = [];
  const duration = formatDuration(turn?.startedAt, turn?.endedAt);
  if (turn?.interrupted) {
    parts.push(duration ? `Interrupted after ${duration}` : "Interrupted");
  } else if (duration) {
    parts.push(`Worked for ${duration}`);
  }
  if (editedFiles.size > 0) parts.push(`edited ${countOf(editedFiles.size, "file")}`);
  if (commandCount > 0) parts.push(`ran ${countOf(commandCount, "command")}`);
  if (mcpCount > 0) parts.push(`used ${countOf(mcpCount, "MCP tool")}`);
  if (skillCount > 0) parts.push(`used ${countOf(skillCount, "skill")}`);

  // Every count was zero and the turn had no duration (e.g. a group of only
  // read/search tools): fall back to a plain step count like the live label —
  // "think" filler stays out of the count unless it is all there is, matching
  // how the live label filters think steps from mixed groups.
  if (parts.length === 0) {
    const realSteps = tools.filter((tool) => tool.kind !== "think").length;
    return sentenceCase(countOf(realSteps > 0 ? realSteps : tools.length, "step"));
  }

  return sentenceCase(parts.join(", "));
}

/**
 * Label for a group formed while the turn streams — "grouped" mode folds each
 * run of completed tools, "compact" folds the whole turn — e.g. "Read 2 files,
 * searched once, ran 1 command". File counts dedupe by path so re-reading a
 * file does not inflate the number; tools with no recognizable path count
 * individually.
 */
export function summarizeLiveToolGroup(events: SessionEventGroupItem[]): string {
  const tools = toolCalls(events);
  const parts = LIVE_SUMMARY_KIND_ORDER.map((kind) => {
    const kindTools = tools.filter(
      (tool) => tool.kind === kind && !isMcpToolCall(tool) && !isSkillToolCall(tool),
    );
    return kindTools.length > 0 ? kindPhrase(kind, kindTools) : null;
  }).filter((part): part is string => part !== null);
  const mcpTools = tools.filter(isMcpToolCall);
  const skillTools = tools.filter(isSkillToolCall);
  if (mcpTools.length > 0) parts.push(kindPhrase("mcp", mcpTools));
  if (skillTools.length > 0) parts.push(kindPhrase("skill", skillTools));
  // "think" steps are filler and stay out of the label; any other unrecognized
  // tool is tallied so the line never silently understates what happened.
  const leftovers = tools.filter(
    (tool) =>
      tool.kind !== "think" &&
      !isMcpToolCall(tool) &&
      !isSkillToolCall(tool) &&
      (!tool.kind || !LIVE_SUMMARY_KIND_SET.has(tool.kind)),
  ).length;
  if (leftovers > 0) parts.push(countOf(leftovers, "other step"));
  if (parts.length === 0) return countOf(tools.length, "step");
  return sentenceCase(parts.join(", "));
}

const LIVE_SUMMARY_KIND_ORDER: ToolCallKind[] = [
  "read",
  "search",
  "edit",
  "delete",
  "move",
  "execute",
  "fetch",
];
const LIVE_SUMMARY_KIND_SET = new Set<ToolCallKind>(LIVE_SUMMARY_KIND_ORDER);

function toolCalls(events: SessionEventGroupItem[]): ToolCall[] {
  return events
    .map((item) => item.event)
    .filter((event): event is ToolCall => event.eventKind === "tool_call");
}

function kindPhrase(kind: ToolGroupKind, tools: ToolCall[]): string {
  switch (kind) {
    case "read":
      return `read ${countOf(distinctTargetCount(tools), "file")}`;
    case "edit":
      return `edited ${countOf(distinctTargetCount(tools), "file")}`;
    case "delete":
      return `deleted ${countOf(distinctTargetCount(tools), "file")}`;
    case "move":
      return `moved ${countOf(distinctTargetCount(tools), "file")}`;
    case "search":
      return tools.length === 1 ? "searched once" : `searched ${tools.length} times`;
    case "execute": {
      const commands = tools.reduce((sum, tool) => sum + commandInvocationCount(tool), 0);
      return `ran ${countOf(commands, "command")}`;
    }
    case "fetch":
      return `fetched ${countOf(tools.length, "page")}`;
    case "mcp":
      return `used ${countOf(tools.length, "MCP tool")}`;
    case "skill":
      return `used ${countOf(tools.length, "skill")}`;
    default:
      return countOf(tools.length, "step");
  }
}

function distinctTargetCount(tools: ToolCall[]): number {
  const paths = new Set<string>();
  let pathless = 0;
  for (const tool of tools) {
    const targets = getEditedPaths(tool);
    if (targets.length > 0) {
      for (const path of targets) paths.add(path);
    } else {
      pathless++;
    }
  }
  return paths.size + pathless;
}

function countOf(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

function getEditedPaths(tool: ToolCall): string[] {
  const paths = new Set<string>();
  for (const path of [getLocationPath(tool), getDiffPath(tool), getRawInputPath(tool)]) {
    if (path) paths.add(path);
  }
  for (const item of tool.content ?? []) {
    if (item.type === "diff" && item.path) paths.add(item.path);
  }
  return [...paths];
}

function commandInvocationCount(tool: ToolCall): number {
  const rawInput = asRecord(tool.rawInput);
  const commands = rawInput?.commands;
  if (Array.isArray(commands)) {
    const count = commands.filter((item) => typeof item === "string" && item.length > 0).length;
    if (count > 0) return count;
  }
  return 1;
}

function formatDuration(startedAt: string | undefined, endedAt: string | undefined): string | null {
  if (!startedAt || !endedAt) return null;
  const started = Date.parse(startedAt);
  const ended = Date.parse(endedAt);
  if (!Number.isFinite(started) || !Number.isFinite(ended) || ended <= started) return null;
  const minutes = Math.max(1, Math.round((ended - started) / 60_000));
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  return value as Record<string, unknown>;
}
