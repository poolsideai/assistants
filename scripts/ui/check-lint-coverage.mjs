#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const ignoredDirectories = new Set([
  ".git",
  ".svelte-kit",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "storybook-static",
]);

const sourceExtensions = new Set([".cjs", ".js", ".mjs", ".svelte", ".ts", ".tsx"]);

function getUiWorkspacePackageJsonPaths() {
  const packageJsonPaths = [];

  for (const entry of readdirSync("ui/apps", { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const appRoot = join("ui/apps", entry.name);
    if (exists(join(appRoot, "package.json"))) {
      packageJsonPaths.push(join(appRoot, "package.json"));
    }

    const nestedApp = join(appRoot, "app", "package.json");
    if (exists(nestedApp)) {
      packageJsonPaths.push(nestedApp);
    }
  }

  for (const entry of readdirSync("ui/config", { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const packageJsonPath = join("ui/config", entry.name, "package.json");
      if (exists(packageJsonPath)) {
        packageJsonPaths.push(packageJsonPath);
      }
    }
  }

  for (const entry of readdirSync("ui/packages", { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const packageJsonPath = join("ui/packages", entry.name, "package.json");
      if (exists(packageJsonPath)) {
        packageJsonPaths.push(packageJsonPath);
      }
    }
  }

  for (const entry of readdirSync("ui/scripts", { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const packageJsonPath = join("ui/scripts", entry.name, "package.json");
      if (exists(packageJsonPath)) {
        packageJsonPaths.push(packageJsonPath);
      }
    }
  }

  return packageJsonPaths.sort();
}

function hasSourceCode(workspacePath) {
  const stack = [workspacePath];

  while (stack.length > 0) {
    const currentPath = stack.pop();
    const entries = readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          stack.push(join(currentPath, entry.name));
        }
        continue;
      }

      if (sourceExtensions.has(extname(entry.name))) {
        return true;
      }
    }
  }

  return false;
}

function exists(path) {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
}

function getPackageJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function getWorkspacePath(packageJsonPath) {
  return packageJsonPath.slice(0, -"/package.json".length);
}

function fail(message, details = []) {
  console.error(message);
  for (const detail of details) {
    console.error(`  - ${detail}`);
  }
  process.exit(1);
}

const workspacePackages = getUiWorkspacePackageJsonPaths().map((packageJsonPath) => {
  const workspacePath = getWorkspacePath(packageJsonPath);
  const packageJson = getPackageJson(packageJsonPath);
  return { packageJsonPath, workspacePath, packageJson };
});

const sourceWorkspaces = workspacePackages.filter(({ workspacePath }) =>
  hasSourceCode(workspacePath),
);

const missingLintScripts = sourceWorkspaces
  .filter(({ packageJson }) => !Object.hasOwn(packageJson.scripts ?? {}, "check:lint"))
  .map(({ workspacePath }) => workspacePath);

if (missingLintScripts.length > 0) {
  fail(
    "UI lint coverage guard failed: the following source workspaces are missing a check:lint script.",
    missingLintScripts,
  );
}

let turboOutput = "";
try {
  turboOutput = execFileSync("pnpm", ["exec", "turbo", "check:lint", "--dry=json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (error) {
  fail("UI lint coverage guard failed: unable to run turbo dry-run.", [
    error.stderr?.toString().trim() || error.message,
  ]);
}

if (turboOutput.includes("<NONEXISTENT>")) {
  const sourceWorkspaceSet = new Set(sourceWorkspaces.map(({ workspacePath }) => workspacePath));
  const missingLintCommands = [];

  try {
    const start = turboOutput.indexOf("{");
    const end = turboOutput.lastIndexOf("}");
    const dryRun = JSON.parse(turboOutput.slice(start, end + 1));

    for (const task of dryRun.tasks ?? []) {
      if (
        task.task === "check:lint" &&
        typeof task.command === "string" &&
        task.command.includes("<NONEXISTENT>") &&
        sourceWorkspaceSet.has(task.directory)
      ) {
        missingLintCommands.push(`${task.package}: ${task.command}`);
      }
    }
  } catch {
    fail("UI lint coverage guard failed: unable to parse turbo dry-run output.");
  }

  if (missingLintCommands.length > 0) {
    fail(
      "UI lint coverage guard failed: turbo dry-run reported missing check:lint commands.",
      missingLintCommands,
    );
  }
}

console.log(
  `UI lint coverage guard passed for ${sourceWorkspaces.length} source workspaces.`,
);
