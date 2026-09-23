import { describe, expect, it } from "vitest";
import { HeightCache } from "./heightCache.js";

describe("HeightCache", () => {
  it("stores and returns measured heights", () => {
    const cache = new HeightCache();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.has("a")).toBe(false);
    cache.set("a", 250);
    expect(cache.get("a")).toBe(250);
    expect(cache.has("a")).toBe(true);
    expect(cache.size).toBe(1);
  });

  it("set returns true for new ids and real changes, false for sub-pixel noise", () => {
    const cache = new HeightCache();
    expect(cache.set("a", 40)).toBe(true); // new
    expect(cache.set("a", 40.2)).toBe(false); // < 0.5px, ignored
    expect(cache.get("a")).toBe(40);
    expect(cache.set("a", 41)).toBe(true); // >= 0.5px, applied
    expect(cache.get("a")).toBe(41);
  });

  it("delete removes an entry", () => {
    const cache = new HeightCache();
    cache.set("a", 100);
    cache.set("b", 300);
    cache.delete("a");
    expect(cache.has("a")).toBe(false);
    expect(cache.get("b")).toBe(300);
    expect(cache.size).toBe(1);
  });

  it("clear empties the cache", () => {
    const cache = new HeightCache();
    cache.set("a", 100);
    cache.set("b", 200);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });
});
