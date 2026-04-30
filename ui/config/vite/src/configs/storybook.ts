import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { defineConfig } from "vite";

export default defineConfig((_) => {
  return {
    test: {
      projects: [
        {
          extends: true,
          plugins: [storybookTest()],
          test: {
            name: {
              label: "storybook",
              color: "magenta",
            },
            browser: {
              enabled: true,
              headless: true,
              provider: "playwright",
              instances: [
                {
                  browser: "chromium",
                },
              ],
            },
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  };
});
