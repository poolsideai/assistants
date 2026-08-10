<script lang="ts">
  import { onMount, tick } from "svelte";

  interface Props {
    title: string;
    label: string;
    value: string;
    onCancel: () => void;
    onRename: (value: string) => void | Promise<void>;
  }

  let { title, label, value, onCancel, onRename }: Props = $props();
  let inputElement = $state<HTMLInputElement | null>(null);
  let nextValue = $state(value);
  let error = $state("");
  let saving = $state(false);

  onMount(() => {
    void tick().then(() => {
      inputElement?.focus();
      inputElement?.select();
    });
  });

  async function submit() {
    const trimmed = nextValue.trim();
    if (!trimmed) {
      error = "Name is required";
      return;
    }
    saving = true;
    try {
      await onRename(trimmed);
    } finally {
      saving = false;
    }
  }
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape") onCancel();
  }}
/>

<div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4">
  <form
    class="bg-psx-panel text-psx-foreground-primary shadow-overlay dark:shadow-overlay-dark w-full max-w-[360px] rounded-lg p-4"
    onsubmit={(event) => {
      event.preventDefault();
      void submit();
    }}
  >
    <h2 class="text-sm font-medium">{title}</h2>
    <label class="text-psx-foreground-secondary mt-3 block text-xs" for="acp-rename-input">
      {label}
    </label>
    <input
      id="acp-rename-input"
      bind:this={inputElement}
      bind:value={nextValue}
      aria-invalid={error ? "true" : "false"}
      spellcheck="false"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      class="border-psx-border bg-psx-input-background outline-hidden focus-visible:outline-psx-focus mt-1 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:outline-2"
      oninput={() => (error = "")}
    />
    {#if error}
      <p class="text-psx-error-foreground mt-2 text-xs">{error}</p>
    {/if}
    <div class="mt-4 flex justify-end gap-2">
      <button
        type="button"
        class="hover:bg-psx-menu-hover-background outline-hidden focus-visible:outline-psx-focus rounded-md px-3 py-1.5 text-sm focus-visible:outline-2"
        onclick={onCancel}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        class="bg-psx-button-primary-background text-psx-button-primary-foreground outline-hidden focus-visible:outline-psx-focus rounded-md px-3 py-1.5 text-sm focus-visible:outline-2 disabled:opacity-60"
      >
        Rename
      </button>
    </div>
  </form>
</div>
