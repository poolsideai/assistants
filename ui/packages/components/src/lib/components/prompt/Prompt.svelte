__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { createPrompt } from "./context/prompt.js";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    suggestion?: string | null;
    onValueChange?: (value: string) => void;
    onSuggestionAccepted?: (value: string) => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onSubmitNow?: (value: string) => void;
    onInterrupt?: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    submitDisabled?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    value = "",
    suggestion = null,
    onValueChange,
    onSuggestionAccepted,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onSubmitNow,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    submitDisabled,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onInterrupt,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onSubmitNow,
    submitDisabled: submitDisabledS,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onInterrupt: onInterruptS,
    suggestion: suggestionS,
    onSuggestionAccepted: onSuggestionAcceptedS,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<!--
@component

The prompt component exports an imperative API:

<Prompt bind:this={prompt} />
-->

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
