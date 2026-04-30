export const sizes = ["xs", "sm", "md", "lg"] as const;

export type Size = (typeof sizes)[number];
