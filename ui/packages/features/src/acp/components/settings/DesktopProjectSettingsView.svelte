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

<DesktopSettingsPanelFrame
  title={projectSettingsNavItem.label}
  breadcrumbs={[{ label: projectSettingsNavItem.label, icon: projectSettingsNavItem.icon }]}
>
  <DesktopProjectSettingsIndex expandedProjectPath={projectPath} embedded />
</DesktopSettingsPanelFrame>
