<script lang="ts">
  import Icon from "@poolsideai/components/icon";
  import { onDestroy } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import DesktopSettingsPanelFrame from "./settings/DesktopSettingsPanelFrame.svelte";
  import ConfirmationDialog from "./ui/ConfirmationDialog.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { SETTINGS_NAV_ITEMS } from "./settings/settingsSections";

  interface Props {
    projectPath: string;
    projectName?: string;
    centerHeader?: boolean;
    sidebarWidth?: number;
    onDone?: () => void;
    onBackToIndex?: () => void;
    desktopFrame?: boolean;
    embeddedDesktopContent?: boolean;
  }

  let {
    projectPath,
    projectName,
    centerHeader = false,
    sidebarWidth = 260,
    onDone,
    onBackToIndex,
    desktopFrame = false,
    embeddedDesktopContent = false,
  }: Props = $props();
  const projects = getACPProjectRepo();
  const conversations = getACPConversationRepo();
  const worktrees = getACPWorktreeRepo();
  const projectSettingsNavItem = SETTINGS_NAV_ITEMS["project-settings"];

  let projectNameInput = $state(projectName ?? projectPath);
  let setupScript = $state("");
  let teardownScript = $state("");
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let loading = $state(false);
  let error = $state<string | null>(null);
  let renameError = $state<string | null>(null);
  let removeConfirmOpen = $state(false);
  let loadedPath = $state<string | null>(null);
  let loadedNamePath = $state<string | null>(null);
  let lastSavedProjectName = $state<string | null>(null);
  let lastSavedSignature = $state<string | null>(null);
  let renameGeneration = 0;
  let saveGeneration = 0;
  let pendingSettingsSave: {
    timeout: ReturnType<typeof setTimeout>;
    path: string;
    generation: number;
  } | null = null;

  let projectDisplayName = $derived(projectNameInput.trim() || projectName || projectPath);

  $effect(() => {
    if (loadedPath === projectPath) return;
    flushPendingSettingsSave({ applyResponse: false });
    loadedPath = projectPath;
    lastSavedSignature = null;
    void loadSettings(projectPath);
  });

  $effect(() => {
    if (loadedNamePath === projectPath) return;
    loadedNamePath = projectPath;
    projectNameInput = projectName ?? projectPath;
    lastSavedProjectName = projectNameInput.trim();
    renameError = null;
  });

  $effect(() => {
    const trimmed = projectNameInput.trim();
    if (loadedNamePath !== projectPath || lastSavedProjectName === null) return;
    if (!trimmed) {
      renameError = "Project name is required";
      return;
    }
    if (trimmed === lastSavedProjectName) return;

    const generation = ++renameGeneration;
    const timeout = setTimeout(() => {
      void autoRenameProject(projectPath, trimmed, generation);
    }, 350);

    return () => clearTimeout(timeout);
  });

  onDestroy(() => flushPendingSettingsSave({ applyResponse: false }));

  async function loadSettings(path: string) {
    if (!path) return;
    loading = true;
    error = null;
    lastSavedSignature = null;
    try {
      const settings = await projects.getProjectSettings(path);
      if (path !== projectPath) return;
      setupScript = settings?.setupScript ?? "";
      teardownScript = settings?.teardownScript ?? "";
__POOL_SYNTHETIC_IMPORT_BASELINE__
      lastSavedSignature = settingsSignature(path);
    } catch (e) {
      if (path === projectPath) {
        error = e instanceof Error ? e.message : String(e);
      }
    } finally {
      if (path === projectPath) {
        loading = false;
      }
    }
  }

  async function autoRenameProject(path: string, name: string, generation: number) {
    renameError = null;
    try {
      await projects.renameProject(path, name);
      if (generation !== renameGeneration || path !== projectPath) return;
      lastSavedProjectName = name;
    } catch (e) {
      if (generation === renameGeneration && path === projectPath) {
        renameError = e instanceof Error ? e.message : String(e);
      }
    }
  }

  async function autoSaveSettings(
    path: string,
    generation: number,
    { applyResponse = true }: { applyResponse?: boolean } = {},
  ) {
    if (!path) return;
    const signature = settingsSignature(path);
    if (loading || loadedPath !== path || lastSavedSignature === null) return;
    if (signature === lastSavedSignature) return;
    if (applyResponse) {
      error = null;
    }
    try {
      await projects.setProjectSettings(settingsPayload(path));
      if (!applyResponse || generation !== saveGeneration || path !== projectPath) return;
      // The helper trims the saved scripts; applying the echoed response here
      // would rewrite the textarea mid-edit and delete a just-typed leading or
      // trailing newline. Keep the local text authoritative while editing.
      lastSavedSignature = signature;
    } catch (e) {
      if (applyResponse && generation === saveGeneration && path === projectPath) {
        error = e instanceof Error ? e.message : String(e);
      }
    }
  }

  function settingsPayload(path: string): ACPNavProjectSettings {
    return {
      path,
      setupScript,
      teardownScript,
      userPrompt,
    };
  }

  function settingsSignature(path: string) {
    const settings = settingsPayload(path);
    return JSON.stringify([
      settings.path,
      settings.setupScript,
      settings.teardownScript,
      settings.userPrompt,
    ]);
  }

  function scheduleSettingsSave() {
    cancelPendingSettingsSave();
    const path = projectPath;
    const generation = ++saveGeneration;
    const timeout = setTimeout(() => {
      if (pendingSettingsSave?.generation === generation) {
        pendingSettingsSave = null;
      }
      void autoSaveSettings(path, generation);
    }, 350);
    pendingSettingsSave = { timeout, path, generation };
  }

  function cancelPendingSettingsSave() {
    if (!pendingSettingsSave) return;
    clearTimeout(pendingSettingsSave.timeout);
    pendingSettingsSave = null;
  }

  function flushPendingSettingsSave({ applyResponse = true }: { applyResponse?: boolean } = {}) {
    if (!pendingSettingsSave) return;
    const pending = pendingSettingsSave;
    clearTimeout(pending.timeout);
    pendingSettingsSave = null;
    void autoSaveSettings(pending.path, pending.generation, { applyResponse });
  }

  async function removeProject() {
    cancelPendingSettingsSave();
    await projects.removeProject(projectPath);
    await worktrees.closeProject(projectPath);
    await conversations.refresh();
    removeConfirmOpen = false;
  }
