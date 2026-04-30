/**
 * Prepares a VSCode format keybinding for rendering.
 *   - Replaces special keys with glyph representations.
 *   - Replaces + (signifying that keys should be held down together) with a single space.
 *   - Replaces single space (signifying a new chord) with a comma and space.
 *   - Capitalizes each binding
 *
 */
export function serialize(platform: Platform, binding?: string) {
  if (binding == null) return;
  // First split multi-chord bindings
  const chords = binding.split(" "); // e.g. [cmd+a, b]
  return chords
    .map(
      (chord) =>
        chord
          .split("+") // e.g. [cmd, a]
          .map((key) => keyMap[platform][key] || capitalize(key)) // e.g. [⌘, A]
          .join(" "), // e.g. "⌘ a"
    )
    .join(", "); // e.g. "⌘ a,  b"
}

function capitalize(str: string) {
  return str.split("").shift()?.toUpperCase() + str.slice(1);
}

type Platform = "mac" | "linux" | "win";

const keyMap: Record<Platform, Record<string, string>> = {
  mac: {
    ctrl: "⌃",
    cmd: "⌘",
    alt: "⌥",
    shift: "⇧",
    tab: "⇥",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
    enter: "⏎",
    return: "⏎",
    backspace: "⌫",
    delete: "⌫",
    capslock: "⇪",
    space: "␣",
  },
  linux: {
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
    enter: "⏎",
    return: "⏎",
    backspace: "⌫",
    delete: "⌫",
  },
  win: {
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
    enter: "⏎",
    return: "⏎",
    backspace: "⌫",
    delete: "⌫",
  },
};
