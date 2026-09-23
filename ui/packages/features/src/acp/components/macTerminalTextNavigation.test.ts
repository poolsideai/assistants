import { describe, expect, it } from "vitest";
import { macTerminalTextNavigationInput } from "./macTerminalTextNavigation";

function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, ...init });
}

describe("macTerminalTextNavigationInput", () => {
  it.each([
    ["Cmd+Left", keydown("ArrowLeft", { metaKey: true }), "\x01"],
    ["Cmd+Right", keydown("ArrowRight", { metaKey: true }), "\x05"],
    ["Cmd+Backspace", keydown("Backspace", { metaKey: true }), "\x15"],
  ])("maps %s", (_label, event, expected) => {
    expect(macTerminalTextNavigationInput(event)).toBe(expected);
  });

  it.each([
    keydown("ArrowLeft"),
    keydown("ArrowLeft", { ctrlKey: true }),
    keydown("ArrowLeft", { shiftKey: true, metaKey: true }),
    keydown("ArrowLeft", { altKey: true, metaKey: true }),
    keydown("k", { metaKey: true }),
    new KeyboardEvent("keyup", { key: "ArrowLeft", metaKey: true }),
  ])("leaves unrelated shortcuts to xterm", (event) => {
    expect(macTerminalTextNavigationInput(event)).toBeUndefined();
  });

  // xterm maps these to the same sequences on macOS and cancels the event
  // afterwards; claiming them here let the keydown bubble into the splits
  // container, which moved pane focus mid-word (PE-2470).
  it.each([
    ["Option+Left", keydown("ArrowLeft", { altKey: true })],
    ["Option+Right", keydown("ArrowRight", { altKey: true })],
    ["Option+Backspace", keydown("Backspace", { altKey: true })],
  ])("leaves %s to xterm's own word navigation", (_label, event) => {
    expect(macTerminalTextNavigationInput(event)).toBeUndefined();
  });
});
