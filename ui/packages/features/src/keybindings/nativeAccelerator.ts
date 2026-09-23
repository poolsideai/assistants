// Chord → Tauri native-menu accelerator translation. Desktop-only (macOS).
// Pure functions extracted so they can be unit-tested without a Svelte harness.

import type { KeyChord } from "./chord";
import { parseChord } from "./chord";

/**
 * Map a normalized `KeyboardEvent.key` value (lower-case, as produced by
 * `parseChord`) to the label Tauri expects in a native-menu accelerator string.
 * Returns `undefined` for an empty string or any multi-character key that is not
 * in the table — the caller must treat that as an unmappable chord and return
 * `undefined` rather than emit an invalid accelerator.
 */
export function nativeMenuKeyLabel(key: string): string | undefined {
  if (!key) return undefined;
  const labels: Record<string, string> = {
    " ": "Space",
    escape: "Escape",
    enter: "Enter",
    arrowup: "Up",
    arrowdown: "Down",
    arrowleft: "Left",
    arrowright: "Right",
    delete: "Delete",
    backspace: "Backspace",
    tab: "Tab",
  };
  if (key in labels) return labels[key];
  // Only ASCII printable single characters are valid bare key tokens.
  // Unicode symbols like "↑" have length 1 but are not accepted by Tauri.
  if (key.length === 1 && /^[\x20-\x7E]$/.test(key)) return key.toUpperCase();
  return undefined; // multi-char or non-ASCII key — not a valid accelerator token
}

/**
 * Translate a `KeyChord` string (e.g. `"mod+shift+n"`) into a Tauri native-menu
 * accelerator string (e.g. `"Cmd+Shift+N"`). Returns `undefined` when the chord
 * has no key or the key cannot be represented as a Tauri accelerator token —
 * never emits an invalid accelerator string.
 *
 * `mod` always maps to `Cmd`: this helper is for the desktop-only macOS surface.
 */
export function chordToNativeAccelerator(chord: KeyChord): string | undefined {
  const parsed = parseChord(chord);
  const keyLabel = nativeMenuKeyLabel(parsed.key);
  if (!keyLabel) return undefined;

  const parts: string[] = [];
  if (parsed.mod || parsed.meta) parts.push("Cmd");
  if (parsed.shift) parts.push("Shift");
  if (parsed.alt) parts.push("Alt");
  if (parsed.ctrl) parts.push("Ctrl");
  parts.push(keyLabel);
  return parts.join("+");
}
