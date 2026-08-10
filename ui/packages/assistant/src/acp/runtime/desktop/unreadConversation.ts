// Pure helper for the "next unread conversation" shortcut: scan forward from the
// current conversation (wrapping around) for the next one flagged unread. Kept
// separate from DesktopRuntime so the wrap-around index logic is unit-testable.

interface UnreadCandidate {
  id: string;
  liveStatus?: { unread?: boolean } | null;
}

/**
 * The next conversation after `currentId` (wrapping past the end) whose live status
 * is unread, or undefined when none are unread. When `currentId` is not in the list
 * the scan starts at the beginning.
 */
export function findNextUnreadConversation<T extends UnreadCandidate>(
  conversations: readonly T[],
  currentId: string | null,
): T | undefined {
  if (conversations.length === 0) return undefined;
  const currentIndex = conversations.findIndex((conversation) => conversation.id === currentId);
  const start = currentIndex >= 0 ? currentIndex + 1 : 0;
  for (let offset = 0; offset < conversations.length; offset++) {
    const conversation = conversations[(start + offset) % conversations.length];
    if (conversation.id === currentId) continue;
    if (conversation.liveStatus?.unread) return conversation;
  }
  return undefined;
}
