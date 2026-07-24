import { defineConfig } from "vitest/config";

// Standalone config: this scripts package isn't part of the UI vitest workspace
// (which only globs ui/config, ui/features, ui/packages), so it defines its own.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // The integration suites use synchronous child processes for real git
    // operations. Running those files in parallel can starve Vitest's worker
    // heartbeat, especially while the full workspace test suite is busy.
    fileParallelism: false,
    pool: "threads",
    reporters: ["dot"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
