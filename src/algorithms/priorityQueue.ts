/**
 * Deterministic Binary Min-Heap Priority Queue.
 *
 * Tie-breaking rules for absolute determinism:
 * 1. Primary: priority (numeric distance, lowest first)
 * 2. Secondary: id (alphabetical ascending string comparison)
 * 3. Tertiary: sequence number (FIFO insertion order)
 */

export interface HeapElement<T> {
  readonly item: T;
  readonly priority: number;
  readonly id: string;
  readonly seq: number;
}

export class PriorityQueue<T> {
  private readonly heap: HeapElement<T>[] = [];
  private sequenceCounter = 0;

  public push(item: T, priority: number, id: string): void {
    const element: HeapElement<T> = {
      item,
      priority,
      id,
      seq: this.sequenceCounter++,
    };
    this.heap.push(element);
    this.siftUp(this.heap.length - 1);
  }

  public pop(): HeapElement<T> | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.siftDown(0);
    }
    return top;
  }

  public peek(): HeapElement<T> | undefined {
    return this.heap[0];
  }

  public get size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public clear(): void {
    this.heap.length = 0;
    this.sequenceCounter = 0;
  }

  /**
   * Compares two elements. Returns negative if a < b (a has higher priority).
   */
  private compare(a: HeapElement<T>, b: HeapElement<T>): number {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    const idDiff = a.id.localeCompare(b.id);
    if (idDiff !== 0) {
      return idDiff;
    }
    return a.seq - b.seq;
  }

  private siftUp(index: number): void {
    let curr = index;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      const currElem = this.heap[curr]!;
      const parentElem = this.heap[parent]!;
      if (this.compare(currElem, parentElem) < 0) {
        this.heap[curr] = parentElem;
        this.heap[parent] = currElem;
        curr = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    let curr = index;
    const length = this.heap.length;

    while (true) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      let smallest = curr;

      if (
        left < length &&
        this.compare(this.heap[left]!, this.heap[smallest]!) < 0
      ) {
        smallest = left;
      }

      if (
        right < length &&
        this.compare(this.heap[right]!, this.heap[smallest]!) < 0
      ) {
        smallest = right;
      }

      if (smallest !== curr) {
        const temp = this.heap[curr]!;
        this.heap[curr] = this.heap[smallest]!;
        this.heap[smallest] = temp;
        curr = smallest;
      } else {
        break;
      }
    }
  }
}
