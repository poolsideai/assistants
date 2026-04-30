import type { NodeSpec } from "prosemirror-model";
import type { Simplify } from "type-fest";

export type NodeAttrs<T extends NodeSpec> = Simplify<
  {
    [K in keyof T["attrs"] as T["attrs"][K] extends { default: infer _ } ? never : K]: string;
  } & {
    [K in keyof T["attrs"] as T["attrs"][K] extends { default: infer _ }
      ? K
      : never]?: T["attrs"][K] extends { default: infer D }
      ? D extends undefined
        ? string
        : D
      : string;
  }
>;
