<script lang="ts">
  import {
    _setAssistantTerminalContextForTests,
    type AssistantTerminalRepository,
  } from "../features/AssistantTerminalRepository.svelte";
  import AssistantTerminalView from "./AssistantTerminalView.svelte";

  interface Props {
    repo: AssistantTerminalRepository;
    terminalId: string;
    focusToken?: number;
  }

  let { repo, terminalId, focusToken = 0 }: Props = $props();

  _setAssistantTerminalContextForTests(repo);
</script>

<AssistantTerminalView {terminalId} {focusToken} />
