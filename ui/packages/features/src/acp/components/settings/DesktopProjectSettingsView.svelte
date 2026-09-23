<script lang="ts">
  import DesktopProjectSettingsIndex from "./DesktopProjectSettingsIndex.svelte";
  import DesktopSettingsPanelFrame from "./DesktopSettingsPanelFrame.svelte";
  import { SETTINGS_NAV_ITEMS } from "./settingsSections";

  interface Props {
    projectPath?: string | null;
  }

  let { projectPath = null }: Props = $props();

  const projectSettingsNavItem = SETTINGS_NAV_ITEMS["project-settings"];
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <DesktopProjectSettingsIndex expandedProjectPath={projectPath} embedded />
</DesktopSettingsPanelFrame>
