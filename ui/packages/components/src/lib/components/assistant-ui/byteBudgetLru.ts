interface ByteBudgetEntry<Value> {
  bytes: number;
  value: Value;
}

/** A small LRU whose capacity is measured by retained bytes rather than item count. */
export class ByteBudgetLru<Value> {
  readonly #entries = new Map<string, ByteBudgetEntry<Value>>();
  #bytes = 0;

  constructor(readonly maxBytes: number) {}

  get size(): number {
    return this.#entries.size;
  }

  get bytes(): number {
    return this.#bytes;
  }

  get(key: string): Value | undefined {
    const entry = this.#entries.get(key);
    if (!entry) return undefined;

    this.#entries.delete(key);
    this.#entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: Value, bytes: number): void {
    this.delete(key);
    const normalizedBytes = Math.max(0, bytes);
    this.#entries.set(key, { value, bytes: normalizedBytes });
    this.#bytes += normalizedBytes;
    this.evictToBudget();
  }

  /** Update an entry after an async value's retained size becomes known. */
  resize(key: string, value: Value, bytes: number): void {
    const entry = this.#entries.get(key);
    if (!entry || entry.value !== value) return;

    this.#bytes -= entry.bytes;
    entry.bytes = Math.max(0, bytes);
    this.#bytes += entry.bytes;
    this.evictToBudget();
  }

  clear(): void {
    this.#entries.clear();
    this.#bytes = 0;
  }

  private delete(key: string): void {
    const entry = this.#entries.get(key);
    if (!entry) return;
    this.#entries.delete(key);
    this.#bytes -= entry.bytes;
  }

  private evictToBudget(): void {
    while (this.#bytes > this.maxBytes && this.#entries.size > 0) {
      const oldestKey = this.#entries.keys().next().value;
      if (oldestKey === undefined) return;
      this.delete(oldestKey);
    }
  }
}
