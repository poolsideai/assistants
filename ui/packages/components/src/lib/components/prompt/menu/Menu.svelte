<script lang="ts" module>
  import type { FilterOptions } from "../utils/filter.js";

  export type MenuRule = {
    /**
     * A value that is inserted into the input when the menu is opened manually
     * (e.g., via `Menu.Trigger`). This ensures the `pattern` can match even when the menu
     * is opened programmatically.
     *
     * This value typically corresponds to the trigger character in `triggerPattern`.
     */
    trigger?: string;

    /**
     * Determines when the trigger is inserted into the input.
     *
     * - 'always': The trigger is always inserted when the menu is opened manually
     * - 'when-focused': The trigger is only inserted when the input is focused
     *
     * @default 'always'
     */
    behavior?: "always" | "when-focused";

    triggerRegExp: RegExp;

    /**
     * A regular expression pattern for the query part after the trigger.
     * @default /^.*$/
     */
    queryRegExp?: RegExp;

    attrs?: {
      nodeName?: string;
      class?: string;
    };
  };

  export type MenuProps = {
    /**
     * A unique value for the menu.
     */
    value?: string;

    rules?: MenuRule[];

    /**
     * Determines whether menu items should be filtered based on the search term.
     *
     * @default true
     */
    shouldFilter?: boolean;

    filterOptions?: FilterOptions;

    /**
     * Determines whether matching characters should be highlighted.
     *
     * @default false
     */
    highlightMatch?: boolean;

    /**
     * When true, arrow navigation will wrap around from the last item to the first item and vice versa.
     *
     * @default false
     */
    loop?: boolean;
  };
</script>

<script lang="ts">
  import { getMenus } from "../context/prompt.js";
  import { createMenu } from "../context/menu.js";
  import type { Snippet } from "svelte";

  interface Props extends MenuProps {
    shouldFilter?: boolean;
    highlightMatch?: boolean;
    loop?: boolean;
    children?: Snippet;
  }

  let {
    value,
    rules,
    shouldFilter = true,
    filterOptions,
    highlightMatch = true,
    loop = true,
    children,
  }: Props = $props();

  const { id } = createMenu({
    value,
    rules: rules?.map((rule) => ({
      behavior: "when-focused",
      ...rule,
    })),
    shouldFilter,
    filterOptions,
    highlightMatch,
    loop,
  });

  const { menu } = getMenus();

  let shouldRender = $derived(id === $menu?.id);
</script>

{#if shouldRender}
  {@render children?.()}
{/if}
