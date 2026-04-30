import type { Attachment } from "svelte/attachments";

export function portal(container: HTMLElement): Attachment {
  return (element: Element) => {
    container.appendChild(element);

    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  };
}
