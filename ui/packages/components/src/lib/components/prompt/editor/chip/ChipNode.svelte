<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon, { type IconName } from "../../../icon/index.js";
  import ChipTooltip from "./ChipTooltip.svelte";

  interface Props {
    label: string;
    icon?: IconName | Snippet;
    fileIconPath?: string;
    tooltip?: string;
    tooltipContent?: Snippet;
    // for handling click / Enter
    onActivate?: (e: Event) => void;
    ariaLabel?: string;
  }

  let { label, icon, fileIconPath, tooltip, tooltipContent, onActivate, ariaLabel }: Props =
    $props();

  function isSnippet(value: IconName | Snippet): value is Snippet {
    return typeof value === "function";
  }

  function handleClick(e: MouseEvent) {
    if (!onActivate) return;
    e.stopPropagation();
    e.preventDefault();
    onActivate(e);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!onActivate) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate(e);
    }
  }
</script>

<ChipTooltip
  text={tooltip ?? ""}
  {tooltipContent}
  show={!!tooltipContent || (!!tooltip && tooltip !== label)}
>
  <div
    class="group"
    class:clickable={!!onActivate}
    {...onActivate
      ? {
          role: "button" as const,
          tabindex: 0,
          onclick: handleClick,
          onkeydown: handleKeydown,
        }
      : {}}
    aria-label={ariaLabel}
  >
    {#if icon && isSnippet(icon)}
      {@render icon()}
    {:else if fileIconPath}
      <span class="mr-0.5 inline-flex items-center align-middle" aria-hidden="true">
        <Icon
          type="file"
          name={fileIconPath}
          fallback={typeof icon === "string" ? icon : "file"}
          size={13}
        />
      </span>
    {:else if icon}
      <Icon name={icon} size={12} class="mr-1 align-middle" />
    {/if}{label}
  </div>
</ChipTooltip>

<style lang="postcss">
  @reference "#tailwind.css";
  div {
    @apply relative isolate inline-block truncate align-middle text-sm select-none;
    @apply max-h-6 max-w-full px-1.5 leading-6;
    @apply before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-sm before:border before:border-solid before:border-psx-border before:bg-psx-chrome before:duration-100;
    @apply text-psx-foreground-secondary;

    /* Chips embedded in rendered markdown must remain part of the text
       selection so copying surrounding prose keeps the chip label.
       The ProseMirror editor is not `.markdown`, so its chips stay atomic via
       the base `select-none` above. */
    :global(.markdown [data-skill]) &,
    :global(.markdown [data-command]) &,
    :global(.markdown [data-file-path]) & {
      @apply select-text;
    }

    &.clickable {
      @apply cursor-pointer hover:text-psx-foreground-primary;
    }

    :global(.ProseMirror-focused .ProseMirror-selectednode) > & {
      @apply text-psx-foreground-primary before:border-psx-focus;
    }

    :global([data-selection]) > & {
      @apply text-psx-foreground-primary;
      @apply after:absolute after:inset-x-0 after:-z-10 after:h-full after:bg-psx-editor-selection-background;
    }

    :global(.ProseMirror:not(.ProseMirror-focused) [data-selection]) > & {
      @apply after:hidden;
    }
    :global(.markdown.user [data-skill]) &,
    :global(.markdown.user [data-command]) &,
    :global(.markdown.user [data-file-path]) & {
      color: var(--psx-user-chip-fg, var(--psx-bubble-foreground));
      border-radius: var(--radius-sm, 2px);

      &::before {
        @apply border-none opacity-25;
      }
    }
  }
</style>
