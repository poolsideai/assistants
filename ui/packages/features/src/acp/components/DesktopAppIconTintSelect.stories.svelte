<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DesktopAppIconTintSelect from "./DesktopAppIconTintSelect.svelte";

  const { Story } = defineMeta({
    component: DesktopAppIconTintSelect,
    args: { value: "default" },
  });
</script>

<Story name="Default" />
<Story name="Tinted" args={{ value: "green" }} />
<Story name="Disabled" args={{ disabled: true }} />
