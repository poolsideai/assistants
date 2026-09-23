import { describe, expect, it } from "vitest";
import { chordToNativeAccelerator, nativeMenuKeyLabel } from "./nativeAccelerator";

describe("nativeMenuKeyLabel", () => {
  it("maps named keys to Tauri accelerator labels", () => {
    expect(nativeMenuKeyLabel("escape")).toBe("Escape");
    expect(nativeMenuKeyLabel("enter")).toBe("Enter");
    expect(nativeMenuKeyLabel("arrowup")).toBe("Up");
    expect(nativeMenuKeyLabel("arrowdown")).toBe("Down");
    expect(nativeMenuKeyLabel("arrowleft")).toBe("Left");
    expect(nativeMenuKeyLabel("arrowright")).toBe("Right");
    expect(nativeMenuKeyLabel(" ")).toBe("Space");
    expect(nativeMenuKeyLabel("delete")).toBe("Delete");
    expect(nativeMenuKeyLabel("backspace")).toBe("Backspace");
    expect(nativeMenuKeyLabel("tab")).toBe("Tab");
  });

  it("upper-cases single-character keys", () => {
    expect(nativeMenuKeyLabel("n")).toBe("N");
    expect(nativeMenuKeyLabel("k")).toBe("K");
    expect(nativeMenuKeyLabel("1")).toBe("1");
  });

  it("returns undefined for an empty string", () => {
    expect(nativeMenuKeyLabel("")).toBeUndefined();
  });

  it("returns undefined for multi-character unicode symbols not in the table", () => {
    // These arise when a display hint symbol (e.g. "↑") leaks in — must not pass through.
    expect(nativeMenuKeyLabel("↑")).toBeUndefined();
    expect(nativeMenuKeyLabel("↓")).toBeUndefined();
    expect(nativeMenuKeyLabel("f12")).toBeUndefined();
  });
});

describe("chordToNativeAccelerator", () => {
  it("translates a standard mod chord", () => {
    expect(chordToNativeAccelerator("mod+n")).toBe("Cmd+N");
    expect(chordToNativeAccelerator("mod+shift+n")).toBe("Cmd+Shift+N");
  });

  it("translates mod+arrow chords correctly (bug fix: not '↑')", () => {
    expect(chordToNativeAccelerator("mod+arrowup")).toBe("Cmd+Up");
    expect(chordToNativeAccelerator("mod+arrowdown")).toBe("Cmd+Down");
  });

  it("translates mod+up alias (parseChord normalises up→arrowup)", () => {
    expect(chordToNativeAccelerator("mod+up")).toBe("Cmd+Up");
  });

  it("maps meta to Cmd", () => {
    expect(chordToNativeAccelerator("meta+k")).toBe("Cmd+K");
  });

  it("maps all modifiers", () => {
    expect(chordToNativeAccelerator("mod+shift+alt+ctrl+k")).toBe("Cmd+Shift+Alt+Ctrl+K");
  });

  it("returns undefined for a chord with no key (modifier-only)", () => {
    // A chord string that parses to modifiers only has an empty key.
    expect(chordToNativeAccelerator("mod+shift")).toBeUndefined();
  });

  it("returns undefined for a bare-modifier chord", () => {
    expect(chordToNativeAccelerator("shift")).toBeUndefined();
  });

  it("returns undefined for a key that cannot be expressed as a Tauri accelerator", () => {
    // Unknown multi-char keys like "f12" are not in the table.
    expect(chordToNativeAccelerator("mod+f12")).toBeUndefined();
  });

  it("handles special keys", () => {
    expect(chordToNativeAccelerator("mod+escape")).toBe("Cmd+Escape");
    expect(chordToNativeAccelerator("mod+enter")).toBe("Cmd+Enter");
    expect(chordToNativeAccelerator("mod+backspace")).toBe("Cmd+Backspace");
    expect(chordToNativeAccelerator("mod+delete")).toBe("Cmd+Delete");
    expect(chordToNativeAccelerator("mod+tab")).toBe("Cmd+Tab");
    expect(chordToNativeAccelerator("mod+space")).toBe("Cmd+Space");
  });
});
