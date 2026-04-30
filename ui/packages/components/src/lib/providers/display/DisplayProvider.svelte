<script lang="ts" module>
  type DisplayContext = {
    customUI?: boolean;
    wrapLines?: boolean;
  };

  const [getDisplay, setDisplay] = createContext<DisplayContext>();

  export { getDisplay };
</script>

<script lang="ts">
  import { createContext, type Snippet } from "svelte";

  interface Props extends Partial<DisplayContext> {
    children?: Snippet;
  }

  let { children, customUI, wrapLines }: Props = $props();

  setDisplay({
    get customUI() {
      return customUI;
    },
    get wrapLines() {
      return wrapLines;
    },
  });
</script>

{@render children?.()}
