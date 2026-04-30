<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { getEnvironment, getLog } from "../../providers/index.js";

  export type BoundaryProps = Pick<SvelteHTMLElements["svelte:boundary"], "failed" | "pending"> & {
    name?: string;
    children?: Snippet;
    onError?: (error: unknown, reset: () => void) => void;
    rethrowInDev?: boolean;
  };

  let { children, name, onError, failed, pending, rethrowInDev = true }: BoundaryProps = $props();

  const log = getLog();
  const environment = getEnvironment();
</script>

<svelte:boundary
  {failed}
  {pending}
  onerror={(error, retry) => {
    onError?.(error, retry);
    log.error(error, `error within component boundary: ${name}`, { boundary: name });
    if (environment.name === "production" || !rethrowInDev) return;
    throw error;
  }}
>
  {@render children?.()}
</svelte:boundary>
