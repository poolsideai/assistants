/**
 * Transforms any value into `""` (empty string) or `undefined` for use with HTML attributes where presence indicates truth.
 *
 * This is particularly useful for custom `data-*` attributes that drive conditional styling or JavaScript behavior.
 * It simplifies applying conditional states such as `data-[active]:opacity-100` instead of needing to target the attribute's value (`data[active='true']:opacity-100`).
 */
export function boolAttr(value: unknown) {
  return value ? "" : undefined;
}
