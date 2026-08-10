__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    extractErrorMessage,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let dismissedUpdate = $state<string | null>(null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let activeAgentName = $derived(
    activeUpdate?.agent.name.trim().replace(/\s+agent$/i, "") ?? "ACP",
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let isRestart = $derived(activeUpdate?.kind === "restart");
  let restartBlocked = $derived(isRestart && updates.restartBlockedFor(normalizedAgentServer));
  let updateKey = $derived(
    `${normalizedAgentServer}:${activeUpdate?.kind}:${activeUpdate?.agent.version}`,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let shouldShow = $derived(activeUpdate != null && (isUpdating || dismissedUpdate !== updateKey));
  let updateFailure = $state<{ agentServer: string; message: string } | null>(null);
  let updateError = $derived(
    updateFailure?.agentServer === normalizedAgentServer ? updateFailure.message : null,
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const agentServer = normalizedAgentServer;
    const agentName = activeAgentName;
    dismissedUpdate = null;
    updateFailure = null;
    try {
      await updates.update(agentServer);
    } catch (error) {
      updateFailure = {
        agentServer,
        message:
          updates.error ??
          extractErrorMessage(error, `The ${agentName} agent updater did not return error details`),
      };
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    updateFailure = null;
    dismissedUpdate = updateKey;
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
            ? `${activeAgentName} agent is configured but not installed on this machine`
            : isRestart
              ? `Restart required for the ${activeAgentName} agent`
              : `Update available for the ${activeAgentName} agent`}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {#if !progress}
        <div class="mt-0.5 text-[12px]/[16px] text-psx-foreground-tertiary">
          {#if isInstall}
            Install the local ACP agent package to use this agent on this machine.
          {:else if isRestart}
            Version {activeUpdate.agent.version} is installed. {restartBlocked
              ? "Wait for this agent’s running conversations to finish, then restart to use it."
              : "Restart the agent to use it and refresh available models."}
          {:else}
            This updates the local ACP agent used for chats, not the Poolside Assistant app.
          {/if}
        </div>
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
          <div class="mb-1 text-[12px]/[16px] text-psx-foreground-tertiary">
            {#if isInstall}
              Installing the local ACP agent package for this machine.
            {:else if isRestart}
              Restarting the agent and refreshing available models.
            {:else}
              Updating the local ACP agent used for chats, not the Poolside Assistant app.
            {/if}
          </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

      {#if updateError}
        <div
          role="alert"
          class="mt-1.5 flex min-w-0 items-start gap-1 text-[12px]/[16px] text-psx-error-foreground"
          title={updateError}
        >
          <Icon name="alert" size={14} class="mt-px shrink-0 self-start" />
          <div class="min-w-0">
            <div>
              Couldn’t {isRestart ? "restart" : "update"} the {activeAgentName} agent{isRestart
                ? "."
                : ` to version ${activeUpdate.agent.version}.`}
            </div>
            <div class="line-clamp-2 break-words text-psx-foreground-tertiary">
              {updateError}
            </div>
          </div>
        </div>
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
        disabled={updates.busyAgentServer != null || restartBlocked}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {isUpdating
          ? updates.busyLabel(normalizedAgentServer)
          : updateError
            ? "Retry"
            : isInstall
              ? "Install agent"
              : isRestart
                ? "Restart agent"
                : "Update agent"}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
