import { Collapsible as Primitive } from "bits-ui";
export type {
  CollapsibleContentProps,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
} from "bits-ui";
export { default as CollapsibleContent } from "./CollapsibleContent.svelte";
export { default as CollapsibleIndicator } from "./CollapsibleIndicator.svelte";
export { default as CollapsibleTrigger } from "./CollapsibleTrigger.svelte";
export const Collapsible = Primitive.Root;
