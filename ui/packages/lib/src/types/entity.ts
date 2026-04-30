import type { Id } from "./id.js";

export interface BaseEntity<T extends PropertyKey> {
  id: Id<T>;
}

export type EntityCollection<T extends BaseEntity<PropertyKey>> = Map<T["id"], T>;

export type EntityRelation<
  Source extends BaseEntity<PropertyKey>,
  Target extends BaseEntity<PropertyKey>,
  Relation extends "one" | "many" = "one",
> = Relation extends "many"
  ? Map<Source["id"], Set<Target["id"]>>
  : Map<Source["id"], Target["id"]>;
