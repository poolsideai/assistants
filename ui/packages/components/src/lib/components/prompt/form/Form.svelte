<script lang="ts">
  import type { PointerEventHandler } from "svelte/elements";
  import { getPrompt } from "../context/prompt.js";
  import type { Snippet } from "svelte";
  import { isTouchDevice } from "../utils/common.js";
  import { boolAttr } from "../../../utils/boolAttr.js";

  interface Props {
    disabled?: boolean;
    children?: Snippet;
  }

  let { disabled = false, children }: Props = $props();

  const { editor } = getPrompt();

  const pointerDown: PointerEventHandler<HTMLElement> = ({ target }) => {
    if (disabled) return;
    if (isTouchDevice()) return;
    if (!(target instanceof HTMLElement)) return;
    if (!$editor || $editor.hasFocus() || target.closest("button, a")) return;

    requestAnimationFrame(() => {
      if ($editor.hasFocus()) return;
      $editor.focus();
    });
  };

  let formHeight = $state(0);
</script>

<form
  data-disabled={boolAttr(disabled)}
  bind:clientHeight={formHeight}
  class="relative flex cursor-text flex-col text-[14px] disabled:cursor-auto disabled:opacity-50 disabled:select-none"
  class:small-height={formHeight <= 62}
  class:large-height={formHeight > 62}
  onpointerdown={pointerDown}
>
  {@render children?.()}
</form>

<style lang="postcss">
  @reference "#tailwind.css";
  form {
    &::after,
    &::before {
      @apply absolute inset-0 -z-10 rounded-[inherit];
      content: "";
      transform: translateZ(0);
    }
  }

  :global(body:not(.web-app)) form {
    @apply rounded-[8px] border border-psx-input-border bg-psx-input-background transition-colors;

    /* Device-pixel hairline on desktop retina; other hosts leave the token
       unset and keep the 1px default. */
    border-width: var(--psx-hairline, 1px);

    &:has(:global(.ProseMirror-focused)) {
      @apply border-psx-focus;
      &::after {
        @apply opacity-10 outline-[3px] outline-offset-1 outline-psx-focus;
      }
    }
  }

  :global(body.web-app) form.small-height {
    @apply rounded-full;
  }

  :global(body.web-app) form.large-height {
    @apply rounded-3xl;
  }

  :global(body.web-app) form {
    @apply rounded-[21px] border-none bg-(--color-mono-000) shadow-(--shadow-border);
    outline: 1px solid transparent;
    transition: outline-color 150ms;

    &:has(:global(.ProseMirror-focused)) {
      outline-color: var(--color-mono-400);
    }
  }
</style>
