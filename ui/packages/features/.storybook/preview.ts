import { Providers } from "@poolsideai/components/storybook";
import { definePreviewConfig } from "@poolsideai/storybook-config";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import ElicitationDecorator from "./ElicitationDecorator.svelte";
import "./globals.css";

const preview = definePreviewConfig({
  decorators: [
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }),
    (_, { parameters }) => ({
      Component: ElicitationDecorator,
      props: {
        pendingElicitationIds: parameters.elicitation?.pendingElicitationIds ?? [],
      },
    }),
    () => ({ Component: Providers }),
  ],
});

export default preview;
