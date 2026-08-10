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
  <div
    role="status"
    data-testid="prompt-suggestion"
    aria-label={`Suggested prompt: ${$suggestion}. Enter sends; Tab or Right Arrow edits`}
    class="pointer-events-none absolute inset-x-0 top-(--tw-pt) z-10 flex h-6 min-w-0 items-center gap-3 overflow-hidden text-left text-psx-input-placeholder-foreground select-none"
  >
    <span class="min-w-0 flex-1 truncate">{$suggestion}</span>
    <span
      class="suggestion-shortcut flex shrink-0 items-center gap-1 text-xs text-psx-foreground-tertiary"
      aria-hidden="true"
    >
      <Icon name="enter" size={14} />
      to send
    </span>
  </div>
{/if}

<style lang="postcss">
  @reference "#tailwind.css";

  [data-testid="prompt-suggestion"] {
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
