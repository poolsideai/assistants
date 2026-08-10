<script lang="ts">
  import { get } from "svelte/store";
  import { onDestroy, type Snippet } from "svelte";
  import { appState, type AppState } from "../src/lib/store";

  type StorybookAppState = Omit<Partial<AppState>, "environment" | "userSettings"> & {
    environment?: Partial<AppState["environment"]> & {
      capabilities?: Partial<AppState["environment"]["capabilities"]>;
    };
    userSettings?: Partial<AppState["userSettings"]>;
  };

  interface Props {
    children?: Snippet;
    state?: StorybookAppState;
  }

  let { children, state }: Props = $props();
  const previous = get(appState);

  $effect(() => {
    if (!state) return;

    appState.update((current) => ({
      ...current,
      ...state,
      environment: state.environment
        ? {
            ...current.environment,
            ...state.environment,
            capabilities: {
              ...current.environment.capabilities,
              ...state.environment.capabilities,
            },
          }
        : current.environment,
      userSettings: state.userSettings
        ? {
            ...current.userSettings,
            ...state.userSettings,
          }
        : current.userSettings,
    }));
  });

  onDestroy(() => {
    appState.set(previous);
  });
</script>

{@render children?.()}
