import type { ToolCall } from "../../../types";
import { getToolPath } from "../../shared/toolPaths";

type ViewImagePreview = {
  src: string;
  path?: string;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  return value as Record<string, unknown>;
}

function getImageUrl(value: unknown): string | undefined {
  const record = asRecord(value);
  const imageUrl = record?.image_url;
  return typeof imageUrl === "string" && imageUrl.length > 0 ? imageUrl : undefined;
}

function getImageOutput(rawOutput: unknown): string | undefined {
  if (Array.isArray(rawOutput)) {
    return rawOutput.map(getImageUrl).find(Boolean);
  }

  return getImageUrl(rawOutput);
}

export function getViewImagePreview(tool: ToolCall): ViewImagePreview | undefined {
  const src = getImageOutput(tool.rawOutput);
  if (!src) return;
  return {
    src,
    path: getToolPath(tool),
  };
}

export function isViewImageToolCall(tool: ToolCall): boolean {
  return tool.title === "view_image" && !!getViewImagePreview(tool);
}
