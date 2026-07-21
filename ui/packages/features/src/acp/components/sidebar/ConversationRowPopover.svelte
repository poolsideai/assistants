__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { onDestroy } from "svelte";
  import { cubicIn } from "svelte/easing";
  import { fly } from "svelte/transition";
  import type { ACPConversationSummary } from "../../navTypes";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import {
    getAcpSidebarController,
    type SidebarConversationPreviewTarget,
  } from "./SidebarController.svelte";
  import { rowExitAnimation } from "./rowExitAnimation.svelte";
  import { rowExitDurationMs } from "./rowExitTransition";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    iconSlotSize?: number;
    leadingPaddingClass?: string;
    working?: boolean;
    waitingForUser?: boolean;
    unread?: boolean;
    shortcutHint?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Read when the row leaves the list, so the exit animation is reserved for
    // rows the user archived rather than rows a search or collapse filtered out.
    isExiting?: () => boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onArchive?: (event: MouseEvent) => void | Promise<void>;
    onArchiveNow?: (event: MouseEvent) => void | Promise<void>;
    onContextMenu?: (event: MouseEvent) => void;
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
    iconSlotSize = iconSize,
    leadingPaddingClass = "pl-2",
    working = false,
    waitingForUser = false,
    unread = false,
    shortcutHint,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isExiting,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onArchive,
    onArchiveNow,
    onContextMenu,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let rowElement = $state<HTMLDivElement | null>(null);

  // Svelte evaluates transition params when the outro starts, so this reads
  // the caller's exiting state at the moment the row is actually removed. That
  // gate is also what makes the outro safe to mark |global: emptying a group
  // tears down the wrapper around the row list, which would skip a local
  // transition, while collapsing or unmounting the sidebar still resolves to a
  // zero duration and no animation.
  function exitDuration(): number {
    return rowExitDurationMs(isExiting?.() === true);
  }

  // Reports real exit outros to the shared animation state so empty-state
  // copy waits for outroend. The exiting flag is captured at outrostart:
  // delete clears it in a finally that can run before the outro finishes.
  // Svelte can start the same element's outro twice in one removal (observed
  // in the desktop webview), and only the surviving animation dispatches
  // outroend — so each exit is counted at most once.
  let exitOutroCounted = false;

  function handleOutroStart() {
    if (exitOutroCounted || isExiting?.() !== true) return;
    exitOutroCounted = true;
    rowExitAnimation.outroStarted();
  }

  function handleOutroEnd() {
    if (!exitOutroCounted) return;
    exitOutroCounted = false;
    rowExitAnimation.outroEnded();
  }

  function previewTarget(): SidebarConversationPreviewTarget | null {
    if (!rowElement) return null;
    return {
      key: reviewKey,
      anchor: rowElement,
      session,
      agentName,
      iconUrl,
      iconClass,
      iconSize,
      desktop,
    };
  }

  function handlePointerEnter(event: PointerEvent) {
    const target = previewTarget();
    if (target) sidebar.openConversationPreview(target, event);
  }

  function handleContextMenu(event: MouseEvent) {
    sidebar.closeConversationPreview();
    onContextMenu?.(event);
  }

  $effect(() => {
    const target = previewTarget();
    if (target) sidebar.refreshConversationPreview(target);
  });

  onDestroy(() => {
    if (rowElement) sidebar.unmountConversationPreviewRow(reviewKey, rowElement);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  role="presentation"
  out:fly|global={{ x: -32, opacity: 0, duration: exitDuration(), easing: cubicIn }}
  onoutrostart={handleOutroStart}
  onoutroend={handleOutroEnd}
  onpointerenter={handlePointerEnter}
  onpointerleave={() => sidebar.leaveConversationPreview(reviewKey)}
  onpointerdown={() => sidebar.cancelConversationPreviewOpen(reviewKey)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Source-list selection, styled in the desktop stylesheet off this class
    // rather than here: the fill and its ring are desktop-only — see app.css.
    selected && desktop ? "desktop-sidebar-row-selected" : "",
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
    {iconSlotSize}
    {leadingPaddingClass}
    {working}
    {waitingForUser}
    {unread}
    {shortcutHint}
    {desktop}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {onArchive}
    {onArchiveNow}
    onContextMenu={handleContextMenu}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
