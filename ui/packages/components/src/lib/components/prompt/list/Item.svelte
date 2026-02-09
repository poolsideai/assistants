<script lang="ts" module>
  /**
   * Represents text that can be displayed with optional highlighting.
   */
  export type Highlightable = string | { value: string; score: number; indices: readonly number[] };

  export interface ItemProps {
    value?: string;
    keywords?: string[];
    title: Highlightable;
    subtitle?: Highlightable;
    icon?: IconProps | IconName | "loading" | IconProps;
    disabled?: boolean;
    alwaysRender?: boolean;
    tooltip?: string;
    "data-testid"?: string;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes, MouseEventHandler } from "svelte/elements";
  import Icon, { type IconName, type IconProps } from "../../icon/index.js";
  import { createItem } from "../context/item.js";
  import { getItems, getMenus } from "../context/prompt.js";
  import { type Snippet } from "svelte";
  import type { Except } from "type-fest";
  import { Spinner } from "../../spinner/index.js";
  import { findMatchIndices, highlightSegments } from "../utils/highlightMatch.js";
  import HighlightedText from "./HighlightedText.svelte";

  interface Props
    extends Except<ItemProps, "icon" | "subtitle">,
      Pick<HTMLAttributes<HTMLDivElement>, "class"> {
    icon?: ItemProps["icon"] | Snippet;
    subtitle?: ItemProps["subtitle"] | Snippet<[{ highlight: Snippet<[Highlightable]> }]>;
    children?: Snippet;
    accessories?: Snippet;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  let {
    title,
    subtitle,
    value,
    icon,
    disabled,
    keywords,
    alwaysRender,
    tooltip,
    children,
    accessories,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    ...rest
  }: Props = $props();

  const item = {
    value,
    title,
    subtitle: typeof subtitle === "function" ? undefined : subtitle,
    icon: typeof icon === "function" ? undefined : icon,
    disabled,
    keywords,
    alwaysRender,
  } satisfies Props;

  const {
    id,
    action,
    isSelected,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  } = createItem(item);

  const { filtered, select, updateDisabled } = getItems();
  const { search, menu } = getMenus();

  $effect(() => {
    updateDisabled(id, disabled);
  });

  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    if (disabled) return;
    select(id);
    $action?.onAction?.(e);
  };

  function segmentsFor(input: Highlightable) {
    if (typeof input === "string") {
      return highlightSegments(input, findMatchIndices(input, $search ?? ""));
    }

    return highlightSegments(input.value, input.indices);
  }

  function processHighlightable(input: Highlightable | undefined, shouldHighlight: boolean = true) {
    if (!input) return undefined;
    if (shouldHighlight) return segmentsFor(input);
    return highlightSegments(typeof input === "string" ? input : input.value, []);
  }

  let shouldRender = $derived($filtered?.items.has(id) ?? true);

  // While filtering, the list flattens its sections and ranks items purely by
  // match strength via flex `order` (see List/Section). Better matches get a
  // lower order value so they rise to the top.
  let filterOrder = $derived.by(() => {
    const score = $filtered?.items.get(id)?.score;
    if (score === undefined) return undefined;
    return -Math.round(score * 1000);
  });

  let shouldHighlight = $derived($menu?.highlightMatch && !!$search);

  let resolvedTitle = $derived($filtered?.items.get(id)?.title ?? title);
  let resolvedSubtitle = $derived(
    $filtered?.items.get(id)?.subtitle ?? (typeof subtitle === "function" ? undefined : subtitle),
  );
  let titleHighlight = $derived(processHighlightable(resolvedTitle, shouldHighlight));
  let subtitleHighlight = $derived(processHighlightable(resolvedSubtitle, shouldHighlight));
</script>

{#snippet highlight(input: Highlightable)}
  <HighlightedText segments={segmentsFor(input)} />
{/snippet}

{#if shouldRender}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    bind:this={$rootEl}
    {id}
    data-prompt-item
    title={tooltip}
    aria-disabled={disabled ? true : undefined}
    aria-selected={$isSelected ? true : undefined}
    data-disabled={disabled ? true : undefined}
    data-selected={$isSelected ? true : undefined}
    data-value={value}
    role="option"
    tabindex={-1}
    style:order={filterOrder}
    onclick={handleClick}
    {...rest}
  >
    {@render children?.()}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if typeof icon === "function"}
      {@render icon()}
    {:else if icon === "loading"}
      <Spinner />
    {:else if typeof icon === "string"}
      <Icon name={icon} />
    {:else if icon}
      <Icon {...icon} />
    {/if}

    <div class={["flex min-w-0 grow items-baseline gap-1"]}>
      <span class="title-highlight min-w-0 shrink-0 truncate">
        {#if titleHighlight}<HighlightedText segments={titleHighlight} />{/if}
      </span>

      <div
        class={[
          "title-highlight min-w-0 text-[12px] opacity-75",
          typeof subtitle !== "function" && "truncate",
          $action?.intent === "warning" && "text-psx-warning-badge",
        ]}
        bind:this={$subtitleEl}
      >
        {#if typeof subtitle === "function"}
          {@render subtitle({ highlight })}
        {:else if subtitleHighlight}
          <HighlightedText segments={subtitleHighlight} />
        {/if}
      </div>
    </div>

    <div
      data-prompt-item-accessories
__POOL_SYNTHETIC_IMPORT_BASELINE__
      data-size="xs"
      bind:this={$accessoriesEl}
    >
      {@render accessories?.()}
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "#tailwind.css";
  [data-prompt-item] {
    content-visibility: auto;
    contain-intrinsic-size: auto 28px;
    @apply flex cursor-pointer items-center text-psx-foreground-primary outline-hidden hover:bg-psx-menu-hover-background active:bg-psx-menu-active-background data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:bg-psx-menu-active-background data-selected:text-psx-menu-active-foreground;

    :global(body:not(.web-app)) & {
      @apply gap-1.5 rounded-md py-0.5 pl-1.5;

      &:not([data-selected]) :global([data-state="matched"]) {
        @apply text-psx-menu-highlight;
      }

      &[data-selected] :global([data-state="matched"]) {
        @apply text-psx-menu-active-highlight;
      }
    }

    :global(body.web-app) & {
      @apply gap-2 rounded-[10px] px-2 py-1.5;

      & :global([data-state="matched"]) {
        background: var(--color-pri-900);
        @apply bg-clip-text text-transparent;
      }
    }
  }

  :global(body.web-app) [data-prompt-item] {
    @apply hover:bg-(--color-alpha-050) active:bg-(--color-alpha-050) data-selected:bg-(--color-alpha-050);
  }

  :global(body.web-app) .title-highlight {
    @apply text-(--color-mono-900);
  }

  :global(body.web-app .title-highlight [data-state="matched"]) {
    @apply text-(--color-pri-900);
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</style>
