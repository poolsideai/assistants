export type ExtractUnionMember<
  T extends Record<string, unknown>,
  V extends T extends Record<Field, infer V> ? V : string,
  Field extends string = "type",
> = Extract<T, Record<Field, V>>;
