import { nanoid } from "nanoid/non-secure";

export function generateId<T extends string>() {
  return nanoid<T>(10);
}
