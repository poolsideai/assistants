/**
 * Common prefix shared by both strings.
 */
export function commonPrefix(a: string, b: string) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a.charCodeAt(i) === b.charCodeAt(i)) i++;
  return a.slice(0, i);
}
