<script lang="ts">
  import type { AnyFieldApi } from "@tanstack/svelte-form";
  import type { EnumField, EnumOption } from "../../../../../elicitation";
  import FieldErrors from "./FieldErrors.svelte";
  import FieldLabel from "./FieldLabel.svelte";
  import { optionRestingClass, optionRowClass, optionSelectedClass } from "./optionRow";

  interface Props {
    field: AnyFieldApi;
    model: EnumField;
    required: boolean;
  }

  const { field, model, required }: Props = $props();

  /**
   * Normalise whichever picker attribute is present into a single
   * `EnumOption[]`, plus a flag for whether free-text is allowed.
   *
   * Sources, in priority order:
   *  1. `enum` — bare-value list. Each value becomes its own option.
   *  2. `oneOf` — already an `EnumOption[]`.
   *  3. `anyOf` — branches can be flat `EnumOption`s, a nested
   *     `{oneOf: EnumOption[]}` (the agent's question-tool shape for
   *     "options + free-text"), or a `{type:"string"}` free-text branch.
   */
  const options = $derived<readonly EnumOption[]>(
    model.enum?.map((v) => ({ const: v, title: v })) ??
      model.oneOf ??
      model.anyOf?.flatMap<EnumOption>((b) =>
        "oneOf" in b ? [...b.oneOf] : "const" in b ? [b] : [],
      ) ??
      [],
  );
  const allowFreeText = $derived(
    Boolean(model.anyOf?.some((b) => "type" in b && b.type === "string")),
  );

  const selectedConst = $derived<string | undefined>(
    typeof field.state.value === "string" ? field.state.value : undefined,
  );
  const isPresetSelection = $derived(
    selectedConst !== undefined && options.some((o) => o.const === selectedConst),
  );
  const freeTextValue = $derived(
    allowFreeText && selectedConst !== undefined && !isPresetSelection ? selectedConst : "",
  );

  function selectOption(constValue: string) {
    field.handleChange(constValue);
    field.handleBlur();
  }
</script>

<FieldLabel name={field.name} title={model.title} description={model.description} {required}>
  <div class="flex flex-col gap-1.5">
    {#each options as option, idx (option.const)}
      {@const selected = selectedConst === option.const}
      <button
        type="button"
        aria-pressed={selected}
        onclick={() => selectOption(option.const)}
        class={[optionRowClass, selected ? optionSelectedClass : optionRestingClass]}
      >
        <span>{idx + 1}. {option.title ?? option.const}</span>
        {#if option.description}
          <!-- Demote with opacity rather than a foreground token, so the
               description keeps its contrast against the selected row's fill
               as well as the resting one, in both themes. -->
          <span class="text-xs opacity-80">{option.description}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if allowFreeText}
    <textarea
      id={field.name}
      name={field.name}
      class="border-psx-input-border bg-psx-input-background text-psx-input-foreground placeholder:text-psx-input-placeholder-foreground focus-visible:outline-psx-focus text-[length:var(--psx-composer-font-size,14px)]/normal field-sizing-content max-h-40 w-full resize-none rounded-md border p-1.5 focus-visible:outline-2 {isPresetSelection
        ? 'opacity-50'
        : ''}"
      rows="1"
      placeholder="Or type your own answer..."
      value={freeTextValue}
      oninput={(e) => field.handleChange((e.currentTarget as HTMLTextAreaElement).value)}
      onblur={field.handleBlur}
    ></textarea>
  {/if}
  <FieldErrors {field} {model} {required} />
</FieldLabel>
