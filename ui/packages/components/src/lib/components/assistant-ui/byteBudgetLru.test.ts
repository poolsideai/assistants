import { describe, expect, it } from "vitest";
import { ByteBudgetLru } from "./byteBudgetLru.js";

describe("ByteBudgetLru", () => {
  it("evicts least-recently-used entries until it is within budget", () => {
    const cache = new ByteBudgetLru<string>(10);
    cache.set("a", "A", 4);
    cache.set("b", "B", 4);
    expect(cache.get("a")).toBe("A");

    cache.set("c", "C", 4);

    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe("A");
    expect(cache.get("c")).toBe("C");
    expect(cache.bytes).toBe(8);
  });

  it("resizes only the matching async value and evicts oversized results", () => {
    const cache = new ByteBudgetLru<object>(10);
    const pending = {};
    cache.set("result", pending, 2);

    cache.resize("result", {}, 20);
    expect(cache.get("result")).toBe(pending);

    cache.resize("result", pending, 20);
    expect(cache.get("result")).toBeUndefined();
    expect(cache.bytes).toBe(0);
  });

  it("clears entries and retained-byte accounting together", () => {
    const cache = new ByteBudgetLru<string>(10);
    cache.set("a", "A", 4);
    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.bytes).toBe(0);
  });
});
