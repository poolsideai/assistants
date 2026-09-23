<script lang="ts">
  import SidebarIconButton from "./SidebarIconButton.svelte";

  interface Props {
    expandLabel: string;
    desktop?: boolean;
    width?: number;
    isLoading?: boolean;
    onExpand: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  let {
    expandLabel,
    desktop = false,
    width,
    isLoading = false,
    onExpand,
    onNewConversation,
  }: Props = $props();
</script>

<aside class="text-psx-foreground-primary relative z-20 h-full w-0 shrink-0 select-none">
  <div
    class={[
      "pointer-events-none absolute flex items-center gap-1",
      desktop
        ? "desktop-collapsed-sidebar-actions"
        : "bg-psx-panel shadow-overlay dark:shadow-overlay-dark left-2 top-2 rounded-[8px] p-1",
    ]}
    style={desktop && width ? `width: ${width}px;` : undefined}
    data-tauri-drag-region={desktop ? "deep" : undefined}
  >
    <SidebarIconButton
      icon="sidebar-show"
      label={expandLabel}
      size={14}
      buttonSize="size-[22px]"
      class="pointer-events-auto"
      dragRegion={desktop}
      onclick={onExpand}
    />
    <SidebarIconButton
      icon="new"
      label="New conversation"
      title="New Conversation"
      size={14}
      buttonSize="size-[22px]"
      class="pointer-events-auto"
      dragRegion={desktop}
      disabled={isLoading}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    />
  </div>
</aside>

<style lang="postcss">
  .desktop-collapsed-sidebar-actions {
    top: var(--desktop-title-bar-control-top, 12px);
    left: var(
      --desktop-sidebar-compensated-inset,
      calc(var(--desktop-main-panel-inset, 8px) - 0.375rem)
    );
    height: 24px;
    padding-left: var(--desktop-window-controls-space, 88px);
    padding-right: 8px;
  }
</style>
