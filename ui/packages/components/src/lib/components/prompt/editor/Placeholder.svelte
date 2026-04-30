<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { getPrompt } from "../context/prompt.js";
  import type { Snippet } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
    children?: Snippet;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__

  const {
    disabled,
    isDirty,
    suggestion,
    menus: { menu },
  } = getPrompt();
</script>

{#if !$isDirty && !($suggestion && !$disabled && !$menu)}
  <p
__POOL_SYNTHETIC_IMPORT_BASELINE__
      "pointer-events-none absolute inset-x-0 top-(--tw-pt) bottom-(--tw-pb) -z-10 whitespace-nowrap text-psx-input-placeholder-foreground select-none",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  >
    {@render children?.()}
  </p>
{/if}

<style lang="postcss">
  @reference "#tailwind.css";

  p {
    :global(body.web-app) & {
      @apply text-(--color-mono-500);
    }

    mask-image: linear-gradient(to right, var(--psx-input-background) 95%, transparent);

    @media (pointer: coarse) {
      @apply text-[16px];
    }
  }
</style>
