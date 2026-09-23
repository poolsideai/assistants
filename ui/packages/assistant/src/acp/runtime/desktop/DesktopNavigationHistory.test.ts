import { describe, expect, it } from "vitest";
import { DesktopNavigationHistory, type DesktopNavigationEntry } from "./DesktopNavigationHistory";

function entry(
  view: DesktopNavigationEntry["view"],
  conversationId: string | null = "conversation-a",
): DesktopNavigationEntry {
  return { view, conversationId, projectSettingsPath: null };
}

describe("DesktopNavigationHistory", () => {
  it("navigates backward and forward across destinations", () => {
    const history = new DesktopNavigationHistory(entry("chat"));
    expect(history.canGoBack).toBe(false);
    expect(history.canGoForward).toBe(false);

    history.record(entry("connectors"));
    history.record(entry("settings"));
    expect(history.canGoBack).toBe(true);
    expect(history.canGoForward).toBe(false);

    expect(history.back()).toEqual(entry("connectors"));
    expect(history.canGoForward).toBe(true);
    expect(history.back()).toEqual(entry("chat"));
    expect(history.back()).toBeUndefined();
    expect(history.forward()).toEqual(entry("connectors"));
    expect(history.forward()).toEqual(entry("settings"));
    expect(history.forward()).toBeUndefined();
  });

  it("deduplicates repeated focus notifications", () => {
    const focused: DesktopNavigationEntry = {
      ...entry("chat"),
      split: {
        layoutKey: "conversation-a",
        surface: "main",
        paneId: "pane-a",
        tabId: "tab-a",
      },
    };
    const history = new DesktopNavigationHistory(entry("chat"));

    history.record(focused);
    history.record(focused);

    expect(history.canGoBack).toBe(false);
    expect(history.current).toEqual(focused);
  });

  it("records pane and tab focus changes within one conversation", () => {
    const first: DesktopNavigationEntry = {
      ...entry("chat"),
      split: {
        layoutKey: "conversation-a",
        surface: "main",
        paneId: "pane-a",
        tabId: "tab-a",
      },
    };
    const second: DesktopNavigationEntry = {
      ...entry("chat"),
      split: {
        layoutKey: "conversation-a",
        surface: "rightSidebar",
        paneId: "pane-b",
        tabId: "tab-b",
      },
    };
    const history = new DesktopNavigationHistory(first);

    history.record(second);

    expect(history.back()).toEqual(first);
    expect(history.forward()).toEqual(second);
  });

  it("drops the forward branch after new navigation", () => {
    const history = new DesktopNavigationHistory(entry("chat", "conversation-a"));
    history.record(entry("chat", "conversation-b"));
    history.record(entry("settings", "conversation-b"));
    history.back();

    history.record(entry("connectors", "conversation-b"));

    expect(history.canGoForward).toBe(false);
    expect(history.back()).toEqual(entry("chat", "conversation-b"));
  });
});
