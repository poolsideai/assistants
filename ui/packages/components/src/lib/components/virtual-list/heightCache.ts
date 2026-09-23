/**
 * A cache of measured element heights keyed by a stable string id.
 *
 * Intentionally a plain measured-height store: unmeasured items are given a
 * FIXED estimate by the caller (see VirtualList), not a running average of the
 * measured ones — a moving estimate would shift the assumed height of every
 * unmeasured row on each measurement and make the scroll height swing.
 */
export class HeightCache {
  private readonly heights = new Map<string, number>();

  /**
   * Store a measured height for `id`. Returns `true` if the stored value
   * changed — a new id, or a change of at least 0.5px (the threshold suppresses
   * sub-pixel ResizeObserver noise) — so callers can skip needless recomputes.
   */
  set(id: string, height: number): boolean {
    const existing = this.heights.get(id);
    if (existing !== undefined && Math.abs(height - existing) < 0.5) {
      return false;
    }
    this.heights.set(id, height);
    return true;
  }

  get(id: string): number | undefined {
    return this.heights.get(id);
  }

  has(id: string): boolean {
    return this.heights.has(id);
  }

  delete(id: string): void {
    this.heights.delete(id);
  }

  clear(): void {
    this.heights.clear();
  }

  get size(): number {
    return this.heights.size;
  }
}
