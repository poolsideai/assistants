import type { ToolCall } from "../../../types";

export function isWriteStdinToolCall(tool: ToolCall): boolean {
  return tool.title?.toLowerCase() === "write_stdin";
}

export function getWriteStdinSessionId(tool: ToolCall): string | undefined {
  const rawInput = asRecord(tool.rawInput);
  const sessionId = rawInput?.session_id;
  if (typeof sessionId === "string" && sessionId.length > 0) return sessionId;
  if (typeof sessionId === "number") return String(sessionId);
}

export function getWriteStdinInput(tool: ToolCall): string | undefined {
  const rawInput = asRecord(tool.rawInput);
  const chars = rawInput?.chars;
  return typeof chars === "string" && chars.length > 0 ? chars : undefined;
}

export function getWriteStdinOutput(tool: ToolCall): string | undefined {
  if (typeof tool.rawOutput === "string" && tool.rawOutput.length > 0) return tool.rawOutput;

  const rawOutput = asRecord(tool.rawOutput);
  const output =
    rawOutput?.stdout ??
    rawOutput?.formatted_output ??
    rawOutput?.aggregated_output ??
    rawOutput?.stderr ??
    rawOutput?.output ??
    rawOutput?.observation;
  if (typeof output === "string" && output.length > 0) return output;

  if (tool.rawOutput != null) return JSON.stringify(tool.rawOutput, null, 2);

  const content = tool.content
    ?.map((item) => {
      if (item.type !== "content") return;
      const block = item.content;
      if (block.type === "text") return block.text;
    })
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .join("\n");

  return content || undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  return value as Record<string, unknown>;
}
