import { describe, expect, it } from 'vitest';
import { validateGraph } from '../graph/graphValidation';
import { BASE_GRAPH } from '../graph/graphData';
import { BaseGraphData } from '../graph/types';

describe('Graph Validation', () => {
  it('validates the default Mumbai road network without errors', () => {
    const result = validateGraph(BASE_GRAPH);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects duplicate node ids', () => {
    const invalidGraph: BaseGraphData = {
      nodes: [
        { id: 'node_a', name: 'Node A', area: 'A', x: 100, y: 100 },
        { id: 'node_a', name: 'Node A Duplicate', area: 'A', x: 200, y: 200 },
      ],
      edges: [],
    };
    const result = validateGraph(invalidGraph, { allowDisconnected: true });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_NODE_ID')).toBe(true);
  });

  it('detects duplicate edge ids', () => {
    const invalidGraph: BaseGraphData = {
      nodes: [
        { id: 'node_a', name: 'Node A', area: 'A', x: 100, y: 100 },
        { id: 'node_b', name: 'Node B', area: 'B', x: 200, y: 200 },
      ],
      edges: [
        { id: 'e1', from: 'node_a', to: 'node_b', weight: 2.0 },
        { id: 'e1', from: 'node_b', to: 'node_a', weight: 3.0 },
      ],
    };
    const result = validateGraph(invalidGraph);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_EDGE_ID')).toBe(true);
  });

  it('detects missing node endpoints in edges', () => {
    const invalidGraph: BaseGraphData = {
      nodes: [{ id: 'node_a', name: 'Node A', area: 'A', x: 100, y: 100 }],
      edges: [{ id: 'e1', from: 'node_a', to: 'non_existent', weight: 1.5 }],
    };
    const result = validateGraph(invalidGraph, { allowDisconnected: true });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MISSING_NODE_ENDPOINT')).toBe(true);
  });

  it('detects self-loops', () => {
    const invalidGraph: BaseGraphData = {
      nodes: [{ id: 'node_a', name: 'Node A', area: 'A', x: 100, y: 100 }],
      edges: [{ id: 'e1', from: 'node_a', to: 'node_a', weight: 1.0 }],
    };
    const result = validateGraph(invalidGraph, { allowDisconnected: true });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SELF_LOOP')).toBe(true);
  });

  it('detects parallel edges between the same pair of nodes', () => {
    const invalidGraph: BaseGraphData = {
      nodes: [
        { id: 'node_a', name: 'Node A', area: 'A', x: 100, y: 100 },
        { id: 'node_b', name: 'Node B', area: 'B', x: 200, y: 200 },
      ],
      edges: [
        { id: 'e1', from: 'node_a', to: 'node_b', weight: 2.5 },
        { id: 'e2', from: 'node_b', to: 'node_a', weight: 3.0 },
      ],
    };
    const result = validateGraph(invalidGraph);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PARALLEL_EDGE')).toBe(true);
  });

  it('detects non-positive, zero, NaN, or non-finite weights', () => {
    const testWeights = [0, -2.5, NaN, Infinity];
    for (const w of testWeights) {
      const invalidGraph: BaseGraphData = {
        nodes: [
          { id: 'node_a', name: 'Node A', area: 'A', x: 100, y: 100 },
          { id: 'node_b', name: 'Node B', area: 'B', x: 200, y: 200 },
        ],
        edges: [{ id: 'e1', from: 'node_a', to: 'node_b', weight: w }],
      };
      const result = validateGraph(invalidGraph);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_WEIGHT')).toBe(true);
    }
  });

  it('detects disconnected graphs', () => {
    const disconnectedGraph: BaseGraphData = {
      nodes: [
        { id: 'node_a', name: 'Node A', area: 'A', x: 100, y: 100 },
        { id: 'node_b', name: 'Node B', area: 'B', x: 200, y: 200 },
        { id: 'island', name: 'Island Node', area: 'C', x: 300, y: 300 },
      ],
      edges: [{ id: 'e1', from: 'node_a', to: 'node_b', weight: 1.0 }],
    };
    const result = validateGraph(disconnectedGraph);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'DISCONNECTED_GRAPH')).toBe(true);
  });
});
