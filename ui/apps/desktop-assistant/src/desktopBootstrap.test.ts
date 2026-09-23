import assert from "node:assert/strict";
import { test } from "node:test";
import { loadDesktopBootstrap, type DesktopBootstrapOperations } from "./desktopBootstrap.ts";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

const settings = { themePreference: "dark", codeFontSize: 17, windowVibrancy: false };
function operations(): DesktopBootstrapOperations<typeof settings, string> {
  return {
    readSettings: async () => settings,
    readVersion: async () => "1.2.3",
    readHomeDirectory: async () => "/fixture/home",
    prepareAppearance: async () => "dark",
    reconcileAccent: async () => null,
    readWindowFocused: async () => true,
    readWindowFullscreen: async () => false,
  };
}

test("independent reads begin before settings finish, while appearance waits for settings", async () => {
  const pendingSettings = deferred<typeof settings>();
  const calls: string[] = [];
  const ops = operations();
  ops.readSettings = () => pendingSettings.promise;
  for (const key of [
    "readVersion",
    "readHomeDirectory",
    "reconcileAccent",
    "readWindowFocused",
    "readWindowFullscreen",
  ] as const) {
    const read = ops[key];
    Object.assign(ops, {
      [key]: () => {
        calls.push(key);
        return read();
      },
    });
  }
  ops.prepareAppearance = async (value) => {
    assert.equal(value, settings);
    calls.push("appearance");
    return "dark";
  };
  const result = loadDesktopBootstrap(ops);
  await new Promise<void>((resolve) => setImmediate(resolve));
  const started = [...calls];
  pendingSettings.resolve(settings);
  await result;
  assert.equal(started.length, 3);
  assert.ok(!started.includes("appearance"));
  assert.ok(!started.includes("readWindowFocused"));
  assert.ok(!started.includes("readWindowFullscreen"));
  assert.ok(calls.indexOf("appearance") < calls.indexOf("readWindowFocused"));
});

test("returns the complete snapshot only after appearance and required reads finish", async () => {
  const appearance = deferred<string>();
  const ops = operations();
  ops.prepareAppearance = () => appearance.promise;
  let completed = false;
  const result = loadDesktopBootstrap(ops).then((value) => {
    completed = true;
    return value;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(completed, false);
  appearance.resolve("dark");
  assert.deepEqual(await result, {
    desktopSettings: settings,
    assistantVersion: "1.2.3",
    homeDirectory: "/fixture/home",
    currentResolvedTheme: "dark",
    isWindowFocused: true,
    isWindowFullscreen: false,
  });
});

test("a failed required read reaches startup recovery and never fabricates defaults", async () => {
  const ops = operations();
  ops.readHomeDirectory = async () => {
    throw new Error("home unavailable");
  };
  await assert.rejects(loadDesktopBootstrap(ops), /home unavailable/);
});

test("appearance is never applied from failed settings", async () => {
  const ops = operations();
  let applied = false;
  ops.readSettings = async () => {
    throw new Error("settings unavailable");
  };
  ops.prepareAppearance = async () => {
    applied = true;
    return "dark";
  };
  await assert.rejects(loadDesktopBootstrap(ops), /settings unavailable/);
  assert.equal(applied, false);
});

test("window probes share a round trip after the slow appearance phase", async () => {
  const appearance = deferred<string>();
  const focus = deferred<boolean>();
  const ops = operations();
  let fullscreenProbed = false;
  ops.prepareAppearance = () => appearance.promise;
  ops.readWindowFocused = () => focus.promise;
  ops.readWindowFullscreen = async () => {
    fullscreenProbed = true;
    return true;
  };
  const result = loadDesktopBootstrap(ops);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(fullscreenProbed, false);
  appearance.resolve("light");
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(fullscreenProbed, true);
  focus.resolve(false);
  const snapshot = await result;
  assert.equal(snapshot.isWindowFocused, false);
  assert.equal(snapshot.isWindowFullscreen, true);
});

test("both early and late failures of parallel reads are handled", async () => {
  const accent = deferred<unknown>();
  const ops = operations();
  let accentStarted = false;
  ops.readVersion = () => {
    throw new Error("version unavailable");
  };
  ops.reconcileAccent = () => {
    accentStarted = true;
    return accent.promise;
  };
  await assert.rejects(loadDesktopBootstrap(ops), /version unavailable/);
  if (accentStarted) accent.reject(new Error("late accent failure"));
  await new Promise<void>((resolve) => setImmediate(resolve));
});
