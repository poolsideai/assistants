<script lang="ts">
  import { createPrompt } from "./context/prompt.js";
  import { writable } from "svelte/store";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  export type PromptProps = {
    value?: string;
    suggestion?: string | null;
    onValueChange?: (value: string) => void;
    onSuggestionAccepted?: (value: string) => void;
    onSubmit?: (value: string) => void;
    onSubmitNow?: (value: string) => void;
    onInterrupt?: () => void;
  };

  interface Props extends PromptProps {
    label?: string;
    class?: ClassValue;
    submitDisabled?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    children?: Snippet;
  }

  let {
    label = "",
    value = "",
    suggestion = null,
    onValueChange,
    onSuggestionAccepted,
    onSubmit,
    onSubmitNow,
    children,
    submitDisabled,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onInterrupt,
    class: className,
  }: Props = $props();

  // for some reason, toStore didn't work.
  const submitDisabledS = writable<boolean | undefined>(submitDisabled);
  $effect.pre(() => {
    submitDisabledS.set(submitDisabled);
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const onInterruptS = writable<PromptProps["onInterrupt"]>(onInterrupt);
  $effect.pre(() => {
    onInterruptS.set(onInterrupt);
  });

  const suggestionS = writable<string | null>(suggestion);
  $effect.pre(() => {
    suggestionS.set(suggestion);
  });

  const onSuggestionAcceptedS = writable<PromptProps["onSuggestionAccepted"]>(onSuggestionAccepted);
  $effect.pre(() => {
    onSuggestionAcceptedS.set(onSuggestionAccepted);
  });

  const prompt = createPrompt({
    value,
    onValueChange,
    onSubmit,
    onSubmitNow,
    submitDisabled: submitDisabledS,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onInterrupt: onInterruptS,
    suggestion: suggestionS,
    onSuggestionAccepted: onSuggestionAcceptedS,
  });

  $effect(() => {
    prompt.setValue(value, { focus: false });
  });

  const {
    elements: { rootEl, rootId, labelId },
  } = prompt;

  export const interrupt = () => prompt.interrupt();
  export const clear = () => prompt.clear();
  export const focus = () => prompt.focus();
  export const submit = () => prompt.submit();
  export const submitNow = () => prompt.submitNow();
  export const reset = () => prompt.reset();
  export const restore = (text: string) => prompt.restore(text);
  export const setValue = (text: string) => prompt.setValue(text);
  export const menus = prompt.menus;
</script>

<!--
@component

The prompt component exports an imperative API:

<Prompt bind:this={prompt} />
-->

<div
  bind:this={$rootEl}
  id={rootId}
  role="application"
  class={[className, "@container relative isolate"]}
>
  <label
    id={labelId}
    for={rootId}
    data-prompt-label
    class="absolute -m-px size-px overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0,0,0,0)]"
  >
    {label}
  </label>

  {@render children?.()}
</div>
