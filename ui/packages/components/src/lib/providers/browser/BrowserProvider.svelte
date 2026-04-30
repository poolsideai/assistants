<script lang="ts" module>
  type BrowserProvider = {
    open: (url: string | URL) => void;
  };

  const [getBrowser, setBrowser] = createContext<BrowserProvider>();

  export { getBrowser };
</script>

<script lang="ts">
  import { createContext, type Snippet } from "svelte";

  interface Props {
    children?: Snippet;
    onOpen?: BrowserProvider["open"];
  }

  let {
    children,
    onOpen = (url) => {
      window.open(url);
    },
  }: Props = $props();

  setBrowser({
    open: onOpen,
  });
</script>

{@render children?.()}
