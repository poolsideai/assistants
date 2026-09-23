import { describe, expect, it } from "vitest";
import { withTimeout } from "./withTimeout.js";

describe("withTimeout", () => {
  it("resolves when callback calls resolver before timeout", async () => {
    const value = "done";

    const result = await withTimeout((resolve) => {
      resolve();
      return value;
    }, 10);

    expect(result).toBe(value);
  });

  it("resolves when callback does not call resolver before timeout", async () => {
    const value = "done";

    const result = await withTimeout(() => value, 10);

    expect(result).toBe(value);
  });
});
