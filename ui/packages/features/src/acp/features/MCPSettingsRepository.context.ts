import { createContext } from "svelte";
import type { ACPMCPSettingsRepository } from "./MCPSettingsRepository.svelte";

const [getContext, setContext] = createContext<ACPMCPSettingsRepository>();

export { setContext as setACPMCPSettingsContext };

export function getACPMCPSettingsRepo(): ACPMCPSettingsRepository | null {
  try {
    return getContext();
  } catch {
    return null;
  }
}
