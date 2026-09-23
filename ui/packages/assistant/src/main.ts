/// <reference path="../global.d.ts" />

import { warmDiffWorkerPool } from "@poolsideai/components/file-diff";
import { enableAcpTranscriptBatching } from "@poolsideai/features/acp";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type { MobileHostStatus } from "./acp/mobile/hostStatus";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Initialize shared runtime behavior before booting an app surface.
 */
export async function init() {
  enableAcpTranscriptBatching();
  scheduleDiffWorkerPoolWarmup();
}

/**
 * Spawn pierre's highlight workers once the surface has had a chance to
 * paint, so the first file or diff open colorizes without also paying
 * worker startup and shiki init. Idle-scheduled to stay out of the startup
 * path; WebKit lacks requestIdleCallback, hence the timeout fallback.
 */
function scheduleDiffWorkerPoolWarmup() {
  const warm = () => warmDiffWorkerPool();
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(warm);
  } else {
    setTimeout(warm, 2000);
  }
}
