// Keeps each desktop tab's content DOM alive in a hidden pool and moves it
// between pane slots by tab id, so splits, pane drops, and cross-surface tab
// moves reparent the existing DOM instead of remounting the content
// components (remounting a populated chat pane or terminal blocks the main
// thread for ~150ms; reparenting is a single appendChild).
//
// All bookkeeping is plain module state on purpose: adoption runs inside
// controller-publish flushes, and reactive collections read there can feed
// the flush that triggered them (infinite reactive loop).

let poolHost: HTMLElement | undefined;
const wrappers = new Map<string, HTMLElement>();
const slots = new Map<string, HTMLElement>();

/** Action for the hidden container that parks content no slot claims. */
export function desktopTabContentPoolHost(element: HTMLElement) {
  poolHost = element;
  return {
    destroy() {
      if (poolHost === element) poolHost = undefined;
    },
  };
}

/** Action for a pooled wrapper rendering one tab's content. */
export function pooledDesktopTabContent(element: HTMLElement, tabId: string) {
  wrappers.set(tabId, element);
  const slot = slots.get(tabId);
  if (slot && element.parentElement !== slot) slot.appendChild(element);
  return {
    destroy() {
      if (wrappers.get(tabId) === element) wrappers.delete(tabId);
    },
  };
}

/** Action for the pane-side slot that claims a tab's pooled content. */
export function adoptDesktopTabContent(element: HTMLElement, tabId: string) {
  let currentTabId = tabId;

  function adopt(id: string) {
    slots.set(id, element);
    const wrapper = wrappers.get(id);
    if (wrapper && wrapper.parentElement !== element) element.appendChild(wrapper);
  }

  // A moved tab's new slot can mount before or after the old slot's destroy
  // within one flush; release only when this slot is still the owner, and
  // park the wrapper back in the pool so its DOM survives until adoption.
  function release(id: string) {
    if (slots.get(id) !== element) return;
    slots.delete(id);
    const wrapper = wrappers.get(id);
    if (wrapper && wrapper.parentElement === element && poolHost) poolHost.appendChild(wrapper);
  }

  adopt(currentTabId);
  return {
    update(nextTabId: string) {
      if (nextTabId === currentTabId) return;
      release(currentTabId);
      currentTabId = nextTabId;
      adopt(currentTabId);
    },
    destroy() {
      release(currentTabId);
    },
  };
}
