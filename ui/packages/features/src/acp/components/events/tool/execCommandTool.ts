import type { ToolCall } from "../../../types";
__POOL_SYNTHETIC_IMPORT_BASELINE__

export function isExecCommandToolCall(tool: ToolCall): boolean {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const title = tool.title?.toLowerCase();
  if (title === "exec_command") return true;

  if (tool.kind !== "execute" && tool.kind !== "other") return false;
  return getExecCommand(tool) != null;
}

export function getExecCommand(tool: ToolCall): string | undefined {
  if (typeof tool.rawInput === "string" && tool.rawInput.length > 0) return tool.rawInput;

  const rawInput = asRecord(tool.rawInput);
  const command = rawInput?.cmd ?? rawInput?.command;
  if (typeof command === "string" && command.length > 0) return command;

  const parsedCommand = getParsedCommand(rawInput?.parsed_cmd);
  if (parsedCommand) return parsedCommand;

  const shellCommand = getShellCommand(command);
  if (shellCommand) return shellCommand;

  return tool.title === "Run" || tool.title === "exec_command" ? undefined : tool.title;
}

export function getExecOutput(tool: ToolCall): string | undefined {
  const rawOutput = asRecord(tool.rawOutput);
  const output =
    rawOutput?.stdout ??
    rawOutput?.formatted_output ??
    rawOutput?.aggregated_output ??
    rawOutput?.stderr ??
    rawOutput?.output ??
    rawOutput?.observation;
  if (typeof output === "string" && output.length > 0) return stripWrappingCodeFence(output);

  const content = tool.content
    ?.map((item) => {
      if (item.type !== "content") return;
      const block = item.content;
      if (block.type === "text") return block.text;
    })
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .join("\n");

  if (content) return stripWrappingCodeFence(content);

  if (tool.rawOutput != null) {
    return typeof tool.rawOutput === "string"
      ? stripWrappingCodeFence(tool.rawOutput)
      : JSON.stringify(tool.rawOutput, null, 2);
  }
}

/**
 * Some agents wrap the whole command output in a markdown code fence (e.g.
 * ```console … ```). The output is rendered verbatim, not as markdown, so the
 * fence would show up as literal backtick lines — drop it when it wraps the
 * entire output, and keep the output untouched otherwise.
 */
export function stripWrappingCodeFence(output: string): string {
  const lines = output.trim().split("\n");
  if (lines.length < 2) return output;

  const opening = /^(`{3,})[^`\s]*\s*$/.exec(lines[0]);
  if (!opening) return output;
  const closing = /^(`{3,})\s*$/.exec(lines[lines.length - 1]);
  if (!closing || closing[1].length < opening[1].length) return output;

  // An interior line that could close the opening fence means the first and
  // last lines delimit different fenced blocks within the output (e.g. a grep
  // over markdown files), not one fence wrapping the whole thing.
  const interior = lines.slice(1, -1);
  const closesOpeningFence = (line: string) => {
    const match = /^(`{3,})\s*$/.exec(line);
    return match != null && match[1].length >= opening[1].length;
  };
  if (interior.some(closesOpeningFence)) return output;

  return interior.join("\n");
}

function getParsedCommand(value: unknown): string | undefined {
  if (!Array.isArray(value)) return;

  for (const item of value) {
    const parsed = asRecord(item);
    const cmd = parsed?.cmd;
    if (typeof cmd === "string" && cmd.length > 0) return cmd;
  }
}

function getShellCommand(value: unknown): string | undefined {
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === "string")) {
    return;
  }

  const shellFlagIndex = value.findIndex((part) => part === "-c" || part === "-lc");
  if (shellFlagIndex >= 0) {
    return value[shellFlagIndex + 1];
  }

  return value.length > 0 ? value.join(" ") : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  return value as Record<string, unknown>;
}
