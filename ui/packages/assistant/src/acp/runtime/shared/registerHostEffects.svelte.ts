import { serializeError } from "serialize-error";
import { onMount } from "svelte";

import { rpc } from "../../../lib/rpc/client";

// Host-facing effects: global error reporting. The window focus/blur handlers
// are pure and live on the core runtime itself.
export function registerHostEffects() {
  onMount(() => installGlobalErrorHandlers());
}

function installGlobalErrorHandlers() {
  window.addEventListener("error", reportWindowError, { capture: true });
  window.addEventListener("unhandledrejection", reportUnhandledRejection);

  return () => {
    window.removeEventListener("error", reportWindowError, { capture: true });
    window.removeEventListener("unhandledrejection", reportUnhandledRejection);
  };
}

function reportUnhandledRejection(event: PromiseRejectionEvent): void {
  rpc.reportError(serializeError(event.reason));
}

function reportWindowError(event: ErrorEvent): void {
  if (isResizeObserverLoopError(event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  const error = event.error ?? new Error(event.message || "Unhandled window error");
  console.error(error);
  rpc.reportError(serializeError(error));
}

function isResizeObserverLoopError(message: string | undefined): boolean {
  return (
    message === "ResizeObserver loop completed with undelivered notifications." ||
    message === "ResizeObserver loop limit exceeded"
  );
}
