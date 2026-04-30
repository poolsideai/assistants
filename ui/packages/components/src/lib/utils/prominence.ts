export const prominences = ["standard", "increased"] as const;

export type Prominence = (typeof prominences)[number];
