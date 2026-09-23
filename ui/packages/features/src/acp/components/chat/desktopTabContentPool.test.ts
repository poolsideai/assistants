import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import {
  adoptDesktopTabContent,
  desktopTabContentPoolHost,
  pooledDesktopTabContent,
} from "./desktopTabContentPool";

// The pool exists so moving a tab between panes reparents its live DOM instead
// of remounting the view (a remount rebuilds an xterm and replays its whole
// scrollback, or rebuilds a chat transcript). The invariant these tests hold is
// node identity: the same element must survive every move.

describe("desktop tab content pool", () => {
  let host: HTMLElement;
  let hostAction: { destroy(): void };

  function element(className: string) {
    const node = document.createElement("div");
    node.className = className;
    document.body.appendChild(node);
    return node;
  }

  function pooledContent(tabId: string) {
    const wrapper = element("pool-item");
    host.appendChild(wrapper);
    const action = pooledDesktopTabContent(wrapper, tabId);
    return { wrapper, action };
  }

  beforeEach(() => {
    document.body.innerHTML = "";
    host = element("pool-host");
    hostAction = desktopTabContentPoolHost(host);
  });

  it("adopts pooled content into the slot that claims its tab", () => {
    const { wrapper } = pooledContent("tab-a");
    const slot = element("slot");

    adoptDesktopTabContent(slot, "tab-a");

    expect(wrapper.parentElement).toBe(slot);
  });

  it("adopts content that mounts after its slot", () => {
    const slot = element("slot");
    adoptDesktopTabContent(slot, "tab-late");

    const { wrapper } = pooledContent("tab-late");

    expect(wrapper.parentElement).toBe(slot);
  });

  it("keeps the same node across a move, in both teardown orders", () => {
    for (const releaseFirst of [true, false]) {
      document.body.innerHTML = "";
      host = element("pool-host");
      hostAction = desktopTabContentPoolHost(host);

      const { wrapper } = pooledContent("tab-moved");
      const source = element("slot-source");
      const sourceAction = adoptDesktopTabContent(source, "tab-moved");
      expect(wrapper.parentElement).toBe(source);

      const target = element("slot-target");
      // Svelte gives no ordering guarantee between the old slot's destroy and
      // the new slot's mount within one flush, so both orders must land the
      // content in the new slot.
      if (releaseFirst) {
        sourceAction.destroy();
        adoptDesktopTabContent(target, "tab-moved");
      } else {
        adoptDesktopTabContent(target, "tab-moved");
        sourceAction.destroy();
      }

      expect(wrapper.parentElement, `releaseFirst=${releaseFirst}`).toBe(target);
      expect(wrapper.isConnected).toBe(true);
    }
  });

  it("parks content back in the pool when its slot goes away unclaimed", () => {
    const { wrapper } = pooledContent("tab-parked");
    const slot = element("slot");
    const action = adoptDesktopTabContent(slot, "tab-parked");

    action.destroy();

    expect(wrapper.parentElement).toBe(host);
    expect(wrapper.isConnected).toBe(true);
  });

  it("follows a slot that switches to a different tab", () => {
    const first = pooledContent("tab-1");
    const second = pooledContent("tab-2");
    const slot = element("slot");

    const action = adoptDesktopTabContent(slot, "tab-1");
    expect(first.wrapper.parentElement).toBe(slot);

    action.update("tab-2");

    expect(second.wrapper.parentElement).toBe(slot);
    expect(first.wrapper.parentElement).toBe(host);
  });

  it("stops tracking content once the pooled wrapper is destroyed", () => {
    const { wrapper, action } = pooledContent("tab-gone");
    action.destroy();

    const slot = element("slot");
    adoptDesktopTabContent(slot, "tab-gone");

    expect(wrapper.parentElement).toBe(host);
    expect(slot.children.length).toBe(0);
  });

  it("never lets the subscribing effect read and write a revision counter", () => {
    // SplitsController.subscribe() calls the subscriber synchronously, so the
    // publish handler runs inside the effect that subscribes. Two things keep
    // that from self-triggering: priming the signatures first makes the
    // immediate call a no-op, and untrack stops the read inside `+=` from
    // registering the effect as a dependent. Without both, the effect reads and
    // writes the counter in its own body and Svelte aborts the app with
    // effect_update_depth_exceeded.
    const source = readFileSync("src/acp/components/chat/DesktopSplitsPane.svelte", "utf-8");

    expect(source).toContain("const primed = readPooledPlacements(currentEntry);");
    expect(source).toContain("pooledPlacementSignature = primed.signature;");
    expect(source).toContain("selectionSignature = primed.selection;");
    for (const counter of ["pooledLayoutRevision", "selectionRevision"]) {
      expect(source).toMatch(
        new RegExp(`untrack\\(\\(\\) => \\{\\s*${counter} \\+= 1;\\s*\\}\\);`),
      );
      // Exactly one increment, and the pattern above proves that one is wrapped.
      expect(source.match(new RegExp(`${counter} \\+= 1;`, "g"))).toHaveLength(1);
    }
  });

  it("drops the host on teardown so a stale pool cannot capture content", () => {
    hostAction.destroy();

    const { wrapper } = pooledContent("tab-hostless");
    const slot = element("slot");
    const action = adoptDesktopTabContent(slot, "tab-hostless");
    expect(wrapper.parentElement).toBe(slot);

    // With no pool host, releasing must leave the node where it is rather than
    // throwing — the content is torn down with its own component.
    expect(() => action.destroy()).not.toThrow();
  });
});
