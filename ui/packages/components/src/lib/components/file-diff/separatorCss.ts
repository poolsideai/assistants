/**
 * Restyles pierre's collapsed-context separators inside its shadow root: the
 * full-width "n unmodified lines" bars become quiet gutter-only expand
 * buttons with dashed edges. A leading separator that offers no expansion
 * (patch-only parses can't expand) is hidden so the first visible diff line
 * sits directly below the file header; when full contents make it expandable
 * it stays, as the only way to reveal the lines above the first hunk.
 * Injected via the `unsafeCSS` option, which lands in the `unsafe` cascade
 * layer and so wins over pierre's own rules.
 *
 * Anything here that changes rendered heights must be mirrored in the
 * `itemMetrics`/virtual metrics passed alongside it (the 22px separator
 * height below ↔ `hunkSeparatorHeight: 22`), or pierre's size estimation
 * drifts and scrolling jumps. Verify with pierre's
 * `__devOnlyValidateItemHeights` option after changing either side.
 */
export const SEPARATOR_CSS = `
  [data-separator-first]:not([data-expand-index]) {
    display: none;
  }
  [data-separator="line-info"],
  [data-separator="line-info-basic"] {
    height: 22px;
    margin-block: 0;
    background-color: var(--diffs-bg);
  }
  [data-separator="line-info"] [data-separator-wrapper] {
    padding-inline: 0;
    width: auto;
    background-color: var(--diffs-bg);
  }
  [data-separator-content] {
    display: none;
  }
  [data-expand-index] [data-separator-wrapper] {
    display: flex;
  }
  [data-content] [data-separator-wrapper] {
    display: none;
  }
  [data-expand-button] {
    box-sizing: border-box;
    min-width: 0;
    width: 44px;
    border: none;
    border-radius: 0;
    background-color: var(--diffs-bg-separator);
    color: var(--diffs-fg-number);
  }
  [data-expand-button] [data-icon] {
    opacity: 0.6;
    transition: opacity 0.1s ease;
  }
  [data-expand-button]:hover [data-icon] {
    opacity: 1;
  }
`;

/** Height of the restyled separator bars above, for pierre's estimators. */
export const SEPARATOR_HEIGHT = 22;

/**
 * Fixed height of the restyled custom header row below. Must equal
 * `itemMetrics.diffHeaderHeight` wherever HEADER_CSS is used.
 */
export const HEADER_HEIGHT = 38;

/**
 * Card-style file header for the review surface, applied to pierre's custom
 * header row inside the shadow root. Every rule is height-exact or paint-only
 * so pierre's estimation stays correct:
 *
 * - The row height is pinned to `HEADER_HEIGHT` and mirrored via
 *   `itemMetrics.diffHeaderHeight`.
 * - The bottom divider is a box-shadow painted *outside* the row (over the
 *   first code line, exactly where a border would sit). Once the content
 *   has fully scrolled under the header, the shadow falls outside the host
 *   and is clipped — so it can never double up with the card's bottom ring.
 * - The card's visible top line is the *inset* shadow on this row, not the
 *   host ring: the surface's inset mask always covers the outer ring's top
 *   line (it sits in the masked zone), so the header draws the top edge —
 *   at rest and, crucially, also while sticky-pinned mid-file, where the
 *   host's own top edge is far off-screen.
 * - The sticky pin offset is a CSS variable (inherited across the shadow
 *   boundary) so the surface can pin headers at its document inset instead
 *   of the viewport edge; overriding pierre's `top: 0` is pure paint.
 */
