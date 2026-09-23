import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/acp/components/chat/DesktopSplitsPane.svelte", "utf-8");

describe("desktop focus appearance", () => {
  it("marks exactly one desktop surface as active", () => {
    for (const surface of ["main", "bottomPanel", "rightSidebar"]) {
      expect(source).toContain(`data-desktop-surface="${surface}"`);
      expect(source).toContain(
        `data-desktop-surface-active={activeSurface === "${surface}" ? "true" : undefined}`,
      );
      expect(source).toContain(`onfocusin={() => setActiveDesktopSurface("${surface}")}`);
      expect(source).toContain(
        `onpointerdowncapture={() => setActiveDesktopSurface("${surface}")}`,
      );
    }
  });
});
