<script lang="ts">
  import type { Snippet } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { getDisplay } from "../../../providers/index.js";

  interface Props {
    children?: Snippet;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__

  const display = getDisplay();
</script>

<div
  data-prompt-field
__POOL_SYNTHETIC_IMPORT_BASELINE__
    "relative flex items-center overflow-hidden pr-[5px] has-[+_[data-prompt-form-footer]]:mt-0.5 has-[+_[data-prompt-form-footer]]:-mb-0.5 has-[+_[data-prompt-form-footer]]:-ml-1 has-[+_[data-prompt-form-footer]]:pr-2",
    display.customUI ? "pl-7" : "pl-4",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
>
  {@render children?.()}
</div>
