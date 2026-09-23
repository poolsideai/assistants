import { rpc, type RPCClient } from "../../hostRpc";

type FileIconRPC = RPCClient & {
  fileIconDataUri(path: string): Promise<string | undefined>;
};

// Keyed by absolute path. The OS resolves file icons at native resolution
// (the host renders 2x a 16pt box), so entries never vary by display; a
// settled `undefined` (non-macOS host, or encoding failed) is deterministic
// and stays cached so reopening never re-asks the host.
const fileIconCache = new Map<string, Promise<string | undefined>>();

/**
 * The OS's own icon for the file at `path` (e.g. the real macOS folder icon
 * for a project directory) as a PNG data URI, fetched from the desktop host.
 *
 * Resolves `undefined` when the host yields nothing; never rejects. Results
 * are cached per path, but a failed call is evicted so a later open retries.
 */
export function fileIconDataUri(path: string): Promise<string | undefined> {
  let entry = fileIconCache.get(path);
  if (!entry) {
    const request: Promise<string | undefined> = (rpc as FileIconRPC).fileIconDataUri(path).then(
      // The RPC bridge may surface a missing icon as null; normalize it.
      (uri) => uri ?? undefined,
      () => {
        if (fileIconCache.get(path) === request) fileIconCache.delete(path);
        return undefined;
      },
    );
    entry = request;
    fileIconCache.set(path, entry);
  }
  return entry;
}

/** Test-only: clears the per-path cache between test cases. */
export function _resetFileIconDataUriCacheForTests(): void {
  fileIconCache.clear();
}
