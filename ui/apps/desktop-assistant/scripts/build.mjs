import { execFileSync } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

if (process.env.SKIP_DESKTOP_TAURI_BUILD === "1") {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
} else {
  runPnpm("download:binaries");
  runPnpm("tauri", "build");
}

function runPnpm(...args) {
  execFileSync(pnpm, args, { stdio: "inherit" });
}
