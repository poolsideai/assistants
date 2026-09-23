import { Terminal, type ILink, type ILinkProvider } from "@xterm/xterm";
import { describe, expect, it, vi } from "vitest";
import { createTerminalLinkActivation, installTerminalLinks } from "./terminalLinks";

function mouseEvent(init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent("click", init);
}

describe("terminal links", () => {
  it("opens links without a keyboard modifier", () => {
    const openExternalURL = vi.fn();
    const activate = createTerminalLinkActivation(openExternalURL);

    activate(mouseEvent(), "https://example.com/opened");

    expect(openExternalURL).toHaveBeenCalledOnce();
    expect(openExternalURL).toHaveBeenCalledWith("https://example.com/opened");
  });

  it("detects HTTP URLs in terminal output", async () => {
    const terminal = new Terminal();
    const openExternalURL = vi.fn();
    let provider: ILinkProvider | undefined;
    vi.spyOn(terminal, "registerLinkProvider").mockImplementation((candidate) => {
      provider = candidate;
      return { dispose: vi.fn() };
    });

    installTerminalLinks(terminal, openExternalURL);
    await new Promise<void>((resolve) => {
      terminal.write("visit https://example.com/poolside-terminal-link-test", resolve);
    });
    const links = await new Promise<ILink[] | undefined>((resolve) => {
      provider?.provideLinks(1, resolve);
    });

    expect(links).toHaveLength(1);
    expect(links?.[0]?.text).toBe("https://example.com/poolside-terminal-link-test");
    links?.[0]?.activate(mouseEvent(), links[0].text);
    expect(openExternalURL).toHaveBeenCalledWith("https://example.com/poolside-terminal-link-test");

    terminal.dispose();
  });

  it("configures OSC 8 links to reject non-HTTP protocols", () => {
    const terminal = new Terminal();
    const openExternalURL = vi.fn();

    installTerminalLinks(terminal, openExternalURL);

    expect(terminal.options.linkHandler?.allowNonHttpProtocols).toBe(false);
    terminal.options.linkHandler?.activate(mouseEvent(), "https://example.com", {
      start: { x: 1, y: 1 },
      end: { x: 1, y: 1 },
    });
    expect(openExternalURL).toHaveBeenCalledWith("https://example.com");

    terminal.dispose();
  });
});
