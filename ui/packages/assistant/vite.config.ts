import base, { mergeConfigs } from "@poolsideai/vite-config";
import { defineConfig } from "vite";
__POOL_SYNTHETIC_IMPORT_BASELINE__
export default defineConfig((env) =>
  mergeConfigs(base(env), {
    optimizeDeps: {
      include: [],
    },
  }),
);
