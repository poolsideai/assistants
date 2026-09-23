<script lang="ts">
  import { setElicitationContext, type ElicitationRepository } from "../../../../elicitation";
  import { setNotificationContext } from "../../../features/NotificationRepository.svelte";
  import {
    setACPConversationStatusContext,
    type ACPConversationStatusRepository,
  } from "../../../features/ConversationStatusRepository.svelte";
  import ElicitationPrompt from "./ElicitationPrompt.svelte";

  interface Props {
    onReady: (repo: ElicitationRepository) => void;
    /**
     * Unmount the prompt while leaving this harness — and so the repository —
     * in place. That is what a conversation switch does to it: the pane is
     * rebuilt, the app-level repository is not.
     */
    mounted?: boolean;
  }

  const { onReady, mounted = true }: Props = $props();

  const notificationRepo = setNotificationContext(
    () => {},
    (agentServer: string) => agentServer,
    () => false,
    () => true,
  );
  const conversationStatus = setACPConversationStatusContext(
    notificationRepo.publicAPI(),
  ).publicAPI() as ACPConversationStatusRepository;
  const repo = setElicitationContext(conversationStatus);
  onReady(repo);
</script>

{#if mounted}
  <ElicitationPrompt />
{/if}
