import type { TV } from "tailwind-variants";
import * as base from "tailwind-variants";

export const tv: TV = (options, config) =>
  base.tv(options, {
    ...config,
    twMerge: config?.twMerge ?? true,
    twMergeConfig: {
      ...config?.twMergeConfig,
      extend: {
        theme: {
          text: ["auto"],
        },
      },
    },
  });

export { cn, cx } from "tailwind-variants";
export type { VariantProps } from "tailwind-variants";
