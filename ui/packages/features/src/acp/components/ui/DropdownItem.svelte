<script lang="ts">
  import { DropdownItem as SharedDropdownItem } from "@poolsideai/components/assistant-ui";
  import type { IconName } from "@poolsideai/components/icon";
  import type { Snippet } from "svelte";

  interface Props {
    icon: IconName;
    iconClass?: string;
    label: string;
    description?: string | null;
    tag?: string;
    selected?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onclick?: () => void;
    accessories?: Snippet;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    iconClass,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    description,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

<SharedDropdownItem
  {icon}
  {iconClass}
  {label}
  {description}
  {tag}
  {selected}
  {disabled}
  {onclick}
  {accessories}
/>
