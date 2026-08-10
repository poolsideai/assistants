export interface DesktopOpenerInfo {
  id: string;
  label: string;
  kind: "inApp" | "default" | "editorEnv" | "application" | "terminal";
  appPath?: string;
  bundleId?: string;
  iconDataUri?: string;
}
