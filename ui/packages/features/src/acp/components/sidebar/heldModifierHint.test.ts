import { afterEach, describe, expect, it, vi } from "vitest";
import { HeldModifierHint, SHORTCUT_HINT_HOLD_MS } from "./heldModifierHint";

function modifierEvent(
  key: string,
  modifiers: Partial<{
    metaKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
  }> = {},
) {
  return {
    key,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ctrlKey: false,
    ...modifiers,
  };
}

describe("HeldModifierHint", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the hint after the shortened hold delay", () => {
    vi.useFakeTimers();
    let visible = false;
    const hint = new HeldModifierHint((nextVisible) => (visible = nextVisible));

    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true }));
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS - 1);
    expect(visible).toBe(false);

    vi.advanceTimersByTime(1);
    expect(visible).toBe(true);
  });

  it("cancels a pending hint when another key starts a chord", () => {
    vi.useFakeTimers();
    const onVisibilityChange = vi.fn();
    const hint = new HeldModifierHint(onVisibilityChange);

    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true }));
    hint.handleKeyDown(modifierEvent("v", { metaKey: true }));
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);

    expect(onVisibilityChange).not.toHaveBeenCalled();
  });

  it("hides a visible hint when Meta keyup is delivered", () => {
    vi.useFakeTimers();
    let visible = false;
    const hint = new HeldModifierHint((nextVisible) => (visible = nextVisible));

    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true }));
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);
    hint.handleKeyUp(modifierEvent("Meta"));

    expect(visible).toBe(false);
  });

  it("hides a visible hint while a second modifier is held", () => {
    vi.useFakeTimers();
    let visible = false;
    const hint = new HeldModifierHint((nextVisible) => (visible = nextVisible));

    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true }));
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);
    expect(visible).toBe(true);

    hint.handleKeyDown(modifierEvent("Shift", { metaKey: true, shiftKey: true }));
    expect(visible).toBe(false);
  });

  it("re-shows immediately when the second modifier is released mid-hold", () => {
    vi.useFakeTimers();
    let visible = false;
    const hint = new HeldModifierHint((nextVisible) => (visible = nextVisible));

    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true }));
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);
    hint.handleKeyDown(modifierEvent("Shift", { metaKey: true, shiftKey: true }));
    expect(visible).toBe(false);

    hint.handleKeyUp(modifierEvent("Shift", { metaKey: true }));
    expect(visible).toBe(true);
  });

  it("does not show when Meta is pressed while another modifier is already held", () => {
    vi.useFakeTimers();
    const onVisibilityChange = vi.fn();
    const hint = new HeldModifierHint(onVisibilityChange);

    hint.handleKeyDown(modifierEvent("Shift", { shiftKey: true }));
    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true, shiftKey: true }));
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);

    expect(onVisibilityChange).not.toHaveBeenCalled();
  });

  it("shows after the hold delay once a leading second modifier is released", () => {
    vi.useFakeTimers();
    let visible = false;
    const hint = new HeldModifierHint((nextVisible) => (visible = nextVisible));

    hint.handleKeyDown(modifierEvent("Shift", { shiftKey: true }));
    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true, shiftKey: true }));
    hint.handleKeyUp(modifierEvent("Shift", { metaKey: true }));
    expect(visible).toBe(false);

    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);
    expect(visible).toBe(true);
  });

  it("recovers from a dropped Meta keyup on pointer activity", () => {
    vi.useFakeTimers();
    let visible = false;
    const hint = new HeldModifierHint((nextVisible) => (visible = nextVisible));

    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true }));
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);
    hint.handlePointerEvent({ metaKey: false });

    expect(visible).toBe(false);
  });

  it("clears a pending hint when reset", () => {
    vi.useFakeTimers();
    const onVisibilityChange = vi.fn();
    const hint = new HeldModifierHint(onVisibilityChange);

    hint.handleKeyDown(modifierEvent("Meta", { metaKey: true }));
    hint.reset();
    vi.advanceTimersByTime(SHORTCUT_HINT_HOLD_MS);

    expect(onVisibilityChange).not.toHaveBeenCalled();
  });
});
