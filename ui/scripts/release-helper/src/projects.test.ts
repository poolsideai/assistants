import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

interface Project {
  name: string;
  dirs: string[];
}

const config = YAML.parse(readFileSync(resolve("projects.yml"), "utf8")) as {
  projects: Project[];
};
const trackedFiles = execFileSync("git", ["ls-files"], {
  cwd: resolve("../../.."),
  encoding: "utf8",
})
  .trim()
  .split("\n");

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function dirsFor(name: string): string[] {
  const project = config.projects.find((candidate) => candidate.name === name);
  if (!project) throw new Error(`Missing ${name} project`);
  return project.dirs;
}

describe("release project ownership", () => {
  it("contains only products managed by the coordinated release flow", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(dirsFor(product)).toEqual(
      expect.arrayContaining([
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "cmd/poolside-helper",
        "pkg",
        "ui/apps/mobile-remote",
        "ui/packages/assistant",
        "ui/packages/components",
        "ui/packages/diff",
        "ui/packages/dnd",
        "ui/packages/features",
        "ui/packages/helperapi",
        "ui/packages/lib",
        "ui/packages/rpc",
        "ui/packages/remote-client",
        "ui/packages/splits",
        "ui/config/svelte",
        "ui/config/tailwind",
        "ui/config/tsconfig",
        "ui/config/vite",
        "bazel",
        "patches",
        "third_party",
        ".bazelignore",
        ".bazelrc",
        ".bazelversion",
        "BUILD.bazel",
        "MODULE.bazel",
        "MODULE.bazel.lock",
        "go.mod",
        "go.sum",
        "nogo_config.json",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
        "turbo.json",
        ".tool-versions",
      ]),
    );
  });

  it("assigns the Desktop-only MLX sidecar only to Desktop", () => {
    expect(dirsFor("desktop")).toContain("cmd/poolside-mlx-sidecar");
    expect(dirsFor("vscode")).not.toContain("cmd/poolside-mlx-sidecar");
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
    for (const path of dirsFor(product)) {
      expect(
        trackedFiles.some((file) => file === path || file.startsWith(`${path}/`)),
        `${path} is not tracked`,
      ).toBe(true);
    }
  });
});
