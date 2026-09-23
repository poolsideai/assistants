<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import PromptConfigControls from "./menus/config/PromptConfigControls.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  interface Props {
    onInterrupt?: () => void;
    onSubmit?: (value: string) => void;
    submitDisabled?: boolean;
    disabled?: boolean;
    draftKey?: string | null;
    showConfigControls?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onSubmit,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    disabled = false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    showConfigControls = true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <button
    type="button"
    aria-label="Submit"
    disabled={disabled || submitDisabled}
    onclick={() => onSubmit?.("hello")}>Submit</button
  >
__POOL_SYNTHETIC_IMPORT_BASELINE__
