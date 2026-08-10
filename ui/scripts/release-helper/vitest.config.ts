__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // The integration suites use synchronous child processes for real git
    // operations. Running those files in parallel can starve Vitest's worker
    // heartbeat, especially while the full workspace test suite is busy.
    fileParallelism: false,
    pool: "threads",
    reporters: ["dot"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
