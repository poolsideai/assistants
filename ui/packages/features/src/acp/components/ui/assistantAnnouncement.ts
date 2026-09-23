/**
 * Derives a VoiceOver announcement string from assistant turn state.
 *
 * Returns a non-empty string on each meaningful state *transition* so that an
 * aria-live region can announce it. Returns an empty string when there is
 * nothing to announce (idle state without a prior active turn).
 *
 * The caller is responsible for only passing the string to the live region when
 * it differs from the previous value — identical consecutive values won't
 * re-trigger a screen-reader announcement anyway, so guarding is fine but not
 * strictly required.
 */
export type AssistantTurnState = "idle" | "working" | "awaiting-approval";

export function getAssistantTurnState(
  isTurnActive: boolean,
  hasPendingPermissionRequests: boolean,
): AssistantTurnState {
  if (!isTurnActive) return "idle";
  if (hasPendingPermissionRequests) return "awaiting-approval";
  return "working";
}

export function getAssistantAnnouncement(state: AssistantTurnState): string {
  switch (state) {
    case "working":
      return "Assistant is responding";
    case "awaiting-approval":
      return "Assistant is requesting approval";
    case "idle":
      return "Assistant finished responding";
  }
}
