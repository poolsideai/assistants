import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

interface ProductPlan {
  action: string;
  tag: string;
  tagAnnotation: string;
}

interface CoordinatedPlan {
  version: string | null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  activeProducts: string[];
  products: Record<string, ProductPlan & { version?: string }>;
}

const script = resolve(dirname(fileURLToPath(import.meta.url)), "find-version.ts");
const tsx = resolve(dirname(fileURLToPath(import.meta.url)), "../node_modules/.bin/tsx");
const vscodeDestination = "poolside-ai.acp-assistant";
const desktopDestination = "poolside/desktop-assistant";
__POOL_SYNTHETIC_IMPORT_BASELINE__

function git(repo: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
}

function runCli<T>(repo: string, ...args: string[]): T {
  const result = spawnSync(tsx, [script, ...args], {
    cwd: repo,
    encoding: "utf8",
    env: {
      ...process.env,
      FORCE_COLOR: "0",
      PATH: `${resolve(repo, "bin")}:${process.env.PATH ?? ""}`,
    },
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `release helper exited ${result.status}`);
  }
  return JSON.parse(result.stdout);
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const args = [
    "plan",
    product,
    "--channel",
    "stable",
    "--version",
    version,
    "--ref",
    "HEAD",
    "--main-ref",
    "HEAD",
    "--tag-prefix",
    tagPrefix,
    "--destination",
    destination,
    "--create-lineage",
  ];
  if (product === "vscode") args.push("--display-name", "Poolside Assistant");
  const plan = runCli<ProductPlan>(repo, ...args);
  git(repo, "tag", "--annotate", plan.tag, "--message", plan.tagAnnotation);
  return plan;
}

function coordinate(repo: string, ...args: string[]): CoordinatedPlan {
  return runCli<CoordinatedPlan>(
    repo,
    "plan-products",
    "--ref",
    "HEAD",
    "--main-ref",
    "HEAD",
    "--vscode",
    "--desktop",
    "--vscode-destination",
    vscodeDestination,
    "--vscode-display-name",
    "Poolside Assistant",
    "--desktop-destination",
    desktopDestination,
    ...args,
  );
}

function commitFile(repo: string, path: string, contents: string): void {
  writeFileSync(resolve(repo, path), contents);
  git(repo, "add", ".");
  git(repo, "commit", "-m", contents);
}

