<script lang="ts">
  import Icon from "@poolsideai/components/icon";
  import type { ModeChange } from "../../types";
  import { getACPChatSessionScope } from "../../features/ChatSessionScope.svelte";

  interface Props {
    event: ModeChange;
    source?: "user" | "tool_call";
  }

  let { event, source }: Props = $props();

  const chatSession = getACPChatSessionScope();

  let mode = $derived(event.currentModeId);
  let label = $derived(chatSession.modeNameById.get(mode) ?? mode);
</script>

<div
  class="bg-psx-editor-background text-auto relative isolate flex flex-col overflow-hidden rounded-xl {source ===
  'user'
    ? 'self-end'
    : 'self-start'}"
>
  <div
    data-size="sm"
    class="text-auto text-psx-foreground-secondary relative isolate flex items-center justify-between gap-1.5 truncate px-2 py-1"
  >
    <div class="inline-flex items-center gap-1 truncate">
      <Icon class="text-psx-icon" name={mode === "plan" ? "plan" : "code"} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    </div>
  </div>
</div>
