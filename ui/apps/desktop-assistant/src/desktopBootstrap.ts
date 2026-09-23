export interface DesktopBootstrapOperations<Settings, Theme> {
  readSettings(): Promise<Settings>;
  readVersion(): Promise<string>;
  readHomeDirectory(): Promise<string>;
  prepareAppearance(settings: Settings): Promise<Theme>;
  reconcileAccent(): Promise<unknown>;
  readWindowFocused(): Promise<boolean>;
  readWindowFullscreen(): Promise<boolean>;
}

// A single owner for the pre-mount snapshot. The appearance depends on settings;
// version, home and accent have no dependency on each other. Probe window state
// last so time spent loading settings cannot age the initial focus/fullscreen state.
export async function loadDesktopBootstrap<Settings, Theme>(
  operations: DesktopBootstrapOperations<Settings, Theme>,
) {
  const appearance = Promise.resolve()
    .then(() => operations.readSettings())
    .then(async (desktopSettings) => ({
      desktopSettings,
      currentResolvedTheme: await operations.prepareAppearance(desktopSettings),
    }));
  const [{ desktopSettings, currentResolvedTheme }, assistantVersion, homeDirectory] =
    await Promise.all([
      appearance,
      Promise.resolve().then(() => operations.readVersion()),
      Promise.resolve().then(() => operations.readHomeDirectory()),
      Promise.resolve().then(() => operations.reconcileAccent()),
    ]);
  const [isWindowFocused, isWindowFullscreen] = await Promise.all([
    Promise.resolve().then(() => operations.readWindowFocused()),
    Promise.resolve().then(() => operations.readWindowFullscreen()),
  ]);
  return {
    desktopSettings,
    assistantVersion,
    homeDirectory,
    currentResolvedTheme,
    isWindowFocused,
    isWindowFullscreen,
  };
}
