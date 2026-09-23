import type { ToolCall } from "../../../types";
import { getToolName, isDirectoryListing } from "../../shared/toolPaths";
import { isMcpToolCall, isSkillToolCall } from "./toolCategory";

export function isReadToolCall(tool: ToolCall): boolean {
  if (isMcpToolCall(tool) || isSkillToolCall(tool)) return false;
  if (isDirectoryListing(tool)) return false;
  return tool.kind === "read" || getToolName(tool) === "read";
}
