/**
 * Gets a value from a map if the key exists, or sets a default value if it doesn't.
 */
export function getOrSet<K, V, D extends V>(map: Map<K, V>, key: K, defaultValue: D): D;
export function getOrSet<K, V, D extends V>(map: Map<K, V>, key: K, factory: (key: K) => D): D;
export function getOrSet<K, V>(map: Map<K, V>, key: K, defaultOrFactory: V | ((key: K) => V)): V {
  if (map.has(key)) return map.get(key)!;

  const value = defaultOrFactory instanceof Function ? defaultOrFactory(key) : defaultOrFactory;
  map.set(key, value);
  return value;
}
