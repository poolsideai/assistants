<script lang="ts">
  interface Props {
    onValueChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    onSubmitNow?: (value: string) => void;
  }

  let { onValueChange, onSubmit, onSubmitNow }: Props = $props();
  let value = $state("");

  export function focus(): boolean {
    return true;
  }

  export function restore(next: string): void {
    value = next;
  }

  export const menus = {
    push: (_value: string) => void _value,
  };

  function submit(callback = onSubmit): void {
    callback?.(value);
    value = "";
    onValueChange?.("");
  }
</script>

<input
  data-testid="prompt-input"
  {value}
  oninput={(event) => {
    value = event.currentTarget.value;
    onValueChange?.(value);
  }}
/>
<button type="button" aria-label="Submit" disabled={!value} onclick={() => submit()}>Submit</button>
<button
  type="button"
  aria-label="Interrupt & Send Now"
  disabled={!value}
  onclick={() => submit(onSubmitNow)}>Interrupt & Send Now</button
>
