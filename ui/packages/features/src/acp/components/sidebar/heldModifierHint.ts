export const SHORTCUT_HINT_HOLD_MS = 150;

// The hints only advertise plain ⌘-key shortcuts, so any second modifier
// (⌘⇧, ⌘⌥, ⌘⌃) means the current chord can't match one of them.
const OTHER_MODIFIER_KEYS = new Set(["Shift", "Alt", "Control"]);

interface KeyModifierEvent {
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
}

interface ModifierEvent {
  metaKey: boolean;
}

function metaHeldAlone(event: KeyModifierEvent): boolean {
  return event.metaKey && !event.shiftKey && !event.altKey && !event.ctrlKey;
}

export class HeldModifierHint {
  private holdTimer: ReturnType<typeof setTimeout> | undefined;
  private visible = false;
  private holdElapsed = false;

  constructor(
    private readonly onVisibilityChange: (visible: boolean) => void,
    private readonly holdMs = SHORTCUT_HINT_HOLD_MS,
  ) {}

  handleKeyDown(event: KeyModifierEvent): void {
    if (event.key === "Meta") {
      if (metaHeldAlone(event)) this.startHoldTimer();
      else this.suspend();
      return;
    }

    if (OTHER_MODIFIER_KEYS.has(event.key)) {
      // ⌘ plus a second modifier: hide until the hold is back to just ⌘.
      this.suspend();
      return;
    }

    this.clearHoldTimer();
    if (!event.metaKey) this.reset();
  }

  handleKeyUp(event: KeyModifierEvent): void {
    if (event.key === "Meta" || !event.metaKey) {
      this.reset();
      return;
    }

    // Releasing the last extra modifier returns to a plain ⌘ hold; the hold
    // delay was already served if the hints were shown earlier in this hold.
    if (OTHER_MODIFIER_KEYS.has(event.key) && metaHeldAlone(event)) {
      if (this.holdElapsed) this.setVisible(true);
      else this.startHoldTimer();
    }
  }

  handlePointerEvent(event: ModifierEvent): void {
    if (!event.metaKey) this.reset();
  }

  reset(): void {
    this.holdElapsed = false;
    this.suspend();
  }

  destroy(): void {
    this.clearHoldTimer();
  }

  private startHoldTimer(): void {
    if (this.visible || this.holdTimer !== undefined) return;
    this.holdTimer = setTimeout(() => {
      this.holdTimer = undefined;
      this.holdElapsed = true;
      this.setVisible(true);
    }, this.holdMs);
  }

  private suspend(): void {
    this.clearHoldTimer();
    this.setVisible(false);
  }

  private clearHoldTimer(): void {
    if (this.holdTimer === undefined) return;
    clearTimeout(this.holdTimer);
    this.holdTimer = undefined;
  }

  private setVisible(visible: boolean): void {
    if (this.visible === visible) return;
    this.visible = visible;
    this.onVisibilityChange(visible);
  }
}
