import type { AuthMethod as SdkAuthMethod } from "@agentclientprotocol/sdk";
import { describe, expect, it } from "vitest";
import { parseAuthMethods } from "./authMethods";

describe("parseAuthMethods", () => {
  it("returns [] for null/undefined", () => {
    expect(parseAuthMethods(null)).toEqual([]);
    expect(parseAuthMethods(undefined)).toEqual([]);
  });

  it("parses agent type by default", () => {
    const input: SdkAuthMethod[] = [{ id: "claude-oauth", name: "Claude OAuth" }];
    expect(parseAuthMethods(input)).toEqual([
      { type: "agent", id: "claude-oauth", name: "Claude OAuth", description: undefined },
    ]);
  });

  it("parses Qwen-style methods that put type/args under _meta", () => {
    const input: SdkAuthMethod[] = [
      {
        id: "openai",
        name: "Use OpenAI API key",
        description: "Requires setting the `OPENAI_API_KEY` environment variable",
        _meta: { type: "terminal", args: ["--auth-type=openai"] },
      },
      {
        id: "qwen-oauth",
        name: "Qwen OAuth",
        description: "Qwen OAuth (free tier discontinued 2026-04-15)",
        _meta: { type: "terminal", args: ["--auth-type=qwen-oauth"] },
      },
    ];
    expect(parseAuthMethods(input)).toEqual([
      {
        type: "terminal",
        id: "openai",
        name: "Use OpenAI API key",
        description: "Requires setting the `OPENAI_API_KEY` environment variable",
        command: undefined,
        args: ["--auth-type=openai"],
        env: undefined,
      },
      {
        type: "terminal",
        id: "qwen-oauth",
        name: "Qwen OAuth",
        description: "Qwen OAuth (free tier discontinued 2026-04-15)",
        command: undefined,
        args: ["--auth-type=qwen-oauth"],
        env: undefined,
      },
    ]);
  });

  it("parses Zed-style terminal-auth metadata", () => {
    const input: SdkAuthMethod[] = [
      {
        id: "setup",
        name: "CLI Setup",
        description: "Run setup in a terminal",
        _meta: {
          "terminal-auth": {
            command: "agent",
            args: ["login"],
            env: { AGENT_HOME: "/tmp/agent" },
          },
        },
      },
    ];
    expect(parseAuthMethods(input)).toEqual([
      {
        type: "terminal",
        id: "setup",
        name: "CLI Setup",
        description: "Run setup in a terminal",
        command: "agent",
        args: ["login"],
        env: { AGENT_HOME: "/tmp/agent" },
      },
    ]);
  });

  it("treats cli type auth as terminal auth", () => {
    const input = [
      {
        id: "login",
        name: "Login",
        type: "cli",
        command: "agent",
        args: ["login"],
      },
    ] as unknown as SdkAuthMethod[];
    expect(parseAuthMethods(input)).toEqual([
      {
        type: "terminal",
        id: "login",
        name: "Login",
        description: undefined,
        command: "agent",
        args: ["login"],
        env: undefined,
      },
    ]);
  });

  it("parses top-level type/args (forward-compatible with SDK upgrade)", () => {
    const input = [
      {
        id: "openai",
        name: "Use OpenAI API key",
        type: "env_var",
        vars: [{ name: "OPENAI_API_KEY", secret: true }],
        link: "https://platform.openai.com/api-keys",
      },
    ] as unknown as SdkAuthMethod[];
    expect(parseAuthMethods(input)).toEqual([
      {
        type: "env_var",
        id: "openai",
        name: "Use OpenAI API key",
        description: undefined,
        link: "https://platform.openai.com/api-keys",
        vars: [{ name: "OPENAI_API_KEY", label: undefined, optional: undefined, secret: true }],
      },
    ]);
  });

  it("skips entries missing id or name", () => {
    const input = [
      { id: "ok", name: "Good" },
      { id: "no-name" },
      { name: "no-id" },
    ] as unknown as SdkAuthMethod[];
    expect(parseAuthMethods(input).map((m) => m.id)).toEqual(["ok"]);
  });
});
