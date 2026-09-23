import { afterEach, describe, expect, it, vi } from "vitest";

import { sidebarToasts } from "./sidebarToastsState.svelte";

afterEach(() => {
  for (const toast of [...sidebarToasts.toasts]) {
    sidebarToasts.dismiss(toast.id);
  }
  vi.useRealTimers();
});

function undoKeydown(): KeyboardEvent {
  return new KeyboardEvent("keydown", { key: "z", metaKey: true, bubbles: true, cancelable: true });
}

describe("sidebarToasts.addActionToast", () => {
  it("shows an actionable toast that runs and dismisses on activation", () => {
    const onClick = vi.fn();
    sidebarToasts.addActionToast("Updated to 1.2.0", { label: "Changelog", onClick });

    expect(sidebarToasts.toasts).toHaveLength(1);
    const toast = sidebarToasts.toasts[0];
    expect(toast.message).toBe("Updated to 1.2.0");
    expect(toast.action?.label).toBe("Changelog");
    expect(toast.progress).toBeUndefined();
    expect(toast.persistent).toBeUndefined();

    sidebarToasts.runAction(toast.id);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(sidebarToasts.toasts).toHaveLength(0);
  });

  it("times out like an info toast", () => {
    vi.useFakeTimers();
    sidebarToasts.addActionToast(
      "Updated to 1.2.0",
      { label: "Changelog", onClick: vi.fn() },
      { timeoutMs: 15_000 },
    );
    expect(sidebarToasts.toasts).toHaveLength(1);

    vi.advanceTimersByTime(14_999);
    expect(sidebarToasts.toasts).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(sidebarToasts.toasts).toHaveLength(0);
  });

  it("is not a ⌘Z undo target", () => {
    const detach = sidebarToasts.attach();
    const onClick = vi.fn();
    try {
      sidebarToasts.addActionToast("Updated to 1.2.0", { label: "Changelog", onClick });
      const event = undoKeydown();
      window.dispatchEvent(event);
      expect(onClick).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
      expect(sidebarToasts.toasts).toHaveLength(1);
    } finally {
      detach();
    }
  });

  it("keeps ⌘Z working for undoable progress toasts alongside an announcement", () => {
    const detach = sidebarToasts.attach();
    const undo = vi.fn();
    const announcement = vi.fn();
    try {
      sidebarToasts.addProgressToast(
        "archive-undo",
        "Conversation archived",
        { kind: "countdown", durationMs: 5000 },
        { label: "Undo", onClick: undo },
      );
      sidebarToasts.addActionToast("Updated to 1.2.0", {
        label: "Changelog",
        onClick: announcement,
      });

      window.dispatchEvent(undoKeydown());
      expect(undo).toHaveBeenCalledTimes(1);
      expect(announcement).not.toHaveBeenCalled();
    } finally {
      detach();
    }
  });
});
