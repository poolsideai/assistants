<script lang="ts">
  import DesktopSettingsPanelFrame from "./DesktopSettingsPanelFrame.svelte";

  interface Props {
    title?: string;
  }

  let { title = "General" }: Props = $props();
</script>

<DesktopSettingsPanelFrame {title}>
  <div data-testid="settings-content">Settings content</div>
</DesktopSettingsPanelFrame>
