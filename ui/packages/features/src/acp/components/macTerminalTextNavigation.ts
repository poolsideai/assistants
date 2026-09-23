type TerminalKeyboardEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey" | "shiftKey" | "type"
>;

/**
 * Translate the macOS Command text-navigation shortcuts into the control
 * sequences understood by shell line editors such as zsh and readline. xterm
 * leaves these alone: its key handler breaks out of the arrow cases as soon as
 * the Meta modifier is held.
 *
 * Option+Arrow and Option+Backspace are deliberately absent. xterm already maps
 * them to the very sequences we would send (`ESC b`, `ESC f`, `ESC DEL`) when it
 * detects macOS, and — unlike the custom-handler path, which returns from
 * `_keyDown` before anything is cancelled — its own path ends in
 * `cancel(event, true)`. Claiming them here left the keydown to bubble out of
 * the terminal and reach the splits container, which reads Option+Arrow as
 * "focus the neighbouring pane" (PE-2470).
 */
export function macTerminalTextNavigationInput(event: TerminalKeyboardEvent): string | undefined {
  if (event.type !== "keydown" || event.ctrlKey || event.shiftKey) return undefined;
  if (!event.metaKey || event.altKey) return undefined;

  if (event.key === "ArrowLeft") return "\x01"; // Ctrl+A: beginning of line
  if (event.key === "ArrowRight") return "\x05"; // Ctrl+E: end of line
  if (event.key === "Backspace") return "\x15"; // Ctrl+U: delete to beginning

  return undefined;
}
