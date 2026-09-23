import { describe, expect, it } from "vitest";
import { registryAgentRequirements, registryAgentRuntimeWarning } from "./agentRequirements";

describe("registryAgentRequirements", () => {
  it("combines the package runner with curated agent requirements", () => {
    expect(
      registryAgentRequirements({
        id: "github-copilot-cli",
        distribution: { npx: { package: "@github/copilot" } },
      }),
    ).toEqual(["Node.js and npx", "GitHub account with Copilot access"]);

    expect(
      registryAgentRequirements({
        id: "fast-agent",
        distribution: { uvx: { package: "fast-agent-mcp" } },
      }),
    ).toEqual(["uv and uvx", "configured model provider and API key"]);
  });

  it("lists external CLIs that are not supplied by the registry package", () => {
    expect(
      registryAgentRequirements({
        id: "amp-acp",
        distribution: {
          binary: {
            "darwin-aarch64": { archive: "https://example.com/amp.tar.gz", cmd: "./amp-acp" },
          },
        },
      }),
    ).toEqual(["Amp CLI", "Amp account or API key"]);
  });

  it("gives newly registered agents a useful fallback", () => {
    expect(
      registryAgentRequirements({
        id: "new-agent",
        distribution: { npx: { package: "new-agent" } },
      }),
    ).toEqual(["Node.js and npx", "publisher-specific authentication or setup"]);
  });
});

describe("registryAgentRuntimeWarning", () => {
  const npxAgent = { distribution: { npx: { package: "new-agent" } } };

  it("warns for npx agents when npx is known to be missing", () => {
    expect(registryAgentRuntimeWarning(npxAgent, false)).toMatch(/npx was not found/);
  });

  it("stays silent while npx availability is unknown", () => {
    expect(registryAgentRuntimeWarning(npxAgent, null)).toBeNull();
  });

  it("stays silent when npx is available", () => {
    expect(registryAgentRuntimeWarning(npxAgent, true)).toBeNull();
  });

  it("stays silent for agents that do not launch through npx", () => {
    expect(
      registryAgentRuntimeWarning(
        {
          distribution: {
            binary: {
              "darwin-aarch64": { archive: "https://example.com/amp.tar.gz", cmd: "./amp-acp" },
            },
          },
        },
        false,
      ),
    ).toBeNull();
  });
});
