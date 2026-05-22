__POOL_SYNTHETIC_IMPORT_BASELINE__
export { poolsideAcpPoolsideRenameSession as poolsideAcpRenameSession } from "./gen/api";
export * from "./manualApi";
import { runtime } from "./orval/clientHelpers";

/**
 * initializeStatefulModule readies the generated helper API methods for use, e.g. `poolsideHello`
 */
export const initializeStatefulModule = runtime.setImplementation;
