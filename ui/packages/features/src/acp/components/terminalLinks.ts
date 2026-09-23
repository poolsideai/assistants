import { WebLinksAddon } from "@xterm/addon-web-links";
import type { ILinkHandler, Terminal } from "@xterm/xterm";
import { rpc } from "../hostRpc";

type OpenExternalURL = (url: string) => void;

export function createTerminalLinkActivation(
  openExternalURL: OpenExternalURL,
): (event: MouseEvent, uri: string) => void {
  return (_event, uri) => {
    openExternalURL(uri);
  };
}

/**
 * Add implicit HTTP(S) URL detection and explicit OSC 8 hyperlink handling.
 * Both activate with a normal click or tap and use the host URL opener.
 */
export function installTerminalLinks(
  terminal: Terminal,
  openExternalURL: OpenExternalURL = (url) => {
    void rpc.openExternalURL(url);
  },
): void {
  const activate = createTerminalLinkActivation(openExternalURL);
  const linkHandler: ILinkHandler = {
    activate,
    // Terminal output is untrusted. Never pass custom OSC 8 protocols such as
    // javascript: or file: through to the host.
    allowNonHttpProtocols: false,
  };

  terminal.options.linkHandler = linkHandler;
  terminal.loadAddon(new WebLinksAddon(activate));
}
