<script lang="ts">
  import { ACPChatSessionScopeWriter } from "./ChatSessionScope.svelte";
  import type { ACPSessionRepository } from "./SessionRepository.svelte";

  interface Props {
    repo: ACPSessionRepository;
    conversationId: string;
    onIdleSession?: () => void;
  }

  let { repo, conversationId, onIdleSession }: Props = $props();
  const chatSession = new ACPChatSessionScopeWriter(repo, () => conversationId);

  $effect(() => {
    const session = repo.getSessionByConversationId(conversationId);
    if (
      session?.sessionId === null &&
      session.pendingHandoff === null &&
      session.loadState.status !== "loading" &&
      !session.isSending
    ) {
      onIdleSession?.();
    }
  });
</script>

<span data-testid="routed-agent">
  {repo.getSessionByConversationId(conversationId)?.agentServer ?? "none"}
</span>
<span data-testid="scoped-agent">{chatSession.selectedAgentServer}</span>
