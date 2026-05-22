<script lang="ts">
  import Icon, { type IconName } from "../../icon/index.js";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { MouseEventHandler } from "svelte/elements";

  interface Props {
    icon?: IconName;
    label?: string;
    title?: string;
    disabled?: boolean;
    onclick?: () => void;
    oncontextmenu?: MouseEventHandler<HTMLButtonElement>;
    ref?: HTMLElement;
  }

  let {
    icon = "submit",
    label = "Submit",
    title = label,
    disabled = false,
    onclick,
    oncontextmenu,
    ref = $bindable(),
  }: Props = $props();

__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

<button
  type="button"
  class="flex text-psx-foreground-primary hover:bg-psx-chrome-hover focus-visible:border-psx-focus focus-visible:text-psx-focus active:bg-psx-chrome-active {customUI
__POOL_SYNTHETIC_IMPORT_BASELINE__
    : 'size-[22px]'} shrink-0 items-center justify-center rounded-full bg-transparent focus:outline-hidden focus-visible:border disabled:pointer-events-none disabled:opacity-25"
  aria-label={label}
  {title}
__POOL_SYNTHETIC_IMPORT_BASELINE__
  bind:this={ref}
  {disabled}
  {onclick}
  {oncontextmenu}
>
  <Icon aria-hidden="true" name={icon} size={customUI ? 24 : 20} />
</button>
