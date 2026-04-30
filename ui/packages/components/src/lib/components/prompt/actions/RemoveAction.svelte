<script lang="ts">
  import type { Snippet } from "svelte";
  import { getPrompt, getChips, getMenus } from "../context/prompt.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { Node } from "prosemirror-model";
  import type { ChipProps } from "./InsertAction.svelte";

  export interface RemoveChipProps extends ActionBaseProps {
    type: "chip";
    value: ChipProps["content"]["value"];
    onRemoveFallback?: (value: ChipProps["content"]["value"]) => void;
  }

  interface Props extends RemoveChipProps {
    children?: Snippet;
  }

  let { children, icon = "trash", onRemoveFallback, ...rest }: Props = $props();

  const { editor } = getPrompt();
  const { close } = getMenus();
  const { getByValue } = getChips();

  function handleRemoveChip({ value }: RemoveChipProps) {
    if (!$editor) return;

    $editor.executeCommand((state, dispatch, view) => {
      const { tr } = state;

      const nodes: { node: Node; pos: number }[] = [];
      tr.doc.descendants((node, pos) => {
        if (node.attrs.value === value) {
          nodes.push({ node, pos });
        }
      });

      if (nodes.length) {
        for (let i = nodes.length - 1; i >= 0; i--) {
          const { node, pos } = nodes[i];
          tr.delete(pos, pos + node.nodeSize);
        }

        dispatch?.(tr);
      } else {
        const chip = getByValue(value);
        if (chip) {
          chip.onRemove?.(value);
        } else {
          onRemoveFallback?.(value);
        }
      }

      if (!view?.hasFocus()) {
        close();
      }

      return true;
    });
  }

  function handleAction() {
    switch (rest.type) {
      case "chip":
        handleRemoveChip(rest);
        break;
    }
  }
</script>

<BaseAction {...rest} type="remove" {icon} onAction={handleAction}>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {@render children?.()}
</BaseAction>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
