import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appState } from "../../hostAdapter";
import { initializeStatefulModule } from "../../hostRpc";
import { showDesktopSystemContextMenu } from "./desktopSystemContextMenu";

function setAssistantHost(assistantHost: string): void {
  appState.update((state) => ({
    ...state,
    environment: { ...state.environment, assistantHost },
  }));
}

describe("showDesktopSystemContextMenu", () => {
  const items = [
    { kind: "action" as const, id: "copy", label: "Copy" },
    { kind: "separator" as const },
    { kind: "action" as const, id: "paste", label: "Paste" },
  ];

  beforeEach(() => {
    setAssistantHost("desktop");
  });

  afterEach(() => {
    setAssistantHost("");
  });

  it("uses the system-menu RPC and resolves with the selected action", async () => {
    const sender = vi.fn().mockResolvedValue("paste");
    initializeStatefulModule(sender);

    await expect(showDesktopSystemContextMenu(items, { x: 10, y: 20 })).resolves.toBe("paste");

    expect(sender).toHaveBeenCalledWith("showDesktopSystemContextMenu", [
      {
        position: { x: 10, y: 20 },
        items,
      },
    ]);
  });

  it("resolves undefined when the system menu is dismissed", async () => {
    initializeStatefulModule(vi.fn().mockResolvedValue(null));

    await expect(showDesktopSystemContextMenu(items, { x: 0, y: 0 })).resolves.toBeUndefined();
  });

  it("resolves undefined when the system-menu RPC fails", async () => {
    initializeStatefulModule(vi.fn().mockRejectedValue(new Error("no menu host")));

    await expect(showDesktopSystemContextMenu(items, { x: 0, y: 0 })).resolves.toBeUndefined();
  });

  it("is a no-op off the desktop host", async () => {
    setAssistantHost("vscode");
    const sender = vi.fn();
    initializeStatefulModule(sender);

    await expect(showDesktopSystemContextMenu(items, { x: 0, y: 0 })).resolves.toBeUndefined();
    expect(sender).not.toHaveBeenCalled();
  });
});
