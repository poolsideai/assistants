/**
 * Selectable-option rows for the elicitation form (single and multi select).
 *
 * These follow the desktop sidebar's source-list selection rather than button
 * prominence: resting rows have no fill, hover takes the menu hover fill, and
 * the selected row takes the highlight pair. Selection is a state, not a call
 * to action — painting it as a primary button competed with the form's own
 * Submit and, being an accent fill, left no readable colour for the option's
 * description.
 *
 * The selected outline is a real border that every row carries — transparent
 * until selected — so selecting one cannot shift the layout of the rest. The
 * sidebar draws its equivalent with an inset box-shadow, which is not portable
 * here: on these rows the desktop WKWebView paints such a shadow only down the
 * right edge, leaving the other three sides bare (`ring-*` builds on the same
 * shadow and fails identically). A border paints on all four sides.
 */
// The border width lives here so every row reserves it; the colour lives in the
// state classes below. Both states must not set a border colour — they carry
// equal specificity, so whichever Tailwind emitted last would win rather than
// the one that applies.
export const optionRowClass = [
  "text-psx-foreground-primary flex w-full cursor-default select-none flex-col gap-0.5",
  "rounded-md border px-2.5 py-1.5 text-left transition-colors",
  "outline-hidden focus-visible:outline-psx-focus focus-visible:outline-2",
].join(" ");

export const optionSelectedClass = "bg-psx-highlight-background border-psx-highlight-border";

export const optionRestingClass = "border-transparent hover:bg-psx-menu-hover-background";
