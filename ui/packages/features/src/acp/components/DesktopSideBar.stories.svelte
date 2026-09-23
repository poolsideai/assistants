<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { LocalInferenceState } from "@poolsideai/helperapi/schemas";
  import type { WorkspaceFolder } from "@poolsideai/rpc";
  import DesktopSideBar from "./DesktopSideBar.svelte";
  import SidebarStoryHarness from "./SidebarStoryHarness.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__

  const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const projects: ACPNavProject[] = [
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      isWorktree: false,
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(60 * 24 * 3),
      updatedAt: minutesAgo(15),
    },
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      name: "acp-sidebar",
      isWorktree: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(60 * 24),
      updatedAt: minutesAgo(15),
    },
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      name: "refactor-router",
      isWorktree: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(60 * 12),
      updatedAt: minutesAgo(120),
    },
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      name: "crisp-current",
      isWorktree: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(4),
      updatedAt: minutesAgo(4),
      busy: "creating",
    },
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      name: "steady-setup",
      isWorktree: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(5),
      updatedAt: minutesAgo(5),
      busy: "running_setup",
    },
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      name: "tidy-teardown",
      isWorktree: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(6),
      updatedAt: minutesAgo(6),
      busy: "tearing_down",
    },
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      name: "deft-delete",
      isWorktree: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(7),
      updatedAt: minutesAgo(7),
      busy: "deleting",
    },
    {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      name: "poolside-books-api-demo",
      isWorktree: false,
      collapsed: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      createdAt: minutesAgo(60 * 24 * 10),
      updatedAt: minutesAgo(60 * 6),
    },
  ];

  const conversations: ACPNavConversation[] = [
    {
      id: "conv-1",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentServer: "poolside",
      sessionId: "session-acp-1",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      title: "Wire up workspace-scoped ACP sidebar",
      updatedAt: minutesAgo(15),
      active: true,
      archived: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
    {
      id: "conv-2",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentServer: "claude-code",
      sessionId: "session-claude-2",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      updatedAt: minutesAgo(60),
      active: true,
      archived: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
    {
      id: "conv-3",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentServer: "poolside",
      sessionId: "session-acp-3",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      title: "Add storybook coverage for sidebars",
      updatedAt: minutesAgo(20),
      active: true,
      archived: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
    {
      id: "conv-4",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentServer: "poolside",
      sessionId: "session-acp-4",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      title: "Refactor router for ACP host scopes",
      updatedAt: minutesAgo(120),
      active: true,
      archived: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
    {
      id: "conv-5",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentServer: "poolside",
      sessionId: "session-acp-5",
__POOL_SYNTHETIC_IMPORT_BASELINE__
      title: "Add Book description field",
      updatedAt: minutesAgo(60 * 6),
      active: true,
      archived: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
  ];

  const currentWorkspaceFolders: WorkspaceFolder[] = [
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ];

  const desktopCapabilities = {
    openWorkspace: true,
    addFolderToWorkspace: true,
  };

  // A resident local model, as the sidecar reports it: powers the ambient
  // runtime pill at the sidebar bottom (memory figure, last prompt, idle
  // unload countdown, and the reclaim-memory action).
  const GIB = 1024 ** 3;
  const localModelLoaded: LocalInferenceState = {
    modelsDirectory: "/Users/poolie/.config/poolside/models",
    catalog: [
      {
        id: "poolside/Laguna-XS-2.1-NVFP4-mlx",
        repoId: "poolside/Laguna-XS-2.1-NVFP4-mlx",
        name: "Laguna XS 2.1 NVFP4",
        provider: "poolside",
        downloaded: true,
        default: true,
      },
    ],
    runtime: {
      supported: true,
      status: "running",
      agentServer: "local",
      defaultModelId: "poolside/Laguna-XS-2.1-NVFP4-mlx",
      loadedModelId: "poolside/Laguna-XS-2.1-NVFP4-mlx",
      loadedMemoryBytes: 20.1 * GIB,
      lastActivityUnixMs: Date.now() - 4 * 60 * 1000,
      idleUnloadSeconds: 15 * 60,
    },
  };

  const handlers = {
    onCollapsedChange: () => {},
    onNewConversation: () => {},
    onShowSettings: () => {},
    onShowProjectSettings: () => {},
    onShowChat: () => {},
    onResizeStart: () => {},
    onWidthChange: () => {},
    onShowShortcuts: () => {},
    onShowConnectors: () => {},
    onShowAgents: () => {},
  };

  const { Story } = defineMeta({
    component: DesktopSideBar,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness {projects} {conversations} capabilities={desktopCapabilities}>
        <DesktopSideBar
          collapsed={false}
          currentView="chat"
          {currentWorkspaceFolders}
          {...handlers}
        />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>

<Story name="Local Model Loaded">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness
        {projects}
        {conversations}
        capabilities={desktopCapabilities}
        localInference={localModelLoaded}
      >
        <DesktopSideBar
          collapsed={false}
          currentView="chat"
          {currentWorkspaceFolders}
          {...handlers}
        />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>

<Story name="Empty">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness projects={[]} conversations={[]} capabilities={desktopCapabilities}>
        <DesktopSideBar
          collapsed={false}
          currentView="chat"
          {currentWorkspaceFolders}
          {...handlers}
        />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>

<Story name="Collapsed">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness {projects} {conversations} capabilities={desktopCapabilities}>
        <DesktopSideBar
          collapsed={true}
          showCollapsedActions
          currentView="chat"
          {currentWorkspaceFolders}
          {...handlers}
        />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>

<Story name="Settings">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness {projects} {conversations} capabilities={desktopCapabilities}>
        <DesktopSideBar
          collapsed={false}
          currentView="settings"
          {currentWorkspaceFolders}
          {...handlers}
        />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>

<Story name="Collapsed Settings Route">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness {projects} {conversations} capabilities={desktopCapabilities}>
        <DesktopSideBar
          collapsed={false}
          currentView="connectors"
          {currentWorkspaceFolders}
          {...handlers}
        />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>
