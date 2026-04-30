import { definePreviewConfig } from "@poolsideai/storybook-config";
import { Providers } from "../src/lib/storybook/index.js";
import "./globals.css";

const preview = definePreviewConfig({
  decorators: [
    () => ({
      Component: Providers,
    }),
  ],
});

export default preview;
