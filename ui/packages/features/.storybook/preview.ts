import { Providers } from "@poolsideai/components/storybook";
import { definePreviewConfig } from "@poolsideai/storybook-config";
import ACPContextDecorator from "./ACPContextDecorator.svelte";
import ElicitationDecorator from "./ElicitationDecorator.svelte";
import "./globals.css";

const preview = definePreviewConfig({
  decorators: [
    () => ({
      Component: ACPContextDecorator,
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
