<script lang="ts">
  import type { IconName } from "../../icon/index.js";
  import { getPrompt } from "../context/prompt.js";
  import SubmitButton from "./SubmitButton.svelte";
  import type { MouseEventHandler } from "svelte/elements";

  interface Props {
    icon?: IconName;
    label?: string;
    title?: string;
    oncontextmenu?: MouseEventHandler<HTMLButtonElement>;
  }

  let { icon, label = "Submit", title, oncontextmenu }: Props = $props();

  const {
    submit,
    canSubmit,
    elements: { submitEl },
  } = getPrompt();
</script>

<SubmitButton
  {icon}
  {label}
  title={title ?? label}
  disabled={!$canSubmit}
  onclick={() => submit()}
  {oncontextmenu}
  bind:ref={$submitEl}
/>
