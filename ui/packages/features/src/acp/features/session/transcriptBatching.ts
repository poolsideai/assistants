// Frame-coalescing of transcript publishes is enabled once, from the real
// webview boot (assistant main.ts init()). Tests never call init(), so they
// keep publishing synchronously and can assert session.events immediately.
let batchingEnabled = false;
export function enableAcpTranscriptBatching(): void {
  batchingEnabled = true;
}
export function isAcpTranscriptBatchingEnabled(): boolean {
  return batchingEnabled;
}
