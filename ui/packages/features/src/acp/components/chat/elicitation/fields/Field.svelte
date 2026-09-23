<script lang="ts">
  import type { AnyFieldApi } from "@tanstack/svelte-form";
  import { isEnumField, isNumberField, type FieldModel } from "../../../../../elicitation";
  import StringField from "./StringField.svelte";
  import EnumArrayField from "./EnumArrayField.svelte";
  import BooleanField from "./BooleanField.svelte";
  import NumberField from "./NumberField.svelte";
  import EnumField from "./EnumField.svelte";

  interface Props {
    field: AnyFieldApi;
    model: FieldModel;
    required: boolean;
  }

  const { field, model, required }: Props = $props();
</script>

{#if isEnumField(model)}
  <EnumField {field} {model} {required} />
{:else if isNumberField(model)}
  <NumberField {field} {model} {required} />
{:else if model.type === "boolean"}
  <BooleanField {field} {model} {required} />
{:else if model.type === "array"}
  <EnumArrayField {field} {model} {required} />
{:else}
  <StringField {field} {model} {required} />
{/if}
