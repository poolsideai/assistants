import { describe, expect, it } from "vitest";
import { defaultTabForDesktopAuxiliarySurface } from "./desktopAuxiliarySurfaceDefault";

describe("desktop auxiliary surface defaults", () => {
  it("defaults an empty bottom panel to a terminal", () => {
    expect(defaultTabForDesktopAuxiliarySurface("bottomPanel", false, false)).toBe("terminal");
  });

  it("defaults an empty right sidebar to the file tree", () => {
    expect(defaultTabForDesktopAuxiliarySurface("rightSidebar", false, false)).toBe("files");
  });

  it("does not add a default tab when the surface already has contents", () => {
    expect(defaultTabForDesktopAuxiliarySurface("bottomPanel", true, false)).toBeUndefined();
    expect(defaultTabForDesktopAuxiliarySurface("rightSidebar", true, false)).toBeUndefined();
  });

  it("leaves empty surfaces unchanged when a custom default layout is saved", () => {
    expect(defaultTabForDesktopAuxiliarySurface("bottomPanel", false, true)).toBeUndefined();
    expect(defaultTabForDesktopAuxiliarySurface("rightSidebar", false, true)).toBeUndefined();
  });
});
