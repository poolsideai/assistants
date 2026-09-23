import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import CopyToClipboard from "./CopyToClipboard.svelte";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CopyToClipboard", () => {
  it("uses the host clipboard without first calling the restricted browser API", async () => {
    const browserWrite = vi.fn().mockRejectedValue(new Error("clipboard permission denied"));
    const hostWrite = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: browserWrite } });

    render(CopyToClipboard, {
      props: {
        text: "Assistant response",
        capabilities: { hostClipboardWrite: true },
        writeToClipboard: hostWrite,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "copy to clipboard" }));

    await waitFor(() => expect(hostWrite).toHaveBeenCalledWith("Assistant response"));
    expect(browserWrite).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument();
  });

  it("falls back from rich code copy to the host clipboard", async () => {
    const hostWrite = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("ClipboardItem", undefined);

    render(CopyToClipboard, {
      props: {
        text: "const answer = 42;",
        html: "<pre><code>const answer = 42;</code></pre>",
        forCode: true,
        capabilities: { hostClipboardWrite: true },
        writeToClipboard: hostWrite,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "copy to clipboard" }));

    await waitFor(() => expect(hostWrite).toHaveBeenCalledWith("const answer = 42;"));
    expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument();
  });

  it("reports host clipboard failures without showing success", async () => {
    const error = new Error("host clipboard unavailable");
    const onCopyError = vi.fn();

    render(CopyToClipboard, {
      props: {
        text: "Assistant response",
        capabilities: { hostClipboardWrite: true },
        writeToClipboard: vi.fn().mockRejectedValue(error),
        onCopyError,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "copy to clipboard" }));

    await waitFor(() => expect(onCopyError).toHaveBeenCalledWith(error));
    expect(screen.getByRole("button", { name: "copy to clipboard" })).toBeInTheDocument();
  });

  it("uses the same stable circular button for code and regular copy actions", () => {
    const regular = render(CopyToClipboard, { props: { text: "response" } });
    const code = render(CopyToClipboard, { props: { text: "code", forCode: true } });

    for (const container of [regular.container, code.container]) {
      const button = container.querySelector("[data-copy-button]");
      const statusIcon = container.querySelector("[data-copy-status-icon]");

      expect(button).toHaveClass(
        "size-6",
        "rounded-full",
        "border",
        "border-psx-border",
        "bg-psx-panel",
        "transition-colors",
      );
      expect(button).not.toHaveClass("hover:bg-psx-chrome-hover");
      expect(statusIcon).toBeInTheDocument();
      expect(statusIcon?.querySelector("svg")).toHaveAttribute("width", "14");
      expect(statusIcon?.querySelector("svg")).toHaveAttribute("height", "14");
    }
  });

  it("centres exactly one status icon in each copy state", async () => {
    const writeToClipboard = vi.fn().mockResolvedValue(undefined);
    const { container } = render(CopyToClipboard, {
      props: {
        text: "response",
        capabilities: { hostClipboardWrite: true },
        writeToClipboard,
      },
    });

    const button = screen.getByRole("button", { name: "copy to clipboard" });
    const statusIcon = container.querySelector("[data-copy-status-icon]");

    expect(statusIcon).toHaveAttribute("data-copy-status", "copy");
    expect(statusIcon?.children).toHaveLength(1);

    await fireEvent.click(button);
    await waitFor(() => expect(writeToClipboard).toHaveBeenCalledWith("response"));

    expect(statusIcon).toHaveAttribute("data-copy-status", "copied");
    expect(statusIcon?.children).toHaveLength(1);
    expect(button).toHaveClass("copy-button-success");
  });
});
