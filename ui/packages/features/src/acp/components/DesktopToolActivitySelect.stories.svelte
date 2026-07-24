<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DesktopToolActivitySelect from "./DesktopToolActivitySelect.svelte";

  const { Story } = defineMeta({
    component: DesktopToolActivitySelect,
    args: { value: "grouped" },
  });
</script>

<Story name="Default" />
<Story name="Show everything selected" args={{ value: "detailed" }} />
<Story name="Disabled" args={{ disabled: true }} />
