import type { Tagged } from "type-fest";

export type Id<T extends PropertyKey> = Tagged<string, T>;
