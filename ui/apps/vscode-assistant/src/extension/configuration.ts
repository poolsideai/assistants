import type { Configuration } from "@poolsideai/rpc";
import { getPoolsideConfigurationSection } from "./api/configuration";

/**
 * Gets the poolside configuration from VSCode and normalizes it.
 */
export function getPoolsideConfig() {
  const workspaceConfig = getPoolsideConfigurationSection();
  const config: Configuration = JSON.parse(JSON.stringify(workspaceConfig));

  // The `poolside.uri` (Poolside API) setting was removed (ACP-chat-only), but
  // the shared `Configuration` type still requires `uri`. Emit a fixed empty
  // value to satisfy the type and downstream consumers.
  config.uri = "";

  return config;
}
