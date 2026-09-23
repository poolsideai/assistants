// Tuning the ACP transcript passes to the generic VirtualList component.

export const VIRTUALIZE_THRESHOLD = 60; // render everything at or below this many items

// Pixels rendered above and below the viewport. Kept deliberately generous: rows
// within the overscan are already mounted and measured, so scrolling back
// through a thread resolves height estimates off-screen instead of jumping the
// visible content, and expanded rows survive more scrolling before unmounting.
// The trade is DOM/memory — at the ~200px estimate this is roughly a dozen extra
// rows each side, still far below the unbounded render this component replaced.
export const OVERSCAN_PX = 2400;

// Distance from the bottom (px) that counts as "at the bottom". Shared by
// ScrollManager's auto-scroll detach and VirtualList's tail pin so the two can't
// disagree — in the gap between them the last row stays mounted-and-growing
// while the viewport is no longer chased to it.
export const AT_BOTTOM_THRESHOLD_PX = 150;

// Fixed assumed height for rows that have not been measured yet. It is
// deliberately a CONSTANT rather than a running average: measuring one row must
// never change the assumed height of the (potentially hundreds of) other
// unmeasured rows, or the top spacer — and therefore the total scroll height —
// would swing on every measurement and the viewport would jump while a long
// thread settles.
export const ESTIMATED_ROW_HEIGHT = 200;
