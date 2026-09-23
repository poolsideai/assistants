<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { ComponentProps } from "svelte";
  import VirtualListDemo from "./VirtualListDemo.svelte";

  const { Story } = defineMeta({
    title: "Components/VirtualList",
    component: VirtualListDemo,
    args: {
      count: 1000,
      scroll: true,
      threshold: 60,
      overscanPx: 300,
      estimateHeight: 56,
      gap: 8,
      variableHeight: false,
      height: 420,
    },
    argTypes: {
      count: { control: { type: "range", min: 0, max: 5000, step: 50 } },
      threshold: { control: { type: "number" } },
      overscanPx: { control: { type: "range", min: 0, max: 1200, step: 50 } },
      estimateHeight: { control: { type: "number" } },
      gap: { control: { type: "range", min: 0, max: 32, step: 2 } },
      height: { control: { type: "number" } },
      variableHeight: { control: "boolean" },
      scroll: { control: "boolean" },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof VirtualListDemo>)}
  <div class="max-w-2xl p-4">
    <VirtualListDemo {...args} />
  </div>
{/snippet}

<!--
  1000 uniform-height rows, but only the rows near the viewport (plus overscan)
  are ever in the DOM — watch the "rows in the DOM" counter stay small while you
  scroll. Off-screen rows are stood in for by top/bottom spacer divs.
-->
<Story name="Windowed (long list)" args={{ count: 1000 }} />

<!--
  Same, with rows of differing heights. Each row is measured on mount and cached,
  so the scrollbar and scroll position stay correct as heights become known.
-->
<Story name="Variable heights" args={{ count: 1000, variableHeight: true }} />

<!--
  Below the threshold (or with no scroll element), windowing stays off and every
  row renders — the fallback path for short lists and non-scrolling consumers.
-->
<Story name="Flow (no windowing)" args={{ count: 20, scroll: false, height: 320 }} />

<!--
  Tweak count / threshold / overscan / gap / heights live via the controls.
-->
<Story name="Playground" args={{ count: 2000, variableHeight: true }} />
