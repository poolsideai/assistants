import { annotations } from "@poolsideai/storybook-config";
import { setProjectAnnotations } from "@storybook/svelte-vite";
import * as preview from "./preview.js";

setProjectAnnotations([...annotations, preview]);
