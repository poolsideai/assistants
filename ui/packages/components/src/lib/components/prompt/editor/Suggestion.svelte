<script lang="ts">
  import Icon from "../../icon/index.js";
  import { getPrompt } from "../context/prompt.js";

  const {
    disabled,
    isDirty,
    suggestion,
    menus: { menu },
  } = getPrompt();
</script>

{#if $suggestion && !$isDirty && !$disabled && !$menu}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    data-testid="prompt-suggestion"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  >
    <span class="min-w-0 flex-1 truncate">{$suggestion}</span>
    <span
      class="suggestion-shortcut flex shrink-0 items-center gap-1 text-xs text-psx-foreground-tertiary"
      aria-hidden="true"
    >
      <Icon name="enter" size={14} />
      to send
    </span>
__POOL_SYNTHETIC_IMPORT_BASELINE__
{/if}

<style lang="postcss">
  @reference "#tailwind.css";

__POOL_SYNTHETIC_IMPORT_BASELINE__
    :global(body.web-app) & {
      @apply text-(--color-mono-500);
    }

    @media (pointer: coarse) {
      @apply text-[16px];
    }
  }

  @media (pointer: coarse) {
    .suggestion-shortcut {
      display: none;
    }
  }
</style>
