import type { ContentBlock } from "@agentclientprotocol/sdk";
import { imageFilePathFromUri } from "../../../shared/imagePreview";
import type { ToolCall } from "../../../types";
import { isPreviewableImagePath, isPreviewableImageUrl } from "../../content/imagePreview";

export type ImageGenerationPreview =
  | {
      kind: "data";
      data: string;
      mimeType: string;
      title: string;
      uri?: string | null;
    }
  | {
      kind: "file";
      path: string;
      title: string;
    }
  | {
      kind: "url";
      title: string;
      url: string;
    };

export function isImageGenerationToolCall(tool: ToolCall): boolean {
  return normalizeToolTitle(tool.title) === "image generation";
}

export function getImageGenerationPrompt(tool: ToolCall): string | undefined {
  for (const value of [
    getStringField(tool.rawOutput, "revised_prompt"),
    getStringField(tool.rawOutput, "revisedPrompt"),
    getStringField(tool.rawInput, "prompt"),
    getStringField(tool.rawInput, "revised_prompt"),
    getStringField(tool.rawInput, "revisedPrompt"),
  ]) {
    if (value) return stripPromptPrefix(value);
  }

  for (const block of toolContentBlocks(tool)) {
    if (block.type !== "text") continue;
    const prompt = stripPromptPrefix(block.text);
    if (prompt) return prompt;
  }
}

export function getImageGenerationPreview(tool: ToolCall): ImageGenerationPreview | undefined {
  for (const block of toolContentBlocks(tool)) {
    if (block.type === "image") {
      return {
        kind: "data",
        data: block.data,
        mimeType: block.mimeType,
        title: block.uri ?? "Generated image",
        uri: block.uri,
      };
    }

    if (block.type === "resource_link" && isImageResource(block.uri, block.mimeType)) {
      const title = block.title ?? block.name ?? block.uri;
      const filePath = imageFilePathFromUri(block.uri);
      if (filePath) {
        return { kind: "file", path: filePath, title };
      }
      if (isPreviewableImageUrl(block.uri)) {
        return { kind: "url", title, url: block.uri };
      }
    }
  }
}

export function isImageGenerationPending(tool: ToolCall): boolean {
  return tool.status === "in_progress" && !getImageGenerationPreview(tool);
}

function normalizeToolTitle(title: string): string {
  return title.replace(/[_-]+/g, " ").trim().toLowerCase();
}

function getStringField(value: unknown, field: string): string | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  const fieldValue = (value as Record<string, unknown>)[field];
  return typeof fieldValue === "string" && fieldValue.trim().length > 0
    ? fieldValue.trim()
    : undefined;
}

function stripPromptPrefix(value: string): string | undefined {
  const trimmed = value.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;
  const prompt = unquoted.replace(/^revised prompt:\s*/i, "").trim();
  return prompt.length > 0 ? prompt : undefined;
}

function toolContentBlocks(tool: ToolCall): ContentBlock[] {
  return (
    tool.content
      ?.map((item) => (item.type === "content" ? item.content : undefined))
      .filter((item): item is ContentBlock => item !== undefined) ?? []
  );
}

function isImageResource(uri: string, mimeType?: string | null): boolean {
  return (
    mimeType?.startsWith("image/") === true ||
    isPreviewableImageUrl(uri) ||
    isPreviewableImagePath(uri)
  );
}
