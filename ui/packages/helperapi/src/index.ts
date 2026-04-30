export * from "./gen/api";
export { poolsideAcpPoolsideRenameSession as poolsideAcpRenameSession } from "./gen/api";
export * from "./manualApi";
import { runtime } from "./orval/clientHelpers";

/**
 * initializeStatefulModule readies the generated helper API methods for use, e.g. `poolsideHello`
 */
export const initializeStatefulModule = runtime.setImplementation;
