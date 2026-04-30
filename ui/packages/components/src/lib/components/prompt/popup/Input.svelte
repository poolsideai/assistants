<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { getMenus, getPrompt } from "../context/prompt.js";

  interface Props extends HTMLInputAttributes {}

  let { class: className, ...rest }: Props = $props();

  const {
    elements: { inputEl, listId },
  } = getPrompt();

  const { search } = getMenus();
</script>

<input
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  autocomplete="off"
  {...rest}
  bind:this={$inputEl}
  {@attach (element) => element.focus()}
  data-prompt-input
  class={[className, "bg-transparent px-2.5 py-1.5 text-base"]}
  aria-expanded="true"
  aria-controls={listId}
  role="combobox"
  bind:value={$search}
/>
