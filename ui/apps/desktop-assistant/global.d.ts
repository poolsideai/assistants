declare global {
  interface Window {
    __TAURI_ISOLATION_HOOK__?: (payload: unknown) => unknown;
  }
}

export {};
