import { describe, expect, it } from "vitest";
import { getLogoPixelRatio, getLogoRenderSize } from "./Logo3D.js";

describe("3D logo render bounds", () => {
  it("caps a large desktop surface", () => {
    expect(getLogoRenderSize(1336, 383)).toEqual({ width: 720, height: 360 });
  });

  it("preserves smaller mobile surfaces and guards zero dimensions", () => {
    expect(getLogoRenderSize(390, 176)).toEqual({ width: 390, height: 176 });
    expect(getLogoRenderSize(0, 0)).toEqual({ width: 1, height: 1 });
  });

  it("caps high-density displays without reducing standard density", () => {
    expect(getLogoPixelRatio(1)).toBe(1);
    expect(getLogoPixelRatio(2)).toBe(1.5);
    expect(getLogoPixelRatio(3)).toBe(1.5);
  });
});
