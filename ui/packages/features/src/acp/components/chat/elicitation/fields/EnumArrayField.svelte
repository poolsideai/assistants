<script lang="ts">
  import type { AnyFieldApi } from "@tanstack/svelte-form";
  import type { ArrayField, EnumOption } from "../../../../../elicitation";
  import FieldErrors from "./FieldErrors.svelte";
  import FieldLabel from "./FieldLabel.svelte";
  import { optionRestingClass, optionRowClass, optionSelectedClass } from "./optionRow";

  interface Props {
    field: AnyFieldApi;
    model: ArrayField;
    required: boolean;
  }

  const { field, model, required }: Props = $props();

  const options = $derived<readonly EnumOption[]>(
    model.items.enum?.map((v) => ({ const: v, title: v })) ?? model.items.anyOf ?? [],
  );

  const selected = $derived<Set<string>>(
    new Set(Array.isArray(field.state.value) ? (field.state.value as string[]) : []),
  );

  function toggle(constValue: string) {
    const current = new Set(selected);
    if (current.has(constValue)) current.delete(constValue);
    else current.add(constValue);
    const ordered = options.filter((o) => current.has(o.const)).map((o) => o.const);
    field.handleChange(ordered);
    field.handleBlur();
  }
</script>

<FieldLabel name={field.name} title={model.title} description={model.description} {required}>
  <div class="flex flex-col gap-1.5">
    {#each options as option, idx (option.const)}
      {@const isSelected = selected.has(option.const)}
      <button
        type="button"
        aria-pressed={isSelected}
        onclick={() => toggle(option.const)}
        class={[optionRowClass, isSelected ? optionSelectedClass : optionRestingClass]}
      >
        <span>{idx + 1}. {option.title ?? option.const}</span>
        {#if option.description}
          <!-- Opacity, not a foreground token, so the description keeps its
               contrast on the selected fill too (see EnumField). -->
          <span class="text-xs opacity-80">{option.description}</span>
        {/if}
      </button>
    {/each}
  </div>
  <FieldErrors {field} {model} {required} />
</FieldLabel>
