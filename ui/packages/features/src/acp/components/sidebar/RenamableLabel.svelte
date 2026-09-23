<script lang="ts">
  import { onMount, tick } from "svelte";

  // Finder-style inline rename: a sidebar row's label swaps to this input with
  // the current name pre-selected. Enter or clicking away commits, Escape
  // reverts. Rows render it in place of their label/button while renaming —
  // never inside the row's <button>, where an input would be invalid HTML.
  interface Props {
    // Current name; committing an unchanged or empty value cancels instead.
    value: string;
    ariaLabel: string;
    onSubmit: (value: string) => void | Promise<void>;
    onCancel: () => void;
    class?: string;
  }

  let { value, ariaLabel, onSubmit, onCancel, class: className = "" }: Props = $props();

  let inputElement = $state<HTMLInputElement | null>(null);
  let nextValue = $state(value);
  // Committing unmounts the input, which fires a final blur; only the first
  // commit/cancel wins.
  let settled = false;

  onMount(() => {
    void tick().then(() => {
      inputElement?.focus();
      inputElement?.select();
    });
  });

  function commit() {
    if (settled) return;
    settled = true;
    const trimmed = nextValue.trim();
    if (!trimmed || trimmed === value) {
      onCancel();
      return;
    }
    void onSubmit(trimmed);
  }

  function cancel() {
    if (settled) return;
    settled = true;
    onCancel();
  }
</script>

<input
  bind:this={inputElement}
  bind:value={nextValue}
  type="text"
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  autocomplete="off"
  aria-label={ariaLabel}
  class={[
    "bg-psx-input-background text-psx-foreground-primary outline-psx-focus h-[18px] min-w-0 flex-1 select-text rounded-[3px] border-0 px-1 py-0 outline-2",
    className,
  ]}
  onkeydown={(event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    }
  }}
  onblur={commit}
  onclick={(event) => event.stopPropagation()}
  ondblclick={(event) => event.stopPropagation()}
  onpointerdown={(event) => event.stopPropagation()}
  oncontextmenu={(event) => event.stopPropagation()}
/>

<style lang="postcss">
  input {
    /* Inputs don't inherit typography; match the label the input replaces. */
    font: inherit;
  }
</style>
