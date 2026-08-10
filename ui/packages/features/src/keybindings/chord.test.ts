import { describe, expect, it } from "vitest";
import {
  chordFromEvent,
  formatChord,
  hasNonShiftModifier,
  matchesChord,
  parseChord,
} from "./chord";

function keydown(init: Partial<KeyboardEvent> & { key: string }): KeyboardEvent {
  return {
    key: init.key,
    code: init.code ?? "",
    metaKey: init.metaKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    altKey: init.altKey ?? false,
    shiftKey: init.shiftKey ?? false,
  } as KeyboardEvent;
}

describe("parseChord", () => {
  it("parses modifiers and key, order-insensitive and case-insensitive", () => {
    expect(parseChord("Mod+Shift+K")).toEqual({
      mod: true,
      ctrl: false,
      alt: false,
      shift: true,
      meta: false,
      key: "k",
    });
    expect(parseChord("shift+mod+k")).toEqual(parseChord("mod+shift+k"));
  });

  it("applies key aliases", () => {
    expect(parseChord("esc").key).toBe("escape");
    expect(parseChord("mod+up").key).toBe("arrowup");
  });
});

describe("matchesChord", () => {
  it("maps mod to Command on mac and Control elsewhere", () => {
    expect(matchesChord(keydown({ key: "k", metaKey: true }), "mod+k", "mac")).toBe(true);
    expect(matchesChord(keydown({ key: "k", ctrlKey: true }), "mod+k", "mac")).toBe(false);

    expect(matchesChord(keydown({ key: "k", ctrlKey: true }), "mod+k", "other")).toBe(true);
    expect(matchesChord(keydown({ key: "k", metaKey: true }), "mod+k", "other")).toBe(false);
  });

  it("requires an exact modifier set so extra modifiers do not match", () => {
    expect(matchesChord(keydown({ key: "k", metaKey: true, shiftKey: true }), "mod+k", "mac")).toBe(
      false,
    );
    expect(
      matchesChord(keydown({ key: "k", metaKey: true, shiftKey: true }), "mod+shift+k", "mac"),
    ).toBe(true);
  });

  it("matches bare keys", () => {
    expect(matchesChord(keydown({ key: "Escape" }), "escape", "mac")).toBe(true);
    expect(matchesChord(keydown({ key: "Escape", metaKey: true }), "escape", "mac")).toBe(false);
  });

  it("matches letters by physical code when Alt rewrites event.key (macOS)", () => {
    // Alt+A on macOS reports key "å" but code "KeyA".
    expect(matchesChord(keydown({ key: "å", code: "KeyA", altKey: true }), "alt+a", "mac")).toBe(
      true,
    );
    expect(matchesChord(keydown({ key: "a", code: "KeyA", altKey: true }), "alt+a", "other")).toBe(
      true,
    );
  });
});

describe("hasNonShiftModifier", () => {
  it("detects modifier-bearing chords, treating Shift as ordinary typing", () => {
    expect(hasNonShiftModifier("mod+i")).toBe(true);
    expect(hasNonShiftModifier("mod+shift+p")).toBe(true);
    expect(hasNonShiftModifier("shift+tab")).toBe(false); // Shift alone is not a bypass
    expect(hasNonShiftModifier("escape")).toBe(false);
    expect(hasNonShiftModifier("a")).toBe(false);
  });
});

describe("chordFromEvent", () => {
  it("encodes the platform-primary modifier as mod", () => {
    expect(chordFromEvent(keydown({ key: "J", metaKey: true }), "mac")).toBe("mod+j");
    expect(chordFromEvent(keydown({ key: "J", ctrlKey: true }), "other")).toBe("mod+j");
    expect(chordFromEvent(keydown({ key: "K", metaKey: true, shiftKey: true }), "mac")).toBe(
      "mod+shift+k",
    );
  });

  it("returns null for a lone modifier so recording keeps waiting", () => {
    expect(chordFromEvent(keydown({ key: "Shift", shiftKey: true }), "mac")).toBeNull();
    expect(chordFromEvent(keydown({ key: "Meta", metaKey: true }), "mac")).toBeNull();
  });
});

describe("formatChord", () => {
  it("renders mac symbols", () => {
    expect(formatChord("mod+shift+k", "mac")).toBe("⇧⌘K");
    expect(formatChord("mod+i", "mac")).toBe("⌘I");
    expect(formatChord("escape", "mac")).toBe("Esc");
  });

  it("renders verbose labels elsewhere", () => {
    expect(formatChord("mod+shift+k", "other")).toBe("Ctrl+Shift+K");
    expect(formatChord("shift+tab", "other")).toBe("Shift+Tab");
  });
});
