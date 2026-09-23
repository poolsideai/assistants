__POOL_SYNTHETIC_IMPORT_BASELINE__
  import Icon, { type IconName } from "@poolsideai/components/icon";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { appState } from "../../hostAdapter";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { supportsNativeMenus } from "./desktopContextMenu";
  import { presentNativeMenu, type MenuSpecItem } from "../ui/menuSpec";
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
  // macOS desktop presents this as an OS-native menu; other desktop platforms
  // fall back to the DOM menu below.
  const native = $derived(supportsNativeMenus($appState.environment));
  let menuTriggerButton = $state<HTMLButtonElement>();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      : "text-psx-icon hover:bg-psx-menu-hover-background",
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const prLabel = $derived(links?.prExists ? "Open Current PR" : "Open New PR");

  // Single source of truth for the menu's actions: the DOM menu renders these
  // as rows below, the native menu maps them to spec items. Both dispatch
  // through runGithubMenuAction.
  type GithubMenuActionId = "openPr" | "openPulls" | "openIssues" | "openRepo";

  interface GithubMenuAction {
    id: GithubMenuActionId;
    label: string;
    icon: IconName;
  }

  const githubMenuActions = $derived<GithubMenuAction[]>([
    { id: "openPr", label: prLabel, icon: "git-branch" },
    { id: "openPulls", label: "Open All Pull Requests", icon: "review" },
    { id: "openIssues", label: "Open Issues", icon: "alert" },
    { id: "openRepo", label: "Open Repository", icon: "github" },
  ]);

  function runGithubMenuAction(id: string) {
    switch (id as GithubMenuActionId) {
      case "openPr":
        openExternal(links?.prUrl);
        return;
      case "openPulls":
        openExternal(links?.pullsUrl);
        return;
      case "openIssues":
        openExternal(links?.issuesUrl);
        return;
      case "openRepo":
        openExternal(links?.repoUrl);
        return;
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (open) {
      open = false;
      return;
    }
    open = true;
    await ensureLinks();
    if (native) await openNativeMenu();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Native menus can't be updated once shown, so present them only after
  // ensureLinks() (awaited by toggleMenu above) has resolved.
  async function openNativeMenu() {
    if (!menuTriggerButton) {
      open = false;
      return;
    }
    const rect = menuTriggerButton.getBoundingClientRect();
    try {
      const items: MenuSpecItem[] = githubMenuActions.map((action) => ({
        kind: "action",
        id: action.id,
        label: action.label,
        icon: action.icon,
        enabled: !loading,
      }));
      const id = await presentNativeMenu(
        items,
        { x: rect.right, y: rect.bottom + 4, align: "end" },
        { highlightStyle: "themed" },
      );
      if (id) runGithubMenuAction(id);
    } finally {
      open = false;
    }
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          "outline-hidden focus-visible:outline-psx-focus flex shrink-0 items-center gap-1.5 rounded-l-[6px] transition-colors ease-out focus-visible:outline-2",
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
        bind:this={menuTriggerButton}
__POOL_SYNTHETIC_IMPORT_BASELINE__
          "outline-hidden focus-visible:outline-psx-focus flex shrink-0 items-center justify-center rounded-r-[6px] transition-colors ease-out focus-visible:outline-2",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        title="GitHub Actions"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if open && !native}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        class="menu-surface absolute right-0 z-50 mt-1 w-56 overflow-hidden p-1"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {#each githubMenuActions as action (action.id)}
          <button
            type="button"
            role="menuitem"
            class="hover:bg-psx-menu-hover-background flex h-8 w-full items-center gap-2 rounded-[4px] px-2 text-left disabled:opacity-50"
            disabled={loading}
            data-tauri-drag-region="false"
            onclick={() => runGithubMenuAction(action.id)}
          >
            <Icon name={action.icon} size={14} class="text-psx-icon shrink-0" />
            <span class="min-w-0 flex-1 truncate">{action.label}</span>
          </button>
        {/each}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
