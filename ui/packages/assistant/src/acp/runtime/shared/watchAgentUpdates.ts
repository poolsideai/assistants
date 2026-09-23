const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

// Check on startup, while visible, and after returning to a long-lived window.
// Focus/visibility bursts share one check, including while it is still in flight.
export function watchAgentUpdates(check: () => Promise<void>): () => void {
  let lastCheck = -Infinity;
  let checking = false;
  let stopped = false;

  const refresh = (initial = false) => {
    if (
      stopped ||
      checking ||
      (!initial && document.hidden) ||
      Date.now() - lastCheck < UPDATE_CHECK_INTERVAL_MS
    )
      return;
    lastCheck = Date.now();
    checking = true;
    void check()
      .catch((error: unknown) => console.error("Failed to check agent updates", error))
      .finally(() => {
        checking = false;
      });
  };
  const onVisible = () => refresh();
  refresh(true);
  const interval = window.setInterval(onVisible, UPDATE_CHECK_INTERVAL_MS);
  window.addEventListener("focus", onVisible);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    stopped = true;
    window.clearInterval(interval);
    window.removeEventListener("focus", onVisible);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
