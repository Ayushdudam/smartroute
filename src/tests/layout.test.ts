import { describe, expect, it } from 'vitest';
import { BASE_GRAPH, CANVAS_BOUNDS } from '../graph/graphData';

describe('Map Layout Constraints', () => {
  it('ensures all 25 nodes lie strictly within canvas viewBox with padding', () => {
    const minX = CANVAS_BOUNDS.padding;
    const maxX = CANVAS_BOUNDS.width - CANVAS_BOUNDS.padding;
    const minY = CANVAS_BOUNDS.padding;
    const maxY = CANVAS_BOUNDS.height - CANVAS_BOUNDS.padding;

    expect(BASE_GRAPH.nodes).toHaveLength(25);

    for (const node of BASE_GRAPH.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(minX);
      expect(node.x).toBeLessThanOrEqual(maxX);
      expect(node.y).toBeGreaterThanOrEqual(minY);
      expect(node.y).toBeLessThanOrEqual(maxY);
    }
  });

  it('guarantees no two nodes are closer than 60 pixels to prevent label collisions', () => {
    const MIN_DISTANCE = 60;
    const nodes = BASE_GRAPH.nodes;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i]!;
        const n2 = nodes[j]!;
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        expect(
          dist,
          `Nodes "${n1.id}" and "${n2.id}" are too close: ${dist.toFixed(2)}px < ${MIN_DISTANCE}px`
        ).toBeGreaterThanOrEqual(MIN_DISTANCE);
      }
    }
  });

  it('verifies every node has degree >= 2', () => {
    const degreeMap = new Map<string, number>();
    for (const n of BASE_GRAPH.nodes) {
      degreeMap.set(n.id, 0);
    }
    for (const e of BASE_GRAPH.edges) {
      degreeMap.set(e.from, (degreeMap.get(e.from) ?? 0) + 1);
      degreeMap.set(e.to, (degreeMap.get(e.to) ?? 0) + 1);
    }

    for (const [nodeId, degree] of degreeMap.entries()) {
      expect(degree, `Node ${nodeId} should have degree >= 2`).toBeGreaterThanOrEqual(2);
    }
  });
});
