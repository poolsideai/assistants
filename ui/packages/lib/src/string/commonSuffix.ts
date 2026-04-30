/**
 * Common suffix shared by both strings.
 */
export function commonSuffix(a: string, b: string) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a.charCodeAt(a.length - 1 - i) === b.charCodeAt(b.length - 1 - i)) {
    i++;
  }
  return a.slice(a.length - i);
}
