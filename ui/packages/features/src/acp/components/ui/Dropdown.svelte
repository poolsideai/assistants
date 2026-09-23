<script lang="ts">
  import { Dropdown as SharedDropdown } from "@poolsideai/components/assistant-ui";
  import type { IconName } from "@poolsideai/components/icon";
  import type { Snippet } from "svelte";

  interface Props {
    icon: IconName;
    iconClass?: string;
    label: string;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
    header?: Snippet;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    searchable?: boolean;
    searchPlaceholder?: string;
    disableFocusFirstItem?: boolean;
    wide?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  let {
    icon,
    iconClass,
    label,
    placement = "bottom-start",
    header,
    children,
    searchable = false,
    searchPlaceholder = "Search...",
    disableFocusFirstItem = false,
    wide = false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }: Props = $props();
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {iconClass}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {disableFocusFirstItem}
  {wide}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
