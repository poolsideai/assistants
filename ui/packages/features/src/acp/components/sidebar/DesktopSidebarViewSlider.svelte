<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    view: "main" | "settings";
    main?: Snippet;
    settings?: Snippet;
  }

  let { view, main, settings }: Props = $props();
</script>

<div class="desktop-sidebar-view-slider">
  <!-- Keep the transform inline on the track. WKWebView can skip transitions
       when an attribute change only makes a stylesheet selector re-match. -->
  <div
    class="desktop-sidebar-view-track"
    data-view={view}
    style:transform={view === "settings" ? "translateX(-100%)" : "translateX(0)"}
  >
    <div
      class="desktop-sidebar-view"
      aria-hidden={view === "main" ? undefined : "true"}
      inert={view !== "main"}
    >
      {@render main?.()}
    </div>
    <div
      class="desktop-sidebar-view"
      aria-hidden={view === "settings" ? undefined : "true"}
      inert={view !== "settings"}
    >
      {@render settings?.()}
    </div>
  </div>
</div>

<style lang="postcss">
  .desktop-sidebar-view-slider {
    /* 4px wider than the sidebar, with the width returned as padding: the
       conversation list scroller extends 4px into the sidebar→panel gap so
       the OS scrollbar paints beside the rows, and this overflow clip would
       otherwise shave the thumb at the sidebar edge. overflow: hidden clips
       at the padding box, so the clip edge moves out with the padding while
       the content box — where the track and views lay out — keeps the plain
       sidebar width, leaving the slide animation untouched. */
    width: calc(100% + 4px);
    height: 100%;
    min-width: 0;
    min-height: 0;
    padding-right: 4px;
    overflow: hidden;
  }

  .desktop-sidebar-view-track {
    display: flex;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    transition: transform 170ms cubic-bezier(0.2, 0, 0, 1);
    will-change: transform;
  }

  .desktop-sidebar-view {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    flex: 0 0 100%;
    flex-direction: column;
  }
</style>
