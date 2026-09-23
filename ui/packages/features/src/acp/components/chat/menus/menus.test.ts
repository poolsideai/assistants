import { describe, expect, it } from "vitest";
import {
  AGENT_CONFIG_OPTION_ID,
  AGENT_CONFIG_OPTION_LABEL,
  configMenuValue,
  isAgentPickerOptionId,
} from "./menus";

describe("AGENT_CONFIG_OPTION_ID", () => {
  it("is not the plain word 'agent', so a real agent-supplied config option with that id is never mistaken for the synthetic picker", () => {
    // Claude Code's ACP adapter ships a real custom-agent/persona picker
    // under the plain id "agent". Regression guard: if this constant ever
    // goes back to "agent", that real option becomes invisible again.
    expect(AGENT_CONFIG_OPTION_ID).not.toBe("agent");
    expect(AGENT_CONFIG_OPTION_ID).not.toBe(AGENT_CONFIG_OPTION_LABEL);
  });
});

describe("isAgentPickerOptionId", () => {
  it("matches only the synthetic sentinel id", () => {
    expect(isAgentPickerOptionId(AGENT_CONFIG_OPTION_ID)).toBe(true);
  });

  it("does not match a real agent-supplied option id of 'agent'", () => {
    expect(isAgentPickerOptionId("agent")).toBe(false);
    expect(isAgentPickerOptionId(AGENT_CONFIG_OPTION_LABEL)).toBe(false);
  });

  it("does not match unrelated option ids", () => {
    expect(isAgentPickerOptionId("model")).toBe(false);
    expect(isAgentPickerOptionId("")).toBe(false);
  });
});

describe("configMenuValue", () => {
  it("never collides between the synthetic agent picker and a real 'agent'-id option", () => {
    expect(configMenuValue(AGENT_CONFIG_OPTION_ID)).not.toBe(configMenuValue("agent"));
  });
});
