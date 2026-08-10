<script lang="ts" generics="T extends string">
  import type { HTMLAttributes } from "svelte/elements";

  /**
   * Pill-style segmented switch with a sliding thumb: one absolutely
   * positioned pill moved/resized to the checked option, so switching
   * animates instead of jump-cutting. Shared by the Diff tab's scope switch
   * and the files sidebar's All files / Changes switch.
   */
  interface Props extends HTMLAttributes<HTMLDivElement> {
    options: readonly { value: T; label: string }[];
    /** Currently selected option value (bindable). */
    value: T;
    ariaLabel: string;
    /**
     * Fixed option width in px (sized to the widest label) so the thumb
     * never resizes. Omit to size options to their labels, in which case
     * the thumb's width snaps between differently sized options.
     */
    optionWidth?: number;
    class?: string;
  }

  let {
    options,
    value = $bindable(),
    ariaLabel,
    optionWidth,
    class: className = "",
    ...rest
  }: Props = $props();

  // Scopes the radio group: two switches could be mounted (e.g. across
  // split layouts), and duplicate input names would link their groups.
  const uid = $props.id();

  let rootElement = $state<HTMLDivElement>();
  let thumbLeft = $state(0);
  let thumbWidth = $state(0);
  let thumbMeasured = $state(false);
  let thumbAnimated = $state(false);

  function measureThumb(root: HTMLElement) {
    const checked = root
      .querySelector<HTMLInputElement>(".segmented-switch-radio:checked")
      ?.closest<HTMLElement>(".segmented-switch-option");
    if (!checked) return;
    thumbLeft = checked.offsetLeft;
    thumbWidth = checked.offsetWidth;
    if (!thumbMeasured) {
      thumbMeasured = true;
      // Enable the transition only after the initial position has painted, so
      // the thumb doesn't slide in from 0 on mount.
      requestAnimationFrame(() => requestAnimationFrame(() => (thumbAnimated = true)));
    }
  }

  $effect(() => {
    void value;
    if (rootElement) measureThumb(rootElement);
  });

  $effect(() => {
    // Re-measure on container resize (font swaps, zoom) — offsets shift.
    const root = rootElement;
    if (!root) return;
    const observer = new ResizeObserver(() => measureThumb(root));
    observer.observe(root);
    return () => observer.disconnect();
  });
</script>

<div
  bind:this={rootElement}
  class="segmented-switch {className}"
  role="radiogroup"
  aria-label={ariaLabel}
  {...rest}
>
  <span
    class="segmented-switch-thumb"
    class:segmented-switch-thumb--measured={thumbMeasured}
    class:segmented-switch-thumb--animated={thumbAnimated}
    style="transform: translateX({thumbLeft}px); width: {thumbWidth}px"
    aria-hidden="true"
  ></span>
  {#each options as option (option.value)}
    <label
      class="segmented-switch-option"
      style:width={optionWidth === undefined ? undefined : `${optionWidth}px`}
    >
      <input
        class="segmented-switch-radio"
        type="radio"
        name="{uid}-segmented-switch"
        value={option.value}
        bind:group={value}
      />
      <span>{option.label}</span>
    </label>
  {/each}
</div>

<style>
  .segmented-switch {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 2px;
    border-radius: 9999px;
    background: var(--psx-panel);
    color: var(--psx-foreground-secondary);
    font-size: 12px;
  }

  .segmented-switch-thumb {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 0;
    visibility: hidden;
    border: 1px solid rgb(0 0 0 / 0.16);
    border-radius: 9999px;
    background: var(--psx-editor-background);
  }

  :global(:where(.psx-dark, .vscode-dark)) .segmented-switch-thumb {
    border-color: rgb(255 255 255 / 0.28);
  }

  .segmented-switch-thumb--measured {
    visibility: visible;
  }

  /* Only the position slides. Animating width as well makes the pill
     visibly stretch between differently sized labels, so width snaps. */
  .segmented-switch-thumb--animated {
    transition: transform 0.18s ease;
  }

  .segmented-switch:has(:focus-visible) {
    outline: 2px solid var(--psx-focus);
    outline-offset: 2px;
  }

  .segmented-switch-option {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Overridable per instance via the custom property (e.g. the files
       sidebar's slightly taller switch). */
    min-height: var(--segmented-switch-option-min-height, 22px);
    padding: 0 10px;
    border-radius: 9999px;
    cursor: pointer;
    user-select: none;
    transition: color 0.15s ease-in-out;
  }

  .segmented-switch-option:hover {
    color: var(--psx-foreground-primary);
  }

  .segmented-switch-option:has(:checked) {
    color: var(--psx-foreground-primary);
  }

  .segmented-switch-radio {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .segmented-switch-thumb--animated {
      transition: none;
    }
  }
</style>
