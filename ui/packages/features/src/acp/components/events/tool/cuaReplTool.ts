import type { ToolCall } from "../../../types";
import { getToolName } from "../../shared/toolPaths";
import { isPermissionDeniedToolCall } from "../../shared/toolStatus";

export function getCuaReplMethod(tool: ToolCall): "js" | "js_reset" | undefined {
  // Codex uses dotted MCP titles; other ACP adapters preserve the namespaced
  // tool id in metadata. Match the exact server and method, never just "js".
  const name = getToolName(tool) ?? tool.title.trim().toLowerCase();
  const match = /^(?:(?:mcp\.)?cua_repl\.|(?:mcp__)?cua_repl__)(js|js_reset)$/.exec(name);
  return match?.[1] as "js" | "js_reset" | undefined;
}

export function isCuaReplToolCall(tool: ToolCall): boolean {
  return getCuaReplMethod(tool) !== undefined && !isPermissionDeniedToolCall(tool);
}

export function getCuaReplInput(tool: ToolCall): { title?: string; code?: string } {
  const input = asRecord(parseJson(tool.rawInput));
  // Codex's live MCP calls use { server, tool, arguments }; restored history
  // uses { name, arguments }. Other adapters supply the arguments directly.
  const record = asRecord(parseJson(input?.arguments)) ?? input;
  return {
    title: typeof record?.title === "string" ? record.title.trim() || undefined : undefined,
    code: typeof record?.code === "string" && record.code.trim() ? record.code : undefined,
  };
}

export function getCuaReplContent(tool: ToolCall): NonNullable<ToolCall["content"]> {
  if (tool.content?.length) return tool.content;

  // Codex ACP leaves MCP results in rawOutput instead of emitting ACP content.
  // Recovered function-call history stores the same payload under `output`.
  const output = asRecord(parseJson(tool.rawOutput));
  const result = parseJson(output?.result ?? output?.output ?? tool.rawOutput);
  const content = Array.isArray(result) ? result : asRecord(result)?.content;
  if (!Array.isArray(content)) return [];

  const blocks = content.map((value): NonNullable<ToolCall["content"]>[number] => {
    const block = asRecord(value);
    if (
      (block?.type === "text" || block?.type === "input_text") &&
      typeof block.text === "string"
    ) {
      return { type: "content", content: { type: "text", text: block.text } };
    }
    // Codex stores MCP screenshots as data URLs in function-call history.
    if (block?.type === "input_image" && typeof block.image_url === "string") {
      const image = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i.exec(block.image_url);
      if (image) {
        return {
          type: "content",
          content: { type: "image", mimeType: image[1], data: image[2] },
        };
      }
    }
    if (
      block?.type === "image" &&
      typeof block.data === "string" &&
      typeof block.mimeType === "string"
    ) {
      return {
        type: "content",
        content: {
          type: "image",
          data: block.data,
          mimeType: block.mimeType,
          uri: typeof block.uri === "string" ? block.uri : undefined,
        },
      };
    }
    // Keep unexpected or malformed blocks inspectable rather than dropping them.
    return textContent(value);
  });
  if (output?.error != null) blocks.push(textContent(output.error));
  return blocks;
}

function textContent(value: unknown): NonNullable<ToolCall["content"]>[number] {
  return {
    type: "content",
    content: {
      type: "text",
      text: typeof value === "string" ? value : (JSON.stringify(value, null, 2) ?? String(value)),
    },
  };
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
