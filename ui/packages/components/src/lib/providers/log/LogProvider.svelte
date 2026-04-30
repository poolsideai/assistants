<script lang="ts" module>
  import { createContext, type Snippet } from "svelte";

  export interface LogContext {
    error: (error: unknown, message?: string, data?: Record<string, unknown>) => void;
    info: (message: string, data?: Record<string, unknown>) => void;
  }

  const [getLog, setLog] = createContext<LogContext>();

  export { getLog };
</script>

<script lang="ts">
  export interface LogProviderProps {
    children?: Snippet;
    onError?: LogContext["error"];
    onInfo?: LogContext["info"];
  }

  let { children, onInfo = console.log, onError = console.error }: LogProviderProps = $props();

  setLog({ info: onInfo, error: onError });
</script>

{@render children?.()}
