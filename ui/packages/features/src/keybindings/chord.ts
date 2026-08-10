// Chord parsing, matching and formatting. Pure: every function takes the platform
// explicitly so it can be unit-tested without `navigator`. The rest of the
// keybindings module builds on top of this.

export type Platform = "mac" | "other";

/**
 * A keybinding written in the registry, e.g. "mod+shift+k" or "escape".
 *
 * Tokens are joined by "+", order-insensitive, case-insensitive. Supported
 * modifiers: `mod`, `ctrl`, `alt`, `shift`, `meta`. `mod` is the
 * platform-primary accelerator — Command on macOS, Control elsewhere — and is
 * what you almost always want. The final non-modifier token is the key.
 */
export type KeyChord = string;

export interface ParsedChord {
  /** Command on macOS, Control elsewhere. */
  mod: boolean;
  /** Literal Control, regardless of platform. */
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  /** Literal Command/Meta, regardless of platform. */
  meta: boolean;
  /** Normalized, lower-case key (matches `KeyboardEvent.key` lower-cased). */
  key: string;
}

// Spelling tolerated in the registry -> canonical `KeyboardEvent.key` (lower-case).
const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  del: "delete",
  space: " ",
  spacebar: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  plus: "+",
};

const MODIFIER_TOKENS = new Set([
  "mod",
  "ctrl",
  "control",
  "alt",
  "option",
  "shift",
  "meta",
  "cmd",
  "command",
]);

export function parseChord(chord: KeyChord): ParsedChord {
  const parsed: ParsedChord = {
    mod: false,
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    key: "",
  };

  for (const raw of chord.split("+")) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;

    if (MODIFIER_TOKENS.has(token)) {
      switch (token) {
        case "mod":
          parsed.mod = true;
          break;
        case "ctrl":
        case "control":
          parsed.ctrl = true;
          break;
        case "alt":
        case "option":
          parsed.alt = true;
          break;
        case "shift":
          parsed.shift = true;
          break;
        case "meta":
        case "cmd":
        case "command":
          parsed.meta = true;
          break;
      }
      continue;
    }

    parsed.key = KEY_ALIASES[token] ?? token;
  }

  return parsed;
}

/**
 * Resolve `mod` into the concrete modifiers expected for `platform`, so that an
 * event can be compared against an exact modifier set.
 */
function effectiveModifiers(chord: ParsedChord, platform: Platform) {
  return {
    meta: chord.meta || (chord.mod && platform === "mac"),
    ctrl: chord.ctrl || (chord.mod && platform !== "mac"),
    alt: chord.alt,
    shift: chord.shift,
  };
}

// Keys that are modifiers on their own — pressing only one of these is not a
// complete chord while recording.
const MODIFIER_KEYS = new Set(["control", "shift", "alt", "meta", "os", "altgraph"]);

/**
 * Build a normalized chord from a recorded keydown, or null when the event is a
 * lone modifier (recording should keep waiting). The platform-primary modifier
 * (Command on mac, Control elsewhere) is encoded as `mod` so the binding stays
 * readable and portable.
 */
export function chordFromEvent(event: KeyboardEvent, platform: Platform): KeyChord | null {
  const key = event.key.toLowerCase();
  if (MODIFIER_KEYS.has(key)) return null;

  const tokens: string[] = [];
  const primaryHeld = platform === "mac" ? event.metaKey : event.ctrlKey;
  const secondaryHeld = platform === "mac" ? event.ctrlKey : event.metaKey;
  if (primaryHeld) tokens.push("mod");
  if (secondaryHeld) tokens.push(platform === "mac" ? "ctrl" : "meta");
  if (event.altKey) tokens.push("alt");
  if (event.shiftKey) tokens.push("shift");
  tokens.push(key);
  return tokens.join("+");
}

/**
 * True when `event` is exactly the chord on `platform`. Modifiers must match
 * exactly (an extra held modifier is a non-match) so bindings never fire by
 * accident.
 */
export function matchesChord(event: KeyboardEvent, chord: KeyChord, platform: Platform): boolean {
  const parsed = parseChord(chord);
  if (!parsed.key) return false;

  const mods = effectiveModifiers(parsed, platform);
  if (event.metaKey !== mods.meta) return false;
  if (event.ctrlKey !== mods.ctrl) return false;
  if (event.altKey !== mods.alt) return false;
  if (event.shiftKey !== mods.shift) return false;

  if (event.key.toLowerCase() === parsed.key) return true;

  // Fall back to the physical key for single letters/digits: holding Alt on macOS
  // rewrites `event.key` (Alt+A -> "å"), but `event.code` stays "KeyA"/"Digit1".
  if (/^[a-z]$/.test(parsed.key)) return event.code === `Key${parsed.key.toUpperCase()}`;
  if (/^[0-9]$/.test(parsed.key)) return event.code === `Digit${parsed.key}`;
  return false;
}

/**
 * True when the chord carries a modifier other than Shift (mod/ctrl/alt/meta).
 * Shift is excluded on purpose: Shift+key is ordinary typing (capitals), so a
 * Shift-only chord must not bypass the "don't steal keys inside text inputs"
 * guard in the desktop dispatcher.
 */
export function hasNonShiftModifier(chord: KeyChord): boolean {
  const parsed = parseChord(chord);
  return parsed.mod || parsed.ctrl || parsed.alt || parsed.meta;
}

const MAC_SYMBOLS: Record<string, string> = {
  meta: "⌘", // ⌘
  ctrl: "⌃", // ⌃
  alt: "⌥", // ⌥
  shift: "⇧", // ⇧
};

const KEY_LABELS: Record<string, string> = {
  escape: "Esc",
  enter: "⏎", // ⏎
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  " ": "Space",
};

function keyLabel(key: string): string {
  return (
    KEY_LABELS[key] ??
    (key.length === 1 ? key.toUpperCase() : key.replace(/^\w/, (c) => c.toUpperCase()))
  );
}

/** Human-readable hint for display, e.g. "⌘⇧K" on mac or "Ctrl+Shift+K". */
export function formatChord(chord: KeyChord, platform: Platform): string {
  const parsed = parseChord(chord);
  const mods = effectiveModifiers(parsed, platform);

  if (platform === "mac") {
    const parts: string[] = [];
    if (mods.ctrl) parts.push(MAC_SYMBOLS.ctrl);
    if (mods.alt) parts.push(MAC_SYMBOLS.alt);
    if (mods.shift) parts.push(MAC_SYMBOLS.shift);
    if (mods.meta) parts.push(MAC_SYMBOLS.meta);
    parts.push(keyLabel(parsed.key));
    return parts.join("");
  }

  const parts: string[] = [];
  if (mods.ctrl) parts.push("Ctrl");
  if (mods.alt) parts.push("Alt");
  if (mods.shift) parts.push("Shift");
  if (mods.meta) parts.push("Meta");
  parts.push(keyLabel(parsed.key));
  return parts.join("+");
}
