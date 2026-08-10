import { describe, expect, it } from "vitest";
import {
  spoolsideSlotForWorktree,
  spoolsideSlotMobileUrl,
  type MobileSpoolsideInstance,
} from "./spoolsideMobile";

const instance: MobileSpoolsideInstance = {
  slot: 1,
  worktreeName: "orderly-orbit",
  color: "#2563eb",
  slots: [
    { slot: 1, id: "orderly-orbit", remotePort: 8747 },
    { slot: 3, id: "brave-bison", remotePort: 8767 },
  ],
};

describe("spoolsideSlotForWorktree", () => {
  it("matches a worktree served by another live slot", () => {
    const slot = spoolsideSlotForWorktree({ name: "brave-bison", isWorktree: true }, instance);
    expect(slot).toEqual({ slot: 3, id: "brave-bison", remotePort: 8767 });
  });

  it("skips the slot already serving this app", () => {
    expect(spoolsideSlotForWorktree({ name: "orderly-orbit", isWorktree: true }, instance)).toBe(
      null,
    );
  });

  it("skips worktrees with no live slot", () => {
    expect(spoolsideSlotForWorktree({ name: "gone-tree", isWorktree: true }, instance)).toBe(null);
  });

  it("skips non-worktree projects and non-spoolside hosts", () => {
    expect(spoolsideSlotForWorktree({ name: "brave-bison", isWorktree: false }, instance)).toBe(
      null,
    );
    expect(spoolsideSlotForWorktree({ name: "brave-bison", isWorktree: true }, null)).toBe(null);
    expect(spoolsideSlotForWorktree({ name: "brave-bison", isWorktree: true }, undefined)).toBe(
      null,
    );
  });
});

describe("spoolsideSlotMobileUrl", () => {
  it("swaps only the port, keeping protocol and hostname", () => {
    const url = spoolsideSlotMobileUrl(
      { remotePort: 8767 },
      { protocol: "https:", hostname: "mac.tail1234.ts.net" },
    );
    expect(url).toBe("https://mac.tail1234.ts.net:8767/");
  });

  it("keeps IPv6 brackets (Location.hostname includes them per the URL standard)", () => {
    // Mirrors what browsers hand us: new URL("https://[::1]:8747/").hostname === "[::1]".
    expect(new URL("https://[::1]:8747/").hostname).toBe("[::1]");
    const url = spoolsideSlotMobileUrl(
      { remotePort: 8767 },
      { protocol: "https:", hostname: "[::1]" },
    );
    expect(url).toBe("https://[::1]:8767/");
  });

  it("appends the auth handoff fragment when provided", () => {
    const url = spoolsideSlotMobileUrl(
      { remotePort: 8767 },
      { protocol: "https:", hostname: "mac.tail1234.ts.net" },
      "#poolsideDeviceToken=tok",
    );
    expect(url).toBe("https://mac.tail1234.ts.net:8767/#poolsideDeviceToken=tok");
  });
});
