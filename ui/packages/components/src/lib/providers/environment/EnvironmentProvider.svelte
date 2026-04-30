<script lang="ts" module>
  export type EnvironmentContext = {
    name: "development" | "production" | "test";
  };

  const [getEnvironment, setEnvironment] = createContext<EnvironmentContext>();

  export { getEnvironment };
</script>

<script lang="ts">
  import { createContext, type Snippet } from "svelte";

  export interface EnvironmentProviderProps extends Partial<EnvironmentContext> {
    children?: Snippet<[EnvironmentContext]>;
  }

  let { children, name = "production" }: EnvironmentProviderProps = $props();

  setEnvironment({
    get name() {
      return name;
    },
  });
</script>

{@render children?.({ name })}
