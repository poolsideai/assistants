__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /** Optional glyph-only colour or presentation class. */
    iconClass?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    agentIcon?: {
      iconUrl?: string;
      class?: string;
      overlayIconUrl?: string;
      overlayClass?: string;
    };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /** Secondary line under the label, e.g. what a config value does. */
    caption?: string;
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // NSMenu-style icon column: when any row of the sheet carries an icon,
  // icon-less rows reserve the same box so every label starts at the same
  // x. Sheets with no icons at all stay flush-left.
  const reserveIconBox = $derived(options.some((option) => option.agentIcon || option.icon));

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  // Drag-to-dismiss from the grab handle: follow the finger down, then close if
  // pulled past a threshold, otherwise snap back.
  const DISMISS_THRESHOLD_PX = 80;
  let dragOffset = $state(0);
  let dragging = $state(false);
  let dragStartY = 0;

  function onDragStart(event: PointerEvent) {
    dragging = true;
    dragStartY = event.clientY;
    dragOffset = 0;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onDragMove(event: PointerEvent) {
    if (!dragging) return;
    dragOffset = Math.max(0, event.clientY - dragStartY);
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    if (dragOffset > DISMISS_THRESHOLD_PX) onClose();
    else dragOffset = 0;
  }
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
<!-- Height tracks the visual viewport (the area above the keyboard) rather than
     inset-0, so when the composer keeps focus the sheet lands above the
     keyboard instead of behind it. Falls back to the full viewport when no
     keyboard is up. See installMobileViewportTracking. -->
<div
  class="fixed inset-x-0 top-0 z-[110] flex flex-col justify-end"
  style="height: var(--visual-viewport-height, 100dvh)"
>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <!-- Flex column capped at a share of the overlay (which has a definite
       height), so the sheet grows to its content and only the options list
       scrolls once it would exceed the cap. A percentage height on the list
       itself would resolve against this auto-height sheet and misbehave. -->
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    class="mobile-select-sheet bg-psx-panel shadow-overlay dark:shadow-overlay-dark relative flex max-h-[85%] flex-col rounded-t-2xl px-2 pt-2"
    class:dragging
    style:transform={`translateY(${dragOffset}px)`}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <!-- Grab handle + title double as the drag-to-dismiss area. touch-none so
         the browser doesn't hijack the vertical drag as a scroll. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="-mx-2 -mt-2 touch-none px-2 pt-2"
      onpointerdown={onDragStart}
      onpointermove={onDragMove}
      onpointerup={onDragEnd}
      onpointercancel={onDragEnd}
    >
      <div class="bg-psx-border mx-auto mb-2 mt-1 h-1 w-9 rounded-full" aria-hidden="true"></div>
      <div class="text-psx-foreground-primary min-w-0 truncate px-3 pb-2 text-[15px] font-semibold">
        {title}
      </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            "outline-hidden active:bg-psx-menu-hover-background focus-visible:outline-psx-focus text-psx-foreground-primary flex w-full gap-3 rounded-lg py-3 pr-3 text-left text-[15px] focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50",
__POOL_SYNTHETIC_IMPORT_BASELINE__
            // A captioned row anchors its icon and trailing marks to the label
            // rather than to the middle of the taller row.
            option.caption ? "items-start" : "items-center",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          {#if option.agentIcon || option.icon}
            <!-- Sized to one line of the 15px label so the glyph centres on the
                 first line, not on the whole two-line row. -->
            <span class={["flex shrink-0 items-center", option.caption && "h-[1.5em]"]}>
              {#if option.agentIcon}
                <RegistryAgentIcon
                  iconUrl={option.agentIcon.iconUrl}
                  size={18}
                  class={option.agentIcon.class ?? ""}
                  overlayIconUrl={option.agentIcon.overlayIconUrl}
                  overlayClass={option.agentIcon.overlayClass}
                />
              {:else if option.icon}
                <Icon
                  name={option.icon}
                  size={18}
                  class={["shrink-0", option.iconClass]}
                  aria-hidden="true"
                />
              {/if}
            </span>
          {:else if reserveIconBox}
            <!-- The icon column's empty box (icons render 18px square). -->
            <span class="w-[18px] shrink-0" aria-hidden="true"></span>
          {/if}
          {#if option.caption}
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="truncate">{option.label}</span>
              <span class="text-psx-foreground-tertiary line-clamp-2 text-[13px] leading-snug">
                {option.caption}
              </span>
            </span>
          {:else}
            <span class="min-w-0 flex-1 truncate">{option.label}</span>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          {#if option.selected || option.submenu}
            <span class={["flex shrink-0 items-center", option.caption && "h-[1.5em]"]}>
              {#if option.selected}
                <Icon name="checkmark" size={16} class="shrink-0 opacity-70" aria-hidden="true" />
              {:else}
                <Icon
                  name="chevron"
                  size={14}
                  class="shrink-0 -rotate-90 opacity-50"
                  aria-hidden="true"
                />
              {/if}
            </span>
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
    /* Snap back after a drag that didn't cross the dismiss threshold. */
    transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Track the finger 1:1 while dragging. */
  .mobile-select-sheet.dragging {
    transition: none;
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
