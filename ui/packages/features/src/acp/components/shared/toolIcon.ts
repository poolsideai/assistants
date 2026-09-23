import type { IconName, IconProps } from "@poolsideai/components/icon";
import type { ToolCall } from "../../types";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

function modeToIcon(rawInput: unknown): IconName {
  if (rawInput == null || typeof rawInput !== "object" || Array.isArray(rawInput)) return "code";

  const mode = (rawInput as Record<string, unknown>).mode;
  return mode === "plan" ? "plan" : "code";
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
  const path = getToolPath(tool);

  switch (tool.kind) {
    case "read":
    case "delete":
    case "move":
    case "edit":
      return path ? { type: "file", name: iconPath ?? path } : "file";
    case "search":
      return "search";
    case "execute":
      return "terminal";
    case "switch_mode":
      return modeToIcon(tool.rawInput);
    case "fetch":
      return "web";
    case "think":
__POOL_SYNTHETIC_IMPORT_BASELINE__
    case "other":
      return "terminal";
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}
