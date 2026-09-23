<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { ComponentProps } from "svelte";
  import { expect, waitFor, within } from "storybook/test";
  import { CODEX_GOAL_CONTROL_METHOD } from "../../goals";
  import PromptGoalStoryHarness from "./PromptGoalStoryHarness.svelte";

  type Args = ComponentProps<typeof PromptGoalStoryHarness>;

  const { Story } = defineMeta({
    title: "ACP/Chat/Prompt/Goal",
    component: PromptGoalStoryHarness,
    args: {
      goal: null,
      width: "560px",
    },
  });
</script>

<Story name="Default" />

<Story
  name="Active Codex goal"
  args={{
    goal: {
      source: "codex",
      objective: "Fix the failing integration tests and land the change",
      status: "active",
      controlMethod: CODEX_GOAL_CONTROL_METHOD,
      timeUsedSeconds: 482,
      tokenBudget: 50_000,
    },
  } satisfies Args}
/>

<Story
  name="Active Claude goal"
  args={{
    goal: {
      source: "claude",
      objective: "Get the release branch ready for review",
      status: "active",
      iterations: 3,
      setAt: Date.now() - 8 * 60_000,
      tokensAtStart: 12_400,
      lastReason: "Two Windows integration tests are still failing.",
    },
  } satisfies Args}
/>

<Story
  name="Paused goal"
  args={{
    goal: {
      source: "codex",
      objective: "Complete the authentication migration",
      status: "paused",
      controlMethod: CODEX_GOAL_CONTROL_METHOD,
      timeUsedSeconds: 1_240,
    },
  } satisfies Args}
/>

<Story
  name="Blocked goal"
  args={{
    goal: {
      source: "codex",
      objective: "Deploy the new helper protocol to production",
      status: "blocked",
      controlMethod: CODEX_GOAL_CONTROL_METHOD,
      timeUsedSeconds: 2_940,
    },
  } satisfies Args}
/>

<Story
  name="Narrow prompt box"
  args={{
    width: "360px",
    goal: {
      source: "codex",
      objective: "Resolve every remaining accessibility regression before release",
      status: "active",
      controlMethod: CODEX_GOAL_CONTROL_METHOD,
      timeUsedSeconds: 95,
    },
  } satisfies Args}
/>

<Story
  name="Goal details open"
  args={{
    goal: {
      source: "codex",
      objective: "Fix the failing integration tests and land the change",
      status: "active",
      controlMethod: CODEX_GOAL_CONTROL_METHOD,
      timeUsedSeconds: 482,
      tokenBudget: 50_000,
      lastReason: "Two Windows integration tests are still failing.",
    },
  } satisfies Args}
  play={async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /Goal, Active:/ });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const menu = body.getByRole("menu");
    await waitFor(() => expect(menu).toHaveFocus());
    await expect(body.getByRole("menuitem", { name: "Pause goal" })).not.toHaveFocus();
    await expect(body.getByRole("menuitem", { name: "Clear goal" })).not.toHaveFocus();
  }}
/>

<Story
  name="Mobile goal details open"
  args={{
    mobile: true,
    width: "390px",
    visualViewportHeight: "420px",
    goal: {
      source: "codex",
      objective: "Finish the mobile authentication migration",
      status: "paused",
      controlMethod: CODEX_GOAL_CONTROL_METHOD,
      timeUsedSeconds: 1_240,
    },
  } satisfies Args}
  play={async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Goal, Paused:/ }));
  }}
/>
