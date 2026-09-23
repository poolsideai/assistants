<script lang="ts">
  import { Dropdown, DropdownItem } from "../../../ui";
  import DefaultStarButton from "./DefaultStarButton.svelte";

  let presses = $state(0);
  let selections = $state(0);
</script>

<button type="button">Outside</button>

<Dropdown icon="gear" label="Picker">
  {#snippet children()}
    {#snippet accessories()}
      <DefaultStarButton
        label="Use option by default"
        pressed={presses > 0}
        onPress={() => (presses += 1)}
      />
    {/snippet}
    <DropdownItem
      icon="gear"
      label="Option"
      selected
      {accessories}
      onclick={() => (selections += 1)}
    />
  {/snippet}
</Dropdown>

<div hidden>
  <span data-testid="presses">{presses}</span>
  <span data-testid="selections">{selections}</span>
</div>
