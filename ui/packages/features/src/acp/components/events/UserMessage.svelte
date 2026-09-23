<script lang="ts">
  import type { UserMessage as UserMessageEvent } from "../../types";
  import UserMessageBubble from "../ui/UserMessageBubble.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import Tooltip from "../ui/Tooltip.svelte";
  import Icon from "@poolsideai/components/icon";
  import ContentRenderer from "../content/ContentRenderer.svelte";
  import { CopyToClipboard } from "../ui";

  interface Props {
    event: UserMessageEvent;
  }

  let { event }: Props = $props();

  let textContent = $derived(
    event.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join(""),
  );

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  const actionClass =
    "border-psx-border bg-psx-panel text-psx-icon hover:bg-psx-chrome-hover active:bg-psx-chrome-active flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-psx-focus";
</script>

<div
  data-user-message
  data-steer-message={event.steer ? "" : undefined}
  class="group/message relative flex flex-col items-end"
>
  <UserMessageBubble variant={event.steer ? "steer" : "default"}>
    <ContentRenderer content={event.content} isUser />
  </UserMessageBubble>

__POOL_SYNTHETIC_IMPORT_BASELINE__
    <div class="flex -translate-y-2 justify-end">
      <div
        class="flex gap-1 opacity-0 transition-[opacity,transform] duration-150 focus-within:pointer-events-auto focus-within:opacity-100 group-hover/message:pointer-events-auto group-hover/message:opacity-100"
      >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          <CopyToClipboard text={textContent} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
      </div>
    </div>
  {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</div>
