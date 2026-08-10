__POOL_SYNTHETIC_IMPORT_BASELINE__
import { AcpProvider } from "@poolsideai/features/acp";
import { definePreviewConfig } from "@poolsideai/storybook-config";
import AppStateDecorator from "./AppStateDecorator.svelte";
import ElicitationDecorator from "./ElicitationDecorator.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const preview = definePreviewConfig({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    (_, { parameters }) => ({
      Component: AppStateDecorator,
      props: {
        state: parameters.appState,
      },
    }),
    (_, { parameters }) => ({
      Component: ElicitationDecorator,
      props: {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
