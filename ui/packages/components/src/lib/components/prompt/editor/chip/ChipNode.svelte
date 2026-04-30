<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import Icon, { type IconName } from "../../../icon/index.js";
  import ChipTooltip from "./ChipTooltip.svelte";

  interface Props {
    label: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    fileIconPath?: string;
    tooltip?: string;
    tooltipContent?: Snippet;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  let { label, icon, fileIconPath, tooltip, tooltipContent, onActivate, ariaLabel }: Props =
    $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

<ChipTooltip
  text={tooltip ?? ""}
  {tooltipContent}
  show={!!tooltipContent || (!!tooltip && tooltip !== label)}
>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
  </div>
</ChipTooltip>

<style lang="postcss">
  @reference "#tailwind.css";
  div {
    @apply relative isolate inline-block truncate align-middle text-sm select-none;
    @apply max-h-6 max-w-full px-1.5 leading-6;
    @apply before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-sm before:border before:border-solid before:border-psx-border before:bg-psx-chrome before:duration-100;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /* Chips embedded in rendered markdown must remain part of the text
__POOL_SYNTHETIC_IMPORT_BASELINE__
       The ProseMirror editor is not `.markdown`, so its chips stay atomic via
       the base `select-none` above. */
    :global(.markdown [data-skill]) &,
    :global(.markdown [data-command]) &,
    :global(.markdown [data-file-path]) & {
      @apply select-text;
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      color: var(--psx-user-chip-fg, var(--psx-bubble-foreground));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        @apply border-none opacity-25;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
</style>
