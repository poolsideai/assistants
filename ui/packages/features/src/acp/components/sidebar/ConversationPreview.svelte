<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import ConversationRowPopoverContent from "./ConversationRowPopoverContent.svelte";
  import { getAcpSidebarController } from "./SidebarController.svelte";

  const sidebar = getAcpSidebarController();
  const target = $derived(sidebar.conversationPreviewTarget);

  const VIEWPORT_MARGIN = 8;
  // Measured from the row's outer edge. The preview used to hang off the row's
  // title button, which stops ~48px short of that edge (trailing action gutter
  // plus row padding), so the equivalent gutter here is small — a larger one
  // drifts the card away from the item it describes.
  const DESKTOP_GUTTER = 4;
  const IDE_GUTTER = 4;

  let popoverElement = $state<HTMLDivElement | null>(null);
  let left = $state(0);
  let top = $state(0);
  let positionedKey = $state<string | null>(null);

  const portalToBody: Attachment = (element) => {
    document.body.appendChild(element);
    return () => element.remove();
  };

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function updatePosition() {
    const activeTarget = target;
    const popover = popoverElement;
    if (!activeTarget || !popover) return;
    if (!activeTarget.anchor.isConnected) {
      sidebar.closeConversationPreview();
      return;
    }

    const anchorRect = activeTarget.anchor.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    if (activeTarget.desktop) {
      const right = anchorRect.right + DESKTOP_GUTTER;
      const leftFallback = anchorRect.left - DESKTOP_GUTTER - popoverRect.width;
      left = clamp(
        right + popoverRect.width <= window.innerWidth - VIEWPORT_MARGIN ? right : leftFallback,
        VIEWPORT_MARGIN,
        window.innerWidth - popoverRect.width - VIEWPORT_MARGIN,
      );
      top = clamp(
        anchorRect.top,
        VIEWPORT_MARGIN,
        window.innerHeight - popoverRect.height - VIEWPORT_MARGIN,
      );
    } else {
      left = clamp(
        anchorRect.left + (anchorRect.width - popoverRect.width) / 2,
        VIEWPORT_MARGIN,
        window.innerWidth - popoverRect.width - VIEWPORT_MARGIN,
      );
      const below = anchorRect.bottom + IDE_GUTTER;
      const above = anchorRect.top - IDE_GUTTER - popoverRect.height;
      top = clamp(
        below + popoverRect.height <= window.innerHeight - VIEWPORT_MARGIN ? below : above,
        VIEWPORT_MARGIN,
        window.innerHeight - popoverRect.height - VIEWPORT_MARGIN,
      );
    }
    positionedKey = activeTarget.key;
  }

  function handlePointerDown(event: PointerEvent) {
    const activeTarget = target;
    if (!activeTarget || popoverElement?.contains(event.target as Node)) return;
    if (activeTarget.anchor.contains(event.target as Node)) return;
    sidebar.closeConversationPreview();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    sidebar.closeConversationPreview();
  }

  $effect(() => {
    const activeTarget = target;
    const popover = popoverElement;
    positionedKey = null;
    if (!activeTarget || !popover) return;

    sidebar.setConversationPreviewElement(popover);
    void tick().then(updatePosition);

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(activeTarget.anchor);
    resizeObserver.observe(popover);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      sidebar.setConversationPreviewElement(null);
    };
  });

  onDestroy(() => sidebar.setConversationPreviewElement(null));
</script>

<svelte:window
  onmousemove={(event) => sidebar.trackConversationPreviewPointer(event)}
  onpointerdown={handlePointerDown}
  onkeydown={handleKeyDown}
/>

{#if target}
  <div
    bind:this={popoverElement}
    {@attach portalToBody}
    data-testid="conversation-preview"
    role="dialog"
    tabindex="-1"
    aria-label="Conversation details"
    onpointerenter={() => sidebar.enterConversationPreview()}
    onpointerleave={() => sidebar.leaveOpenConversationPreview()}
    class={[
      "bg-psx-editor-background shadow-mid fixed z-[100] flex flex-col gap-2",
      positionedKey === target.key ? "visible" : "invisible",
      target.desktop
        ? "outline-black/3 w-[280px] rounded-[14px] bg-white/70 px-3 py-3 text-[13px]/[16px] outline-1 backdrop-blur-sm dark:bg-[#1B1F23]/75 dark:outline-white/10"
        : "w-[260px] rounded-xl px-4 py-4 text-sm",
    ]}
    style:left={`${left}px`}
    style:top={`${top}px`}
  >
    <ConversationRowPopoverContent
      session={target.session}
      agentName={target.agentName}
      iconUrl={target.iconUrl}
      iconSize={target.iconSize}
      iconClass={target.desktop
        ? sidebar.agentIconColorClass(sidebar.getSessionAgentServer(target.session))
        : target.iconClass}
      desktop={target.desktop}
    />
  </div>
{/if}
