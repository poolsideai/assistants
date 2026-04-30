<script lang="ts" module>
  type ClipboardProvider = {
    write: (text: string) => Promise<void>;
  };

  const [getClipboard, setClipboard] = createContext<ClipboardProvider>();

  export { getClipboard };
</script>

<script lang="ts">
  import { createContext, type Snippet } from "svelte";

  interface Props {
    children: Snippet;
    onWrite?: ClipboardProvider["write"];
  }

  let { children, onWrite = (text) => navigator.clipboard.writeText(text) }: Props = $props();

  setClipboard({
    write: onWrite,
  });
</script>

{@render children?.()}
