import type { IconName } from "@poolsideai/components/icon";

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  | "models"
  | "voice"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  | "archived"
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type DesktopSettingsNavSection = DesktopSettingsSection | "project-settings";
export type SettingsSection = "all" | DesktopSettingsSection;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export const DESKTOP_SETTINGS_SECTIONS = [
  "preferences",
  "agents",
  "models",
  "voice",
  "shortcuts",
__POOL_SYNTHETIC_IMPORT_BASELINE__
  "archived",
__POOL_SYNTHETIC_IMPORT_BASELINE__
] as const satisfies readonly DesktopSettingsSection[];

export const DESKTOP_SETTINGS_NAV_SECTIONS = [
  "preferences",
  "project-settings",
  "agents",
  "models",
  "voice",
  "shortcuts",
__POOL_SYNTHETIC_IMPORT_BASELINE__
  "archived",
__POOL_SYNTHETIC_IMPORT_BASELINE__
] as const satisfies readonly DesktopSettingsNavSection[];

export const IDE_SETTINGS_SECTIONS = [
  "connectors",
  "agents",
] as const satisfies readonly DesktopSettingsSection[];

export const SETTINGS_HEADINGS: Record<SettingsSection, { title: string; subtitle: string }> = {
  all: {
    title: "Settings",
    subtitle:
      "Configure preferences, local models, voice recognition, MCP connections, and ACP agents.",
  },
  preferences: { title: "General", subtitle: "Appearance and API settings." },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    subtitle: "Install and choose local MLX models.",
  },
  voice: {
    title: "Voice Recognition",
    subtitle: "Install and choose local Whisper models for dictation.",
__POOL_SYNTHETIC_IMPORT_BASELINE__
  connectors: { title: "Connectors", subtitle: "MCP servers available to your agents." },
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agents: { title: "Agents", subtitle: "Choose and configure ACP agents and harnesses." },
  archived: {
    title: "Archived Chats",
    subtitle: "View, restore, or delete archived conversations.",
  },
__POOL_SYNTHETIC_IMPORT_BASELINE__
    title: "Remote Access",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
};

export const SETTINGS_NAV_ITEMS: Record<
  DesktopSettingsNavSection,
  { label: string; icon: IconName; badge?: IconName; pill?: string }
> = {
  preferences: { label: "General", icon: "gear" },
  "project-settings": { label: "Projects", icon: "folder" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  voice: { label: "Voice Recognition", icon: "microphone" },
  connectors: { label: "Connectors", icon: "mcp" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agents: { label: "Agents", icon: "sparkles" },
  archived: { label: "Archived Chats", icon: "archive" },
  remote: { label: "Remote Access", icon: "remote-access", pill: "Experimental" },
};