</script>

{#snippet projectSettingsForm()}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <SettingsSection title="Project Name" subtitle="Rename how this project appears in the app.">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      subtitle="Your personal instructions and preferences for agents working in this project. Use AGENTS.md for shared guidance checked into the repository."
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      title="Worktree Setup Script"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      title="Worktree Teardown Script"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        title="Sync Error"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <SettingsSection title="Delete Project" subtitle="Delete this project without deleting files.">
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
        <h3 class="text-psx-foreground-primary text-[13px]/[18px] font-medium">Project Name</h3>
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
          Your personal instructions for agents working in this project. Use AGENTS.md for shared
          guidance checked into the repository.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          Worktree Setup Script
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          Worktree Teardown Script
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
          <h3 class="text-psx-foreground-primary text-[13px]/[18px] font-medium">Sync Error</h3>
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
        <h3 class="text-psx-foreground-primary text-[13px]/[18px] font-medium">Delete Project</h3>
__POOL_SYNTHETIC_IMPORT_BASELINE__
          Delete this project without deleting files.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  </div>
{/snippet}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    spellcheck="false"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
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
    autocapitalize="off"
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
    autocapitalize="off"
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
    <span>Delete Project</span>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#snippet desktopProjectSettingsContent()}
  <div class="flex h-full w-full min-w-0 flex-1 flex-col">
    {#if onBackToIndex}
      <div class="border-psx-border flex shrink-0 items-center border-b px-3 py-2">
        <button
          type="button"
          class="text-psx-foreground-primary outline-hidden hover:bg-psx-menu-hover-background focus-visible:outline-psx-focus inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2 text-[13px]/[16px] focus-visible:outline-2"
          onclick={onBackToIndex}
        >
          <Icon name="arrow-left" size={14} />
          <span>Back</span>
        </button>
      </div>
    {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  </div>
{/snippet}

{#if embeddedDesktopContent}
  {@render desktopProjectSettingsContent()}
{:else if desktopFrame}
  <DesktopSettingsPanelFrame
    title={projectSettingsNavItem.label}
    subtitle={projectName ?? projectPath}
    breadcrumbs={[
      {
        label: projectSettingsNavItem.label,
__POOL_SYNTHETIC_IMPORT_BASELINE__
        onClick: onBackToIndex,
      },
      { label: projectName ?? projectPath },
    ]}
  >
    {@render desktopProjectSettingsContent()}
  </DesktopSettingsPanelFrame>
{:else}
  <section
    class="bg-psx-editor-background text-psx-foreground-primary flex h-full min-w-0 flex-col"
  >
    <div
      class="border-psx-border relative flex h-12 shrink-0 items-center justify-between border-b px-4 py-1.5"
    >
      {#if centerHeader}
        <div
          class="pointer-events-none relative z-10 shrink-0"
          style={`width: ${sidebarWidth}px;`}
          aria-hidden="true"
        ></div>
      {/if}

      <div
        class={[
          "pointer-events-none relative z-10 min-w-0",
          centerHeader ? "flex-1 text-center" : "",
        ]}
      >
        <h1 class="truncate text-base font-semibold">Project Settings</h1>
        <p class="text-psx-foreground-secondary truncate text-[13px]/[18px]">
          {projectName ?? projectPath}
        </p>
      </div>

      <div
        class={["relative z-10", centerHeader ? "flex shrink-0 justify-end" : ""]}
        style={centerHeader ? `width: ${sidebarWidth}px;` : undefined}
      >
        <button
          type="button"
          class="text-psx-icon outline-hidden hover:bg-psx-menu-hover-background focus-visible:outline-psx-focus flex size-7 shrink-0 items-center justify-center rounded-[6px] focus-visible:outline-2"
          aria-label="Return to conversation"
          onclick={onDone}
        >
          <Icon name="cross" size={16} />
        </button>
      </div>
    </div>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  </section>
{/if}

{#if removeConfirmOpen}
  <ConfirmationDialog
    destructive
    title="Delete project?"
    description={`Delete ${projectDisplayName} from Poolside. Existing files on disk will not be deleted.`}
    confirmLabel="Delete Project"
    onCancel={() => (removeConfirmOpen = false)}
    onConfirm={removeProject}
  />
{/if}
