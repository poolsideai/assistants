import { Providers } from "@poolsideai/components/storybook";
import { AcpProvider } from "@poolsideai/features/acp";
import { definePreviewConfig } from "@poolsideai/storybook-config";
import AppStateDecorator from "./AppStateDecorator.svelte";
import ElicitationDecorator from "./ElicitationDecorator.svelte";
import "./globals.css";

const preview = definePreviewConfig({
  decorators: [
    (_, { parameters }) => ({
      Component: AcpProvider,
      props: {
        sessionId: "test-session",
        ...parameters.acp,
      },
    }),
    (_, { parameters }) => ({
      Component: AppStateDecorator,
      props: {
        state: parameters.appState,
      },
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
