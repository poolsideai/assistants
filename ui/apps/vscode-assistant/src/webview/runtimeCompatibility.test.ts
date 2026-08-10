import { expect, test } from "vitest";

test("runtime compatibility", () => {
  const typecheckOnly = () => {
    // @ts-expect-error Map.groupBy is unavailable in the minimum supported Chromium runtime.
    const mapGrouped = Map.groupBy([1, 2, 3], (value) => value % 2);
    void mapGrouped;

    // @ts-expect-error Object.groupBy is unavailable in the minimum supported Chromium runtime.
    const objectGrouped = Object.groupBy([1, 2, 3], (value) => `${value % 2}`);
    void objectGrouped;
  };
  void typecheckOnly;

  expect(true).toBe(true);
});
