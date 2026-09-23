// The ⌘1–9 shortcuts that jump to a conversation. Both the sidebar list and
// the ⌘K conversation search assign these to the first
// CONVERSATION_SHORTCUT_LIMIT rows they show, in visual order, so whichever
// surface is on screen while ⌘ is held owns the numbering.
export const CONVERSATION_SHORTCUT_LIMIT = 9;

// Maps a ⌘-digit keydown to its 1-based shortcut index, or undefined when the
// event is not a bare digit. `code` is preferred so the digit is stable across
// keyboard layouts; `key` is the fallback for layouts/hosts that omit it.
export function conversationShortcutIndexFromKeyboardEvent(
  event: KeyboardEvent,
): number | undefined {
  if (/^Digit[1-9]$/.test(event.code)) {
    return Number(event.code.slice("Digit".length));
  }

  if (/^[1-9]$/.test(event.key)) {
    return Number(event.key);
  }

  return undefined;
}

export function conversationShortcutLabel(index: number): string {
  return `⌘${index}`;
}
