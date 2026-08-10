<script lang="ts">
  import type { Snippet } from "svelte";
  import PromptConfigControls from "./menus/config/PromptConfigControls.svelte";

  interface Props {
    onInterrupt?: () => void;
    onSubmit?: (value: string) => void;
    submitDisabled?: boolean;
    disabled?: boolean;
    draftKey?: string | null;
    showConfigControls?: boolean;
    promptBanners?: Snippet;
    promptCommandItems?: Snippet;
  }

  let {
    onInterrupt,
    onSubmit,
    submitDisabled = false,
    disabled = false,
    draftKey = null,
    showConfigControls = true,
    promptBanners,
    promptCommandItems,
  }: Props = $props();
</script>

<div data-testid="prompt-mock-root">
  {@render promptBanners?.()}
  {@render promptCommandItems?.()}
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <div data-testid="prompt-config-controls-visibility">
    {showConfigControls ? "visible" : "hidden"}
  </div>
  {#if showConfigControls}
    <PromptConfigControls />
  {/if}
  <div
    data-testid="prompt-input"
    role="textbox"
    aria-label="Prompt"
    aria-disabled={disabled}
    contenteditable={disabled ? "false" : "true"}
  ></div>
  <button type="button" onclick={onInterrupt}>Stop</button>
  <button
    type="button"
    aria-label="Submit"
    disabled={disabled || submitDisabled}
    onclick={() => onSubmit?.("hello")}>Submit</button
  >
</div>
