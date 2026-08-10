/**
 * True when an event originates inside a modal overlay (`aria-modal="true"`),
 * such as the desktop conversation search. Window-level shortcut handlers use
 * this to leave keystrokes to the modal instead of acting behind it — e.g.
 * Escape inside the search dialog must close the search, not interrupt the
 * running turn or reject a pending permission request.
 */
export function insideModalOverlay(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[aria-modal="true"]') !== null;
}
