import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appState } from "../hostAdapter";
import DesktopFileOpenerSelect, { type DesktopFileOpener } from "./DesktopFileOpenerSelect.svelte";
import { presentNativeMenu } from "./ui/menuSpec";

vi.mock("./ui/menuSpec", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  presentNativeMenu: vi.fn(),
}));

const mockPresentNativeMenu = vi.mocked(presentNativeMenu);

const openers: DesktopFileOpener[] = [
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

describe("DesktopFileOpenerSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setEnvironment("", undefined);
  });

  describe("DOM fallback", () => {
    it("opens the DOM menu and reports the selected opener", async () => {
      const onChange = vi.fn();
      render(DesktopFileOpenerSelect, {
        props: { openers, value: "default", onChange },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open files in" }));

      const vscodeRow = screen.getByRole("menuitem", { name: /VS Code/ });
      await fireEvent.click(vscodeRow);

      expect(onChange).toHaveBeenCalledExactlyOnceWith("vscode");
      expect(mockPresentNativeMenu).not.toHaveBeenCalled();
    });

    it("marks the current opener as selected", async () => {
      render(DesktopFileOpenerSelect, {
        props: { openers, value: "vscode", onChange: vi.fn() },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open files in" }));

      const vscodeRow = screen.getByRole("menuitem", { name: /VS Code/ });
      expect(vscodeRow).toHaveTextContent("Selected");
    });
  });

  describe("native menu host", () => {
    it("presents the native menu from the trigger and dispatches the selected opener", async () => {
      setEnvironment("desktop", "darwin");
      mockPresentNativeMenu.mockResolvedValue("vscode");
      const onChange = vi.fn();

      render(DesktopFileOpenerSelect, {
        props: { openers, value: "default", onChange },
      });

      const trigger = screen.getByRole("button", { name: "Open files in" });
      await fireEvent.click(trigger);

      await waitFor(() => expect(onChange).toHaveBeenCalledExactlyOnceWith("vscode"));

      // No DOM menu renders; the OS owns the surface.
      expect(screen.queryByRole("menuitem")).toBeNull();

      const [items, anchor] = mockPresentNativeMenu.mock.calls[0];
      expect(anchor).not.toHaveProperty("align");
      // App artwork is a full-color image icon, never a recolored mask.
      expect(items).toEqual([
        { kind: "action", id: "default", label: "Default App", icon: "file", checked: true },
        {
          kind: "action",
          id: "vscode",
          label: "VS Code",
          icon: { image: openers[1].iconDataUri },
          checked: false,
        },
        { kind: "action", id: "terminal", label: "Terminal", icon: "terminal", checked: false },
      ]);

      await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    });

    it("marks the currently-selected opener as checked", async () => {
      setEnvironment("desktop", "darwin");
      mockPresentNativeMenu.mockResolvedValue(undefined);

      render(DesktopFileOpenerSelect, {
        props: { openers, value: "vscode", onChange: vi.fn() },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open files in" }));
      await waitFor(() => expect(mockPresentNativeMenu).toHaveBeenCalledTimes(1));

      const [items] = mockPresentNativeMenu.mock.calls[0];
      expect(items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "vscode", checked: true }),
          expect.objectContaining({ id: "default", checked: false }),
        ]),
      );
    });

    it("does not report a selection when the native menu is dismissed", async () => {
      setEnvironment("desktop", "darwin");
      mockPresentNativeMenu.mockResolvedValue(undefined);
      const onChange = vi.fn();

      render(DesktopFileOpenerSelect, {
        props: { openers, value: "default", onChange },
      });

      await fireEvent.click(screen.getByRole("button", { name: "Open files in" }));
      await waitFor(() => expect(mockPresentNativeMenu).toHaveBeenCalledTimes(1));

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
