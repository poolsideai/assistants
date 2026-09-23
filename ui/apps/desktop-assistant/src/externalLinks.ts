import { invoke } from "@tauri-apps/api/core";

/** Install in each trusted app document. Events inside child frames do not bubble here. */
export function installExternalLinkHandler(
  openExternal: (url: string) => void = (url) => {
    void invoke("open_external_url", { url }).catch((error) => {
      console.debug("Unable to open external URL", error);
    });
  },
): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    if (event.button !== (event.type === "auxclick" ? 1 : 0)) return;
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;

    // The webview is an app surface; all link navigation goes through an
    // explicit host action. Native navigation callbacks only allow or deny.
    event.preventDefault();
    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }
    if (
      url.protocol === "mailto:" ||
      ((url.protocol === "http:" || url.protocol === "https:") &&
        url.origin !== window.location.origin)
    ) {
      openExternal(url.toString());
    }
  };

  document.addEventListener("click", onClick, { capture: true });
  document.addEventListener("auxclick", onClick, { capture: true });
  return () => {
    document.removeEventListener("click", onClick, { capture: true });
    document.removeEventListener("auxclick", onClick, { capture: true });
  };
}
