<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import Icon, { type IconName } from "../../icon/index.js";
  import { getActions, type Action } from "../context/prompt.js";
  import { generateId } from "@poolsideai/lib/string";
  import { getItem } from "../context/item.js";
  import { portal } from "../../../attachments/portal.js";
  import type { KebabCase } from "type-fest";
  import type { Actions } from "../index.js";
  import { slide } from "svelte/transition";

  export interface ActionBaseProps {
    title?: string;
    icon?: IconName;
    /**
     * @default "standard"
     */
    prominence?: "standard" | "increased";
    /**
     * @default "neutral"
     */
    intent?: "neutral" | "warning";
__POOL_SYNTHETIC_IMPORT_BASELINE__
    accessories?: Snippet;
  }

  export interface ActionProps extends ActionBaseProps {
    type: KebabCase<keyof typeof Actions>;
    onAction?: (event: KeyboardEvent | MouseEvent) => void;
  }

  interface Props extends ActionProps {
    children?: Snippet;
  }

  let {
    type,
    title,
    icon,
    prominence = "standard",
    intent = "neutral",
    onAction,
    children,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    accessories,
  }: Props = $props();

  const { register } = getActions();

  const {
    id: itemId,
    action,
    isSelected,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  } = getItem();

  const id = generateId<Action["id"]>();

  onMount(() => {
    const unregister = register(id, { type, title, icon, prominence, intent, onAction }, itemId);
    return unregister;
  });

  let shouldRender = $derived(id === $action?.id);
  let showActionAccessory = $derived(icon && (prominence === "increased" || $isSelected));
</script>

{#if shouldRender}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {#if $subtitleEl}
    <span {@attach portal($subtitleEl)}>
      {#if title}
        {title}
      {:else}
        {@render children?.()}
      {/if}
    </span>
  {/if}

  {#if $accessoriesEl}
    <div {@attach portal($accessoriesEl)}>
      {#if accessories}
        <div class="flex items-center gap-1 pr-1.5">
          {@render accessories()}
        </div>
      {:else if showActionAccessory}
        <div class="flex items-center pr-1.5" transition:slide={{ axis: "x", duration: 150 }}>
          <Icon name={icon} />
        </div>
      {/if}
    </div>
  {/if}
{/if}
