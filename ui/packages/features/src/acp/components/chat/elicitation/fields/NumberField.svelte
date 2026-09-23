<script lang="ts">
  import type { AnyFieldApi } from "@tanstack/svelte-form";
  import type { NumberField } from "../../../../../elicitation";
  import FieldErrors from "./FieldErrors.svelte";
  import FieldLabel from "./FieldLabel.svelte";

  interface Props {
    field: AnyFieldApi;
    model: NumberField;
    required: boolean;
  }

  const { field, model, required }: Props = $props();

  function onInput(raw: string) {
    if (raw === "") {
      field.handleChange(undefined);
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) field.handleChange(n);
    else field.handleChange(raw);
  }
</script>

<FieldLabel name={field.name} title={model.title} description={model.description} {required}>
  <input
    id={field.name}
    name={field.name}
    type="number"
    class="border-psx-input-border bg-psx-input-background text-psx-input-foreground focus-visible:outline-psx-focus text-[length:var(--psx-composer-font-size,14px)]/normal w-full rounded-md border p-1.5 focus-visible:outline-2"
    value={field.state.value ?? ""}
    oninput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
    onblur={field.handleBlur}
    min={model.minimum}
    max={model.maximum}
    step={model.type === "integer" ? 1 : "any"}
  />
  <FieldErrors {field} {model} {required} />
</FieldLabel>
