import { describe, expect, it } from "vitest";
import { DesktopViewState, isSettingsView } from "./DesktopViewState.svelte";

describe("DesktopViewState", () => {
  it("accepts Voice Recognition as a settings route", () => {
    expect(isSettingsView("voice")).toBe(true);
  });

  it("routes between desktop panel views", () => {
    const state = new DesktopViewState();

    expect(state.view).toBe("chat");
    expect(state.projectSettingsPath).toBeNull();

    state.showSettings();
    expect(state.view).toBe("settings");

    state.showConnectors();
    expect(state.view).toBe("connectors");

    state.showAgents();
    expect(state.view).toBe("agents");

    state.showSettingsSection("shortcuts");
    expect(state.view).toBe("shortcuts");

    state.showArchived();
    expect(state.view).toBe("archived");

    state.showVoice();
    expect(state.view).toBe("voice");

    state.showProjectSettings("/repo");
    expect(state.view).toBe("project-settings");
    expect(state.projectSettingsPath).toBe("/repo");

    state.showProjectSettings();
    expect(state.view).toBe("project-settings");
    expect(state.projectSettingsPath).toBeNull();

    state.showChat();
    expect(state.view).toBe("chat");
  });

  it("expands the sidebar when entering settings views", () => {
    const state = new DesktopViewState();

    state.setSidebarCollapsed(true);
    state.showSettings();

    expect(state.view).toBe("settings");
    expect(state.sidebarCollapsed).toBe(false);

    state.setSidebarCollapsed(true);
    state.showProjectSettings("/repo");

    expect(state.view).toBe("project-settings");
    expect(state.sidebarCollapsed).toBe(false);
  });

  it("keeps the sidebar expanded while settings views are active", () => {
    const state = new DesktopViewState();

    state.showSettings();
    state.setSidebarCollapsed(true);
    expect(state.sidebarCollapsed).toBe(false);

    state.toggleSidebarCollapsed();
    expect(state.sidebarCollapsed).toBe(false);

    state.showProjectSettings("/repo");
    state.setSidebarCollapsed(true);
    expect(state.sidebarCollapsed).toBe(false);

    state.showChat();
    state.setSidebarCollapsed(true);
    expect(state.sidebarCollapsed).toBe(true);
  });

  it("allows collapsing the sidebar on the connectors view", () => {
    const state = new DesktopViewState();

    state.showConnectors();
    expect(state.sidebarCollapsed).toBe(false);

    state.toggleSidebarCollapsed();
    expect(state.sidebarCollapsed).toBe(true);

    state.toggleSidebarCollapsed();
    expect(state.sidebarCollapsed).toBe(false);

    state.setSidebarCollapsed(true);
    expect(state.sidebarCollapsed).toBe(true);
  });
});
