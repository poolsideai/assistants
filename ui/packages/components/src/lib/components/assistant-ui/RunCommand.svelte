<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import Icon from "../icon/Icon.svelte";
  import CodeBlockButton from "./CodeBlockOptions/CodeBlockButton.svelte";

  interface Capabilities {
    customUI?: boolean;
  }

  interface Props {
    command: string;
    class?: ClassValue;
    capabilities?: Capabilities;
    openTerminal?: (command: string) => void | Promise<void>;
  }

  let { command, capabilities = {}, openTerminal, ...rest }: Props = $props();

  function runCommand() {
    void openTerminal?.(command);
    momentarilyShowSuccess();
  }

  let showSuccess = $state(false);

  function momentarilyShowSuccess() {
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
    }, 2000);
  }
</script>

<CodeBlockButton
  title="Execute Command"
  onclick={runCommand}
  aria-label={showSuccess ? "executed command" : "execute command"}
  bgClass={showSuccess ? "bg-psx-chrome-hover" : ""}
  {capabilities}
  {...rest}
>
  <span
    aria-label={showSuccess ? "executed command" : "execute command"}
    class="absolute inset-0 -top-px opacity-0 transition duration-100"
    class:opacity-100={showSuccess}
  >
    <Icon aria-hidden="true" name="copied" size={16} />
  </span>

  <Icon
    aria-hidden="true"
    name="terminal"
    size={16}
    class="terminal-icon {showSuccess ? 'success' : ''}"
  />
</CodeBlockButton>

<style lang="postcss">
  @reference "#tailwind.css";
  :global(.terminal-icon) {
    :global(path:last-child) {
      @apply transition-opacity duration-100;
    }
  }

  :global(.terminal-icon.success) {
    :global(path:last-child) {
      @apply opacity-0;
    }
  }
</style>
