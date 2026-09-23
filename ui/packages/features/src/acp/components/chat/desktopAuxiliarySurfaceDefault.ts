import type { DesktopAuxiliarySurface } from "./desktopSurfaceFocusHistory";

export type DesktopAuxiliarySurfaceDefault = "terminal" | "files";

export function defaultTabForDesktopAuxiliarySurface(
  surface: DesktopAuxiliarySurface,
  surfaceHasTabs: boolean,
  hasSavedDefaultLayout: boolean,
): DesktopAuxiliarySurfaceDefault | undefined {
  if (surfaceHasTabs || hasSavedDefaultLayout) return undefined;
  return surface === "bottomPanel" ? "terminal" : "files";
}
