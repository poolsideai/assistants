__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import {
    poolsideAcpNavCheckAgentRuntimes,
    poolsideAcpNavInstallAgentServer,
  } from "@poolsideai/helperapi";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { ASSISTANT_CONFIG_DISPLAY_PATH, openAssistantConfigFile } from "../assistantConfig";
  import { appState } from "../hostAdapter";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { registryAgentRequirements, registryAgentRuntimeWarning } from "../agentRequirements";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { Attachment } from "svelte/attachments";
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    LOCAL_AGENT_SERVER,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { versionFromConfig } from "../agentVersions";
  import { LOCAL_AGENT_ROUNDEL_ICON_URL, LOCAL_AGENT_SYSTEM_ICON_URL } from "../localAgentIcon";
  import { agentPickerIconProps } from "./chat/menus/config/agentConfig";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { catalogCardClass } from "./settings/catalogCardStyles";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { primaryPillButtonClass, updatePillButtonClass } from "./settings/pillButtonStyles";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import ConfirmationDialog from "./ui/ConfirmationDialog.svelte";
  import CopyToClipboard from "./ui/CopyToClipboard.svelte";
  import Tooltip from "./ui/Tooltip.svelte";

  const ACP_PROTOCOL_URL = "https://agentclientprotocol.com";
  const CUSTOM_AGENT_CONFIGURATION_URL =
    "https://docs.poolside.ai/tools/poolside-assistant-desktop";

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
  // null until the helper answers; failures leave it null so agents never
  // show a runtime warning the check could not back up.
  let npxAvailable = $state<boolean | null>(null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Disabling archives the agent's conversations, so it goes through a
  // confirmation dialog first.
  let disableCandidate = $state<ACPRegistryAgent | null>(null);

  // The settings pane masks and clips its content, so a dialog rendered in
  // place would only overlay the panel. Reparent it to <body> for an
  // app-level overlay.
  function portalToBody(): Attachment {
    return (element: Element) => {
      document.body.appendChild(element);
      return () => {
        element.remove();
      };
    };
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    Object.keys(configuredAgentServers)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          name !== LOCAL_AGENT_SERVER &&
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
  let testedAgents = $derived(
    sortRegistrySectionAgents(
      configurableRegistryAgents.filter((agent) => registryAgentCategory(agent) === "tested"),
    ),
  );
  let thirdPartyAgents = $derived(
    sortRegistrySectionAgents(
      configurableRegistryAgents.filter((agent) => registryAgentCategory(agent) === "third-party"),
    ),
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let poolsideUpdate = $derived(agentUpdates.updateFor(DEFAULT_AGENT_SERVER));
  let isDesktop = $derived($appState.environment.assistantHost === "desktop");
  let isBusy = $derived(busyAgentId != null || agentUpdates.busyAgentServer != null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let searchQuery = $state("");
  let normalizedQuery = $derived(searchQuery.trim().toLowerCase());
  let filteredThirdPartyAgents = $derived(
    thirdPartyAgents.filter((agent) => matchesSearch(agent.name, agent.description, agent.id)),
  );
  // Collapsed, the third-party grid shows 4 agents (two rows) plus a clipped,
  // faded peek of the third row. Searching always shows every match.
  let showAllThirdParty = $state(false);
  let collapseThirdParty = $derived(
    !showAllThirdParty && normalizedQuery === "" && filteredThirdPartyAgents.length > 4,
  );
  let visibleThirdPartyAgents = $derived(
    collapseThirdParty ? filteredThirdPartyAgents.slice(0, 6) : filteredThirdPartyAgents,
  );

  function matchesSearch(...values: (string | undefined)[]): boolean {
    if (!normalizedQuery) return true;
    return values.some((value) => value?.toLowerCase().includes(normalizedQuery));
  }

  function sortRegistrySectionAgents(agents: ACPRegistryAgent[]): ACPRegistryAgent[] {
    return [...agents].sort((left, right) => {
      const leftInstalled = configuredRegistryIds.has(left.id);
      const rightInstalled = configuredRegistryIds.has(right.id);
      if (leftInstalled !== rightInstalled) return leftInstalled ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
  }

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    void loadAgentRuntimes();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async function loadAgentRuntimes(): Promise<void> {
    try {
      const runtimes = await poolsideAcpNavCheckAgentRuntimes({});
      npxAvailable = runtimes.npx.available;
    } catch {
      // Leave availability unknown; the install path reports its own errors.
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const requestedAgentServers = $state.snapshot(agentServers) as ACPAgentServers;
    // The save replaces the whole agent-servers map on disk, so it must not
    // race the repository's last-used-default writers: route it through the
    // repository's serialized persist queue, which re-reads each surviving
    // entry's default_config_options from the store's freshest state before
    // the host RPC performs the set. The returned map is what actually
    // landed on disk.
    const nextAgentServers = await acp.agents.saveAgentServers(requestedAgentServers, (merged) =>
      rpc.setACPAgentServers(merged),
    );
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // updateAgentServers() below refreshes the store configuredRegistryIds
    // derives from, so re-reading the set after the save answers "is it
    // configured now", not "was this an install" — capture that up front.
    const wasConfigured = configuredRegistryIds.has(agent.id);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (wasConfigured) {
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
      if (!wasConfigured) {
        // Pre-warm the just-installed agent in the background: the probe
        // downloads/starts it, caches its config options, and learns whether
        // it needs login — so first switch in chat is instant instead of a
        // 10+ second blank dropdown.
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function agentCurrentVersionLabel(agent: ACPRegistryAgent): string {
    const update = agentUpdates.updateFor(agent.id);
    if (update?.kind === "install") return "Not installed";
    // Prefer the version the agent itself reported (cached from its last
    // initialize) over parsing it out of the configured package reference.
    const currentVersion =
      acp.agents.installedVersionFor(agent.id) ?? versionFromConfig(update?.currentConfig);
    if (update && !currentVersion) return "Installed";
    return formatAgentVersion(currentVersion ?? agent.version);
  }

  function agentNextVersionLabel(agent: ACPRegistryAgent): string | null {
    const update = agentUpdates.updateFor(agent.id);
    if (!update) return null;
    return formatAgentVersion(update.agent.version);
  }

  function formatAgentVersion(version: string): string {
    return version.startsWith("v") ? version : `v${version}`;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const update = agentUpdates.updateFor(agentId);
    if (update?.kind === "restart") {
      return agentUpdates.restartBlockedFor(agentId) ? "Restart when idle" : "Restart agent";
    }
    if (agentId === DEFAULT_AGENT_SERVER) {
      return update?.kind === "install" ? "Install Poolside Agent" : "Update Poolside Agent";
    }
    return update?.kind === "install" ? "Install" : "Update";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      saveError = errorMessage(error, "Failed to update the Poolside agent");
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async function openAssistantConfig(): Promise<void> {
    saveError = null;
    try {
      await openAssistantConfigFile();
    } catch (error) {
      saveError = errorMessage(error, "Failed to open assistant.json");
    }
  }

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const config = resolvedAgentServers[name];
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    class="border-psx-error-foreground/30 bg-psx-error-foreground/10 text-psx-error-foreground rounded-lg border px-3 py-2 text-[13px]/[18px]"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#snippet acpTerm()}
  <Tooltip placement="bottom" gutter={4} openDelay={200} interactive>
    {#snippet label()}
      <span class="block max-w-64 text-left">
        The Agent Client Protocol (ACP) is an open standard for communication between code
        editors/IDEs and coding tools.
        <button
          type="button"
          title={ACP_PROTOCOL_URL}
          class="outline-hidden focus-visible:outline-psx-focus inline-flex items-baseline gap-0.5 underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2"
          onclick={() => rpc.openExternalURL(ACP_PROTOCOL_URL)}
        >
          Learn more
          <Icon name="arrow-up-right" size={9} class="shrink-0 self-center" aria-hidden="true" />
        </button>
      </span>
    {/snippet}
    <span class="cursor-help underline decoration-dotted underline-offset-2">ACP</span>
  </Tooltip>
{/snippet}

{#snippet likelyRequirements(requirements: string[])}
  <p class="text-psx-foreground-secondary mt-2 text-[12px]/[16px]">
    <span class="text-psx-foreground-primary font-medium">Requires:</span>
    {requirements.join(" · ")}
  </p>
{/snippet}

<SettingsSection title="Made by Poolside" subtitle="Poolside's own first party agent harness.">
  <div class="agent-catalog px-3 pb-4 pt-3">
    <div class="agent-catalog-grid">
      <article class={`${catalogCardClass} flex min-w-0 cursor-default flex-col rounded-xl p-4`}>
__POOL_SYNTHETIC_IMPORT_BASELINE__
          <span
            class="border-psx-border bg-psx-panel inline-grid size-8 shrink-0 place-items-center rounded-[9px] border dark:border-black/10 dark:bg-white"
            aria-hidden="true"
          >
            <RegistryAgentIcon
              iconUrl={bundledPoolsideAgent ? registryIconUrl(bundledPoolsideAgent) : undefined}
              fallback="lab"
              size={20}
              class="text-psx-vibrant shrink-0"
            />
          </span>
          <h3 class="text-psx-foreground-primary truncate text-[13px]/[18px] font-medium">
            Poolside Agent
          </h3>
          {#if bundledPoolsideAgent}
            {#if poolsideReleaseUrl}
              <button
                type="button"
                class="bg-psx-chrome text-psx-foreground-secondary hover:text-psx-foreground-primary outline-hidden focus-visible:outline-psx-focus shrink-0 cursor-pointer rounded-full px-1.5 py-0.5 text-xs underline-offset-2 hover:underline focus-visible:outline-2"
                aria-label="View Poolside Agent releases"
                onclick={() => openReleaseUrl(bundledPoolsideAgent)}
              >
                {agentCurrentVersionLabel(bundledPoolsideAgent)}
              </button>
            {:else}
              <span
                class="bg-psx-chrome text-psx-foreground-secondary shrink-0 rounded-full px-1.5 py-0.5 text-xs"
              >
                {agentCurrentVersionLabel(bundledPoolsideAgent)}
              </span>
            {/if}
            {#if agentNextVersionLabel(bundledPoolsideAgent)}
              <span class="text-psx-foreground-secondary shrink-0 text-xs">→</span>
              <span class="text-psx-vibrant shrink-0 text-sm">
                {agentNextVersionLabel(bundledPoolsideAgent)}
              </span>
            {/if}
            <span
              class="bg-psx-chrome text-psx-foreground-secondary shrink-0 rounded-full px-1.5 py-0.5 text-xs"
            >
              {registryAgentDistributionLabel(bundledPoolsideAgent)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <p class="text-psx-foreground-secondary leading-4.5 mt-2 text-sm">
          Poolside Assistant uses this local ACP agent to talk with Poolside models and unlock
          Poolside-only features such as secret management. The agent is installed and updated
          separately from the desktop app and separately from any <code>pool</code> CLI on this machine.
        </p>
        {@render likelyRequirements(["Poolside account, OpenRouter, or local model endpoint"])}
        {#if poolsideUpdate}
          <div
            class="bg-psx-chrome-hover/40 text-psx-foreground-secondary mt-3 rounded-lg px-3 py-2 text-[13px]/[18px]"
          >
            {#if poolsideUpdate.kind === "install"}
              The Poolside agent is configured but the local agent package is not installed yet.
              Install it to use Poolside chats on this machine.
            {:else if poolsideUpdate.kind === "restart"}
              The updated Poolside agent is installed. Restart the agent after its running
              conversations finish to use it.
            {:else}
              A newer Poolside agent is available. Updating here updates the agent used for chats,
              not the Poolside Assistant desktop app.
            {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {/if}
        {#if poolsideProgress}
          <div class="mt-3">
            <div class="bg-psx-chrome h-1.5 overflow-hidden rounded-full">
              <div
                class="bg-psx-vibrant h-full rounded-full transition-all duration-300 ease-out"
                style:width={poolsideProgress.width}
              ></div>
            </div>
            <div class="text-psx-foreground-secondary mt-1 text-[13px]/[18px]">
              {poolsideProgress.label}
            </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {/if}
        {#if bundledPoolsideAgent && poolsideUpdate}
          <div class="mt-auto flex items-center justify-end gap-2 pt-3">
            {#if bundledPoolsideAgent && poolsideUpdate?.kind !== "install"}
              <button
                type="button"
                disabled={isBusy ||
                  (poolsideUpdate.kind === "restart" &&
                    agentUpdates.restartBlockedFor(DEFAULT_AGENT_SERVER))}
                onclick={updatePoolsideAgent}
                class={updatePillButtonClass}
              >
                {agentUpdateLabel(DEFAULT_AGENT_SERVER)}
              </button>
            {/if}
            {#if bundledPoolsideAgent && poolsideUpdate?.kind === "install"}
              <button
                type="button"
                disabled={isBusy}
                onclick={updatePoolsideAgent}
                class={primaryPillButtonClass}
              >
                {agentUpdateLabel(DEFAULT_AGENT_SERVER)}
              </button>
            {/if}
          </div>
        {/if}
      </article>

      {#if isDesktop}
        <article class={`${catalogCardClass} flex min-w-0 cursor-default flex-col rounded-xl p-4`}>
          <div class="flex min-w-0 items-center gap-2">
            <span
              class="border-psx-border bg-psx-panel inline-grid size-8 shrink-0 place-items-center rounded-[9px] border dark:border-black/10 dark:bg-white"
              aria-hidden="true"
            >
              <RegistryAgentIcon
                iconUrl={LOCAL_AGENT_ROUNDEL_ICON_URL}
                overlayIconUrl={LOCAL_AGENT_SYSTEM_ICON_URL}
                overlayClass="text-psx-icon dark:text-neutral-500"
                fallback="lab"
                size={20}
                class="text-psx-vibrant shrink-0"
              />
            </span>
            <h3 class="text-psx-foreground-primary truncate text-[13px]/[18px] font-medium">
              Poolside Local
            </h3>
            <span
              class="bg-psx-info-foreground/10 text-psx-info-foreground shrink-0 rounded-full px-1.5 py-0.5 text-xs"
            >
              on-device
            </span>
            <span
              class="bg-psx-chrome text-psx-foreground-secondary shrink-0 rounded-full px-1.5 py-0.5 text-xs"
            >
              local
            </span>
          </div>
          <p class="text-psx-foreground-secondary leading-4.5 mt-2 text-sm">
            Runs local, on-device models configured in On-Device Models. Use this when you want the
            model runtime to stay on this machine instead of using Poolside cloud models.
          </p>
          {@render likelyRequirements([
            "downloaded on-device model",
            "sufficient disk space and memory",
          ])}
        </article>
      {/if}
    </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <SettingsSection title="ACP Agents" subtitle="Registry agents made by other publishers.">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <SettingsSection title="ACP Agents" subtitle="Registry agents made by other publishers.">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {#if testedAgents.length > 0}
    <SettingsSection
      title="Tested by Poolside"
      subtitle="Third-party agent harnesses tested by Poolside."
    >
      <div class="agent-catalog px-3 pb-4 pt-3">
        <div class="agent-catalog-grid">
          {#each testedAgents as agent (agent.id)}
            {@render registryAgentCard(agent)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      </div>
    </SettingsSection>
  {/if}

  {#snippet acpSubtitle()}
    Community and vendor {@render acpTerm()} agents from the public registry.
  {/snippet}
  <SettingsSection title="Other Third-Party Agents" subtitle={acpSubtitle}>
    <div class="agent-catalog flex flex-col gap-3 px-3 pb-4 pt-3">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          Installing third party agents runs local code from its publisher. Only install agents you
          trust.
        </p>
      </div>

      {#if filteredThirdPartyAgents.length > 0}
        <div class={["agent-catalog-grid", collapseThirdParty && "agent-catalog-grid-collapsed"]}>
          {#each visibleThirdPartyAgents as agent (agent.id)}
            {@render registryAgentCard(agent)}
          {/each}
        </div>
        {#if normalizedQuery === "" && filteredThirdPartyAgents.length > 4}
          <button
            type="button"
            class="border-psx-button-secondary-border bg-psx-button-secondary-background text-psx-button-secondary-foreground hover:bg-psx-button-secondary-hover-background outline-hidden focus-visible:outline-psx-focus self-center rounded-full border px-3 py-1 text-xs transition-colors duration-200 ease-out focus-visible:outline-2"
            onclick={() => (showAllThirdParty = !showAllThirdParty)}
          >
            {showAllThirdParty ? "Show less" : "Show more"}
          </button>
        {/if}
      {:else}
        <div
          class="border-psx-border bg-psx-panel text-psx-foreground-secondary rounded-lg border px-3 py-6 text-center text-[13px]/[18px]"
        >
          {#if normalizedQuery}
            No agents match “{searchQuery.trim()}”.
          {:else}
            No third-party agents available.
          {/if}
        </div>
      {/if}
    </div>
  </SettingsSection>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#snippet registryAgentCard(agent: ACPRegistryAgent)}
  {@const enabled = configuredRegistryIds.has(agent.id)}
  {@const needsUpdate = agentNeedsUpdate(agent)}
  {@const progress = agentUpdates.progressFor(agent.id) ?? installProgress(agent)}
  {@const releaseUrl = registryAgentReleaseUrl(agent)}
  {@const iconBrandClass = agentPickerIconProps(registry, agent.id).class}
  {@const requirements = registryAgentRequirements(agent)}
  {@const runtimeWarning = registryAgentRuntimeWarning(agent, npxAvailable)}
  <article
    class={`${catalogCardClass} agent-card flex min-w-0 cursor-default flex-col rounded-xl p-4`}
  >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <span
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        </span>
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {:else}
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
        {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              disabled={isBusy ||
                (agentUpdates.updateFor(agent.id)?.kind === "restart" &&
                  agentUpdates.restartBlockedFor(agent.id))}
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
    </div>
    <!-- The description stays in the layout (invisible) while the single-line
         progress row overlays it, so the card height never changes during an
         install regardless of how many lines the description wraps to. -->
    <div class="relative mt-1.5">
      <p
        class={[
          "text-psx-foreground-secondary leading-4.5 line-clamp-2 text-sm",
          progress && "invisible",
        ]}
      >
        {agent.description}
      </p>
      {#if progress}
        <div class="absolute inset-x-0 top-0 flex h-[18px] items-center gap-2">
          <span class="text-psx-foreground-secondary shrink-0 text-[11px]">
            {progress.label}
          </span>
          <div class="bg-psx-chrome h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
            <div
              class="bg-psx-menu-active-background h-full rounded-full transition-[width] duration-300"
              style:width={progress.width}
            ></div>
          </div>
        </div>
      {/if}
    </div>
    {@render likelyRequirements(requirements)}
    {#if runtimeWarning}
      <p class="text-psx-warning-foreground mt-1 flex items-start gap-1 text-[12px]/[16px]">
        <Icon name="alert" size={12} class="mt-0.5 shrink-0" aria-hidden="true" />
        {runtimeWarning}
      </p>
    {/if}
  </article>
{/snippet}

{#snippet customSubtitle()}
  Custom {@render acpTerm()} agents are managed in
  <Tooltip text={ASSISTANT_CONFIG_DISPLAY_PATH} placement="bottom" gutter={4} openDelay={200}>
    <code class="cursor-help">assistant.json</code>
  </Tooltip>.
  <button
    type="button"
    title={CUSTOM_AGENT_CONFIGURATION_URL}
    class="outline-hidden focus-visible:outline-psx-focus inline-flex items-baseline gap-0.5 underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2"
    onclick={() => rpc.openExternalURL(CUSTOM_AGENT_CONFIGURATION_URL)}
  >
    Configuration reference
    <Icon name="arrow-up-right" size={9} class="shrink-0 self-center" aria-hidden="true" />
  </button>
{/snippet}
<SettingsSection title="Custom" subtitle={customSubtitle}>
  <div class="agent-catalog flex flex-col gap-3 px-3 pb-4 pt-3">
    <div class="agent-catalog-grid agent-catalog-grid-fill">
      {#each customAgentServerNames as name (name)}
        {@const command = customCommandLabel(name)}
        {@const installedVersion = acp.agents.installedVersionFor(name)}
        <article
          class={`${catalogCardClass} agent-card flex min-w-0 cursor-default flex-col rounded-xl p-4`}
        >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              <span
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              >
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          </div>
          {#if command}
            <div class="mt-1.5 flex min-w-0 items-center gap-1">
              <span
                class="text-psx-foreground-secondary min-w-0 flex-1 truncate font-mono text-[11px]"
              >
                {command}
              </span>
              <CopyToClipboard text={command} />
            </div>
          {/if}
          {@render likelyRequirements(["configured command and any credentials it needs"])}
        </article>
      {/each}
      <article class={`${catalogCardClass} flex min-w-0 cursor-default flex-col rounded-xl p-4`}>
        <div class="flex min-w-0 items-center gap-2">
          <span
            class="border-psx-border bg-psx-panel inline-grid size-8 shrink-0 place-items-center rounded-[9px] border dark:border-black/10 dark:bg-white"
            aria-hidden="true"
          >
            <Icon name="plus" size={20} class="text-psx-icon shrink-0 dark:text-neutral-500" />
          </span>
          <h3 class="text-psx-foreground-primary truncate text-[13px]/[18px] font-medium">
            New Custom Agent
          </h3>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        </div>
        <p class="text-psx-foreground-secondary leading-4.5 mt-1.5 text-sm">
          Run your own ACP agent by adding an entry to <code>assistant.json</code>.
        </p>
        {@render likelyRequirements(["ACP-compatible command and any credentials it needs"])}
      </article>
    </div>
  </div>
</SettingsSection>

{#if disableCandidate}
  {@const agent = disableCandidate}
  <div {@attach portalToBody()}>
    <ConfirmationDialog
      destructive
      title="Disable {agent.name}?"
      description="This removes {agent.name} from your agents and archives its conversations."
      confirmLabel="Disable"
      onCancel={() => (disableCandidate = null)}
      onConfirm={async () => {
        await toggleAgent(agent);
        disableCandidate = null;
      }}
    />
  </div>
{/if}

<style lang="postcss">
  .agent-catalog {
    width: 100%;
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  .agent-catalog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 27rem), 1fr));
    gap: 8px;
  }

  /* auto-fill keeps the empty second column reserved, so a lone card stays the
     same width as cards in the fuller grids above instead of stretching. */
  .agent-catalog-grid-fill {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 27rem), 1fr));
  }

  /* Two full rows, a 3.5rem clipped peek of the third, and any further rows
     collapsed to zero height. The mask fades the peek out at the bottom. */
  .agent-catalog-grid-collapsed {
    overflow: hidden;
    grid-template-rows: auto auto 3.5rem;
    grid-auto-rows: 0;
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 0,
      #000 calc(100% - 5rem),
      transparent 100%
    );
    mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - 5rem), transparent 100%);
  }
</style>
