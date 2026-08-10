<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { melt, createDropdownMenu } from "@melt-ui/svelte";
  import Icon, { type IconName } from "../../icon/index.js";
  import { Badge } from "../../badge/index.js";
  import { fuzzyScore } from "./fuzzy.js";

  interface Props {
    icon?: IconName;
    iconClass?: string;
    label: string;
    /** Secondary line under the label (e.g. what a config value does). */
    description?: string | null;
    tag?: string;
    selected?: boolean;
    disabled?: boolean;
    onclick?: () => void;
    accessories?: Snippet;
  }

  let {
    icon,
    iconClass,
    label,
    description,
    tag,
    selected = false,
    disabled = false,
    onclick,
    accessories,
  }: Props = $props();

  const {
    elements: { item },
  } = getContext<ReturnType<typeof createDropdownMenu>>("dropdown");

  const search = getContext<{ readonly query: string } | undefined>("dropdown-search");

  const visible = $derived(fuzzyScore(search?.query ?? "", label) !== null);
</script>

{#if visible}
  <button
    type="button"
    use:melt={$item}
    {disabled}
    {onclick}
    class={[
      // No text size: rows inherit the menu surface's 13px system font.
      "group flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-psx-foreground-primary outline-hidden hover:bg-psx-menu-hover-background disabled:cursor-not-allowed disabled:opacity-50 data-[highlighted]:bg-psx-menu-hover-background",
      // A described row anchors its icon and accessories to the label rather
      // than to the middle of the taller row.
      description ? "items-start" : "items-center",
    ]}
  >
    {#if icon}
      <!-- Sized to one line of the label (the menu's own line box) so the
           glyph centres on the first line, not on the whole two-line row. -->
      <span
        class={["flex shrink-0 items-center", description && "h-[var(--text-menu--line-height)]"]}
      >
        <Icon name={icon} size={16} class={iconClass} aria-hidden="true" />
      </span>
    {/if}
    {#if description}
      <!-- Wrapped to two lines at most so one verbose entry cannot dominate. -->
      <span class="flex min-w-0 flex-col">
        <span class="truncate">{label}</span>
        <span class="line-clamp-2 text-xs leading-snug text-psx-foreground-tertiary">
          {description}
        </span>
      </span>
    {:else}
      <span class="truncate">{label}</span>
    {/if}
    {#if tag}
      <span
        class="shrink-0 rounded-full bg-psx-chrome px-1.5 py-0.5 text-[10px] leading-none text-psx-foreground-secondary"
      >
        {tag}
      </span>
    {/if}
    <span
      class={[
        "ml-auto flex items-center gap-2",
        description && "h-[var(--text-menu--line-height)]",
      ]}
    >
      {#if accessories}
        <!-- Interactive accessories (e.g. the "use by default" star) act on
             their own: their events must not reach the row, where melt would
             treat them as selecting the item and close the menu. -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span
          class="contents"
          onclick={(event) => event.stopPropagation()}
          onpointerdown={(event) => event.stopPropagation()}
          onpointerup={(event) => event.stopPropagation()}
          onkeydown={(event) => {
            if (event.key === "Enter" || event.key === " ") event.stopPropagation();
          }}
        >
          {@render accessories()}
        </span>
      {/if}
      {#if selected}
        <Badge size="xs" class="uppercase">Selected</Badge>
      {/if}
    </span>
  </button>
{/if}
