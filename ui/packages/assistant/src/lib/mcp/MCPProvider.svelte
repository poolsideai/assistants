<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import {
    ACPMCPSettingsRepositoryWriter,
    getUserMCPServersRepo,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    type ACPSessionRepository,
  } from "@poolsideai/features/acp";

  interface Props {
    children: Snippet;
    acp?: ACPSessionRepository | null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__

  let stopConnectorRefresh: (() => void) | undefined;

  if (acp) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    // Same-webview fallback trigger: keeps connector mutations refreshing
    // sessions on helpers that predate the mcpServers/didChange broadcast
    // (which arrives via WebviewRPCServer.mcpServersDidChange and shares the
    // repository's coalesced sweep).
    stopConnectorRefresh = getUserMCPServersRepo().onDidChange(() => {
      acp.refreshMCPServersForAllSessions().catch((error) => {
        console.error("Failed to refresh ACP sessions after connector changes", error);
      });
    });
  }

  onDestroy(() => stopConnectorRefresh?.());
</script>

{@render children()}
