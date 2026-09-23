<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import { untrack } from "svelte";
  import { getElicitationContext } from "../../../../elicitation";
  import ElicitationPrompt from "./ElicitationPrompt.svelte";

  // The agent question tool's "options + free-text" schema shape: preset
  // options nested under {oneOf:[…]} plus a {type:"string"} free-text branch.
  const questionSchema = {
    type: "object",
    properties: {
      answer: {
        description: "What is your favorite color?",
        anyOf: [
          {
            oneOf: [
              { const: "Red", title: "Red", description: "The color red" },
              { const: "Green", title: "Green", description: "The color green" },
              { const: "Blue", title: "Blue", description: "The color blue" },
            ],
          },
          { type: "string" },
        ],
      },
    },
    required: ["answer"],
  };

  const { Story } = defineMeta({
    title: "ACP/Elicitation/ElicitationPrompt",
  });
</script>

{#snippet questionPrompt()}
  {@const elicitation = getElicitationContext()}
  {@const registered = untrack(() => {
    if (!elicitation.isElicitationPending("story-question-1")) {
      void elicitation.register({
        elicitationId: "story-question-1",
        message: "What is your favorite color?",
        requestedSchema: questionSchema,
      } as never);
    }
    return true;
  })}
  {#if registered}
    <ElicitationPrompt />
  {/if}
{/snippet}

<Story name="Question with free text">
  {#snippet template()}{@render questionPrompt()}{/snippet}
</Story>

<!-- PE-2419: the submit button must track the free-text input per keystroke,
     not only after the input loses focus. -->
<Story
  name="Submit tracks typing without blur"
  play={async ({ canvas }) => {
    const textarea = await canvas.findByPlaceholderText("Or type your own answer...");
    const submit = await canvas.findByRole("button", { name: /Submit answers/ });

    // An unanswered required form offers no submit to click.
    await expect(submit).toBeDisabled();

    // PE-2419 trigger: a submit attempt on the empty form records a "Required"
    // error for every validation cause, and typing must clear it without a
    // blur. ⌘↵ is how that attempt is still reachable — it calls handleSubmit
    // directly, so the disabled button does not block it.
    await userEvent.click(textarea);
    await userEvent.keyboard("{Meta>}{Enter}{/Meta}");
    await waitFor(() => expect(submit).toBeDisabled());

    await userEvent.click(textarea);
    await userEvent.type(textarea, "Do nothing");
    // No blur: the button must enable while the textarea keeps focus.
    await expect(textarea).toHaveFocus();
    await waitFor(() => expect(submit).toBeEnabled());

    await userEvent.clear(textarea);
    textarea.focus();
    await expect(textarea).toHaveFocus();
    await waitFor(() => expect(submit).toBeDisabled());

    await userEvent.type(textarea, "P");
    await expect(textarea).toHaveFocus();
    await waitFor(() => expect(submit).toBeEnabled());
  }}
>
  {#snippet template()}{@render questionPrompt()}{/snippet}
</Story>
