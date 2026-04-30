import type { NodeSpec } from "prosemirror-model";
import type { NodeAttrs } from "../../../editor/index.js";

export const chipNode = {
  group: "inline",
  inline: true,
  selectable: true,
  atom: true,
  attrs: {
    id: { default: undefined },
    label: {},
    value: {},
    icon: { default: undefined },
    fileIconPath: { default: undefined },
    clipboard: {},
    tooltip: { default: undefined },
  },
  leafText: (node) => node.attrs.clipboard,
  toDOM: (node) => {
    return [
      "span",
      {
        class: "chip-node",
        id: node.attrs.id,
        "data-label": node.attrs.label,
        "data-value": node.attrs.value,
        "data-icon": node.attrs.icon,
        "data-file-icon-path": node.attrs.fileIconPath,
        "data-clipboard": node.attrs.clipboard,
        "data-tooltip": node.attrs.tooltip,
      },
      ["span", { class: "hidden" }, node.attrs.clipboard],
    ];
  },
  parseDOM: [
    {
      tag: "span.chip-node",
      getAttrs(element) {
        return {
          id: element.getAttribute("id"),
          label: element.dataset["label"],
          value: element.dataset["value"],
          icon: element.dataset["icon"],
          fileIconPath: element.dataset["fileIconPath"],
          clipboard: element.dataset["clipboard"],
          tooltip: element.dataset["tooltip"],
        };
      },
    },
  ],
} satisfies NodeSpec;

export type ChipNodeAttrs = NodeAttrs<typeof chipNode>;
