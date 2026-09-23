<script lang="ts">
  import type { AnyFieldApi } from "@tanstack/svelte-form";
  import { isSecretField, type StringField } from "../../../../../elicitation";
  import FieldErrors from "./FieldErrors.svelte";
  import FieldLabel from "./FieldLabel.svelte";

  interface Props {
    field: AnyFieldApi;
    model: StringField;
    required: boolean;
  }

  const { field, model, required }: Props = $props();

  // Secret answers are masked and never rendered as a textarea, whatever the
  // schema's maxLength suggests.
  const secret = $derived(isSecretField(model));
</script>

<FieldLabel name={field.name} title={model.title} description={model.description} {required}>
  {#if !secret && (model.maxLength ?? 0) > 120}
    <textarea
      id={field.name}
      name={field.name}
      class="border-psx-input-border bg-psx-input-background text-psx-input-foreground placeholder:text-psx-input-placeholder-foreground focus-visible:outline-psx-focus text-[length:var(--psx-composer-font-size,14px)]/normal field-sizing-content max-h-40 w-full resize-none rounded-md border p-1.5 focus-visible:outline-2"
      rows="1"
      placeholder="Type your answer..."
      value={field.state.value ?? ""}
      oninput={(e) => field.handleChange((e.currentTarget as HTMLTextAreaElement).value)}
      onblur={field.handleBlur}
      minlength={model.minLength}
      maxlength={model.maxLength}
    ></textarea>
  {:else}
    <input
      id={field.name}
      name={field.name}
      type={secret ? "password" : (model.format ?? "text")}
      autocomplete={secret ? "off" : undefined}
      class="border-psx-input-border bg-psx-input-background text-psx-input-foreground placeholder:text-psx-input-placeholder-foreground focus-visible:outline-psx-focus text-[length:var(--psx-composer-font-size,14px)]/normal w-full rounded-md border p-1.5 focus-visible:outline-2"
      placeholder="Type your answer..."
      value={field.state.value ?? ""}
      oninput={(e) => field.handleChange((e.currentTarget as HTMLInputElement).value)}
      onblur={field.handleBlur}
      minlength={model.minLength}
      maxlength={model.maxLength}
      pattern={model.pattern}
    />
  {/if}
  <FieldErrors {field} {model} {required} />
</FieldLabel>
