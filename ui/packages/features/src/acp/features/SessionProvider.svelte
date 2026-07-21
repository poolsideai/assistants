<script lang="ts">
  import type { Snippet } from "svelte";
  import { _setACPContextForTests, type ACPSessionRepository } from "./SessionRepository.svelte";
  import type { AvailableCommand } from "@agentclientprotocol/sdk";

  interface Props {
    availableCommands: AvailableCommand[];
    children: Snippet;
  }

  let { availableCommands, children }: Props = $props();

  _setACPContextForTests({
    get availableCommands() {
      return availableCommands;
    },
  } as unknown as ACPSessionRepository);
</script>

{@render children()}
