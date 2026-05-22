export function forceExhaustivenessCheck(_value: never): never {
  throw Error(`ERROR! Reached forbidden guard function with unexpected value: ${_value}`);
}
