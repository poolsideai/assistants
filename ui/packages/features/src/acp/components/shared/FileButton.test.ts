import { fireEvent, render, screen } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appState } from "../../hostAdapter";
import { markdownHost } from "../../markdownHost";
import FileButtonHarness from "./FileButton.test.svelte";

describe("FileButton", () => {
  const initialAppState = get(appState);
  const initialOpenFile = markdownHost.openFile;
  const initialShowFileContextMenu = markdownHost.showFileContextMenu;

  afterEach(() => {
    vi.restoreAllMocks();
    markdownHost.openFile = initialOpenFile;
    markdownHost.showFileContextMenu = initialShowFileContextMenu;
    appState.set(initialAppState);
  });

  it("does not render native title tooltips", () => {
    render(FileButtonHarness, {
      props: { path: "/repo/file.ts", title: "/repo/file.ts" },
    });

    expect(screen.getByRole("button", { name: "file.ts" })).not.toHaveAttribute("title");
  });

  it("opens files through the in-app file handler by default", async () => {
    const openFile = vi.fn().mockResolvedValue(undefined);
    markdownHost.openFile = openFile;

    render(FileButtonHarness, { props: { path: "/repo/file.ts" } });
    await fireEvent.click(screen.getByRole("button", { name: "file.ts" }));

    expect(openFile).toHaveBeenCalledWith("/repo/file.ts", undefined, undefined, {
      preferredEditor: false,
    });
  });

  it("opens files through the preferred editor on platform-primary click", async () => {
    const openFile = vi.fn().mockResolvedValue(undefined);
    markdownHost.openFile = openFile;

    render(FileButtonHarness, { props: { path: "/repo/file.ts" } });
    await fireEvent.click(screen.getByRole("button", { name: "file.ts" }), { ctrlKey: true });

    expect(openFile).toHaveBeenCalledWith("/repo/file.ts", undefined, undefined, {
      preferredEditor: true,
    });
  });

  it("shows the desktop file context menu on right click", async () => {
    appState.update((state) => ({
      ...state,
      environment: { ...state.environment, assistantHost: "desktop" },
    }));
    const showFileContextMenu = vi.fn().mockResolvedValue(undefined);
    markdownHost.showFileContextMenu = showFileContextMenu;

    render(FileButtonHarness, { props: { path: "/repo/file.ts" } });
    await fireEvent.contextMenu(screen.getByRole("button", { name: "file.ts" }), {
      clientX: 10,
      clientY: 20,
    });

    expect(showFileContextMenu).toHaveBeenCalledWith({
      path: "/repo/file.ts",
      position: { x: 10, y: 20 },
    });
  });
});