export const HEADER_CSS = `
  [data-diffs-header][data-sticky] {
    top: var(--psx-diff-sticky-inset, 0px);
  }
  [data-diffs-header="custom"] {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: ${HEADER_HEIGHT}px;
    padding-inline: 12px;
    background-color: var(--diffs-bg);
    border-radius: 8px 8px 0 0;
    /* Above the card ring overlay (z 1, CARD_CSS): the header's rounded
       corners and backdrop must cover the ring's straight side lines while
       pinned, or 1px border bits poke through the corner notches. The
       header carries its own frame (::before) so the card edges it covers
       stay drawn. */
    z-index: 2;
    box-shadow: 0 1px 0 var(--psx-diff-card-border);
  }
  /* Containing block for the pseudo-elements. MUST stay scoped to
     :not([data-sticky]): unsafeCSS outranks pierre's core rules, so an
     unconditional position here would override the sticky positioning and
     kill pinned headers entirely. Sticky headers are already a containing
     block by virtue of position: sticky. */
  [data-diffs-header="custom"]:not([data-sticky]) {
    position: relative;
  }
  /* Full-height rounded frame owned by the header: top arc plus side
     segments for the header's own rows, replacing the ring lines its
     opaque background covers. At rest it coincides pixel-for-pixel with
     the card ring, so nothing doubles. */
  [data-diffs-header="custom"]::before {
    content: "";
    position: absolute;
    inset: 0;
    border: 1px solid var(--psx-diff-card-border);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    pointer-events: none;
  }
  /* Page-background backdrop behind the header, extended upward by the
     sticky inset. While pinned it hides code scrolling through the corner
     notches AND through the inset band above the header — doing the
     masking per-header lets the header itself slide out visibly through
     the inset zone when its card scrolls away, instead of vanishing under
     a surface-level mask. At rest the extension falls outside the host,
     where overflow: clip swallows it. */
  [data-diffs-header="custom"]::after {
    content: "";
    position: absolute;
    inset: calc(-1 * var(--psx-diff-sticky-inset, 0px)) 0 0 0;
    z-index: -1;
    background: var(--diffs-bg);
    pointer-events: none;
  }
  [data-diffs-header="custom"] slot {
    display: flex;
    flex: 1;
    min-width: 0;
    align-items: center;
  }
  /* Stretch the slotted (light-DOM) header wrapper to the full row width so
     its right-aligned content (margin-left: auto) actually lands at the
     right edge. */
  [data-diffs-header="custom"] slot::slotted(*) {
    flex: 1;
    min-width: 0;
  }
  /* A collapsed file renders only its header; the card's outer ring is then
     the sole bottom divider, so drop the header's own — but keep the inset
     top line, which is the card's visible top edge. */
  [data-diffs-header="custom"]:not(:has(~ [data-diff], ~ [data-file])) {
    box-shadow: inset 0 1px 0 var(--psx-diff-card-border);
  }
`;

/**
 * Card chrome for each file in the review surface: rounded corners, a 1px
 * ring, and corner clipping — the treatment the pre-CodeView diff document
 * drew with per-file wrappers. All of it is layout-neutral by construction,
 * so pierre's height estimation stays exact:
 *
 * - \`:host\` targets pierre's own per-item \`diffs-container\` element (the
 *   unsafeCSS style node lives in its shadow root), so no wrapper element
 *   is added around items.
 * - The ring is a box-shadow, not a border — zero effect on measured
 *   heights.
 * - \`overflow: clip\` rounds the content against the host's radius without
 *   creating a scroll container, so pierre's sticky headers (position:
 *   sticky against the outer scroll viewport) keep working.
 */
export const CARD_CSS = `
  :host {
    /* Resolved here once for the ring and the header divider. Derived by
       mixing the theme foreground into the card background instead of
       using --psx-border: the desktop dark theme resolves that token to
       the editor background color itself (see the .highlightedCode note in
       desktop-assistant/app.css), which would make the ring invisible —
       the mix guarantees contrast against the surface in any theme. The
       ratio lands on GitHub's palette in both schemes (≈#dfe2e4 on light,
       ≈#31363c on dark). The base is pierre's derived card fill, so the
       ring tracks whatever the surface set as --diffs-background. */
    --psx-diff-card-border: color-mix(
      in srgb,
      var(--psx-foreground-primary, light-dark(#24292f, #c9d1d9)) 15%,
      var(--diffs-bg)
    );

    position: relative;
    background-color: var(--diffs-bg);
    border-radius: 8px;
    overflow: clip;
  }
  /* Inset ring on an overlay above the content: paints the border *inside*
     the host, following its rounded silhouette — like the old wrapper's
     border-box border. Being inside, it can't be covered by the surface's
     inset mask (card 1's top edge) and can't double against a neighboring
     card's header. It must be an ::after overlay, not a shadow on :host
     itself: an inset shadow paints *under* descendant backgrounds, and
     pierre's opaque full-width code <pre> was hiding the side and bottom
     lines. z-index 1 clears the code but stays under the (z-index 2)
     header, whose rounded corners must cover the ring's straight side
     lines while pinned — the header's own ::before frame re-draws the card
     edges it covers. */
  :host::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px var(--psx-diff-card-border);
    pointer-events: none;
  }
  /* Bottom frame above the header (z 3 > header's z 2): while a departing
     pinned header slides out at the host's bottom edge, its opaque
     background covers the ring's (z 1) bottom line — this frame re-draws
     the card's bottom edge on top, the same way the header's own ::before
     re-draws the top edge it covers. Height equals the radius, so its side
     segments exist only in the bottom curve; at rest it coincides
     pixel-for-pixel with the ring's bottom arc, so nothing doubles. */
  :host::before {
    content: "";
    position: absolute;
    inset: auto 0 0 0;
    height: 9px;
    z-index: 3;
    /* border-* widths compute to 0 on :host pseudo-elements here (pierre's
       core resets win for them), so the frame is an inset shadow instead;
       the clip-path removes the shadow's unwanted top line, leaving only
       the sides and bottom arc. */
    box-shadow: inset 0 0 0 1px var(--psx-diff-card-border);
    border-radius: 0 0 8px 8px;
    clip-path: inset(1px 0 0 0);
    pointer-events: none;
  }
`;
