import { createContext } from "svelte";
import type { SubagentReference } from "../../subagents";

export type SubagentTranscriptNavigation = {
  open(reference: SubagentReference): void;
};

const [getSubagentTranscriptNavigation, setSubagentTranscriptNavigation] =
  createContext<SubagentTranscriptNavigation>();

export function getOptionalSubagentTranscriptNavigation():
  | SubagentTranscriptNavigation
  | undefined {
  try {
    return getSubagentTranscriptNavigation();
  } catch {
    return undefined;
  }
}

export { setSubagentTranscriptNavigation };
