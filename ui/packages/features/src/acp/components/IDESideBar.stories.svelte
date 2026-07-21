<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { WorkspaceFolder } from "@poolsideai/rpc";
  import IDESideBar from "./IDESideBar.svelte";
  import SidebarStoryHarness from "./SidebarStoryHarness.svelte";
  import type { ACPNavConversation } from "../navTypes";

  const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

__POOL_SYNTHETIC_IMPORT_BASELINE__

  const currentWorkspaceFolders: WorkspaceFolder[] = [
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ];

  const conversations: ACPNavConversation[] = [
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
    {
      id: "conv-1",
      workspacePath,
      agentServer: "poolside",
      sessionId: "session-acp-1",
      cwd: workspacePath,
      title: "Wire up workspace-scoped ACP sidebar",
      updatedAt: minutesAgo(15),
      active: true,
      archived: false,
      workingDirectories: [workspacePath],
    },
    {
      id: "conv-2",
      workspacePath,
      agentServer: "claude-code",
      sessionId: "session-claude-2",
      cwd: workspacePath,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      updatedAt: minutesAgo(60),
      active: true,
      archived: false,
      workingDirectories: [workspacePath],
    },
    {
      id: "conv-3",
      workspacePath,
      agentServer: "poolside",
      sessionId: "session-acp-3",
      cwd: workspacePath,
      title: "Add storybook coverage for sidebars",
      updatedAt: minutesAgo(20),
      active: true,
      archived: false,
      workingDirectories: [workspacePath],
    },
    {
      id: "conv-4",
      workspacePath,
      agentServer: "poolside",
      sessionId: "session-acp-4",
      cwd: workspacePath,
      title: "Refactor router for ACP host scopes",
      updatedAt: minutesAgo(180),
      active: true,
      archived: false,
      workingDirectories: [workspacePath],
    },
    {
      // out-of-workspace conversation — should be filtered out of the IDE sidebar
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

  const handlers = {
    onCollapsedChange: () => {},
    onNewConversation: () => {},
    onShowAgents: () => {},
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onShowChat: () => {},
  };

  const { Story } = defineMeta({
    component: IDESideBar,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness {conversations}>
        <IDESideBar collapsed={false} {currentWorkspaceFolders} {...handlers} />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>

<Story name="Empty">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness conversations={[]}>
        <IDESideBar collapsed={false} {currentWorkspaceFolders} {...handlers} />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>

<Story name="Collapsed">
  {#snippet template()}
    <div class="bg-psx-editor-background flex h-screen">
      <SidebarStoryHarness {conversations}>
        <IDESideBar collapsed={true} showCollapsedActions {currentWorkspaceFolders} {...handlers} />
      </SidebarStoryHarness>
    </div>
  {/snippet}
</Story>
