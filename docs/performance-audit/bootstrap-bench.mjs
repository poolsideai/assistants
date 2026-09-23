// Compare the actual original main.ts bootstrap block with the extracted loader.
// Each fixture native operation has a 20ms response latency. This isolates the
// serialization penalty; it is not an application TTI measurement.
// Usage: node docs/performance-audit/bootstrap-bench.mjs bf702a7d5
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { loadDesktopBootstrap } from "../../ui/apps/desktop-assistant/src/desktopBootstrap.ts";

const baseline = process.argv[2] ?? "bf702a7d5";
const source = execFileSync("git", ["show", `${baseline}:ui/apps/desktop-assistant/src/main.ts`], { encoding: "utf8" });
const start = source.indexOf("  let desktopSettings = await getDesktopSettings({ boot: true });");
const end = source.indexOf("  let lastAttentionBadgeCount = -1;", start);
assert.ok(start >= 0 && end > start, "Original startup block changed; update extraction");
const Before = new Function("ops", `return (async () => {
  let settings;
  const getDesktopSettings = async () => settings = await ops.readSettings();
  const getVersion = ops.readVersion;
  const homeDir = ops.readHomeDirectory;
  const applyDesktopTheme = () => ops.prepareAppearance(settings);
  const applyDesktopAccent = ops.reconcileAccent;
  const getCurrentWindow = () => ({ isFocused: ops.readWindowFocused, isFullscreen: ops.readWindowFullscreen });
  const logStartupDiagnostic = () => {};
  const applyDesktopFontPreferences = () => {};
  const applyDesktopWindowVibrancy = () => {};
  const setDesktopWindowFullscreenClass = () => {};
  ${source.slice(start, end)}
  return { desktopSettings, assistantVersion, homeDirectory, currentResolvedTheme, isWindowFocused, isWindowFullscreen };
})()`);

const settings = { themePreference: "dark", codeFontSize: 17, windowVibrancy: false };
const delayed = (value) => async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return value;
};
async function measure(load) {
  const timesMs = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const result = await load({
      readSettings: delayed(settings),
      readVersion: delayed("1.2.3"),
      readHomeDirectory: delayed("/fixture/home"),
      prepareAppearance: delayed("dark"),
      reconcileAccent: delayed(null),
      readWindowFocused: delayed(true),
      readWindowFullscreen: delayed(false),
    });
    assert.deepEqual(result, { desktopSettings: settings, assistantVersion: "1.2.3", homeDirectory: "/fixture/home", currentResolvedTheme: "dark", isWindowFocused: true, isWindowFullscreen: false });
    timesMs.push(performance.now() - start);
  }
  return { timesMs, medianMs: [...timesMs].sort((a, b) => a - b)[2] };
}
console.log(JSON.stringify({ baseline, latencyPerOperationMs: 20, before: await measure(Before), after: await measure(loadDesktopBootstrap) }, null, 2));
