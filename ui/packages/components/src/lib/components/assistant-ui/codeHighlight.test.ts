import { bundledLanguages } from "shiki/langs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { highlight, memoizedHighlight, resolveHighlightLanguage } from "./codeHighlight.js";
import { highlightLanguages } from "./highlightLanguages.js";

const workerMock = vi.hoisted(() => {
  class FakeHighlightWorker {
    listeners = new Map<string, ((event: { data?: unknown }) => void)[]>();
    posted: { id: number; code: string; language: string | undefined }[] = [];

    constructor() {
      registry.instances.push(this);
    }

    addEventListener(type: string, listener: (event: { data?: unknown }) => void): void {
      const list = this.listeners.get(type) ?? [];
      list.push(listener);
      this.listeners.set(type, list);
    }

    postMessage(message: { id: number; code: string; language: string | undefined }): void {
      this.posted.push(message);
    }

    terminate(): void {}

    emit(type: string, event: { data?: unknown }): void {
      for (const listener of this.listeners.get(type) ?? []) listener(event);
    }
  }
  const registry = { instances: [] as InstanceType<typeof FakeHighlightWorker>[] };
  return { FakeHighlightWorker, registry };
});

vi.mock("./codeHighlight.worker.js?shared-worker", () => ({
  default: workerMock.FakeHighlightWorker,
}));

/**
 * The static-import tests below run against the main-thread fallback (jsdom
 * has no Worker). These get a fresh module instance with a stubbed Worker
 * global so the facade takes the worker route instead.
 */
async function importWithWorker() {
  vi.resetModules();
  vi.stubGlobal("Worker", workerMock.FakeHighlightWorker);
  workerMock.registry.instances.length = 0;
  return await import("./codeHighlight.js");
}

describe("worker routing", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("routes highlighting through the worker and resolves with its response", async () => {
    const mod = await importWithWorker();

    const pending = mod.highlight("const x = 1;", "ts");
    expect(workerMock.registry.instances).toHaveLength(1);
    const worker = workerMock.registry.instances[0];
    expect(worker.posted).toHaveLength(1);
    expect(worker.posted[0]).toMatchObject({ code: "const x = 1;", language: "ts" });

    worker.emit("message", { data: { id: worker.posted[0].id, html: "<span>done</span>" } });
    expect(await pending).toBe("<span>done</span>");
  });

  it("skips the worker round trip for plain text", async () => {
    const mod = await importWithWorker();

    expect(await mod.highlight("one < two", undefined)).toContain("&lt;");
    expect(workerMock.registry.instances.flatMap((worker) => worker.posted)).toHaveLength(0);
  });

  it("falls back to the main thread for a request the worker reports failed", async () => {
    const mod = await importWithWorker();

    const pending = mod.highlight("const failed = true;", "ts");
    const worker = workerMock.registry.instances[0];
    worker.emit("message", { data: { id: worker.posted[0].id, error: "boom" } });

    const html = await pending;
    expect(html).toContain("<span");
    expect(html).toContain("failed");
  });

  it("drains pending work to the main thread after a worker error and stays there", async () => {
    const mod = await importWithWorker();

    const first = mod.highlight("const a = 1;", "ts");
    const second = mod.highlight("const b = 2;", "ts");
    const worker = workerMock.registry.instances[0];
    expect(worker.posted).toHaveLength(2);

    worker.emit("error", {});
    expect(await first).toContain("<span");
    expect(await second).toContain("<span");

    // Later requests bypass the dead worker entirely.
    expect(await mod.highlight("const c = 3;", "ts")).toContain("<span");
    expect(workerMock.registry.instances).toHaveLength(1);
    expect(worker.posted).toHaveLength(2);
  });
});

describe("Shiki static highlighting", () => {
  it("keeps the complete installed grammar and alias registry available", () => {
    expect([...highlightLanguages].sort()).toEqual(Object.keys(bundledLanguages).sort());
    for (const name of highlightLanguages) expect(resolveHighlightLanguage(name)).toBe(name);
    expect(resolveHighlightLanguage("constructor")).toBeUndefined();
    expect(resolveHighlightLanguage("__proto__")).toBeUndefined();
  });
  it("resolves fence aliases and filenames without loading a grammar", () => {
    expect(resolveHighlightLanguage("ts")).toBe("ts");
    expect(resolveHighlightLanguage("src/example.ts")).toBe("ts");
    expect(resolveHighlightLanguage("scope.json")).toBe("json");
    expect(resolveHighlightLanguage("README.unknown")).toBeUndefined();
  });

  it("highlights a known language", async () => {
    const html = await highlight('const answer: number = 42;\nconsole.log("ok");', "typescript");

    expect(html).toContain("<span");
    expect(html).toContain("answer");
    expect(html.split("\n")).toHaveLength(2);
  });

  it("safely escapes unknown and plain-text blocks", async () => {
    expect(await highlight("<script>alert('x')</script>", "not-a-language")).not.toContain(
      "<script>",
    );
    expect(await highlight("one < two", undefined)).toContain("&lt;");
  });

  it("shares settled work", async () => {
    const first = memoizedHighlight("const settled = true;", "ts");
    const second = memoizedHighlight("const settled = true;", "ts");

    expect(second).toBe(first);
    expect(await first).toContain("settled");
  });
});
