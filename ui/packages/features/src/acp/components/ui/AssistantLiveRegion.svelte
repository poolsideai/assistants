<script lang="ts">
  import { getAssistantAnnouncement, getAssistantTurnState } from "./assistantAnnouncement";

  interface Props {
    isTurnActive: boolean;
    hasPendingPermissionRequests: boolean;
  }

  let { isTurnActive, hasPendingPermissionRequests }: Props = $props();

  let turnState = $derived(getAssistantTurnState(isTurnActive, hasPendingPermissionRequests));

  // Only announce after the first active turn has been observed, so the region
  // doesn't announce "finished responding" on initial mount when nothing has
  // happened yet.
  let hasBeenActive = $state(false);

  $effect(() => {
    if (isTurnActive) hasBeenActive = true;
  });

  let announcement = $derived(hasBeenActive ? getAssistantAnnouncement(turnState) : "");
</script>

<!--
  Visually hidden live region for screen-reader announcements.
  aria-live="polite" queues the announcement after the current speech finishes.
  aria-atomic="true" ensures the full string is read, not just the changed part.
  No role="status": aria-live alone provides the announcement semantics, and an
  extra status role would collide with the visible status banners in the pane.
-->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {announcement}
</div>
