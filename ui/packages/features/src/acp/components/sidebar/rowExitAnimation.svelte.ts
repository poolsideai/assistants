import { ROW_EXIT_DURATION_MS, rowExitDurationMs } from "./rowExitTransition";

// Covers scheduling slop between marking a row as exiting and its outro
// finishing; a matched outroEnded normally releases well before this fires.
const WATCHDOG_SLACK_MS = 250;

// Shared by the sidebars and the row components. The sidebars gate their
// empty-state copy ("No chats", "No conversations") on `animating` so it does
// not render underneath a row that is still flying out.
//
// `hold()` is called when a row is marked exiting — synchronously, before the
// outro even exists — so the copy can never win a race against the animation
// starting. The release comes from the row's own outroend event rather than a
// parallel timer: a timer measured from the click fires while the outro,
// which starts a flush later and eases in slowly, still has the row clearly
// visible. The watchdog only backstops exits that never play an outro (a row
// hidden behind a "Show more" limit, an aborted transition).
class RowExitAnimationState {
  animating = $state(false);

  private outros = 0;
  private watchdog: ReturnType<typeof setTimeout> | undefined;

  hold(): void {
    // Reduced motion removes rows instantly; there is nothing to wait for.
    if (rowExitDurationMs(true) === 0) return;
    this.animating = true;
    this.armWatchdog();
  }

  outroStarted(): void {
    this.outros += 1;
    this.animating = true;
    this.armWatchdog();
  }

  outroEnded(): void {
    if (this.outros > 0) this.outros -= 1;
    if (this.outros === 0) this.release();
  }

  private release(): void {
    clearTimeout(this.watchdog);
    this.watchdog = undefined;
    this.animating = false;
  }

  private armWatchdog(): void {
    clearTimeout(this.watchdog);
    // Every exit outro lasts ROW_EXIT_DURATION_MS, so by the time this fires
    // anything still counted in `outros` has leaked, not merely slowed down.
    this.watchdog = setTimeout(() => {
      this.outros = 0;
      this.release();
    }, ROW_EXIT_DURATION_MS + WATCHDOG_SLACK_MS);
  }
}

export const rowExitAnimation = new RowExitAnimationState();
