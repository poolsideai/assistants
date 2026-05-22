__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { IconName } from "../../icon/index.js";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import SubmitButton from "./SubmitButton.svelte";
  import type { MouseEventHandler } from "svelte/elements";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    icon?: IconName;
    label?: string;
    title?: string;
    oncontextmenu?: MouseEventHandler<HTMLButtonElement>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let { icon, label = "Submit", title, oncontextmenu }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    canSubmit,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<SubmitButton
  {icon}
  {label}
  title={title ?? label}
  disabled={!$canSubmit}
  onclick={() => submit()}
  {oncontextmenu}
  bind:ref={$submitEl}
/>
