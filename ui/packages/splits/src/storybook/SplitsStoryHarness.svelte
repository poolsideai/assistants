<script lang="ts">
  import { SplitsController, SplitsView } from "../index.js";
  import type { PaneID, SplitsConfigurationInput, Tab } from "../types.js";
  import SampleTabContent from "./SampleTabContent.svelte";

  type Scenario = "single" | "workspace" | "empty" | "compact" | "keepAlive";

  interface Props {
    scenario?: Scenario;
    height?: string;
  }

  let { scenario = "workspace", height = "620px" }: Props = $props();

  const controller = createController(scenario);

  function createController(scenario: Scenario): SplitsController {
    const configuration: SplitsConfigurationInput =
      scenario === "compact"
        ? {
            allowTabReordering: false,
            allowCrossPaneTabMove: false,
            appearance: {
              tabBarHeight: 28,
              tabMinWidth: 96,
              tabMaxWidth: 150,
              showSplitButtons: false,
            },
          }
        : scenario === "empty"
          ? {
              autoCloseEmptyPanes: false,
            }
          : scenario === "keepAlive"
            ? {
                contentViewLifecycle: "keepAllAlive",
              }
            : {};

    const controller = new SplitsController(configuration);
    const firstPane = controller.focusedPaneId!;
    const firstTab = controller.allTabIds[0]!;

    controller.updateTab(firstTab, {
      title: scenario === "compact" ? "main.ts" : "App.svelte",
      icon: "doc.text",
    });

    if (scenario === "empty") {
      controller.closeTab(firstTab);
      controller.splitPane({ paneId: firstPane, orientation: "horizontal", withTab: false });
      return controller;
    }

    controller.createTab("stores/session.ts", { inPane: firstPane, isDirty: true });
    controller.createTab("README.md", { inPane: firstPane, icon: "doc.text" });

    if (scenario === "single" || scenario === "compact" || scenario === "keepAlive") {
      return controller;
    }

    const previewPane = controller.splitPane({
      paneId: firstPane,
      orientation: "horizontal",
      withTab: { title: "Preview", icon: "star" },
    })!;
    controller.createTab("Console", { inPane: previewPane, icon: "doc.text", isDirty: true });

    controller.splitPane({
      paneId: previewPane,
      orientation: "vertical",
      withTab: { title: "Terminal", icon: "doc.text" },
    });
    controller.focusPane(firstPane);

    return controller;
  }

  function modeFor(tab: Tab) {
    if (tab.title === "Preview") return "preview";
    if (tab.title === "Terminal" || tab.title === "Console") return "terminal";
    return "editor";
  }
</script>

<div class="story-frame" style={`height: ${height};`}>
  <SplitsView {controller}>
    {#snippet children(tab: Tab, paneId: PaneID)}
      <SampleTabContent {tab} {paneId} mode={modeFor(tab)} />
    {/snippet}

    {#snippet emptyPane(paneId: PaneID)}
      <div class="empty-pane">
        <strong>Empty pane</strong>
        <span>{paneId.slice(0, 8)}</span>
        <button
          type="button"
          onclick={() => controller.createTab("Untitled.ts", { inPane: paneId })}
        >
          Create tab
        </button>
        {#if controller.allPaneIds.length > 1}
          <button type="button" onclick={() => controller.closePane(paneId)}>Close pane</button>
        {/if}
      </div>
    {/snippet}
  </SplitsView>
</div>

<style>
  .story-frame {
    overflow: hidden;
    border: 1px solid var(--psx-border, light-dark(rgb(210, 210, 216), rgb(63, 63, 70)));
    border-radius: 8px;
    background: var(--psx-editor-background, light-dark(rgb(255, 255, 255), rgb(30, 30, 34)));
    box-shadow: 0 18px 48px rgb(0 0 0 / 18%);
  }

  .empty-pane {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    background: repeating-linear-gradient(
      -45deg,
      var(--splits-pane-background),
      var(--splits-pane-background) 12px,
      color-mix(in srgb, var(--splits-foreground) 4%, var(--splits-pane-background)) 12px,
      color-mix(in srgb, var(--splits-foreground) 4%, var(--splits-pane-background)) 24px
    );
    color: var(--splits-foreground);
    font:
      13px/1.45 system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .empty-pane span {
    color: var(--splits-muted-foreground);
    font-size: 12px;
  }

  .empty-pane button {
    border: 1px solid var(--splits-separator);
    border-radius: 5px;
    padding: 5px 10px;
    background: var(--splits-pane-background);
    color: inherit;
    font: inherit;
  }

  .empty-pane button:hover {
    background: var(--splits-tab-hover-background);
  }
</style>
