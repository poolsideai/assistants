export const UNDO_COUNTDOWN_SECONDS = 3;

// A per-key "run in N seconds unless undone" countdown. The component owns
// the reactive remaining-seconds state and passes its setter as
// onRemainingChange (remaining === undefined clears the key); this class owns
// the timers. start() is a no-op while the key is already counting down.
export class UndoCountdown {
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();
  private remaining: Record<string, number> = {};

  constructor(
    private readonly onRemainingChange: (key: string, remaining?: number) => void,
    private readonly seconds = UNDO_COUNTDOWN_SECONDS,
  ) {}

  start(key: string, onExpire: () => void): void {
    if (this.timers.has(key)) return;
    this.setRemaining(key, this.seconds);
    const timer = setInterval(() => {
      const remaining = this.remaining[key];
      if (remaining === undefined) {
        this.cancel(key);
        return;
      }
      if (remaining <= 1) {
        this.cancel(key);
        onExpire();
        return;
      }
      this.setRemaining(key, remaining - 1);
    }, 1000);
    this.timers.set(key, timer);
  }

  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) clearInterval(timer);
    this.timers.delete(key);
    this.setRemaining(key);
  }

  destroy(): void {
    for (const [key, timer] of this.timers) {
      clearInterval(timer);
      this.setRemaining(key);
    }
    this.timers.clear();
  }

  private setRemaining(key: string, remaining?: number): void {
    if (remaining === undefined) delete this.remaining[key];
    else this.remaining[key] = remaining;
    this.onRemainingChange(key, remaining);
  }
}
