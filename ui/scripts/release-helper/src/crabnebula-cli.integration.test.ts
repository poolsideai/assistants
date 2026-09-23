import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import YAML from "yaml";

const action = YAML.parse(
  readFileSync(
    new URL("../../../../.github/actions/setup-crabnebula-cli/action.yml", import.meta.url),
    "utf8",
  ),
) as { runs: { steps: { id: string; run: string }[] } };
const install = action.runs.steps.find((step) => step.id === "install")!.run;
const version = install.match(/^version=(\S+)$/m)![1];

describe("pinned CrabNebula CLI installation", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(resolve(tmpdir(), "crabnebula-cli-"));
    mkdirSync(resolve(directory, "bin"));
    writeFileSync(resolve(directory, "output"), "");
    writeFileSync(
      resolve(directory, "cn-fixture"),
      '#!/bin/bash\nprintf "%s\\n" "$CN_TEST_OUTPUT"\nexit "$CN_TEST_STATUS"\n',
    );
    writeFileSync(
      resolve(directory, "bin/curl"),
      `#!/bin/bash
set -euo pipefail
while (( $# )); do
  if [[ "$1" == "--output" ]]; then
    cp "$CN_TEST_FIXTURE" "$2"
    exit 0
  fi
  shift
done
exit 1
`,
      { mode: 0o755 },
    );
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  function runInstall(output: string, status = 0) {
    const fixture = resolve(directory, "cn-fixture");
    const checksum = createHash("sha256").update(readFileSync(fixture)).digest("hex");
    // Exercise the action's actual shell script with a local download fixture.
    const script = install.replace(/expected=[a-f0-9]{64}/g, `expected=${checksum}`);
    return spawnSync("bash", ["-c", script], {
      cwd: directory,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${resolve(directory, "bin")}:${process.env.PATH ?? ""}`,
        RUNNER_OS: "Linux",
        RUNNER_ARCH: "X64",
        RUNNER_TEMP: directory,
        GITHUB_OUTPUT: resolve(directory, "output"),
        CN_TEST_FIXTURE: fixture,
        CN_TEST_OUTPUT: output,
        CN_TEST_STATUS: String(status),
      },
    });
  }

  it.each([
    ["plain version", `cn ${version}`],
    ["update notice", `cn ${version}\n\nUpdate available! 99.0.0\nPublished on 2026-09-16.`],
    ["failed update check", `cn ${version}\n\nError during update check: connection failed`],
  ])("accepts the pinned version with %s", (_name, output) => {
    const result = runInstall(output);
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(resolve(directory, "output"), "utf8")).toBe(
      `path=${directory}/cn-${version}-Linux-X64\n`,
    );
  });

  it.each([
    ["wrong version", "cn 99.0.0"],
    ["version prefix match", `cn ${version}0`],
    ["version only on a later line", `cn 99.0.0\ncn ${version}`],
    ["empty output", ""],
  ])("rejects %s", (_name, output) => {
    const result = runInstall(output);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Verified binary did not report cn ${version}.`);
    expect(readFileSync(resolve(directory, "output"), "utf8")).toBe("");
  });

  it("rejects a failed version command even when it prints the pinned version", () => {
    const result = runInstall(`cn ${version}`, 1);
    expect(result.status).not.toBe(0);
    expect(readFileSync(resolve(directory, "output"), "utf8")).toBe("");
  });
});
