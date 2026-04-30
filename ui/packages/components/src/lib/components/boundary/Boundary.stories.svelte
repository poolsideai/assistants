<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    EnvironmentProvider,
    LogProvider,
    type EnvironmentProviderProps,
    type LogProviderProps,
  } from "../../providers/index.js";
  import Boundary, { type BoundaryProps } from "./Boundary.svelte";
  import { fn, expect } from "storybook/test";
  import Throw from "./Throw.svelte";
  import { Button } from "../button/index.js";

  const { Story } = defineMeta({
    component: Boundary,
    render: template,
    args: {
      name: "boundary",
      onError: fn(),
    },
  });

  interface Args extends BoundaryProps {
    environment: EnvironmentProviderProps;
    log: LogProviderProps;
  }
</script>

{#snippet template({ environment, log, ...args }: Args)}
  <EnvironmentProvider {...environment}>
    <LogProvider {...log}>
      <Boundary {...args}>
        <Throw />
        {#snippet failed(error, reset)}
          <p>Oops! {error}</p>
          <Button onclick={reset}>Reset</Button>
        {/snippet}
      </Boundary>
    </LogProvider>
  </EnvironmentProvider>
{/snippet}

<Story name="Default" />

<Story
  name="Development"
  parameters={{
    test: {
      dangerouslyIgnoreUnhandledErrors: true,
    },
  }}
  args={{
    environment: {
      name: "development",
    },
    log: {
      onError: fn(),
    },
  }}
  play={async ({ userEvent, canvas, args, step }) => {
    const button = canvas.getByRole("button");

    await step("Should rethrow in development", async () => {
      await userEvent.click(button);
      expect(args.onError).toHaveBeenCalledTimes(1);
      expect(args.log.onError).toHaveBeenCalledTimes(1);
    });
  }}
/>
