export type DesktopAuxiliarySurface = "rightSidebar" | "bottomPanel";

export type DesktopSurfaceVisibilityChange =
  | { kind: "unchanged" }
  | { kind: "opened" }
  | { kind: "closed"; restoreFocusTo?: HTMLElement };

/**
 * Remembers focus independently for the two desktop surfaces. A pending
 * element can be captured on pointerdown, before clicking a toggle moves
 * focus onto the toggle button itself.
 */
export class DesktopSurfaceFocusHistory {
  readonly #visible: Record<DesktopAuxiliarySurface, boolean>;
  readonly #focusBeforeOpen: Partial<Record<DesktopAuxiliarySurface, HTMLElement>> = {};
  readonly #pendingFocusBeforeOpen: Partial<Record<DesktopAuxiliarySurface, HTMLElement>> = {};

  constructor(initialVisibility: Record<DesktopAuxiliarySurface, boolean>) {
    this.#visible = { ...initialVisibility };
  }

  captureBeforeToggle(surface: DesktopAuxiliarySurface, activeElement: Element | null) {
    if (this.#visible[surface] || !(activeElement instanceof HTMLElement)) return;
    this.#pendingFocusBeforeOpen[surface] = activeElement;
  }

  syncVisibility(
    surface: DesktopAuxiliarySurface,
    visible: boolean,
    activeElement: Element | null,
  ): DesktopSurfaceVisibilityChange {
    if (this.#visible[surface] === visible) return { kind: "unchanged" };

    this.#visible[surface] = visible;
    if (visible) {
      const focusBeforeOpen =
        this.#pendingFocusBeforeOpen[surface] ??
        (activeElement instanceof HTMLElement ? activeElement : undefined);
      delete this.#pendingFocusBeforeOpen[surface];
      if (focusBeforeOpen) {
        this.#focusBeforeOpen[surface] = focusBeforeOpen;
      }
      return { kind: "opened" };
    }

    delete this.#pendingFocusBeforeOpen[surface];
    const restoreFocusTo = this.#focusBeforeOpen[surface];
    delete this.#focusBeforeOpen[surface];
    return { kind: "closed", restoreFocusTo };
  }
}
