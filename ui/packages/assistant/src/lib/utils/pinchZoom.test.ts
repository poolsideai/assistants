import { describe, expect, it } from "vitest";
import { installPinchZoomBlocker } from "./pinchZoom";

describe("installPinchZoomBlocker", () => {
  it("prevents ctrl-wheel browser zoom events", () => {
    const cleanup = installPinchZoomBlocker(window);
    const event = new WheelEvent("wheel", { cancelable: true, ctrlKey: true });

    window.dispatchEvent(event);
    cleanup();

    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prevent regular wheel scrolling", () => {
    const cleanup = installPinchZoomBlocker(window);
    const event = new WheelEvent("wheel", { cancelable: true });

    window.dispatchEvent(event);
    cleanup();

    expect(event.defaultPrevented).toBe(false);
  });

  it("prevents WebKit gesture zoom events", () => {
    const cleanup = installPinchZoomBlocker(window);
    const event = new Event("gesturestart", { cancelable: true });

    window.dispatchEvent(event);
    cleanup();

    expect(event.defaultPrevented).toBe(true);
  });

  it("removes installed listeners during cleanup", () => {
    const cleanup = installPinchZoomBlocker(window);
    cleanup();
    const event = new WheelEvent("wheel", { cancelable: true, ctrlKey: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
