import type { AuthMethod as SdkAuthMethod } from "@agentclientprotocol/sdk";

// JSON-RPC error code returned when an agent demands authentication before
// proceeding (advertised via `authMethods` in the initialize response).
export const ACP_AUTH_REQUIRED_ERROR_CODE = -32000;

// Discriminated AuthMethod shape mirroring `coder/acp-go-sdk` so a
// future SDK upgrade collapses to renames-only on this side.
//
// Some agents (e.g. Qwen) put the discriminator and side-payload under `_meta`
// instead of at the top level, because the current SDK build only types
// `id/name/description/_meta` on `AuthMethod`. We honour both.
export type ACPAuthMethodType = "agent" | "terminal" | "env_var";

export interface ACPAuthMethodAgent {
  type: "agent";
  id: string;
  name: string;
  description?: string;
}

export interface ACPAuthMethodTerminal {
  type: "terminal";
  id: string;
  name: string;
  description?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  args?: string[];
  env?: Record<string, string>;
}

export interface ACPAuthEnvVar {
  name: string;
  label?: string;
  optional?: boolean;
  secret?: boolean;
}

export interface ACPAuthMethodEnvVar {
  type: "env_var";
  id: string;
  name: string;
  description?: string;
  link?: string;
  vars: ACPAuthEnvVar[];
}

export type ACPAuthMethod = ACPAuthMethodAgent | ACPAuthMethodTerminal | ACPAuthMethodEnvVar;

export function parseAuthMethods(input: SdkAuthMethod[] | null | undefined): ACPAuthMethod[] {
  if (!input) return [];
  const parsed: ACPAuthMethod[] = [];
  for (const raw of input) {
    const method = parseAuthMethod(raw as Record<string, unknown>);
    if (method) parsed.push(method);
  }
  return parsed;
}

function parseAuthMethod(raw: Record<string, unknown>): ACPAuthMethod | null {
  const id = readString(raw.id);
  const name = readString(raw.name);
  if (!id || !name) return null;
  const meta = (raw._meta && typeof raw._meta === "object" ? raw._meta : {}) as Record<
    string,
    unknown
  >;
  const type = readType(raw, meta);
  const description = readString(raw.description);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  switch (type) {
    case "terminal":
      return {
        type: "terminal",
        id,
        name,
        description,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      };
    case "env_var":
      return {
        type: "env_var",
        id,
        name,
        description,
        link: readString(raw.link) ?? readString(meta.link),
        vars: readEnvVars(raw.vars ?? meta.vars),
      };
    default:
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
      return { type: "agent", id, name, description };
  }
}

function readType(raw: Record<string, unknown>, meta: Record<string, unknown>): ACPAuthMethodType {
  const value = readString(raw.type) ?? readString(meta.type);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if (value === "terminal" || value === "env_var" || value === "agent") {
    return value;
  }
  return "agent";
}

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
function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item === "string") out.push(item);
  }
  return out.length > 0 ? out : undefined;
}

function readStringMap(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") out[key] = raw;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function readEnvVars(value: unknown): ACPAuthEnvVar[] {
  if (!Array.isArray(value)) return [];
  const out: ACPAuthEnvVar[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const v = item as Record<string, unknown>;
    if (typeof v.name !== "string") continue;
    out.push({
      name: v.name,
      label: typeof v.label === "string" ? v.label : undefined,
      optional: typeof v.optional === "boolean" ? v.optional : undefined,
      secret: typeof v.secret === "boolean" ? v.secret : undefined,
    });
  }
  return out;
}
