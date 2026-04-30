<script lang="ts" module>
  export interface FilesystemContext {
    open: (path: string) => Promise<void>;
  }

  const [getFilesystem, setFilesystem] = createContext<FilesystemContext>();

  export { getFilesystem };
</script>

<script lang="ts">
  import { createContext, type Snippet } from "svelte";

  export interface FilesystemProviderProps {
    children: Snippet;
    onOpen?: FilesystemContext["open"];
  }

  let { children, onOpen = async () => {} }: FilesystemProviderProps = $props();

  setFilesystem({
    open: onOpen,
  });
</script>

{@render children?.()}
