__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { AcpHandoffConfirmationProvider } from "@poolsideai/features/acp";

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
<AcpHandoffConfirmationProvider>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    ondragover={runtime.handleDragOver}
    ondragleave={runtime.handleDragLeave}
    ondrop={runtime.handleDrop}
    class="contents"
  >
    <IdentityManager>
      <GlobalProviders>
        <Providers>
          <MCPProvider acp={runtime.acpRepo} activeConversationId={runtime.activeConversationId}>
            {@render children()}
          </MCPProvider>
        </Providers>
      </GlobalProviders>
    </IdentityManager>

    {#if runtime.hasFileContext && runtime.isDraggingFile}
      <div class="fullscreen-overlay"></div>
    {/if}
  </div>
</AcpHandoffConfirmationProvider>

<style lang="postcss">
  @reference "#tailwind.css";

  .fullscreen-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    @apply bg-psx-editor-selection-background;
  }
</style>
