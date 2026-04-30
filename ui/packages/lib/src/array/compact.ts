import { isNonNullable } from "../guard/index.js";

export function compact<T>(arr: T[]) {
  return arr.filter(isNonNullable);
}
