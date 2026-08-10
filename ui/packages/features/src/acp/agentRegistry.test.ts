import { describe, expect, it } from "vitest";
import {
  agentServerConfigFromRegistryAgent,
  registryAgentCategory,
  registryAgentDistributionLabel,
  registryAgentReleaseUrl,
  registryIconUrl,
  sameAgentServerConfig,
  sortRegistryAgents,
  type ACPRegistryAgent,
} from "./agentRegistry";

describe("agentServerConfigFromRegistryAgent", () => {
  it("converts npx distributions to ACP server settings", () => {
    expect(
      agentServerConfigFromRegistryAgent({
        distribution: {
          npx: {
            package: "example-acp@1.0.0",
            args: ["--acp"],
            env: { EXAMPLE: "1" },
          },
        },
      }),
    ).toEqual({
      type: "registry",
      command: "npx",
      args: ["-y", "example-acp@1.0.0", "--acp"],
      env: { EXAMPLE: "1" },
    });
  });

  it("converts uvx distributions to ACP server settings", () => {
    expect(
      agentServerConfigFromRegistryAgent({
        distribution: {
          uvx: {
            package: "example-acp==1.0.0",
            args: ["serve"],
          },
        },
      }),
    ).toEqual({
      type: "registry",
      command: "uvx",
      args: ["example-acp==1.0.0", "serve"],
      env: undefined,
    });
  });

  it("carries binary distributions for helper-side platform selection", () => {
    expect(
      agentServerConfigFromRegistryAgent({
        distribution: {
          binary: {
            "darwin-aarch64": {
              archive: "https://example.com/agent.zip",
              sha256: "0123456789abcdef",
              cmd: "./agent",
              args: ["acp"],
            },
          },
        },
      }),
    ).toEqual({
      type: "registry",
      command: "",
      binary: {
        "darwin-aarch64": {
          archive: "https://example.com/agent.zip",
          sha256: "0123456789abcdef",
          cmd: "./agent",
          args: ["acp"],
        },
      },
    });
  });

  it("returns null when no runnable distribution can be selected", () => {
    expect(
      agentServerConfigFromRegistryAgent({
        distribution: {
          binary: undefined,
        },
      }),
    ).toBeNull();
  });
});

describe("registryAgentDistributionLabel", () => {
  it("labels supported distribution modes", () => {
    expect(
      registryAgentDistributionLabel(makeAgent({ distribution: { npx: { package: "a" } } })),
    ).toBe("npm");
    expect(
      registryAgentDistributionLabel(makeAgent({ distribution: { uvx: { package: "a" } } })),
    ).toBe("uvx");
    expect(
      registryAgentDistributionLabel(
        makeAgent({
          distribution: {
            binary: { "darwin-aarch64": { archive: "https://example.com/a.tgz", cmd: "./a" } },
          },
        }),
      ),
    ).toBe("binary");
  });
});

describe("registryAgentReleaseUrl", () => {
  it("links npx distributions to npm package pages", () => {
    expect(
      registryAgentReleaseUrl(
        makeAgent({ distribution: { npx: { package: "@scope/example@1.2.3" } } }),
      ),
    ).toBe("https://www.npmjs.com/package/%40scope/example");

    expect(
      registryAgentReleaseUrl(makeAgent({ distribution: { npx: { package: "example@1.2.3" } } })),
    ).toBe("https://www.npmjs.com/package/example");
  });

  it("links uvx distributions to PyPI project pages", () => {
    expect(
      registryAgentReleaseUrl(
        makeAgent({ distribution: { uvx: { package: "example-acp==1.2.3" } } }),
      ),
    ).toBe("https://pypi.org/project/example-acp/");
  });

  it("links GitHub binary distributions to releases pages", () => {
    expect(
      registryAgentReleaseUrl(
        makeAgent({
          distribution: {
            binary: {
              "darwin-aarch64": {
                archive: "https://github.com/example/agent/releases/download/v1.2.3/agent.tgz",
                cmd: "./agent",
              },
            },
          },
        }),
      ),
    ).toBe("https://github.com/example/agent/releases");

    expect(
      registryAgentReleaseUrl(
        makeAgent({
          distribution: {},
          repository: "https://github.com/example/agent.git",
        }),
      ),
    ).toBe("https://github.com/example/agent/releases");
  });

  it("falls back to repository or website", () => {
    expect(
      registryAgentReleaseUrl(
        makeAgent({
          distribution: {},
          repository: "https://github.com/example/agent",
          website: "https://example.com",
        }),
      ),
    ).toBe("https://github.com/example/agent/releases");

    expect(
      registryAgentReleaseUrl(
        makeAgent({
          distribution: {},
          website: "https://example.com",
        }),
      ),
    ).toBe("https://example.com");
  });
});

