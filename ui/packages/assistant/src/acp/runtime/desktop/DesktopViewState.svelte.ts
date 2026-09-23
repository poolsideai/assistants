__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  | "models"
  | "voice"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  | "archived"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  "voice",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  "archived",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (collapsed && this.#requiresSidebar()) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  toggleSidebarCollapsed = () => {
    if (this.#requiresSidebar()) {
      this.#sidebarCollapsed = false;
      return;
    }
    this.#sidebarCollapsed = !this.#sidebarCollapsed;
  };
  showSettings = () => {
    this.#sidebarCollapsed = false;
    this.#view = "settings";
  };
  showShortcuts = () => {
    this.#sidebarCollapsed = false;
    this.#view = "shortcuts";
  };
  showModels = () => {
    this.#sidebarCollapsed = false;
    this.#view = "models";
  };
  showVoice = () => {
    this.#sidebarCollapsed = false;
    this.#view = "voice";
  };
  showConnectors = () => {
    this.#sidebarCollapsed = false;
    this.#view = "connectors";
  };
  showGithub = () => {
    this.#sidebarCollapsed = false;
    this.#view = "github";
  };
  showAgents = () => {
    this.#sidebarCollapsed = false;
    this.#view = "agents";
  };
  showArchived = () => {
    this.#sidebarCollapsed = false;
    this.#view = "archived";
  };
  showRemote = () => {
    this.#sidebarCollapsed = false;
    this.#view = "remote";
  };
  showSettingsSection = (section: SettingsView) => {
    this.#sidebarCollapsed = false;
    this.#view = section;
  };
  showProjectSettings = (path?: string | null) => {
    this.#sidebarCollapsed = false;
    this.#projectSettingsPath = path ?? null;
    this.#view = "project-settings";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  restore = (view: DesktopView, projectSettingsPath: string | null) => {
    this.#view = view;
    this.#projectSettingsPath = projectSettingsPath;
    if (this.#requiresSidebar()) {
      this.#sidebarCollapsed = false;
    }
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  // Views whose navigation lives in the sidebar cannot collapse it. Connectors
  // is deliberately absent: it is a standalone destination (AcpConnectorsView),
  // not a settings section, and collapses like chat.
  #requiresSidebar(): boolean {
    return (
      this.#view === "settings" ||
      this.#view === "shortcuts" ||
      this.#view === "models" ||
      this.#view === "voice" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.#view === "agents" ||
      this.#view === "archived" ||
      this.#view === "project-settings"
    );
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
