<script lang="ts">
  import { AcpChatPane } from "@poolsideai/features/acp";
  import { onDestroy } from "svelte";

__POOL_SYNTHETIC_IMPORT_BASELINE__
  import AssistantConfigErrorBanner from "./AssistantConfigErrorBanner.svelte";
  import { installPinchZoomBlocker } from "../lib/utils/pinchZoom";
  import RuntimeProviders from "./RuntimeProviders.svelte";
  import { ChatOnlyRuntime } from "./runtime/ChatOnlyRuntime.svelte";
  import { CoreRuntime, type TargetProps } from "./runtime/CoreRuntime.svelte";

  interface Props extends TargetProps {
    initialChatState?: typeof POOLSIDE_INITIAL_ACP_CHAT_STATE;
  }

  const { initialChatState, ...runtimeProps }: Props = $props();
  const core = new CoreRuntime({ target: "chat-only", ...runtimeProps });
  core.initialize();
  const chat = new ChatOnlyRuntime(core, initialChatState);
  chat.initialize();
  onDestroy(installPinchZoomBlocker());
</script>

<RuntimeProviders runtime={core}>
  <div class="app-container">
    <div class="flex h-screen min-w-0">
      <AcpChatPane
        editorSurface
        activeConversationId={chat.activeConversationId}
        onActiveConversationIdChange={chat.setActiveConversationId}
        onNewConversation={chat.handleNewConversation}
        onAddProject={chat.handleAddProject}
        onShowAgentSettings={chat.handleShowAgentSettings}
      >
        {#snippet promptBanners()}
          <AssistantConfigErrorBanner />
          <ACPAgentUpdateBanner />
        {/snippet}
      </AcpChatPane>
    </div>
  </div>
</RuntimeProviders>

<style>
  .app-container {
    width: 100%;
    height: 100%;
    background: var(--psx-editor-background);
  }
</style>
