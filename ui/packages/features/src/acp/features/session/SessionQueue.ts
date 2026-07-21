import { noop } from "./helpers";

export class ACPSessionQueue {
  operationQueue: Promise<void> = Promise.resolve();
  private configOptionQueues = new Map<string, Promise<void>>();
  private configRequestCounter = 0;

  constructor(private readonly currentGeneration: () => number) {}

  serialize<T>(fn: (gen: number) => Promise<T>): Promise<T> {
    const gen = this.currentGeneration();
    const next = this.operationQueue.then(
      () => fn(gen),
      () => fn(gen),
    );
    this.operationQueue = next.then(noop, noop);
    return next;
  }

  reset(): void {
    this.operationQueue = Promise.resolve();
    this.configOptionQueues.clear();
  }

  enqueueConfigOption<T>(configId: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.configOptionQueues.get(configId) ?? Promise.resolve();
    const next = previous.then(fn, fn);
    const tail = next.then(noop, noop);
    this.configOptionQueues.set(configId, tail);
    void tail.finally(() => {
      if (this.configOptionQueues.get(configId) === tail) {
        this.configOptionQueues.delete(configId);
      }
    });
    return next;
  }

  nextConfigRequestId(): number {
    return ++this.configRequestCounter;
  }
}
