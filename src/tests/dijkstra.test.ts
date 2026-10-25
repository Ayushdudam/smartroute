import { describe, expect, it } from 'vitest';
import { dijkstra } from '../algorithms/dijkstra';
import { buildAdjacencyList } from '../graph/graphUtils';
import { BaseGraphData } from '../graph/types';
import { BASE_GRAPH } from '../graph/graphData';
import { stateAtStep } from '../simulation/executionTrace';

/**
 * Hand-verifiable test fixture 1:
 *
 *    (A) --- 2.0 (e1) ---> (B) --- 3.0 (e2) ---> (C)
 *     |                                           ^
 *     +----------------- 6.0 (e3) ---------------+
 *
 * Shortest path A -> C is A -> B -> C (distance 5.0, not direct edge e3 of 6.0).
 */
const FIXTURE_1: BaseGraphData = {
  nodes: [
    { id: 'A', name: 'Node A', area: 'Test', x: 100, y: 100 },
    { id: 'B', name: 'Node B', area: 'Test', x: 250, y: 100 },
    { id: 'C', name: 'Node C', area: 'Test', x: 400, y: 100 },
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 2.0 },
    { id: 'e2', from: 'B', to: 'C', weight: 3.0 },
    { id: 'e3', from: 'A', to: 'C', weight: 6.0 },
  ],
};

/**
 * Hand-verifiable test fixture 2 (Ties):
 *
 *         (X)
 *        /   \
 *   2.0 /     \ 2.0
 *      v       v
 *    (Y1)     (Y2)
 *      \       /
 *   3.0 \     / 3.0
 *        v   v
 *         (Z)
 *
 * Path 1: X -> Y1 -> Z (5.0 km)
 * Path 2: X -> Y2 -> Z (5.0 km)
 * Deterministic tie-breaking orders Y1 before Y2 alphabetically.
 */
const FIXTURE_TIES: BaseGraphData = {
  nodes: [
    { id: 'X', name: 'X', area: 'Test', x: 100, y: 100 },
    { id: 'Y1', name: 'Y1', area: 'Test', x: 200, y: 80 },
    { id: 'Y2', name: 'Y2', area: 'Test', x: 200, y: 120 },
    { id: 'Z', name: 'Z', area: 'Test', x: 300, y: 100 },
  ],
  edges: [
    { id: 'e_x_y1', from: 'X', to: 'Y1', weight: 2.0 },
    { id: 'e_x_y2', from: 'X', to: 'Y2', weight: 2.0 },
    { id: 'e_y1_z', from: 'Y1', to: 'Z', weight: 3.0 },
    { id: 'e_y2_z', from: 'Y2', to: 'Z', weight: 3.0 },
  ],
};

