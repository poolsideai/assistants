__POOL_SYNTHETIC_IMPORT_BASELINE__
import { getPoolsideConfigurationSection } from "./api/configuration";

/**
__POOL_SYNTHETIC_IMPORT_BASELINE__
 */
export function getPoolsideConfig() {
  const workspaceConfig = getPoolsideConfigurationSection();
  const config: Configuration = JSON.parse(JSON.stringify(workspaceConfig));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  return config;
}
