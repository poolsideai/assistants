import base, { mergeConfigs } from "@poolsideai/vite-config";
import { defineConfig } from "vite";

export default defineConfig((env) =>
  mergeConfigs(base(env), {
    optimizeDeps: {
      include: [],
    },
  }),
);
