export function handlePromptEscape(
  event: KeyboardEvent,
  executeEscapeCommand: () => boolean,
): boolean {
  const handled = executeEscapeCommand();
  if (handled) {
    // Escape has peeled an in-app layer or interrupted active work. Do not
    // also let the host use the same keypress for its native Escape action.
    event.preventDefault();
  }
  return handled;
}