describe("coordinated product release planning", () => {
  let repo: string;

  beforeEach(() => {
    repo = mkdtempSync(resolve(tmpdir(), "coordinated-release-"));
    mkdirSync(resolve(repo, "bin"));
    writeFileSync(
      resolve(repo, "bin/gh"),
      `#!/bin/sh
case "$*" in
__POOL_SYNTHETIC_IMPORT_BASELINE__
  *) exit 1 ;;
esac
`,
    );
    chmodSync(resolve(repo, "bin/gh"), 0o755);
    git(repo, "init", "--initial-branch=main");
    git(repo, "config", "user.name", "Release Test");
    git(repo, "config", "user.email", "release-test@example.com");
    git(repo, "config", "commit.gpgsign", "false");
    mkdirSync(resolve(repo, "app"));
    mkdirSync(resolve(repo, "desktop"));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    writeFileSync(
      resolve(repo, "projects.yml"),
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
    writeFileSync(resolve(repo, "app/file.txt"), "initial vscode");
    writeFileSync(resolve(repo, "desktop/file.txt"), "initial desktop");
__POOL_SYNTHETIC_IMPORT_BASELINE__
    git(repo, "add", ".");
    git(repo, "commit", "-m", "initial");
    bootstrap(repo, "vscode", "0.2.0");
    bootstrap(repo, "desktop", "0.8.0");
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it("ignores completed same-source tags while eliminating synchronized version drift", () => {
    const plan = coordinate(repo, "--channel", "stable", "--bump", "patch", "--sync-versions");

    expect(plan).toMatchObject({
      version: "0.8.1",
      versions: { vscode: "0.8.1", desktop: "0.8.1" },
      activeProducts: ["vscode", "desktop"],
      products: {
        vscode: { action: "release", version: "0.8.0" },
        desktop: { action: "release", version: "0.8.1" },
      },
    });
  });

  it("excludes unchanged products from a scheduled release", () => {
    commitFile(repo, "app/file.txt", "vscode change");
    const plan = coordinate(
      repo,
      "--channel",
      "nightly",
      "--bump",
      "patch",
      "--sync-versions",
      "--scheduled",
      "--skip-if-no-changes",
    );

    expect(plan).toMatchObject({
      version: "0.3.0",
      versions: { vscode: "0.3.0" },
      activeProducts: ["vscode"],
      products: {
        vscode: { action: "release", version: "0.3.0" },
        desktop: { action: "skip", version: "0.9.0" },
      },
    });
    expect(plan.versions.desktop).toBeUndefined();
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  describe("first release after a history migration", () => {
    beforeEach(() => {
      git(
        repo,
        "tag",
        "--delete",
        "vscode-assistant/v0.2.0",
        "desktop/v0.8.0",
        "vs-assistant/v0.4.0",
      );
    });

    it("plans all three products without creating tags or importing old history", () => {
      const sourceSha = git(repo, "rev-parse", "HEAD");
      const plan = coordinate(
        repo,
        "--channel",
        "nightly",
        "--bootstrap-version",
        "1.7.0",
        "--sync-versions",
        "--vs",
        "--vs-destination",
        vsDestination,
      );

      expect(plan).toMatchObject({
        bootstrapVersion: "1.7.0",
        version: "1.7.0",
        versions: { vscode: "1.7.0", desktop: "1.7.0", vs: "1.7.0" },
        activeProducts: ["vscode", "desktop", "vs"],
        sourceSha,
      });
      for (const product of plan.activeProducts) {
        expect(plan.products[product]).toMatchObject({ action: "release", previousTag: null });
        expect(plan.products[product]?.tagAnnotation).toContain(sourceSha);
      }
      expect(git(repo, "tag", "--list")).toBe("");
    });

    it("keeps the exact bootstrap version when retrying a partially reserved release", () => {
      const args = ["--channel", "nightly", "--bootstrap-version", "1.7.0", "--sync-versions"];
      const initial = coordinate(repo, ...args);
      const vscode = initial.products.vscode;
      expect(vscode).toBeDefined();
      git(repo, "tag", "--annotate", vscode!.tag, "--message", vscode!.tagAnnotation);

      expect(coordinate(repo, ...args)).toMatchObject({
        version: "1.7.0",
        versions: { vscode: "1.7.0", desktop: "1.7.0" },
        products: { vscode: { action: "resume" }, desktop: { action: "release" } },
      });

      const desktop = initial.products.desktop;
      expect(desktop).toBeDefined();
      git(repo, "tag", "--annotate", desktop!.tag, "--message", desktop!.tagAnnotation);
      commitFile(repo, "desktop/file.txt", "next desktop change");
      expect(coordinate(repo, "--channel", "nightly", "--sync-versions")).toMatchObject({
        bootstrapVersion: null,
        version: "1.7.1",
        versions: { vscode: "1.7.1", desktop: "1.7.1" },
      });
    });

    it("does not bootstrap implicitly or from a schedule", () => {
      expect(() => coordinate(repo, "--channel", "nightly")).toThrow("is not bound");
      expect(coordinate(repo, "--channel", "nightly", "--scheduled")).toMatchObject({
        activeProducts: [],
      });
      expect(() =>
        coordinate(repo, "--channel", "nightly", "--bootstrap-version", "1.7.0", "--scheduled"),
      ).toThrow("Scheduled releases cannot bootstrap");
    });

    it("rejects a bootstrap version from the wrong channel", () => {
      expect(() =>
        coordinate(repo, "--channel", "nightly", "--bootstrap-version", "1.6.0"),
      ).toThrow("does not belong to the nightly channel");
    });

    it("refuses to move a bootstrap reservation to a different source", () => {
      const args = ["--channel", "nightly", "--bootstrap-version", "1.7.0"];
      const initial = coordinate(repo, ...args);
      const vscode = initial.products.vscode;
      expect(vscode).toBeDefined();
      git(repo, "tag", "--annotate", vscode!.tag, "--message", vscode!.tagAnnotation);
      commitFile(repo, "app/file.txt", "later source");

      expect(() => coordinate(repo, ...args)).toThrow("not planned source");
    });
  });
});
