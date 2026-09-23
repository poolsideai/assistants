import { describe, expect, it } from "vitest";

import {
  DEFAULT_AGENT_SERVER,
  LEGACY_DEFAULT_AGENT_SERVER,
  LOCAL_AGENT_SERVER,
  agentServerNames,
  normalizeAgentServerName,
  resolveAgentServers,
} from "./agentServers";

describe("resolveAgentServers", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const servers = resolveAgentServers({
      echo: {
        command: "node",
        args: ["echo-acp.mjs"],
      },
    });

    expect(servers[DEFAULT_AGENT_SERVER]).toEqual({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    });
    expect(servers).not.toHaveProperty(LOCAL_AGENT_SERVER);
    expect(servers.echo).toEqual({
      command: "node",
      args: ["echo-acp.mjs"],
    });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
    const servers = resolveAgentServers({
      [DEFAULT_AGENT_SERVER]: {
        command: "pool",
        args: ["custom-acp"],
        default_config_options: { mode: "plan" },
      },
      echo: {
        command: "node",
      },
    });

    expect(servers[DEFAULT_AGENT_SERVER]).toEqual({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      default_config_options: { mode: "plan" },
    });
    expect(Object.keys(servers)).toEqual([DEFAULT_AGENT_SERVER, "echo"]);
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("treats legacy default as an alias for Poolside", () => {
    const servers = resolveAgentServers({
      [LEGACY_DEFAULT_AGENT_SERVER]: {
        command: "pool",
        args: ["custom-acp"],
      },
    });

    expect(Object.keys(servers)).toEqual([DEFAULT_AGENT_SERVER]);
    expect(normalizeAgentServerName(LEGACY_DEFAULT_AGENT_SERVER)).toBe(DEFAULT_AGENT_SERVER);
    expect(agentServerNames({ [LEGACY_DEFAULT_AGENT_SERVER]: { command: "pool" } })).toEqual([
      DEFAULT_AGENT_SERVER,
    ]);
  });

  it("preserves the Desktop-managed local agent when the helper advertises it", () => {
    const servers = resolveAgentServers({
      [LOCAL_AGENT_SERVER]: { type: "local" },
    });

    expect(servers[LOCAL_AGENT_SERVER]).toEqual({
      type: "local",
      command: "",
      args: undefined,
    });
  });
});
