import { afterEach, describe, expect, it } from "vitest";
import { installMobileViewportTracking } from "./mobileViewport";

// Minimal stand-in for window.visualViewport: mutable width/height plus a manual
// emit() so a test can drive the resize/scroll events jsdom never fires.
function makeFakeViewport(height: number, width = 400) {
  const listeners: Record<string, Set<() => void>> = { resize: new Set(), scroll: new Set() };
  return {
    width,
    height,
    addEventListener(type: string, cb: () => void) {
      listeners[type]?.add(cb);
    },
    removeEventListener(type: string, cb: () => void) {
      listeners[type]?.delete(cb);
    },
    emit(type: string) {
      listeners[type]?.forEach((cb) => cb());
    },
  };
}

function targetWith(viewport: ReturnType<typeof makeFakeViewport> | undefined) {
  return {
    visualViewport: viewport,
    scrollY: 0,
    scrollTo: () => {},
    document,
  } as unknown as Window;
}

const root = document.documentElement;
afterEach(() => {
  root.removeAttribute("data-keyboard-open");
});

describe("installMobileViewportTracking", () => {
  it("flags keyboard-open when the viewport shrinks well below the tallest seen", () => {
    const vp = makeFakeViewport(800);
    const cleanup = installMobileViewportTracking(targetWith(vp));
    expect(root.hasAttribute("data-keyboard-open")).toBe(false);

    // A small shortfall (toolbar chrome) is not the keyboard.
    vp.height = 740;
    vp.emit("resize");
    expect(root.hasAttribute("data-keyboard-open")).toBe(false);

    vp.height = 420;
    vp.emit("resize");
    expect(root.hasAttribute("data-keyboard-open")).toBe(true);

    vp.height = 800;
    vp.emit("resize");
    expect(root.hasAttribute("data-keyboard-open")).toBe(false);

    cleanup();
  });

  it("recalibrates on rotation instead of flagging landscape as keyboard-open", () => {
    // Portrait, keyboard closed: tall viewport becomes the reference.
    const vp = makeFakeViewport(800, 400);
    const cleanup = installMobileViewportTracking(targetWith(vp));
    expect(root.hasAttribute("data-keyboard-open")).toBe(false);

    // Rotate to landscape (width flips, height shrinks) — this is not a keyboard.
    vp.width = 800;
    vp.height = 390;
    vp.emit("resize");
    expect(root.hasAttribute("data-keyboard-open")).toBe(false);

    // Keyboard opens in landscape: shrinks below the landscape reference.
    vp.height = 200;
    vp.emit("resize");
    expect(root.hasAttribute("data-keyboard-open")).toBe(true);

    cleanup();
  });

  it("detects the keyboard against the max height, not window.innerHeight", () => {
    // Standalone PWA: the whole view resizes for the keyboard, so the initial
    // (keyboard-open) height is already small. Once a taller viewport is seen,
    // shrinking back below it flags keyboard-open.
    const vp = makeFakeViewport(420);
    const cleanup = installMobileViewportTracking(targetWith(vp));

    vp.height = 800;
    vp.emit("resize");
    expect(root.hasAttribute("data-keyboard-open")).toBe(false);

    vp.height = 420;
    vp.emit("resize");
    expect(root.hasAttribute("data-keyboard-open")).toBe(true);

    cleanup();
  });

  it("is a no-op when visualViewport is unavailable", () => {
    expect(() => installMobileViewportTracking(targetWith(undefined))()).not.toThrow();
  });
});
