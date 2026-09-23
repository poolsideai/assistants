<script lang="ts">
  import Icon from "@poolsideai/components/icon";
  import type { ModeChange } from "../../types";
__POOL_SYNTHETIC_IMPORT_BASELINE__

  interface Props {
    event: ModeChange;
    source?: "user" | "tool_call";
  }

  let { event, source }: Props = $props();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let mode = $derived(event.currentModeId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

<div
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
>
  <div
    data-size="sm"
    class="text-auto text-psx-foreground-secondary relative isolate flex items-center justify-between gap-1.5 truncate px-2 py-1"
  >
    <div class="inline-flex items-center gap-1 truncate">
      <Icon class="text-psx-icon" name={mode === "plan" ? "plan" : "code"} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    </div>
  </div>
</div>