describe('Dijkstra Algorithm Unit Tests', () => {
  // Test 1: Basic shortest path with expected route and distance
  it('computes correct shortest path on hand-verifiable fixture', () => {
    const adj = buildAdjacencyList(FIXTURE_1);
    const result = dijkstra(adj, new Set(), 'A', 'C');

    expect(result.status).toBe('FOUND');
    expect(result.totalDistance).toBe(5.0);
    expect(result.route.path).toEqual(['A', 'B', 'C']);
    expect(result.route.steps).toHaveLength(2);
    expect(result.route.steps[0]!.edgeId).toBe('e1');
    expect(result.route.steps[1]!.edgeId).toBe('e2');
  });

  // Test 3: Multiple equal-weight shortest paths are deterministic
  it('breaks ties deterministically across multiple runs', () => {
    const adj = buildAdjacencyList(FIXTURE_TIES);
    const result1 = dijkstra(adj, new Set(), 'X', 'Z');
    const result2 = dijkstra(adj, new Set(), 'X', 'Z');

    expect(result1.status).toBe('FOUND');
    expect(result1.totalDistance).toBe(5.0);
    expect(result1.route.path).toEqual(['X', 'Y1', 'Z']);
    expect(result1.route.path).toEqual(result2.route.path);
    expect(result1.trace).toEqual(result2.trace);
  });

  // Test 4 & 5: Disconnected graph and unreachable destination
  it('returns UNREACHABLE status for disconnected target', () => {
    const disconnectedFixture: BaseGraphData = {
      nodes: [
        { id: 'N1', name: 'N1', area: 'A', x: 100, y: 100 },
        { id: 'N2', name: 'N2', area: 'A', x: 200, y: 100 },
        { id: 'ISO', name: 'Isolated', area: 'B', x: 300, y: 100 },
      ],
      edges: [{ id: 'e1', from: 'N1', to: 'N2', weight: 1.0 }],
    };
    const adj = buildAdjacencyList(disconnectedFixture);
    const result = dijkstra(adj, new Set(), 'N1', 'ISO');

    expect(result.status).toBe('UNREACHABLE');
    expect(result.totalDistance).toBe(Infinity);
    expect(result.route.path).toHaveLength(0);
    expect(result.route.steps).toHaveLength(0);
    expect(result.message).toContain('unreachable');
  });

  // Test 6: Start equals destination
  it('handles source equal to destination as 0 distance and 0 hops', () => {
    const adj = buildAdjacencyList(FIXTURE_1);
    const result = dijkstra(adj, new Set(), 'A', 'A');

    expect(result.status).toBe('SAME_NODE');
    expect(result.totalDistance).toBe(0);
    expect(result.hopCount).toBe(0);
    expect(result.route.path).toEqual(['A']);
    expect(result.route.steps).toHaveLength(0);
  });

  // Test 7: Closed edges are excluded
  it('excludes closed edges and reroutes around them', () => {
    const adj = buildAdjacencyList(FIXTURE_1);
    // Closing e1 forces route to take direct e3 (6.0 km)
    const result = dijkstra(adj, new Set(['e1']), 'A', 'C');

    expect(result.status).toBe('FOUND');
    expect(result.totalDistance).toBe(6.0);
    expect(result.route.path).toEqual(['A', 'C']);
    expect(result.counters.closedEdgesSkipped).toBeGreaterThanOrEqual(1);
  });

  // Test 8: Reopening restores original route
  it('reopening a closed edge restores the original shortest route', () => {
    const adj = buildAdjacencyList(FIXTURE_1);
    const closed = dijkstra(adj, new Set(['e1']), 'A', 'C');
    expect(closed.totalDistance).toBe(6.0);

    const reopened = dijkstra(adj, new Set(), 'A', 'C');
    expect(reopened.totalDistance).toBe(5.0);
    expect(reopened.route.path).toEqual(['A', 'B', 'C']);
  });

  // Test 9: Invalid node IDs return structured errors
  it('returns structured error when source or destination ID is invalid', () => {
    const adj = buildAdjacencyList(FIXTURE_1);
    const badSource = dijkstra(adj, new Set(), 'INVALID', 'C');
    expect(badSource.status).toBe('ERROR');
    expect(badSource.message).toContain('Source location "INVALID" was not found');

    const badDest = dijkstra(adj, new Set(), 'A', 'INVALID');
    expect(badDest.status).toBe('ERROR');
    expect(badDest.message).toContain('Destination location "INVALID" was not found');
  });

  // Test 10: Negative, zero, or NaN weights rejected
  it('rejects graphs with invalid weights', () => {
    const badGraph: BaseGraphData = {
      nodes: [
        { id: 'P', name: 'P', area: 'A', x: 100, y: 100 },
        { id: 'Q', name: 'Q', area: 'A', x: 200, y: 100 },
      ],
      edges: [{ id: 'bad_e', from: 'P', to: 'Q', weight: -1.5 }],
    };
    const adj = buildAdjacencyList(badGraph);
    const result = dijkstra(adj, new Set(), 'P', 'Q');
    expect(result.status).toBe('ERROR');
    expect(result.message).toContain('Invalid weight');
  });

  // Test 11: Route reconstruction correctness
  it('validates reconstructed route integrity', () => {
    const adj = buildAdjacencyList(BASE_GRAPH);
    const result = dijkstra(adj, new Set(), 'vit', 'csmt');

    expect(result.status).toBe('FOUND');
    let sumWeight = 0;
    for (let i = 0; i < result.route.steps.length; i++) {
      const step = result.route.steps[i]!;
      expect(step.from).toBe(result.route.path[i]);
      expect(step.to).toBe(result.route.path[i + 1]);
      sumWeight += step.weight;
    }
    expect(Math.round(sumWeight * 10) / 10).toBe(result.totalDistance);
  });

  // Test 14: Trace agrees with result and invariants
  it('ensures execution trace agrees with result and maintains invariants', () => {
    const adj = buildAdjacencyList(BASE_GRAPH);
    const result = dijkstra(adj, new Set(), 'vit', 'worli_sea_face');

    expect(result.status).toBe('FOUND');
    expect(result.trace.length).toBe(result.counters.totalSteps);

    // Node finalised events must have non-decreasing distance
    const finalisedDistances: number[] = [];
    for (const evt of result.trace) {
      if (evt.type === 'NODE_FINALISED') {
        finalisedDistances.push(evt.finalDistance);
      }
    }
    for (let i = 1; i < finalisedDistances.length; i++) {
      expect(finalisedDistances[i]!).toBeGreaterThanOrEqual(finalisedDistances[i - 1]!);
    }

    // Trace counts match counters
    const nodesFinalisedCount = result.trace.filter((e) => e.type === 'NODE_FINALISED').length;
    expect(result.counters.nodesFinalised).toBe(nodesFinalisedCount);

    const edgesExaminedCount = result.trace.filter((e) => e.type === 'EDGE_EXAMINED').length;
    expect(result.counters.edgesExamined).toBe(edgesExaminedCount);

    const relaxationsCount = result.trace.filter((e) => e.type === 'DISTANCE_UPDATED').length;
    expect(result.counters.relaxations).toBe(relaxationsCount);

    const staleCount = result.trace.filter((e) => e.type === 'STALE_ENTRY_SKIPPED').length;
    expect(result.counters.staleEntriesSkipped).toBe(staleCount);

    const closedCount = result.trace.filter((e) => e.type === 'EDGE_SKIPPED_CLOSED').length;
    expect(result.counters.closedEdgesSkipped).toBe(closedCount);

    // Replay trace to the final step yields final route highlighted
    const finalVisualState = stateAtStep(
      result.trace,
      result.trace.length - 1,
      BASE_GRAPH,
      new Set(),
      'vit',
      'worli_sea_face',
      result.route
    );

    expect(finalVisualState.isCompleted).toBe(true);
    for (const step of result.route.steps) {
      expect(finalVisualState.edgeStates.get(step.edgeId)).toBe('on-final-route');
    }
  });
});
