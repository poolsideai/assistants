import type { SessionNotification } from "@agentclientprotocol/sdk";

export interface ACPTokenUsage {
  used: number | null;
  max: number | null;
}

type ACPSessionUsageUpdate = Extract<
  SessionNotification["update"],
  { sessionUpdate: "usage_update" }
>;

export class ACPSessionUsage {
  value = $state.raw<ACPTokenUsage>(emptyTokenUsage());

  reset(): void {
    this.value = emptyTokenUsage();
  }

  apply(update: ACPSessionUsageUpdate): void {
    this.value = nextTokenUsage(this.value, update);
  }
}

function emptyTokenUsage(): ACPTokenUsage {
  return {
    used: null,
    max: null,
  };
}

function nextTokenUsage(current: ACPTokenUsage, update: ACPSessionUsageUpdate): ACPTokenUsage {
  const used = "used" in update ? normalizeUsageNumber(update.used) : current.used;
  const max = "size" in update ? normalizeUsageNumber(update.size) : current.max;
  return { used, max };
}

function normalizeUsageNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.trunc(value));
}
