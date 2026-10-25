import { describe, expect, it } from 'vitest';
import { PriorityQueue } from '../algorithms/priorityQueue';

describe('PriorityQueue (Binary Min-Heap)', () => {
  it('extracts elements in strictly ascending priority order', () => {
    const pq = new PriorityQueue<string>();
    pq.push('C', 5.5, 'c');
    pq.push('A', 1.2, 'a');
    pq.push('D', 8.9, 'd');
    pq.push('B', 3.4, 'b');

    expect(pq.size).toBe(4);
    expect(pq.isEmpty()).toBe(false);

    expect(pq.pop()?.item).toBe('A');
    expect(pq.pop()?.item).toBe('B');
    expect(pq.pop()?.item).toBe('C');
    expect(pq.pop()?.item).toBe('D');
    expect(pq.isEmpty()).toBe(true);
    expect(pq.pop()).toBeUndefined();
  });

  it('breaks ties deterministically using node id then insertion order', () => {
    const pq = new PriorityQueue<string>();
    // Same priority (4.0), different IDs
    pq.push('Zeta', 4.0, 'z_node');
    pq.push('Alpha', 4.0, 'a_node');
    pq.push('Beta', 4.0, 'b_node');

    // Should pop in alphabetical order of ID: 'a_node', 'b_node', 'z_node'
    expect(pq.pop()?.item).toBe('Alpha');
    expect(pq.pop()?.item).toBe('Beta');
    expect(pq.pop()?.item).toBe('Zeta');

    // Same priority AND same ID -> FIFO by sequence number
    pq.push('FirstCopy', 2.0, 'duplicate_id');
    pq.push('SecondCopy', 2.0, 'duplicate_id');
    expect(pq.pop()?.item).toBe('FirstCopy');
    expect(pq.pop()?.item).toBe('SecondCopy');
  });

  it('peek() views the top element without removing it', () => {
    const pq = new PriorityQueue<string>();
    pq.push('Low', 1.0, 'low');
    pq.push('High', 10.0, 'high');

    expect(pq.peek()?.item).toBe('Low');
    expect(pq.size).toBe(2);
    expect(pq.pop()?.item).toBe('Low');
    expect(pq.peek()?.item).toBe('High');
  });

  it('clear() empties the heap and resets counters', () => {
    const pq = new PriorityQueue<string>();
    pq.push('X', 5.0, 'x');
    pq.push('Y', 2.0, 'y');
    pq.clear();

    expect(pq.size).toBe(0);
    expect(pq.isEmpty()).toBe(true);
    expect(pq.pop()).toBeUndefined();
  });
});
