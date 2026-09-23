import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appState } from "../../hostAdapter";
import { presentNativeMenu } from "../ui/menuSpec";
import DesktopOpenTargetButton, {
  type DesktopTargetOpener,
} from "./DesktopOpenTargetButton.svelte";

vi.mock("../ui/menuSpec", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  presentNativeMenu: vi.fn(),
}));

const mockPresentNativeMenu = vi.mocked(presentNativeMenu);

const openers: DesktopTargetOpener[] = [
  { id: "default", label: "Default App", kind: "default" },
  { id: "vscode", label: "VS Code", kind: "application", iconDataUri: "data:image/png;base64,AAA" },
  { id: "terminal", label: "Terminal", kind: "terminal" },
];

function setEnvironment(assistantHost: string, operatingSystem?: string): void {
  appState.update((state) => ({
    ...state,
    environment: { ...state.environment, assistantHost, operatingSystem },
  }));
}

describe("DesktopOpenTargetButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setEnvironment("", undefined);
  });

  describe("DOM fallback", () => {
    it("opens the DOM menu and reports the selected opener", async () => {
      const onOpen = vi.fn();
      render(DesktopOpenTargetButton, {
        props: { openers, targetKind: "project", value: "default", onOpen },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open project in... options" }));

      const vscodeRow = screen.getByRole("menuitem", { name: "VS Code" });
      await fireEvent.click(vscodeRow);

      expect(onOpen).toHaveBeenCalledExactlyOnceWith(openers[1]);
      expect(mockPresentNativeMenu).not.toHaveBeenCalled();
    });

    it("opens the selected opener directly from the main button", async () => {
      const onOpen = vi.fn();
      render(DesktopOpenTargetButton, {
        props: { openers, targetKind: "worktree", value: "vscode", onOpen },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open worktree in..." }));

      expect(onOpen).toHaveBeenCalledExactlyOnceWith(openers[1]);
    });
  });

  describe("native menu host", () => {
    it("presents the native menu from the trigger and dispatches the selected opener", async () => {
      setEnvironment("desktop", "darwin");
      mockPresentNativeMenu.mockResolvedValue("vscode");
      const onOpen = vi.fn();

      render(DesktopOpenTargetButton, {
        props: { openers, targetKind: "project", value: "default", onOpen },
      });

      const trigger = screen.getByRole("button", { name: "Open project in... options" });
      await fireEvent.click(trigger);

      await waitFor(() => expect(onOpen).toHaveBeenCalledExactlyOnceWith(openers[1]));

      // No DOM menu renders; the OS owns the surface.
      expect(screen.queryByRole("menuitem")).toBeNull();

      const [items, anchor, options] = mockPresentNativeMenu.mock.calls[0];
      expect(options).toMatchObject({ highlightStyle: "themed" });
      expect(anchor).toMatchObject({ align: "end" });
      // App artwork is a full-color image icon, never a recolored mask.
      expect(items).toEqual([
        { kind: "action", id: "default", label: "Default App", icon: "file" },
        { kind: "action", id: "vscode", label: "VS Code", icon: { image: openers[1].iconDataUri } },
        { kind: "action", id: "terminal", label: "Terminal", icon: "terminal" },
      ]);

      await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    });

    it("upscales padded VS Code artwork, mirroring the DOM rows' scale-105", async () => {
      setEnvironment("desktop", "darwin");
      mockPresentNativeMenu.mockResolvedValue(undefined);
      const padded: DesktopTargetOpener[] = [
        {
          id: "app.OpenVSCode",
          label: "Visual Studio Code",
          kind: "application",
          iconDataUri: "data:image/png;base64,BBB",
        },
      ];

      render(DesktopOpenTargetButton, {
        props: { openers: padded, targetKind: "project", value: "app.OpenVSCode", onOpen: vi.fn() },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open project in... options" }));
      await waitFor(() => expect(mockPresentNativeMenu).toHaveBeenCalledTimes(1));

      const [items] = mockPresentNativeMenu.mock.calls[0];
      expect(items).toEqual([
        expect.objectContaining({ icon: { image: "data:image/png;base64,BBB", scale: 1.05 } }),
      ]);
    });

    it("does not report a selection when the native menu is dismissed", async () => {
      setEnvironment("desktop", "darwin");
      mockPresentNativeMenu.mockResolvedValue(undefined);
      const onOpen = vi.fn();

      render(DesktopOpenTargetButton, {
        props: { openers, targetKind: "project", value: "default", onOpen },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open project in... options" }));
      await waitFor(() => expect(mockPresentNativeMenu).toHaveBeenCalledTimes(1));

      expect(onOpen).not.toHaveBeenCalled();
    });
  });
});
