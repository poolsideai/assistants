<script lang="ts">
  import {
    _setAssistantTerminalContextForTests,
    type AssistantTerminalRepository,
  } from "../features/AssistantTerminalRepository.svelte";
  import AssistantTerminalPanel from "./AssistantTerminalPanel.svelte";

  interface Props {
    repo: AssistantTerminalRepository;
    worktreePath: string;
    onClose?: () => void;
  }

  let { repo, worktreePath, onClose = () => {} }: Props = $props();

  _setAssistantTerminalContextForTests(repo);
</script>

<AssistantTerminalPanel
  {worktreePath}
  width={400}
  resizing={false}
  {onClose}
  onResizeStart={() => {}}
/>
