import type { Snippet } from "svelte";
import type { ClassValue, SvelteHTMLElements } from "svelte/elements";
import type { EmptyObject, OmitIndexSignature } from "type-fest";

export type Elements = OmitIndexSignature<SvelteHTMLElements>;

type Props = object & {
  class?: ClassValue | null;
  style?: string;
};

export type ChildSnippet<ChildProps extends object = EmptyObject> = ChildProps extends EmptyObject
  ? Snippet<[{ props: Props }]>
  : Snippet<[ChildProps & { props: Props }]>;

export type WithChild<
  T extends keyof Elements | object = EmptyObject,
  ChildProps extends object = EmptyObject,
> = Omit<T extends keyof Elements ? Elements[T] : T, "child"> & {
  child?: ChildSnippet<ChildProps>;
};
