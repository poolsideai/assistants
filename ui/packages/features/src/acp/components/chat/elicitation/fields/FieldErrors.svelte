<script lang="ts">
  import type { AnyFieldApi } from "@tanstack/svelte-form";
  import { REQUIRED_ERROR, validate, type FieldModel } from "../../../../../elicitation";

  interface Props {
    field: AnyFieldApi;
    model: FieldModel;
    required: boolean;
  }

  const { field, model, required }: Props = $props();

  // Derived from the current value rather than read back from the form
  // library's recorded errors, for the same reason the submit button is: those
  // are only populated once a validator has run, so a schema default that is
  // already invalid would disable the button while explaining nothing. Sharing
  // one source also means the message and the button cannot disagree, and a
  // stale error from another validation cause cannot linger (PE-2419).
  const failure = $derived(validate(model, field.state.value, required));

  // "Required" is deliberately not surfaced: it marks the field invalid so
  // submit stays disabled, but the label's `*` already carries the message and
  // an untouched form should not read as a list of mistakes. Every other
  // failure is an answer that cannot be sent, which does need saying.
  const shown = $derived(failure === REQUIRED_ERROR ? undefined : failure);
</script>

{#if shown}
  <div class="text-psx-error-foreground text-xs">{shown}</div>
{/if}