describe("registryAgentCategory", () => {
  it("places known-good agents in the tested category", () => {
    expect(registryAgentCategory(makeAgent({ id: "codex-acp" }))).toBe("tested");
    expect(registryAgentCategory(makeAgent({ id: "cursor" }))).toBe("third-party");
    expect(registryAgentCategory(makeAgent({ id: "unknown-acp" }))).toBe("third-party");
  });
});

describe("sameAgentServerConfig", () => {
  it("detects registry updates for installed agent configs", () => {
    expect(
      sameAgentServerConfig(
        {
          type: "registry",
          command: "npx",
          args: ["-y", "example@1.0.0"],
          default_config_options: { model: "local-choice" },
        },
        { type: "registry", command: "npx", args: ["-y", "example@1.0.0"] },
      ),
    ).toBe(true);

    expect(
      sameAgentServerConfig(
        { command: "npx", args: ["-y", "example@1.0.0"] },
        { command: "npx", args: ["-y", "example@1.1.0"] },
      ),
    ).toBe(false);
  });

  it("treats empty DB defaults as equivalent to omitted registry fields", () => {
    expect(
      sameAgentServerConfig(
        {
          command: "",
          args: [],
          env: {},
          binary: {
            "darwin-aarch64": {
              archive: "https://downloads.poolside.ai/pool/v1.0.5/pool-darwin-arm64.tar.gz",
              cmd: "./pool-darwin-arm64",
              args: ["acp"],
            },
          },
        },
        {
          command: "",
          binary: {
            "darwin-aarch64": {
              archive: "https://downloads.poolside.ai/pool/v1.0.5/pool-darwin-arm64.tar.gz",
              cmd: "./pool-darwin-arm64",
              args: ["acp"],
            },
          },
        },
      ),
    ).toBe(true);
  });

  it("compares binary distributions independent of platform key order", () => {
    expect(
      sameAgentServerConfig(
        {
          command: "",
          binary: {
            "linux-x86_64": {
              archive: "https://downloads.poolside.ai/pool/v1.0.5/pool-linux-amd64.tar.gz",
              cmd: "./pool-linux-amd64",
              args: ["acp"],
            },
            "darwin-aarch64": {
              archive: "https://downloads.poolside.ai/pool/v1.0.5/pool-darwin-arm64.tar.gz",
              cmd: "./pool-darwin-arm64",
              args: ["acp"],
            },
          },
        },
        {
          command: "",
          binary: {
            "darwin-aarch64": {
              archive: "https://downloads.poolside.ai/pool/v1.0.5/pool-darwin-arm64.tar.gz",
              cmd: "./pool-darwin-arm64",
              args: ["acp"],
            },
            "linux-x86_64": {
              archive: "https://downloads.poolside.ai/pool/v1.0.5/pool-linux-amd64.tar.gz",
              cmd: "./pool-linux-amd64",
              args: ["acp"],
            },
          },
        },
      ),
    ).toBe(true);
  });
});

describe("registryIconUrl", () => {
  it("resolves relative icons against the registry URL", () => {
    expect(registryIconUrl({ icon: "agent.svg" })).toBe(
      "https://cdn.agentclientprotocol.com/registry/v1/latest/agent.svg",
    );
  });
});

describe("sortRegistryAgents", () => {
  it("sorts by display name", () => {
    const agents = [makeAgent({ id: "z", name: "Zulu" }), makeAgent({ id: "a", name: "Alpha" })];

    expect(sortRegistryAgents(agents).map((agent) => agent.id)).toEqual(["a", "z"]);
  });
});

function makeAgent(overrides: Partial<ACPRegistryAgent>): ACPRegistryAgent {
  return {
    id: "agent",
    name: "Agent",
    version: "1.0.0",
    description: "Agent",
    distribution: { npx: { package: "agent" } },
    ...overrides,
  };
}
