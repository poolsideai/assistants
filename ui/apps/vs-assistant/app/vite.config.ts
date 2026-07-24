import base, { mergeConfigs } from "@poolsideai/vite-config";
import path from "node:path";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export default defineConfig((env) =>
  mergeConfigs(
    base(env),
    defineConfig({
      plugins: [],
__POOL_SYNTHETIC_IMPORT_BASELINE__
      resolve: {
        alias: [
          {
            find: "#tailwind.css",
            replacement: "",
            customResolver: (_, importer) => {
              if (!importer) return;

              if (importer.includes("@poolsideai/assistant")) {
                return path.resolve(import.meta.dirname, "./src/assistant.css");
              }

              return;
            },
          },
        ],
      },

      build: {
        rollupOptions: {
          input: ["./assistant.html", "./acp-chat.html"],
          output: {
            entryFileNames: "assets/[name].js",
            chunkFileNames: "assets/[name].js",
            assetFileNames: "assets/[name].[ext]",
          },
        },
        sourcemap: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      server: {
        port: 5176,
        strictPort: true,
      },
    }),
  ),
);
