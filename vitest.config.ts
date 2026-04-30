import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "ui/config/*/{vite,vitest}.config.ts",
      "ui/features/*/{vite,vitest}.config.ts",
      "ui/packages/*/{vite,vitest}.config.ts",
    ],
  },
});
