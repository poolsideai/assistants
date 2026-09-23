let nextCacheNamespace = 0;

/**
 * Pierre's worker cache is a process-wide singleton and treats equal cache
 * keys as equal content without validating the payload. Locally-scoped
 * revisions are not globally unique, so each mounted viewer gets its own
 * namespace; a per-mount revision then uniquely identifies every distinct
 * payload during that mount.
 */
export function createCacheNamespace(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `code-view-${++nextCacheNamespace}`;
}
