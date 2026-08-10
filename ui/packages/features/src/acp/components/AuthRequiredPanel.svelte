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
    /**
     * Method the user has launched. Login finishes outside this panel (terminal
     * TUI, browser), so while set the login buttons give way to a manual
     * "I'm logged in" confirmation and a "Try again" escape back to them.
     */
    attemptedMethodId?: string | null;
    /** The "I'm logged in" re-verification probe is running. */
    confirmInProgress?: boolean;
    /** Brand colour class for the agent glyph (see agentPickerIconProps). */
    iconClass?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onRetry: (methodId: string) => void;
    onConfirmLoggedIn?: () => void;
    onTryAgain?: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    attemptedMethodId = null,
    confirmInProgress = false,
    iconClass = "text-psx-icon",
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onRetry,
    onConfirmLoggedIn,
    onTryAgain,
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
    <div
      class="bg-psx-panel shadow-xs flex size-8 shrink-0 items-center justify-center rounded-lg outline outline-1 outline-black/5 dark:outline-white/20"
    >
      <RegistryAgentIcon {iconUrl} fallback="sparkles" size={18} class={iconClass} />
    </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <h2
        id="acp-auth-required-title"
        class="text-psx-foreground-primary flex h-8 items-center text-sm"
      >
__POOL_SYNTHETIC_IMPORT_BASELINE__
      </h2>
__POOL_SYNTHETIC_IMPORT_BASELINE__

    {#if methods.length > 0 && attemptedMethodId !== null}
      <!-- A login attempt is underway outside the panel; let the user confirm
           completion (re-verified with a probe) or fall back to the buttons. -->
      <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
        <button
          type="button"
          disabled={confirmInProgress}
          onclick={() => onTryAgain?.()}
          class="text-psx-foreground-primary outline-hidden focus-visible:outline-psx-focus rounded-sm text-xs hover:underline focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Try again
        </button>
        <button
          type="button"
          disabled={confirmInProgress}
          onclick={() => onConfirmLoggedIn?.()}
          class="bg-psx-button-primary-background text-psx-button-primary-foreground hover:bg-psx-button-primary-hover-background outline-hidden focus-visible:outline-psx-focus flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#if confirmInProgress}
            <Spinner size={12} />
          {/if}
          <span>I'm logged in</span>
        </button>
      </div>
    {:else if methods.length > 0}
      <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
        {#each methods as method (method.id)}
          {#if method.type === "terminal" && pendingTerminalAuthMethodId === method.id}
            <button
              type="button"
              onclick={() => onRetry(method.id)}
              title={method.description ?? method.name}
              class="text-psx-foreground-primary outline-hidden focus-visible:outline-psx-focus rounded-sm text-xs hover:underline focus-visible:outline-2"
            >
              Retry
            </button>
            <button
              type="button"
              disabled
              class="bg-psx-button-primary-background text-psx-button-primary-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Spinner size={12} />
              <span>{method.name}</span>
            </button>
          {:else}
            {#if inProgress}
              <button
                type="button"
                onclick={() => onRetry(method.id)}
                title={method.description ?? method.name}
                class="text-psx-foreground-primary outline-hidden focus-visible:outline-psx-focus rounded-sm text-xs hover:underline focus-visible:outline-2"
              >
                Retry
              </button>
            {/if}
            <button
              type="button"
              disabled={inProgress}
              onclick={() => onAuthenticate(method.id)}
              title={method.description ?? method.name}
              class="bg-psx-button-primary-background text-psx-button-primary-foreground hover:bg-psx-button-primary-hover-background outline-hidden focus-visible:outline-psx-focus flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {#if inProgress}
                <Spinner size={12} />
              {/if}
              <span>{method.name}</span>
            </button>
          {/if}
        {/each}
      </div>
    {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <!-- Method descriptions are not rendered here: each action button carries its
       method's description as a hover title, and the terminal flow shows the
       command itself, so a visible restatement is noise. -->
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
