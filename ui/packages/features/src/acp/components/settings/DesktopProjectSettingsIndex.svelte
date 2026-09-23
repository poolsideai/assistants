<script lang="ts">
  import Icon from "@poolsideai/components/icon";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { slide } from "svelte/transition";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { appState } from "../../hostAdapter";
  import { shortenHomeDirectoryInText } from "../../shared/paths";
  import ProjectSettingsView from "../ProjectSettingsView.svelte";
  import DesktopSettingsPanelFrame from "./DesktopSettingsPanelFrame.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { SETTINGS_NAV_ITEMS } from "./settingsSections";

  interface Props {
    expandedProjectPath?: string | null;
    embedded?: boolean;
  }

  let { expandedProjectPath = null, embedded = false }: Props = $props();

  const projects = getACPProjectRepo();
  const projectSettingsNavItem = SETTINGS_NAV_ITEMS["project-settings"];

  let rootProjects = $derived(
    projects.projects.filter((project) => !project.isWorktree).sort(compareWorktreesByDisplayOrder),
  );
  let expandedProjectPaths = $state<string[]>([]);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  $effect(() => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  function toggleProject(path: string) {
    expandedProjectPaths = expandedProjectPaths.includes(path)
      ? expandedProjectPaths.filter((expandedPath) => expandedPath !== path)
      : [...expandedProjectPaths, path];
  }

  function isProjectExpanded(path: string) {
    return expandedProjectPaths.includes(path);
  }
</script>

{#snippet projectSettingsIndexContent()}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <SettingsSection
          title={project.name}
          subtitle={shortenHomeDirectoryInText(project.path, $appState.homeDirectory)}
          subtitleClass="font-mono"
        >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            class="text-psx-foreground-primary outline-hidden hover:bg-psx-menu-hover-background/50 focus-visible:outline-psx-focus flex min-h-10 w-full items-center gap-2 px-3 py-2 text-left transition duration-200 focus-visible:outline-2"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              class={[
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              ]}
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
  </div>
{/snippet}

{#if embedded}
  {@render projectSettingsIndexContent()}
{:else}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {@render projectSettingsIndexContent()}
  </DesktopSettingsPanelFrame>
{/if}
