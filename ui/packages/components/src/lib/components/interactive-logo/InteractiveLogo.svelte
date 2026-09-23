<script lang="ts">
  import { onMount } from "svelte";
  import type { LogoColorOverrides, LogoLayoutOptions, LogoSceneControls } from "./Logo3D.js";

  interface Props {
    /** Multiplies the model's base render size (default 1). */
    modelScale?: number;
    /** Center the model vertically in the canvas instead of anchoring it near the bottom. */
    centerModel?: boolean;
  }

  let { modelScale = 1, centerModel = false }: Props = $props();

  let container: HTMLDivElement;
  let sceneControls: LogoSceneControls | null = null;
  let themeObserver: MutationObserver | null = null;
  let disposed = false;

  // Convert CSS color string to hex number for Three.js
  function cssColorToHex(cssColor: string): number {
    // Handle rgb(r, g, b) or rgba(r, g, b, a)
    const rgbMatch = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      return (r << 16) | (g << 8) | b;
    }

    // Handle #hex (3, 4, 6, or 8 digits)
    const hexMatch = cssColor.match(/^#([0-9a-f]{3,8})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      return parseInt(hex.slice(0, 6), 16);
    }

    return 0xffffff; // fallback
  }

  // Read current theme colors from CSS variables
  function getThemeColors(): LogoColorOverrides {
    const styles = getComputedStyle(container);
    const outlineColor = styles.getPropertyValue("--psx-brand").trim();
    const backgroundColor = styles.getPropertyValue("--psx-editor-background").trim();

    const overrides: LogoColorOverrides = {};
    if (outlineColor) {
      overrides.outlineColor = cssColorToHex(outlineColor);
    }
    if (backgroundColor) {
      overrides.backgroundColor = cssColorToHex(backgroundColor);
    }
    return overrides;
  }

  onMount(() => {
    disposed = false;

    void import("./Logo3D.js")
      .then(({ initLogoScene }) => {
        if (disposed || !container) return;

        // Initialize scene with current theme colors. WebGL is unavailable in some
        // environments (e.g. remote-browser sessions with no GPU context), where
        // initLogoScene throws "Error creating WebGL context.". The logo is purely
        // decorative, so swallow the failure and render nothing rather than letting
        // the throw tear down the surrounding empty state (which holds the chat input).
        try {
          const colorOverrides = getThemeColors();
          const layout: LogoLayoutOptions = { scale: modelScale, anchorCenter: centerModel };
          sceneControls = initLogoScene(container, colorOverrides, layout);
        } catch (error) {
          console.warn("Could not initialize interactive logo scene:", error);
          return;
        }

        // Watch for theme changes (VS Code changes body class)
        themeObserver = new MutationObserver(() => {
          if (sceneControls) {
            const newColors = getThemeColors();
            sceneControls.updateColors(newColors);
          }
        });

        themeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
        });
      })
      .catch((error) => {
        if (!disposed) console.warn("Could not load interactive logo renderer:", error);
      });

    return () => {
      disposed = true;
      themeObserver?.disconnect();
      themeObserver = null;
      sceneControls?.dispose();
      sceneControls = null;
    };
  });
</script>

<div bind:this={container} class="absolute inset-0 left-1.5 flex items-center justify-center"></div>
