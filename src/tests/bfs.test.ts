import { describe, expect, it } from 'vitest';
import { bfs } from '../algorithms/bfs';
import { dijkstra } from '../algorithms/dijkstra';
import { buildAdjacencyList } from '../graph/graphUtils';
import { BaseGraphData } from '../graph/types';
import { BASE_GRAPH } from '../graph/graphData';

/**
 * Hand-verifiable test fixture:
 *
 *    (S) ========= 10.0 (e_heavy) =========> (D)
 *     |                                       ^
 *    1.0 (e1)                                1.0 (e3)
 *     v                                       |
 *    (M1) ------------ 1.0 (e2) ------------> (M2)
 *
 * BFS chooses direct hop S -> D (1 hop, total weight 10.0).
 * Dijkstra chooses S -> M1 -> M2 -> D (3 hops, total weight 3.0).
 */
const FIXTURE_BFS_VS_DIJKSTRA: BaseGraphData = {
  nodes: [
    { id: 'S', name: 'Start', area: 'A', x: 100, y: 100 },
    { id: 'D', name: 'Dest', area: 'A', x: 400, y: 100 },
    { id: 'M1', name: 'Mid 1', area: 'A', x: 200, y: 200 },
    { id: 'M2', name: 'Mid 2', area: 'A', x: 300, y: 200 },
  ],
  edges: [
    { id: 'e_heavy', from: 'S', to: 'D', weight: 10.0 },
    { id: 'e1', from: 'S', to: 'M1', weight: 1.0 },
    { id: 'e2', from: 'M1', to: 'M2', weight: 1.0 },
    { id: 'e3', from: 'M2', to: 'D', weight: 1.0 },
  ],
};

describe('BFS Algorithm Unit Tests', () => {
  // Test 2: Fewest-edge route has HIGHER total weight than Dijkstra route
  it('demonstrates BFS selects fewer hops with strictly higher weight than Dijkstra', () => {
    const adj = buildAdjacencyList(FIXTURE_BFS_VS_DIJKSTRA);
    const bfsRes = bfs(adj, new Set(), 'S', 'D');
    const dijkstraRes = dijkstra(adj, new Set(), 'S', 'D');

    expect(bfsRes.status).toBe('FOUND');
    expect(dijkstraRes.status).toBe('FOUND');

    // BFS found 1 hop, weight 10.0
    expect(bfsRes.hopCount).toBe(1);
    expect(bfsRes.totalDistance).toBe(10.0);
    expect(bfsRes.route.path).toEqual(['S', 'D']);

    // Dijkstra found 3 hops, weight 3.0
    expect(dijkstraRes.hopCount).toBe(3);
    expect(dijkstraRes.totalDistance).toBe(3.0);
    expect(dijkstraRes.route.path).toEqual(['S', 'M1', 'M2', 'D']);

    // Core verification: BFS hops < Dijkstra hops, but BFS distance > Dijkstra distance
    expect(bfsRes.hopCount).toBeLessThan(dijkstraRes.hopCount);
    expect(bfsRes.totalDistance).toBeGreaterThan(dijkstraRes.totalDistance);
  });

  it('validates BFS hop count against an independent unweighted BFS checker', () => {
    const adj = buildAdjacencyList(BASE_GRAPH);

    // Run BFS on sample pairs and verify minimal hop count
    const testPairs = [
      ['bandra_station', 'csmt'],
      ['vit', 'worli_sea_face'],
      ['chembur', 'marine_drive'],
      ['kurla', 'haji_ali'],
    ];

    for (const [from, to] of testPairs) {
      const bfsRes = bfs(adj, new Set(), from!, to!);
      expect(bfsRes.status).toBe('FOUND');

      // Independent BFS queue
      const q = [{ id: from!, depth: 0 }];
      const visited = new Set<string>([from!]);
      let oracleHops = -1;

      while (q.length > 0) {
        const curr = q.shift()!;
        if (curr.id === to!) {
          oracleHops = curr.depth;
          break;
        }
        for (const neighbor of adj.get(curr.id) ?? []) {
          if (!visited.has(neighbor.neighbor)) {
            visited.add(neighbor.neighbor);
            q.push({ id: neighbor.neighbor, depth: curr.depth + 1 });
          }
        }
      }

      expect(bfsRes.hopCount).toBe(oracleHops);
    }
  });

  it('handles edge cases identically to Dijkstra specification', () => {
    const adj = buildAdjacencyList(BASE_GRAPH);

    // Same node
    const sameNode = bfs(adj, new Set(), 'vit', 'vit');
    expect(sameNode.status).toBe('SAME_NODE');
    expect(sameNode.hopCount).toBe(0);
    expect(sameNode.totalDistance).toBe(0);

    // Invalid node
    const invalidNode = bfs(adj, new Set(), 'NON_EXISTENT', 'vit');
    expect(invalidNode.status).toBe('ERROR');

    // Unreachable via closures
    const chemburIsolated = bfs(
      adj,
      new Set(['kurla-chembur', 'sion-chembur']),
      'vit',
      'chembur'
    );
    expect(chemburIsolated.status).toBe('UNREACHABLE');
  });
});
