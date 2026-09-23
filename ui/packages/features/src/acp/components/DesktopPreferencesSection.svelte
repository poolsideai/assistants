<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { onMount } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { rpc, type RPCClient } from "../hostRpc";
  import DesktopAppIconTintSelect, {
    APP_ICON_TINTS,
    type AppIconTint,
  } from "./DesktopAppIconTintSelect.svelte";
  import DesktopDefaultLayoutSection from "./DesktopDefaultLayoutSection.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import DesktopThemeToggle, { type DesktopThemePreference } from "./DesktopThemeToggle.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  type SaveStatus = "loading" | "saved" | "saving" | "error";
  type TerminalCursorStyle = "block" | "bar" | "underline";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    status: "alreadyStable" | "noUpdate" | "cancelled" | "staged";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  interface DesktopSettings {
    themePreference: DesktopThemePreference;
    chatFontSize: number;
    codeFontFamily: string;
    codeFontFamilies?: string[];
    codeFontSize: number;
    terminalFontFamily: string;
    terminalFontFamilies?: string[];
    terminalFontSize: number;
    terminalCursorStyle: TerminalCursorStyle;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    steerWithEnter: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    appIconTint?: AppIconTint;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  type DesktopSettingsRPC = RPCClient & {
    getDesktopSettings(): Promise<DesktopSettings>;
    setDesktopThemePreference(themePreference: DesktopThemePreference): Promise<DesktopSettings>;
    setDesktopChatPreferences(chatFontSize: number): Promise<DesktopSettings>;
    setDesktopCodePreferences(
      codeFontFamily: string,
      codeFontSize: number,
    ): Promise<DesktopSettings>;
    setDesktopTerminalPreferences(
      terminalFontFamily: string,
      terminalFontSize: number,
      terminalCursorStyle: TerminalCursorStyle,
    ): Promise<DesktopSettings>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    setDesktopSteerWithEnter(steerWithEnter: boolean): Promise<DesktopSettings>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    setDesktopAppIconTint(appIconTint: AppIconTint): Promise<DesktopSettings>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    getDesktopAppVersion(): Promise<string>;
    openDesktopChangelog(): Promise<void>;
  };

  const desktopRpc = rpc as DesktopSettingsRPC;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const MIN_CHAT_FONT_SIZE = 10;
  const MAX_CHAT_FONT_SIZE = 24;
  const MIN_CODE_FONT_SIZE = 8;
  const MAX_CODE_FONT_SIZE = 24;
  const MIN_TERMINAL_FONT_SIZE = 8;
  const MAX_TERMINAL_FONT_SIZE = 24;
  const CHAT_PREFERENCES_SAVE_DELAY_MS = 200;
  const CHAT_PREFERENCES_STALE_SETTINGS_GUARD_MS = 1_000;
  const CODE_PREFERENCES_SAVE_DELAY_MS = 200;
  const CODE_PREFERENCES_STALE_SETTINGS_GUARD_MS = 1_000;
  const TERMINAL_PREFERENCES_SAVE_DELAY_MS = 200;
  const TERMINAL_PREFERENCES_STALE_SETTINGS_GUARD_MS = 1_000;
__POOL_SYNTHETIC_IMPORT_BASELINE__

  interface ApplyLoadedSettingsOptions {
    preserveChatPreferences?: boolean;
    preserveCodePreferences?: boolean;
    preserveTerminalPreferences?: boolean;
  }

  let themePreference = $state<DesktopThemePreference>("system");
  let persistedThemePreference = $state<DesktopThemePreference>("system");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let codeFontFamily = $state("Menlo");
  let persistedCodeFontFamily = $state("Menlo");
  let codeFontFamilies = $state<string[]>([]);
  let codeFontSize = $state(13);
  let persistedCodeFontSize = $state(13);
  let terminalFontFamily = $state("Menlo");
  let persistedTerminalFontFamily = $state("Menlo");
  let terminalFontFamilies = $state<string[]>([]);
  let terminalFontSize = $state(12);
  let persistedTerminalFontSize = $state(12);
  let terminalCursorStyle = $state<TerminalCursorStyle>("block");
  let persistedTerminalCursorStyle = $state<TerminalCursorStyle>("block");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let steerWithEnter = $state(false);
  let persistedSteerWithEnter = $state(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let appIconTint = $state<AppIconTint>("default");
  let persistedAppIconTint = $state<AppIconTint>("default");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let appVersion = $state("");
  let appChannelLabel = $derived(persistedUpdateChannel === "nightly" ? "Preview" : "Stable");
  let themeStatus = $state<SaveStatus>("loading");
  let chatStatus = $state<SaveStatus>("loading");
  let codeStatus = $state<SaveStatus>("loading");
  let terminalStatus = $state<SaveStatus>("loading");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let steerWithEnterStatus = $state<SaveStatus>("loading");
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let appIconTintStatus = $state<SaveStatus>("loading");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let error = $state("");
  let hasLoaded = $state(false);
  let chatSaveToken = 0;
  let chatSavesInFlight = 0;
  let chatSaveTimer: ReturnType<typeof setTimeout> | undefined;
  let preserveLocalChatPreferencesUntil = 0;
  let codeSaveToken = 0;
  let codeSavesInFlight = 0;
  let codeSaveTimer: ReturnType<typeof setTimeout> | undefined;
  let preserveLocalCodePreferencesUntil = 0;
  let terminalSaveToken = 0;
  let terminalSavesInFlight = 0;
  let terminalSaveTimer: ReturnType<typeof setTimeout> | undefined;
  let preserveLocalTerminalPreferencesUntil = 0;
  let steerWithEnterSaveToken = 0;
  let steerWithEnterSavesPending = 0;
  let steerWithEnterSaveQueue: Promise<void> = Promise.resolve();
  let windowVibrancySaveToken = 0;
  let windowVibrancySavesPending = 0;
  let windowVibrancySaveQueue: Promise<void> = Promise.resolve();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let loading = $derived(
    themeStatus === "loading" ||
      chatStatus === "loading" ||
      codeStatus === "loading" ||
      terminalStatus === "loading" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      steerWithEnterStatus === "loading" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
      appIconTintStatus === "loading" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
  );
  let hasError = $derived(
    themeStatus === "error" ||
      chatStatus === "error" ||
      codeStatus === "error" ||
      terminalStatus === "error" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      steerWithEnterStatus === "error" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
      appIconTintStatus === "error" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
  );

  onMount(() => {
    void loadSettings();
    void desktopRpc
      .getDesktopAppVersion()
      .then((version) => (appVersion = version))
      .catch(() => {
        // The About row simply omits the version if the host cannot report it.
      });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const settings = (event as CustomEvent<DesktopSettings>).detail;
      const preserveChatPreferences = shouldPreserveLocalChatPreferences(settings);
      const preserveCodePreferences = shouldPreserveLocalCodePreferences(settings);
      const preserveTerminalPreferences = shouldPreserveLocalTerminalPreferences(settings);
      applyLoadedSettings(settings, {
        preserveChatPreferences,
        preserveCodePreferences,
        preserveTerminalPreferences,
      });
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (!preserveChatPreferences) chatStatus = "saved";
      if (!preserveCodePreferences) codeStatus = "saved";
      if (!preserveTerminalPreferences) terminalStatus = "saved";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      steerWithEnterStatus = "saved";
__POOL_SYNTHETIC_IMPORT_BASELINE__
      appIconTintStatus = "saved";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return () => {
      window.removeEventListener(DESKTOP_SETTINGS_CHANGED_EVENT, onSettingsChanged);
      clearChatSaveTimer();
      clearCodeSaveTimer();
      clearTerminalSaveTimer();
    };
  });

  $effect(() => {
    const nextThemePreference = themePreference;
    if (!hasLoaded) return;

    if (nextThemePreference === persistedThemePreference) {
      themeStatus = "saved";
      return;
    }

    themeStatus = "saving";
    error = "";
    void persistThemePreference(nextThemePreference);
  });

  async function loadSettings() {
    try {
      const settings = await desktopRpc.getDesktopSettings();
      applyLoadedSettings(settings);
      themeStatus = "saved";
      chatStatus = "saved";
      codeStatus = "saved";
      terminalStatus = "saved";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      steerWithEnterStatus = "saved";
__POOL_SYNTHETIC_IMPORT_BASELINE__
      appIconTintStatus = "saved";
__POOL_SYNTHETIC_IMPORT_BASELINE__
    } catch (err) {
      themeStatus = "error";
      chatStatus = "error";
      codeStatus = "error";
      terminalStatus = "error";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      steerWithEnterStatus = "error";
__POOL_SYNTHETIC_IMPORT_BASELINE__
      appIconTintStatus = "error";
__POOL_SYNTHETIC_IMPORT_BASELINE__
      error = toErrorMessage(err);
    } finally {
      hasLoaded = true;
    }
  }

  async function persistThemePreference(value: DesktopThemePreference) {
    try {
      const settings = await desktopRpc.setDesktopThemePreference(value);
      applyLoadedSettings(settings, {
        preserveChatPreferences: shouldPreserveLocalChatPreferences(settings),
        preserveCodePreferences: shouldPreserveLocalCodePreferences(settings),
        preserveTerminalPreferences: shouldPreserveLocalTerminalPreferences(settings),
      });
      themeStatus = "saved";
      error = "";
    } catch (err) {
      themeStatus = "error";
      error = toErrorMessage(err);
    }
  }

  async function persistSteerWithEnter(value: boolean) {
    const token = ++steerWithEnterSaveToken;
    steerWithEnterSavesPending += 1;
    error = "";
    const operation = steerWithEnterSaveQueue.then(async () => {
      await desktopRpc.setDesktopSteerWithEnter(value);
    });
    steerWithEnterSaveQueue = operation.catch(() => undefined);
    try {
      await operation;
      persistedSteerWithEnter = value;
      if (token !== steerWithEnterSaveToken) return;
      steerWithEnterStatus = "saved";
      error = "";
    } catch (err) {
      if (token !== steerWithEnterSaveToken) return;
      steerWithEnter = persistedSteerWithEnter;
      steerWithEnterStatus = "error";
      error = toErrorMessage(err);
    } finally {
      steerWithEnterSavesPending = Math.max(0, steerWithEnterSavesPending - 1);
    }
  }

  async function persistChatPreferences() {
    if (!hasLoaded) return;
    clearChatSaveTimer();

    const normalizedSize = Math.round(Number(chatFontSize));
    if (!Number.isFinite(normalizedSize)) {
      chatStatus = "error";
      error = "Please enter a chat font size.";
      return;
    }

    if (normalizedSize === persistedChatFontSize) {
      chatStatus = "saved";
      return;
    }

    chatStatus = "saving";
    error = "";
    const token = ++chatSaveToken;
    chatSavesInFlight += 1;
    markPotentialStaleChatSettingsWindow();
    try {
      const settings = await desktopRpc.setDesktopChatPreferences(normalizedSize);
      if (token !== chatSaveToken) return;
      applyLoadedSettings(settings, {
        preserveCodePreferences: shouldPreserveLocalCodePreferences(settings),
        preserveTerminalPreferences: shouldPreserveLocalTerminalPreferences(settings),
      });
      chatStatus = "saved";
      error = "";
    } catch (err) {
      if (token !== chatSaveToken) return;
      chatStatus = "error";
      error = toErrorMessage(err);
    } finally {
      chatSavesInFlight = Math.max(0, chatSavesInFlight - 1);
      markPotentialStaleChatSettingsWindow();
    }
  }

  async function persistCodePreferences() {
    if (!hasLoaded) return;
    clearCodeSaveTimer();

    const normalizedFamily = codeFontFamily.trim();
    const normalizedSize = Math.round(Number(codeFontSize));
    if (!normalizedFamily || !Number.isFinite(normalizedSize)) {
      codeStatus = "error";
      error = "Please enter code font settings.";
      return;
    }

    if (normalizedFamily === persistedCodeFontFamily && normalizedSize === persistedCodeFontSize) {
      codeStatus = "saved";
      return;
    }

    codeStatus = "saving";
    error = "";
    const token = ++codeSaveToken;
    codeSavesInFlight += 1;
    markPotentialStaleCodeSettingsWindow();
    try {
      const settings = await desktopRpc.setDesktopCodePreferences(normalizedFamily, normalizedSize);
      if (token !== codeSaveToken) return;
      applyLoadedSettings(settings, {
        preserveChatPreferences: shouldPreserveLocalChatPreferences(settings),
        preserveTerminalPreferences: shouldPreserveLocalTerminalPreferences(settings),
      });
      codeStatus = "saved";
      error = "";
    } catch (err) {
      if (token !== codeSaveToken) return;
      codeStatus = "error";
      error = toErrorMessage(err);
    } finally {
      codeSavesInFlight = Math.max(0, codeSavesInFlight - 1);
      markPotentialStaleCodeSettingsWindow();
    }
  }

  async function persistTerminalPreferences() {
    if (!hasLoaded) return;
    clearTerminalSaveTimer();

    const normalizedFamily = terminalFontFamily.trim();
    const normalizedSize = Math.round(Number(terminalFontSize));
    const normalizedCursorStyle = normalizeTerminalCursorStyle(terminalCursorStyle);
    if (!normalizedFamily || !Number.isFinite(normalizedSize)) {
      terminalStatus = "error";
      error = "Please enter terminal font settings.";
      return;
    }

    if (
      normalizedFamily === persistedTerminalFontFamily &&
      normalizedSize === persistedTerminalFontSize &&
      normalizedCursorStyle === persistedTerminalCursorStyle
    ) {
      terminalStatus = "saved";
      return;
    }

    terminalStatus = "saving";
    error = "";
    const token = ++terminalSaveToken;
    terminalSavesInFlight += 1;
    markPotentialStaleTerminalSettingsWindow();
    try {
      const settings = await desktopRpc.setDesktopTerminalPreferences(
        normalizedFamily,
        normalizedSize,
        normalizedCursorStyle,
      );
      if (token !== terminalSaveToken) return;
      applyLoadedSettings(settings, {
        preserveChatPreferences: shouldPreserveLocalChatPreferences(settings),
        preserveCodePreferences: shouldPreserveLocalCodePreferences(settings),
      });
      terminalStatus = "saved";
      error = "";
    } catch (err) {
      if (token !== terminalSaveToken) return;
      terminalStatus = "error";
      error = toErrorMessage(err);
    } finally {
      terminalSavesInFlight = Math.max(0, terminalSavesInFlight - 1);
      markPotentialStaleTerminalSettingsWindow();
    }
  }

  function scheduleValidChatPreferencesPersist() {
    const normalizedSize = Math.round(Number(chatFontSize));
    if (
      !Number.isFinite(normalizedSize) ||
      normalizedSize < MIN_CHAT_FONT_SIZE ||
      normalizedSize > MAX_CHAT_FONT_SIZE
    ) {
      return;
    }

    invalidatePendingChatPreferenceSaves();
    if (normalizedSize === persistedChatFontSize) {
      chatStatus = "saved";
      clearChatSaveTimer();
      return;
    }

    chatStatus = "saving";
    error = "";
    clearChatSaveTimer();
    chatSaveTimer = setTimeout(() => {
      chatSaveTimer = undefined;
      void persistChatPreferences();
    }, CHAT_PREFERENCES_SAVE_DELAY_MS);
  }

  function scheduleValidCodePreferencesPersist() {
    const normalizedSize = Math.round(Number(codeFontSize));
    if (
      !Number.isFinite(normalizedSize) ||
      normalizedSize < MIN_CODE_FONT_SIZE ||
      normalizedSize > MAX_CODE_FONT_SIZE
    ) {
      return;
    }

    invalidatePendingCodePreferenceSaves();
    if (
      codeFontFamily.trim() === persistedCodeFontFamily &&
      normalizedSize === persistedCodeFontSize
    ) {
      codeStatus = "saved";
      clearCodeSaveTimer();
      return;
    }

    codeStatus = "saving";
    error = "";
    clearCodeSaveTimer();
    codeSaveTimer = setTimeout(() => {
      codeSaveTimer = undefined;
      void persistCodePreferences();
    }, CODE_PREFERENCES_SAVE_DELAY_MS);
  }

  function scheduleValidTerminalPreferencesPersist() {
    const normalizedSize = Math.round(Number(terminalFontSize));
    if (
      !Number.isFinite(normalizedSize) ||
      normalizedSize < MIN_TERMINAL_FONT_SIZE ||
      normalizedSize > MAX_TERMINAL_FONT_SIZE
    ) {
      return;
    }

    invalidatePendingTerminalPreferenceSaves();
    if (
      terminalFontFamily.trim() === persistedTerminalFontFamily &&
      normalizedSize === persistedTerminalFontSize &&
      terminalCursorStyle === persistedTerminalCursorStyle
    ) {
      terminalStatus = "saved";
      clearTerminalSaveTimer();
      return;
    }

    terminalStatus = "saving";
    error = "";
    clearTerminalSaveTimer();
    terminalSaveTimer = setTimeout(() => {
      terminalSaveTimer = undefined;
      void persistTerminalPreferences();
    }, TERMINAL_PREFERENCES_SAVE_DELAY_MS);
  }

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
      applyLoadedSettings(settings, {
        preserveChatPreferences: shouldPreserveLocalChatPreferences(settings),
        preserveCodePreferences: shouldPreserveLocalCodePreferences(settings),
        preserveTerminalPreferences: shouldPreserveLocalTerminalPreferences(settings),
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
        case "staged":
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
  async function persistAppIconTint() {
    if (!hasLoaded || appIconTint === persistedAppIconTint) {
      appIconTintStatus = "saved";
      return;
    }

    appIconTintStatus = "saving";
    error = "";
    try {
      const settings = await desktopRpc.setDesktopAppIconTint(appIconTint);
      applyLoadedSettings(settings, {
        preserveChatPreferences: shouldPreserveLocalChatPreferences(settings),
        preserveCodePreferences: shouldPreserveLocalCodePreferences(settings),
        preserveTerminalPreferences: shouldPreserveLocalTerminalPreferences(settings),
      });
      appIconTintStatus = "saved";
      error = "";
    } catch (err) {
      appIconTintStatus = "error";
      error = toErrorMessage(err);
    }
  }

  async function persistWindowVibrancy(value: boolean) {
    if (!hasLoaded || (value === persistedWindowVibrancy && windowVibrancySavesPending === 0)) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const token = ++windowVibrancySaveToken;
    windowVibrancySavesPending += 1;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const operation = windowVibrancySaveQueue.then(async () => {
      await desktopRpc.setDesktopWindowVibrancy(value);
    });
    windowVibrancySaveQueue = operation.catch(() => undefined);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      await operation;
      persistedWindowVibrancy = value;
      if (token !== windowVibrancySaveToken) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (token !== windowVibrancySaveToken) return;
      windowVibrancy = persistedWindowVibrancy;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    } finally {
      windowVibrancySavesPending = Math.max(0, windowVibrancySavesPending - 1);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function applyLoadedSettings(
    settings: DesktopSettings,
    options: ApplyLoadedSettingsOptions = {},
  ) {
    const nextCodeFontFamilies = normalizedCodeFontFamilies(
      settings.codeFontFamilies,
      settings.codeFontFamily,
    );
    const nextCodeFontFamily = selectableCodeFontFamily(
      settings.codeFontFamily,
      nextCodeFontFamilies,
    );
    const nextTerminalFontFamilies = normalizedCodeFontFamilies(
      settings.terminalFontFamilies,
      settings.terminalFontFamily,
    );
    const nextTerminalFontFamily = selectableCodeFontFamily(
      settings.terminalFontFamily,
      nextTerminalFontFamilies,
    );

    themePreference = settings.themePreference;
    persistedThemePreference = settings.themePreference;
    if (!options.preserveChatPreferences) {
      chatFontSize = settings.chatFontSize;
      persistedChatFontSize = settings.chatFontSize;
    }
    if (!options.preserveCodePreferences) {
      codeFontFamilies = nextCodeFontFamilies;
      codeFontFamily = nextCodeFontFamily;
      persistedCodeFontFamily = nextCodeFontFamily;
      codeFontSize = settings.codeFontSize;
      persistedCodeFontSize = settings.codeFontSize;
    }
    if (!options.preserveTerminalPreferences) {
      terminalFontFamilies = nextTerminalFontFamilies;
      terminalFontFamily = nextTerminalFontFamily;
      persistedTerminalFontFamily = nextTerminalFontFamily;
      terminalFontSize = settings.terminalFontSize;
      persistedTerminalFontSize = settings.terminalFontSize;
      terminalCursorStyle = normalizeTerminalCursorStyle(settings.terminalCursorStyle);
      persistedTerminalCursorStyle = normalizeTerminalCursorStyle(settings.terminalCursorStyle);
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (steerWithEnterSavesPending === 0) {
      steerWithEnter = settings.steerWithEnter === true;
      persistedSteerWithEnter = settings.steerWithEnter === true;
    }
    if (windowVibrancySavesPending === 0) {
      windowVibrancy = normalizeWindowVibrancy(settings.windowVibrancy);
      persistedWindowVibrancy = normalizeWindowVibrancy(settings.windowVibrancy);
    }
    appIconTint = normalizeAppIconTint(settings.appIconTint);
    persistedAppIconTint = normalizeAppIconTint(settings.appIconTint);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  function shouldPreserveLocalChatPreferences(settings: DesktopSettings): boolean {
    if (!hasLocalChatPreferencesToPreserve()) return false;

    const normalizedLocalSize = Math.round(Number(chatFontSize));
    if (!Number.isFinite(normalizedLocalSize)) return true;

    return settings.chatFontSize !== normalizedLocalSize;
  }

  function shouldPreserveLocalCodePreferences(settings: DesktopSettings): boolean {
    if (!hasLocalCodePreferencesToPreserve()) return false;

    const normalizedLocalFamily = codeFontFamily.trim();
    const normalizedLocalSize = Math.round(Number(codeFontSize));
    if (!normalizedLocalFamily || !Number.isFinite(normalizedLocalSize)) return true;

    const nextCodeFontFamilies = normalizedCodeFontFamilies(
      settings.codeFontFamilies,
      settings.codeFontFamily,
    );
    const nextCodeFontFamily = selectableCodeFontFamily(
      settings.codeFontFamily,
      nextCodeFontFamilies,
    );

    return (
      nextCodeFontFamily !== normalizedLocalFamily || settings.codeFontSize !== normalizedLocalSize
    );
  }

  function shouldPreserveLocalTerminalPreferences(settings: DesktopSettings): boolean {
    if (!hasLocalTerminalPreferencesToPreserve()) return false;

    const normalizedLocalFamily = terminalFontFamily.trim();
    const normalizedLocalSize = Math.round(Number(terminalFontSize));
    const normalizedLocalCursorStyle = normalizeTerminalCursorStyle(terminalCursorStyle);
    if (!normalizedLocalFamily || !Number.isFinite(normalizedLocalSize)) return true;

    const nextTerminalFontFamilies = normalizedCodeFontFamilies(
      settings.terminalFontFamilies,
      settings.terminalFontFamily,
    );
    const nextTerminalFontFamily = selectableCodeFontFamily(
      settings.terminalFontFamily,
      nextTerminalFontFamilies,
    );

    return (
      nextTerminalFontFamily !== normalizedLocalFamily ||
      settings.terminalFontSize !== normalizedLocalSize ||
      normalizeTerminalCursorStyle(settings.terminalCursorStyle) !== normalizedLocalCursorStyle
    );
  }

  function hasLocalChatPreferencesToPreserve(): boolean {
    return (
      chatStatus === "saving" ||
      chatSavesInFlight > 0 ||
      Date.now() < preserveLocalChatPreferencesUntil
    );
  }

  function hasLocalCodePreferencesToPreserve(): boolean {
    return (
      codeStatus === "saving" ||
      codeSavesInFlight > 0 ||
      Date.now() < preserveLocalCodePreferencesUntil
    );
  }

  function hasLocalTerminalPreferencesToPreserve(): boolean {
    return (
      terminalStatus === "saving" ||
      terminalSavesInFlight > 0 ||
      Date.now() < preserveLocalTerminalPreferencesUntil
    );
  }

  function invalidatePendingChatPreferenceSaves() {
    chatSaveToken += 1;
    markPotentialStaleChatSettingsWindow();
  }

  function invalidatePendingCodePreferenceSaves() {
    codeSaveToken += 1;
    markPotentialStaleCodeSettingsWindow();
  }

  function invalidatePendingTerminalPreferenceSaves() {
    terminalSaveToken += 1;
    markPotentialStaleTerminalSettingsWindow();
  }

  function markPotentialStaleChatSettingsWindow() {
    preserveLocalChatPreferencesUntil = Date.now() + CHAT_PREFERENCES_STALE_SETTINGS_GUARD_MS;
  }

  function markPotentialStaleCodeSettingsWindow() {
    preserveLocalCodePreferencesUntil = Date.now() + CODE_PREFERENCES_STALE_SETTINGS_GUARD_MS;
  }

  function markPotentialStaleTerminalSettingsWindow() {
    preserveLocalTerminalPreferencesUntil =
      Date.now() + TERMINAL_PREFERENCES_STALE_SETTINGS_GUARD_MS;
  }

  function clearChatSaveTimer() {
    if (!chatSaveTimer) return;
    clearTimeout(chatSaveTimer);
    chatSaveTimer = undefined;
  }

  function clearCodeSaveTimer() {
    if (!codeSaveTimer) return;
    clearTimeout(codeSaveTimer);
    codeSaveTimer = undefined;
  }

  function clearTerminalSaveTimer() {
    if (!terminalSaveTimer) return;
    clearTimeout(terminalSaveTimer);
    terminalSaveTimer = undefined;
  }

  function toErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return "Unable to update settings.";
  }

  function normalizedCodeFontFamilies(
    families: string[] | undefined,
    currentFamily: string,
  ): string[] {
    const byName = new Map<string, string>();
    for (const family of [...(families ?? []), ...splitFontFamilyList(currentFamily), "Menlo"]) {
      const normalized = normalizeFontFamily(family);
      if (!normalized || isGenericFontFamily(normalized)) continue;
      byName.set(normalized.toLocaleLowerCase(), normalized);
    }
    return [...byName.values()].sort((left, right) => left.localeCompare(right));
  }

  function selectableCodeFontFamily(currentFamily: string, families: string[]): string {
    const familySet = new Set(families.map((family) => family.toLocaleLowerCase()));
    for (const family of splitFontFamilyList(currentFamily)) {
      const normalized = normalizeFontFamily(family);
      if (familySet.has(normalized.toLocaleLowerCase())) return normalized;
    }
    return families[0] ?? normalizeFontFamily(currentFamily) ?? "Menlo";
  }

  function splitFontFamilyList(fontFamily: string): string[] {
    return fontFamily.split(",").map(normalizeFontFamily).filter(Boolean);
  }

  function normalizeFontFamily(fontFamily: string): string {
    return fontFamily.trim().replace(/^["']|["']$/g, "");
  }

  function isGenericFontFamily(fontFamily: string): boolean {
    return ["monospace", "serif", "sans-serif", "sans serif", "cursive", "fantasy"].includes(
      fontFamily.toLocaleLowerCase(),
    );
  }

  function normalizeTerminalCursorStyle(value: string): TerminalCursorStyle {
    if (value === "bar" || value === "underline") return value;
    return "block";
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function normalizeAppIconTint(value: string | undefined): AppIconTint {
    return APP_ICON_TINTS.includes(value as AppIconTint) ? (value as AppIconTint) : "default";
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

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
              void persistWindowVibrancy(value);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <div class="border-psx-border mt-1 flex w-full flex-col gap-2 border-t pt-3">
        <span class="text-psx-foreground-primary text-[13px]/[18px]">App icon</span>
        <DesktopAppIconTintSelect
          bind:value={appIconTint}
          disabled={appIconTintStatus === "loading"}
          onChange={() => void persistAppIconTint()}
        />
        <span class="text-psx-foreground-tertiary text-[11px]/[15px]">
          Tints the icon in the Dock and app switcher. Finder keeps the original.
        </span>
      </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</SettingsSection>

<SettingsSection
  title="Prompt submission"
  subtitle="Choose which action gets the quickest shortcut while an agent is responding"
>
  <div class="flex flex-col items-start gap-2 px-3 pb-3 pt-3">
    <div class="flex items-center gap-2">
      <Switch
        id="desktop-steer-with-enter-switch"
        checked={steerWithEnter}
        disabled={steerWithEnterStatus === "loading"}
        onCheckedChange={(value) => {
          steerWithEnter = value;
          void persistSteerWithEnter(value);
        }}
      />
      <label class="cursor-pointer text-[13px]/[18px]" for="desktop-steer-with-enter-switch">
        Steer with Enter
      </label>
    </div>
    <span class="text-psx-foreground-tertiary text-[11px]/[15px]">
      When enabled, Enter steers and Cmd+Enter enqueues. Otherwise, Enter enqueues and Cmd+Enter
      steers.
    </span>
  </div>
</SettingsSection>

<SettingsSection title="Chat Font">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <span class="text-psx-foreground-primary text-[13px]/[18px]">Size</span>
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
<SettingsSection title="Code Font">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <span class="text-psx-foreground-primary text-[13px]/[18px]">Family</span>
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
      <span class="text-psx-foreground-primary text-[13px]/[18px]">Size</span>
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
      <span class="text-psx-foreground-primary text-[13px]/[18px]">Family</span>
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
      <span class="text-psx-foreground-primary text-[13px]/[18px]">Size</span>
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
      <span class="text-psx-foreground-primary text-[13px]/[18px]">Cursor</span>
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
    <DesktopFileOpenerSelect
      bind:value={fileOpenerId}
      openers={fileOpeners}
      disabled={fileOpenerStatus === "loading" || fileOpeners.length === 0}
      onChange={persistFileOpener}
    />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  subtitle="How much detail to show while the agent works. Finished replies always collapse, chat mode is always compact"
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {$desktopUpdate.version
          ? `Update ${$desktopUpdate.version} is ready.`
          : "An update is ready."}
        Use the Update button to restart before changing release channels.
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
<SettingsSection title="About">
  <div class="flex items-center gap-1.5 px-3 pb-3 pt-3 text-[13px]/[18px]">
    <span class="text-psx-foreground-primary">
      Poolside Assistant{appVersion ? ` ${appVersion}` : ""}
    </span>
    <span class="text-psx-foreground-secondary" aria-hidden="true">·</span>
    <span class="text-psx-foreground-secondary">{appChannelLabel}</span>
    <span class="text-psx-foreground-secondary" aria-hidden="true">·</span>
    <button
      type="button"
      class="text-psx-link underline decoration-transparent hover:decoration-current"
      onclick={() => void desktopRpc.openDesktopChangelog()}
    >
      Changelog
    </button>
  </div>
</SettingsSection>

__POOL_SYNTHETIC_IMPORT_BASELINE__
  <SettingsSection title="Settings Error">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
