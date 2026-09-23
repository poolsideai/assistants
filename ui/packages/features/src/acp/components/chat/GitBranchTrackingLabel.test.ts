import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("shows only the local branch inline with no tooltip, keeping tracking info for a11y", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(label?.textContent?.trim()).toBe("feature/branch");
    expect(label?.getAttribute("title")).toBeNull();
    expect(label?.getAttribute("aria-label")).toBe("feature/branch › origin/feature/branch");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("falls back to the branch alone when there is no tracking branch", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      props: { branch: "main" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(label?.textContent?.trim()).toBe("main");
    expect(label?.getAttribute("title")).toBeNull();
    expect(label?.getAttribute("aria-label")).toBe("main");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
