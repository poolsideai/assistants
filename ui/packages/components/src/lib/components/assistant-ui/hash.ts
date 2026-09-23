/**
 * A simple but fast string hashing function that generates a stable hash
 * This is the djb2 algorithm
 */
export function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to 8-character hex string
  return (hash >>> 0).toString(16).padStart(8, "0");
}
