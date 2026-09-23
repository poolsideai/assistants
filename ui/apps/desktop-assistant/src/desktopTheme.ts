import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { getCurrentWindow, type Theme } from "@tauri-apps/api/window";
import type { DesktopThemePreference } from "./rpc/host";

export type ResolvedDesktopTheme = "light" | "dark";

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export const GITHUB_DARK_COLOR_THEME = {
  name: "GitHub Dark",
  tokenColors: [
    { scope: "comment", settings: { foreground: "#8b949e" } },
    { scope: "constant", settings: { foreground: "#79c0ff" } },
    { scope: "entity.name.function", settings: { foreground: "#d2a8ff" } },
    { scope: "entity.name.tag", settings: { foreground: "#7ee787" } },
    { scope: "keyword", settings: { foreground: "#ff7b72" } },
    { scope: "string", settings: { foreground: "#a5d6ff" } },
    { scope: "variable", settings: { foreground: "#ffa657" } },
    { scope: "invalid", settings: { foreground: "#f0f6fc", background: "#8e1519" } },
    { scope: "markup.heading", settings: { foreground: "#1f6feb", fontStyle: "bold" } },
    { scope: "markup.bold", settings: { foreground: "#c9d1d9", fontStyle: "bold" } },
    { scope: "markup.italic", settings: { foreground: "#c9d1d9", fontStyle: "italic" } },
    { scope: "markup.link", settings: { foreground: "#a5d6ff" } },
  ],
};

export const GITHUB_LIGHT_COLOR_THEME = {
  name: "GitHub Light",
  tokenColors: [
    { scope: "comment", settings: { foreground: "#57606a" } },
    { scope: "constant", settings: { foreground: "#0550ae" } },
    { scope: "entity.name.function", settings: { foreground: "#6639ba" } },
    { scope: "entity.name.tag", settings: { foreground: "#0550ae" } },
    { scope: "keyword", settings: { foreground: "#cf222e" } },
    { scope: "string", settings: { foreground: "#0a3069" } },
    { scope: "variable", settings: { foreground: "#953800" } },
    { scope: "invalid", settings: { foreground: "#f6f8fa", background: "#82071e" } },
    { scope: "markup.heading", settings: { foreground: "#0550ae", fontStyle: "bold" } },
    { scope: "markup.bold", settings: { foreground: "#24292f", fontStyle: "bold" } },
    { scope: "markup.italic", settings: { foreground: "#24292f", fontStyle: "italic" } },
    { scope: "markup.link", settings: { foreground: "#0a3069" } },
  ],
};

export function resolveDesktopTheme(themePreference: DesktopThemePreference): ResolvedDesktopTheme {
  if (themePreference !== "system") return themePreference;
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

export function desktopColorTheme(theme: ResolvedDesktopTheme) {
  return theme === "dark" ? GITHUB_DARK_COLOR_THEME : GITHUB_LIGHT_COLOR_THEME;
}

export async function applyDesktopTheme(
  themePreference: DesktopThemePreference,
): Promise<ResolvedDesktopTheme> {
  const resolvedTheme = resolveDesktopTheme(themePreference);

  document.documentElement.classList.toggle("vscode-light", resolvedTheme === "light");
  document.documentElement.classList.toggle("vscode-dark", resolvedTheme === "dark");
  document.body.classList.toggle("vscode-light", resolvedTheme === "light");
  document.body.classList.toggle("vscode-dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
  document.body.style.colorScheme = resolvedTheme;

  await applyNativeTheme(themePreference);

  return resolvedTheme;
}

export function watchDesktopTheme(
  getThemePreference: () => DesktopThemePreference,
  onResolvedThemeChange?: (theme: ResolvedDesktopTheme) => void,
): () => void {
  const media = window.matchMedia(DARK_SCHEME_QUERY);

  const apply = () => {
    void applyDesktopTheme(getThemePreference())
      .then((theme) => onResolvedThemeChange?.(theme))
      .catch((error) => console.debug("Unable to apply desktop theme", error));
  };

  media.addEventListener("change", apply);

  return () => {
    media.removeEventListener("change", apply);
  };
}

async function applyNativeTheme(themePreference: DesktopThemePreference): Promise<void> {
  const nativeTheme: Theme | null = themePreference === "system" ? null : themePreference;

  await Promise.all([
    setAppTheme(nativeTheme).catch((error) => console.debug("Unable to apply app theme", error)),
    getCurrentWindow()
      .setTheme(nativeTheme)
      .catch((error) => console.debug("Unable to apply window theme", error)),
  ]);
}
