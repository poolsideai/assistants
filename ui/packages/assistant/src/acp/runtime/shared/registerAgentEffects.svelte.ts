import { onDestroy, untrack } from "svelte";
import { get } from "svelte/store";

import { appState } from "../../../lib/store";
import type { Repositories } from "./Repositories.svelte";

// Keeps configured ACP agent servers and registry update state in sync with app settings.
// The configure/refresh calls are untracked so they react only to the settings read, not to any
// state they touch internally (see #156).
export function registerAgentEffects(repositories: Repositories) {
  let appStateSnapshot = $state(get(appState));
  onDestroy(appState.subscribe((value) => (appStateSnapshot = value)));

  $effect(() => {
    const agentServers = appStateSnapshot.userSettings.acpAgentServers;
    untrack(() => {
      repositories.acpAgentServers.configureSessionRepo(agentServers);
    });
  });

  $effect(() => {
    repositories.acpAgentServers.refreshWhenReady();
  });

  $effect(() => {
    repositories.acpRegistry.state;
    repositories.acpRepo.agents.initializeResponses;
    repositories.acpRepo.agents.connectionsByAgentServer;
    appStateSnapshot.userSettings.acpAgentServers;
    untrack(() => {
      repositories.acpAgentUpdates.refresh();
    });
  });
}
