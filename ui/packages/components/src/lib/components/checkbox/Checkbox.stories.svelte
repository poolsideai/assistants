<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Checkbox from "./Checkbox.svelte";
  import { expect } from "storybook/test";
  import { fn } from "storybook/test";

  const { Story } = defineMeta({
    component: Checkbox,
    args: {
      onCheckedChange: fn(),
    },
  });
</script>

<Story
  name="Default"
  args={{
    id: "terms",
    class: "peer",
    "aria-labelledby": "terms-label",
  }}
  play={async ({ canvas, userEvent, args }) => {
    const checkbox = canvas.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    await userEvent.click(checkbox);
    expect(args.onCheckedChange).toHaveBeenCalled();
  }}
>
  {#snippet template(args)}
    <div class="flex items-center gap-2">
      <Checkbox {...args} />
      <label
        id={args["aria-labelledby"]}
        for={args.id}
        class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  {/snippet}
</Story>
