import { afterEach, describe, expect, it, vi } from "vitest";
import { attachViewportLogoTilt, getLogoTilt } from "./logoTilt.js";

describe("3D logo viewport tilt", () => {
  afterEach(() => vi.restoreAllMocks());

  it("maps the full viewport to the tilt range", () => {
    expect(getLogoTilt(0, 1200)).toBe(-0.5);
    expect(getLogoTilt(600, 1200)).toBe(0);
    expect(getLogoTilt(1200, 1200)).toBe(0.5);
  });

  it("clamps coordinates outside the viewport", () => {
    expect(getLogoTilt(-100, 1200)).toBe(-0.5);
    expect(getLogoTilt(1300, 1200)).toBe(0.5);
  });

  it("tracks mouse movement from anywhere in the viewport and cleans up", () => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1200);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    const onTilt = vi.fn();
    const outsideLogo = document.createElement("div");
    document.body.appendChild(outsideLogo);

    const dispose = attachViewportLogoTilt(onTilt);
    outsideLogo.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 0, clientY: 800, bubbles: true }),
    );

    expect(onTilt).toHaveBeenLastCalledWith(0.5, -0.5);

    dispose();
    outsideLogo.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 1200, clientY: 0, bubbles: true }),
    );
    expect(onTilt).toHaveBeenCalledTimes(1);

    outsideLogo.remove();
  });
});
