// Safe-triangle hover grace. When a hover target opens a floating panel, the
// pointer's path to that panel is diagonal and crosses neighbouring hover
// targets; a bare mouseenter on those would instantly retarget or dismiss the
// panel. A pointer inside the triangle between its last position and the
// panel's facing edge (padded, so slightly overshooting the panel doesn't
// count as leaving the path) is treated as travelling to the panel.

export type Point = { x: number; y: number };

function halfPlane(p: Point, a: Point, b: Point): number {
  return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
}

export function pointInTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const d1 = halfPlane(p, a, b);
  const d2 = halfPlane(p, b, c);
  const d3 = halfPlane(p, c, a);
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNegative && hasPositive);
}

// Whether `point` sits inside the safe triangle from `from` to the facing
// edge of `rect`. The facing edge is chosen on the axis where `from` lies
// outside the rect, so panels beside and panels below their trigger both
// work. A `from` over the rect itself means the pointer is leaving the
// panel, not travelling to it.
export function pointerHeadedToRect(
  point: Point,
  from: Point,
  rect: DOMRect,
  pad: number,
): boolean {
  if (from.x < rect.left || from.x > rect.right) {
    const edgeX = from.x < rect.left ? rect.left : rect.right;
    return pointInTriangle(
      point,
      from,
      { x: edgeX, y: rect.top - pad },
      { x: edgeX, y: rect.bottom + pad },
    );
  }
  if (from.y < rect.top || from.y > rect.bottom) {
    const edgeY = from.y < rect.top ? rect.top : rect.bottom;
    return pointInTriangle(
      point,
      from,
      { x: rect.left - pad, y: edgeY },
      { x: rect.right + pad, y: edgeY },
    );
  }
  return false;
}
