import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(scriptDir, "..");
const repoRoot = join(appDir, "..", "..", "..");
const binaryDir = join(appDir, "src-tauri", "binaries");

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const target = helperTarget(targetTriple);
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

mkdirSync(binaryDir, { recursive: true });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
if (process.env.POOLSIDE_DESKTOP_LOCAL_HELPER === "1") {
  installLocalBazelBinary({
    binary: "poolside-helper",
    label: "//cmd/poolside-helper:poolside-helper",
    installedName: `poolside-helper-${targetTriple}${target.extension}`,
  });
} else {
  await installBinary({
    binary: "poolside-helper",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    archiveName: `poolside-helper-${target.platform}-${target.arch}.tar.gz`,
    extractedName: `poolside-helper-${target.platform}-${target.arch}${target.extension}`,
    installedName: `poolside-helper-${targetTriple}${target.extension}`,
  });
}
// Keep the Swift/MLX build explicit: normal desktop dev and spoolside launches
// should consume the prebuilt release sidecar.
if (process.env.POOLSIDE_DESKTOP_LOCAL_MLX_SIDECAR === "1") {
  installLocalMLXSidecar({ target, targetTriple });
} else {
  await installReleaseMLXSidecar({ target, targetTriple });
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
await installReleaseWhisperServer({ target, targetTriple });

async function installBinary({
  binary,
  version,
  download,
  archiveName,
  extractedName,
  installedName,
  requiredSiblings = [],
}) {
  const installedPath = join(binaryDir, installedName);
  const versionPath = `${installedPath}.version`;

  if (
    existsSync(installedPath) &&
    existsSync(versionPath) &&
__POOL_SYNTHETIC_IMPORT_BASELINE__
    requiredSiblings.every((name) => fileExistsAndIsNonEmpty(join(binaryDir, name)))
  ) {
    console.log(`${installedName} is already present for ${version}`);
    return;
  }

  const archivePath = join(binaryDir, archiveName);
  const extractedPath = join(binaryDir, extractedName);

  await download({ version, archiveName, archivePath });
  execFileSync("tar", ["-xzf", archivePath, "-C", binaryDir], { stdio: "inherit" });

  if (!existsSync(extractedPath)) {
    throw new Error(`Expected ${extractedPath} after extracting ${archiveName}`);
  }
  for (const name of requiredSiblings) {
    if (!fileExistsAndIsNonEmpty(join(binaryDir, name))) {
      throw new Error(`Expected ${name} after extracting ${archiveName}`);
    }
  }

  if (extractedPath !== installedPath) {
    rmSync(installedPath, { force: true });
    renameSync(extractedPath, installedPath);
  }
  rmSync(archivePath, { force: true });

  if (process.platform !== "win32") {
    execFileSync("chmod", ["+x", installedPath], { stdio: "inherit" });
  }

  writeFileSync(versionPath, `${version}\n`);
  console.log(`Installed ${binary} as ${installedName} from ${version}`);
}

function fileExistsAndIsNonEmpty(path) {
  try {
    return statSync(path).size > 0;
  } catch {
    return false;
  }
}

function installLocalBazelBinary({ binary, label, installedName }) {
  const hostTriple = targetTripleFromInput();
  if (hostTriple !== targetTriple) {
    throw new Error(
      `POOLSIDE_DESKTOP_LOCAL_HELPER=1 only supports host builds; host is ${hostTriple}, target is ${targetTriple}`,
    );
  }

  warnIfMobileWebUIMissing();
  console.log(`Building local ${binary} from ${label}`);
  execFileSync("bazelisk", ["build", label], { cwd: repoRoot, stdio: "inherit" });

  const builtPath = execFileSync("bazelisk", ["cquery", "--output=files", label], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!builtPath) {
    throw new Error(`Could not resolve built output for ${label}`);
  }

  const installedPath = join(binaryDir, installedName);
  // Bazel outputs are read-only and copyFileSync preserves that mode, so a
  // second install would fail with EACCES without removing the old copy.
  rmSync(installedPath, { force: true });
  copyFileSync(join(repoRoot, builtPath), installedPath);
  if (process.platform !== "win32") {
    execFileSync("chmod", ["+x", installedPath], { stdio: "inherit" });
  }
  writeFileSync(`${installedPath}.version`, "local\n");
  console.log(`Installed ${binary} as ${installedName} from local Bazel build`);
}

// A locally built helper embeds whatever is in the webui embed dir at build
// time, and a plain checkout has only the committed placeholders — so the
// helper silently serves the "no mobile UI bundle" page instead of the real
// remote UI. Released helpers never hit this (helper-build.yml runs the embed
// step), which makes it easy to mistake a local build's placeholder page for a
// regression. Warn rather than fail: most desktop work does not need the
// mobile UI, and building it is a ~6k-module Vite build.
function warnIfMobileWebUIMissing() {
  const embedDir = join(repoRoot, "pkg/poolside-helper/internal/handler/remoteaccess/webui/dist");
  let entries = [];
  try {
    entries = readdirSync(embedDir).filter(
      (entry) => entry !== ".gitkeep" && entry !== ".gitignore",
    );
  } catch {
    return;
  }
  if (entries.length > 0) return;
  console.warn(
    "\nwarning: no mobile-remote UI bundle is embedded; this helper will serve\n" +
      "         a placeholder page for remote access. Build one first with:\n" +
      "           pnpm -F @poolsideai/mobile-remote embed\n",
  );
}

async function installReleaseMLXSidecar({ target, targetTriple }) {
  const installedName = `poolside-mlx-sidecar-${targetTriple}${target.extension}`;
  if (!supportsMLXSidecar(targetTriple)) {
    installPlaceholderBinary({
      installedName,
      version: "unsupported",
      reason: `MLX sidecar is not supported on ${targetTriple}`,
    });
    return;
  }

  try {
    await installBinary({
      binary: "poolside-mlx-sidecar",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      archiveName: `poolside-mlx-sidecar-${target.platform}-${target.arch}.tar.gz`,
      extractedName: `poolside-mlx-sidecar-${target.platform}-${target.arch}${target.extension}`,
      installedName,
      requiredSiblings: ["default.metallib", "mlx.metallib"],
    });
  } catch (error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    installPlaceholderBinary({
      installedName,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    });
  }
}

function installLocalMLXSidecar({ targetTriple }) {
  const target = helperTarget(targetTriple);
  const installedName = `poolside-mlx-sidecar-${targetTriple}${target.extension}`;
  if (!supportsMLXSidecar(targetTriple)) {
    installPlaceholderBinary({
      installedName,
      version: "unsupported",
      reason: `MLX sidecar is not supported on ${targetTriple}`,
    });
    return;
  }

  const packagePath = join(repoRoot, "cmd", "poolside-mlx-sidecar");
  console.log("Building local poolside-mlx-sidecar from cmd/poolside-mlx-sidecar");
  // build.sh shares a SwiftPM scratch path across worktrees, serializes
  // concurrent builds, and installs the binary and metallibs into binaryDir
  // while it still holds the build lock (so a rebuild from another worktree
  // cannot mutate them mid-copy).
  execFileSync(join(packagePath, "scripts", "build.sh"), [binaryDir], {
    cwd: repoRoot,
    stdio: ["ignore", "ignore", "inherit"],
  });

  const builtPath = join(binaryDir, "poolside-mlx-sidecar");
  if (!existsSync(builtPath)) {
    throw new Error(`Expected ${builtPath} after Swift build`);
  }

  const installedPath = join(binaryDir, installedName);
  rmSync(installedPath, { force: true });
  renameSync(builtPath, installedPath);
  execFileSync("chmod", ["+x", installedPath], { stdio: "inherit" });
  writeFileSync(`${installedPath}.version`, "local\n");
  console.log(`Installed poolside-mlx-sidecar as ${installedName} from local Swift build`);
}

async function installReleaseWhisperServer({ target, targetTriple }) {
  const installedName = `poolside-whisper-server-${targetTriple}${target.extension}`;
  if (!supportsWhisperServer(targetTriple)) {
    installPlaceholderBinary({
      installedName,
      version: "unsupported",
      reason: `whisper-server is not supported on ${targetTriple}`,
    });
    return;
  }

  try {
    await installBinary({
      binary: "poolside-whisper-server",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      archiveName: `poolside-whisper-server-${target.platform}-${target.arch}.tar.gz`,
      extractedName: `poolside-whisper-server-${target.platform}-${target.arch}${target.extension}`,
      installedName,
    });
  } catch (error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    console.warn(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
    installPlaceholderBinary({
      installedName,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    });
  }
}

function installPlaceholderBinary({ installedName, version, reason }) {
  const installedPath = join(binaryDir, installedName);
  writeFileSync(installedPath, "");
  if (process.platform !== "win32") {
    execFileSync("chmod", ["+x", installedPath], { stdio: "inherit" });
  }
  writeFileSync(`${installedPath}.version`, `${version}\n`);
  console.log(`Installed placeholder ${installedName}: ${reason}`);
}

function supportsMLXSidecar(triple) {
  return triple === "aarch64-apple-darwin";
}

// Whisper-server release assets are only built for Apple Silicon today; other
// targets get a placeholder and fall back to PATH/env resolution at runtime.
function supportsWhisperServer(triple) {
  return triple === "aarch64-apple-darwin";
}

function downloadGitHubReleaseAsset({ version, archiveName }) {
  execFileSync(
    "gh",
    ["release", "download", version, "--pattern", archiveName, "--clobber", "--dir", binaryDir],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );
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
function targetTripleFromInput(input) {
  if (input) return normalizeTargetTriple(input);
  if (process.env.TARGET_TRIPLE) return normalizeTargetTriple(process.env.TARGET_TRIPLE);
  if (process.env.CARGO_BUILD_TARGET) return normalizeTargetTriple(process.env.CARGO_BUILD_TARGET);

  try {
    return execFileSync("rustc", ["--print", "host-tuple"], { encoding: "utf8" }).trim();
  } catch {
    const verbose = execFileSync("rustc", ["-Vv"], { encoding: "utf8" });
    const hostLine = verbose
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("host:"));
    if (!hostLine) {
      throw new Error("Could not determine Rust target triple");
    }
    return hostLine.slice("host:".length).trim();
  }
}

function normalizeTargetTriple(value) {
  switch (value) {
    case "darwin-x64":
      return "x86_64-apple-darwin";
    case "darwin-arm64":
      return "aarch64-apple-darwin";
    case "linux-x64":
      return "x86_64-unknown-linux-gnu";
    case "linux-arm64":
      return "aarch64-unknown-linux-gnu";
    case "win32-x64":
      return "x86_64-pc-windows-msvc";
    case "win32-arm64":
      return "aarch64-pc-windows-msvc";
    default:
      return value;
  }
}

function helperTarget(triple) {
  if (triple === "aarch64-apple-darwin") {
    return { platform: "darwin", arch: "arm64", extension: "" };
  }
  if (triple === "x86_64-apple-darwin") {
    return { platform: "darwin", arch: "amd64", extension: "" };
  }
  if (triple.startsWith("aarch64-unknown-linux-")) {
    return { platform: "linux", arch: "arm64", extension: "" };
  }
  if (triple.startsWith("x86_64-unknown-linux-")) {
    return { platform: "linux", arch: "amd64", extension: "" };
  }
  if (triple === "aarch64-pc-windows-msvc" || triple === "aarch64-pc-windows-gnullvm") {
    return { platform: "windows", arch: "arm64", extension: ".exe" };
  }
  if (triple === "x86_64-pc-windows-msvc" || triple === "x86_64-pc-windows-gnu") {
    return { platform: "windows", arch: "amd64", extension: ".exe" };
  }

  throw new Error(`Unsupported target triple: ${triple}`);
}
