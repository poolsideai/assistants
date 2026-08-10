<script lang="ts">
  import Boundary from "./Boundary.svelte";
  import { EnvironmentProvider, LogProvider } from "../../providers/index.js";
  import type { LogContext } from "../../providers/index.js";

  interface Props {
    environmentName?: "development" | "production" | "test";
    onError?: LogContext["error"];
    rethrowInDev?: boolean;
    throwChild?: boolean;
  }

  let {
    environmentName = "test",
    onError = () => {},
    rethrowInDev = true,
    throwChild = false,
  }: Props = $props();

  function maybeThrow(): string {
    if (throwChild) {
      throw new Error("boundary test error");
    }

    return "";
  }
</script>

<EnvironmentProvider name={environmentName}>
  <LogProvider {onError} onInfo={() => {}}>
    <Boundary name="BoundaryTest" {rethrowInDev}>
      {#snippet failed(_error, _reset)}
        <div role="alert">Fallback rendered</div>
      {/snippet}

      {maybeThrow()}
      <div>Child rendered</div>
    </Boundary>
  </LogProvider>
</EnvironmentProvider>
