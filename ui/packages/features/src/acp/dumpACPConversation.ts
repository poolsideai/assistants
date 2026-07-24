__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { ACPDumpEntry } from "./debugDump";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  await saveJsonFile(`acp-dump-${timestampForFilename()}.json`, data, assistantHost, "ACP dump");
}

/** Save a (typically conversation-scoped) ACP trajectory as a JSON file. */
export async function saveACPTrajectory(
  entries: ACPDumpEntry[],
  sessionId: string | null,
  assistantHost: string,
): Promise<void> {
  const stem = sessionId && sessionId.length > 0 ? sanitizeFileStem(sessionId) : "current";
  const filename = `acp-trajectory-${stem}-${timestampForFilename()}.json`;
  await saveJsonFile(filename, JSON.stringify(entries, null, 2), assistantHost, "ACP trajectory");
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
async function saveJsonFile(
  filename: string,
  data: string,
  assistantHost: string,
  label: string,
): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      title: `Save ${label}`,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      rpc.showInfoMessage(`${label} saved to ${savedPath}`, InfoMessageType.info);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      console.error(`Failed to save ${label}`, error);
      rpc.showInfoMessage(`Failed to save ${label}`, InfoMessageType.error);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  rpc.showInfoMessage(`${label} saved`, InfoMessageType.info);
}

function sanitizeFileStem(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
