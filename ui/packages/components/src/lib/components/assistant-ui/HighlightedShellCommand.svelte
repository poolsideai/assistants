<script lang="ts">
  import { escape } from "html-escaper";
  import { highlightShellCommand } from "./shellHighlight.js";

  interface Props {
    command: string;
  }

  let { command }: Props = $props();
  let html = $state(escape(command));
  let version = 0;

  $effect(() => {
    const currentCommand = command;
    const currentVersion = ++version;
    html = escape(currentCommand);
    void highlightShellCommand(currentCommand).then((highlighted) => {
      if (currentVersion === version) html = highlighted;
    });
  });
</script>

{@html html}
