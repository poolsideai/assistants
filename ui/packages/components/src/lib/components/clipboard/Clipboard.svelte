<script lang="ts" module>
  interface ClipboardContext extends SetRequired<Except<Props, "children">, "duration"> {
    copied: boolean;
  }

  const [getClipboardContext, setClipboardContext] = createContext<ClipboardContext>();

  export { getClipboardContext };
</script>

<script lang="ts">
  import { createContext, type Snippet } from "svelte";
  import type { Except, SetRequired } from "type-fest";

  interface Props {
    value: string;
    duration?: number;
    onCopy?: (value: string) => void;
    onError?: (error: Error) => void;
    children?: Snippet;
  }

  let { value, duration = 1000, onCopy, onError, children }: Props = $props();

  let copied = $state(false);

  setClipboardContext({
    get value() {
      return value;
    },
    get duration() {
      return duration;
    },
    get copied() {
      return copied;
    },
    set copied(value) {
      copied = value;
    },
    onCopy,
    onError,
  });
</script>

{@render children?.()}
