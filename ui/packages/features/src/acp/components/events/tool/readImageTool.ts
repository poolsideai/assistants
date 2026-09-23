import { imageFilePathFromUri } from "../../../shared/imagePreview";
import type { ToolCall } from "../../../types";
import { isPreviewableImagePath } from "../../content/imagePreview";
import { getToolPath } from "../../shared/toolPaths";

export function getReadImagePath(tool: ToolCall): string | undefined {
  const path = getToolPath(tool);
  if (!path) return;
  return imageFilePathFromUri(path) ?? (isPreviewableImagePath(path) ? path : undefined);
}

export function isReadImageToolCall(tool: ToolCall): boolean {
  return tool.kind === "read" && !!getReadImagePath(tool);
}
