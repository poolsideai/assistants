import { pointerHeadedToRect, type Point } from "../../shared/safeTriangle";

export interface ConversationPreviewAnchorTarget {
  key: string;
  anchor: HTMLElement;
}

interface ConversationPreviewCoordinatorOptions<T extends ConversationPreviewAnchorTarget> {
  onTargetChange: (target: T | null) => void;
  openDelayMs?: number;
  retargetDelayMs?: number;
  safeRetargetDelayMs?: number;
  closeDelayMs?: number;
  safeTrianglePad?: number;
}

/**
 * Owns the hover-preview timers for a whole sidebar.
 *
 * Rows deliberately do not read this state for their visual hover treatment:
 * the preview may use grace periods while the row beneath the pointer must
 * still react immediately.
 */
export class ConversationPreviewCoordinator<T extends ConversationPreviewAnchorTarget> {
  private readonly openDelayMs: number;
  private readonly retargetDelayMs: number;
  private readonly safeRetargetDelayMs: number;
  private readonly closeDelayMs: number;
  private readonly safeTrianglePad: number;

  private target: T | null = null;
  private pendingTarget: T | null = null;
  private hoveredKey: string | null = null;
  private popoverHovered = false;
  private popoverElement: HTMLElement | null = null;
  private lastPointer: Point | null = null;
  private targetTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly options: ConversationPreviewCoordinatorOptions<T>) {
    this.openDelayMs = options.openDelayMs ?? 400;
    this.retargetDelayMs = options.retargetDelayMs ?? 120;
    this.safeRetargetDelayMs = options.safeRetargetDelayMs ?? 300;
    this.closeDelayMs = options.closeDelayMs ?? 300;
    this.safeTrianglePad = options.safeTrianglePad ?? 16;
  }

  rowEntered(nextTarget: T, point: Point): void {
    this.hoveredKey = nextTarget.key;
    this.clearCloseTimer();
    this.clearTargetTimer();

    if (this.target?.key === nextTarget.key) {
      this.commit(nextTarget);
      return;
    }

    const delay = this.target
      ? this.pointerHeadedToPopover(point)
        ? this.safeRetargetDelayMs
        : this.retargetDelayMs
      : this.openDelayMs;

    this.pendingTarget = nextTarget;
    this.targetTimer = setTimeout(() => {
      this.targetTimer = undefined;
      if (this.hoveredKey !== nextTarget.key) return;
      this.pendingTarget = null;
      this.commit(nextTarget);
    }, delay);
  }

  rowLeft(key: string): void {
    if (this.hoveredKey === key) this.hoveredKey = null;
    if (this.pendingTarget?.key === key) this.clearTargetTimer();
    if (this.target && !this.popoverHovered) this.scheduleClose();
  }

  rowPointerDown(key: string): void {
    if (this.pendingTarget?.key === key) this.clearTargetTimer();
  }

  rowUnmounted(key: string, anchor: HTMLElement): void {
    if (this.hoveredKey === key) this.hoveredKey = null;
    if (this.pendingTarget?.key === key && this.pendingTarget.anchor === anchor) {
      this.clearTargetTimer();
    }
    if (this.target?.key === key && this.target.anchor === anchor) this.closeNow();
  }

  refreshTarget(nextTarget: T): void {
    if (this.pendingTarget?.key === nextTarget.key) this.pendingTarget = nextTarget;
    if (this.target?.key === nextTarget.key) this.commit(nextTarget);
  }

  popoverEntered(): void {
    this.popoverHovered = true;
    this.clearCloseTimer();
  }

  popoverLeft(): void {
    this.popoverHovered = false;
    this.scheduleClose();
  }

  pointerMoved(point: Point): void {
    if (this.target) this.lastPointer = point;
  }

  setPopoverElement(element: HTMLElement | null): void {
    this.popoverElement = element;
  }

  closeNow(): void {
    this.clearTargetTimer();
    this.clearCloseTimer();
    this.hoveredKey = null;
    this.popoverHovered = false;
    this.lastPointer = null;
    this.commit(null);
  }

  destroy(): void {
    this.closeNow();
    this.popoverElement = null;
  }

  private pointerHeadedToPopover(point: Point): boolean {
    if (!this.popoverElement || !this.lastPointer) return false;
    return pointerHeadedToRect(
      point,
      this.lastPointer,
      this.popoverElement.getBoundingClientRect(),
      this.safeTrianglePad,
    );
  }

  private scheduleClose(): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => {
      this.closeTimer = undefined;
      if (this.hoveredKey || this.popoverHovered) return;
      this.commit(null);
    }, this.closeDelayMs);
  }

  private commit(target: T | null): void {
    this.target = target;
    this.options.onTargetChange(target);
  }

  private clearTargetTimer(): void {
    if (this.targetTimer !== undefined) clearTimeout(this.targetTimer);
    this.targetTimer = undefined;
    this.pendingTarget = null;
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== undefined) clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
  }
}
