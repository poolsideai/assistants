__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export default defineConfig((options) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    minify: !options.watch,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    sourcemap: options.watch ? false : "hidden",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    inputOptions(options) {
      const mutableOptions = options as typeof options & {
        define?: Record<string, string>;
        inject?: Record<string, unknown>;
        transform?: { define?: Record<string, string> };
      };
      const define = mutableOptions.define;
      delete mutableOptions.define;
      delete mutableOptions.inject;

      if (!define || Object.keys(define).length === 0) {
        return mutableOptions;
      }

      return {
        ...mutableOptions,
        transform: {
          ...mutableOptions.transform,
          define: {
            ...mutableOptions.transform?.define,
            ...define,
          },
        },
      };
    },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
