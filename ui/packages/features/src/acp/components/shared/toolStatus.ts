import type { ToolCall as ACPToolCall } from "@agentclientprotocol/sdk";
import { ACP_PERMISSION_COMMAND_HEADS_META_KEY } from "../../permissionMeta";
import type { ToolCall } from "../../types";

type ToolDisplayFields = {
  _meta?: Record<string, unknown> | null;
  rawInput?: unknown;
  title?: string | null;
  kind?: ACPToolCall["kind"] | null;
};

export function isPermissionDeniedToolCall(tool: Pick<ToolCall, "rawOutput" | "status">): boolean {
  const observation = getPermissionDeniedObservation(tool);
  return typeof observation === "string" && observation.startsWith("user denied ");
}

export function getPermissionDeniedObservation(
  tool: Pick<ToolCall, "rawOutput" | "status">,
): string | undefined {
  if (tool.status !== "failed") return;
  const rawOutput = asRecord(tool.rawOutput);
  const observation = rawOutput?.observation;
  return typeof observation === "string" ? observation : undefined;
}

export function getToolCommand(tool: ToolDisplayFields): string | undefined {
  if (typeof tool.rawInput === "string" && isCommandLike(tool.rawInput, tool.kind)) {
    return tool.rawInput;
  }

  const rawInput = asRecord(tool.rawInput);
  const command = rawInput?.cmd ?? rawInput?.command;
  if (typeof command === "string" && command.length > 0) return command;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if (tool.title) {
    const separator = tool.title.lastIndexOf(":");
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const titleCommand = tool.title.slice(separator + 1).trim();
      if (isCommandLike(titleCommand, tool.kind)) return titleCommand;
    }

    if (isCommandLike(tool.title, tool.kind)) return tool.title;
  }
}

export function getToolCommandHead(tool: ToolDisplayFields): string | undefined {
  const commandHead = getToolCommandHeads(tool)[0];
  if (commandHead) return commandHead;

  return getToolCommand(tool)?.split(/\s+/).find(Boolean);
}

export function getToolCommandHeads(tool: ToolDisplayFields): string[] {
  const meta = asRecord(tool._meta);
  const metaCommandHeads = stringList(meta?.[ACP_PERMISSION_COMMAND_HEADS_META_KEY]);
  if (metaCommandHeads.length > 0) return metaCommandHeads;

  const rawInput = asRecord(tool.rawInput);
  return stringList(rawInput?.commands);
}

export function getToolCommandLabel(tool: ToolDisplayFields): string | undefined {
  const commandHeads = getToolCommandHeads(tool);
  if (commandHeads.length > 2) {
    const remainder = commandHeads.length - 2;
    return `${commandHeads[0]}, ${commandHeads[1]} and ${remainder} more ${remainder === 1 ? "command" : "commands"}`;
  }

  if (commandHeads.length > 0) return commandHeads.join(", ");

  if (tool.title && isCompactCommandLabel(tool.title, tool.kind)) return tool.title;

  return getToolCommandHead(tool);
}

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
export function getToolDescription(tool: ToolDisplayFields): string | undefined {
  const rawInput = asRecord(tool.rawInput);
  const description = rawInput?.description;
  if (typeof description === "string" && description.length > 0) return description;

  const command = getToolCommand(tool);
  if (!tool.title || !command) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__

  const separator = tool.title.lastIndexOf(":");
  if (separator === -1) return;

  const titleCommand = tool.title.slice(separator + 1).trim();
  if (titleCommand !== command) return;

  const titleDescription = tool.title.slice(0, separator).trim();
  return titleDescription.length > 0 ? titleDescription : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  return value as Record<string, unknown>;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function stringList(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === "string")) {
    return [];
  }
  return value.filter((item) => item.length > 0);
}

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
function isCommandLike(value: string, kind: ToolDisplayFields["kind"]): boolean {
  if (kind && kind !== "execute" && kind !== "other") return false;
  return value.length > 0 && /^[\w./-]+(?:\s|$)/.test(value);
}

function isCompactCommandLabel(value: string, kind: ToolDisplayFields["kind"]): boolean {
  if (kind && kind !== "execute" && kind !== "other") return false;
  return /^[\w./-]+(?:, [\w./-]+)*(?: and \d+ more commands?)?$/.test(value);
}
