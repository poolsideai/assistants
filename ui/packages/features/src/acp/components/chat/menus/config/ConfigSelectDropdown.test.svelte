<script lang="ts">
  import type { SessionConfigOption } from "@agentclientprotocol/sdk";
  import { setACPChatSessionScope } from "../../../../features/ChatSessionScope.svelte";
  import {
    _setACPContextForTests,
    type ACPSessionRepository,
  } from "../../../../features/SessionRepository.svelte";
  import ConfigSelectDropdown from "./ConfigSelectDropdown.svelte";

  interface Props {
    option: SessionConfigOption;
    repo: ACPSessionRepository;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  }

  let { option, repo, placement }: Props = $props();

  _setACPContextForTests(repo);
  setACPChatSessionScope(repo, () => "conversation-test");
</script>

<ConfigSelectDropdown {option} {placement} />
