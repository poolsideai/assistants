import { defineConfig } from "tsdown";
import pkg from "./package.json" with { type: "json" };

export default defineConfig((options) => {
  const dependencies = Object.keys(pkg.dependencies);
  return {
    entry: "src/extension/main.ts",
    format: ["cjs"],
    outDir: "dist/extension",
    platform: "node",
    minify: !options.watch,
    shims: true,
    target: "node18",
    sourcemap: options.watch ? false : "hidden",
    clean: true,
    copy: { from: "public", to: "dist/resources" },
    external: ["vscode"],
    noExternal: (id) => dependencies.some((dep) => id.startsWith(dep)),
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
  };
});
