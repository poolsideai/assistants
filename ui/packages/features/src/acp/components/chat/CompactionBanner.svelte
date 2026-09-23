<script lang="ts">
  import { Spinner } from "@poolsideai/components/spinner";
  import { slide } from "svelte/transition";
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
  <div
    class="border-psx-border bg-psx-editor-background text-psx-foreground-secondary mx-px flex items-center gap-1.5 rounded-full border px-2 py-1.5 text-sm"
    transition:slide={{ duration: 200 }}
  >
    <Spinner size={12} />
    <span class="flex-1">Compacting conversation…</span>
  </div>
{/if}
