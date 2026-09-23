__POOL_SYNTHETIC_IMPORT_BASELINE__
import { DesktopViewState, isSettingsView } from "./DesktopViewState.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("accepts Voice Recognition as a settings route", () => {
    expect(isSettingsView("voice")).toBe(true);
  });

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
    state.showArchived();
    expect(state.view).toBe("archived");

    state.showVoice();
    expect(state.view).toBe("voice");

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    state.showProjectSettings();
    expect(state.view).toBe("project-settings");
    expect(state.projectSettingsPath).toBeNull();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("expands the sidebar when entering settings views", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.view).toBe("settings");
    expect(state.sidebarCollapsed).toBe(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    state.setSidebarCollapsed(true);
    state.showProjectSettings("/repo");
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.view).toBe("project-settings");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
