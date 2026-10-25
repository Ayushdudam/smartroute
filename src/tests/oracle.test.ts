import { describe, expect, it } from 'vitest';
import { BASE_GRAPH } from '../graph/graphData';
import { buildAdjacencyList } from '../graph/graphUtils';
import { dijkstra } from '../algorithms/dijkstra';
import { computeFloydWarshallOracle, DeterministicRNG } from '../utils/oracle';

describe('Dijkstra Correctness Oracle (Floyd-Warshall Verification)', () => {
  const adj = buildAdjacencyList(BASE_GRAPH);
  const nodeIds = BASE_GRAPH.nodes.map((n) => n.id);

  it('matches Floyd-Warshall oracle for ALL 25x25 (625) ordered node pairs on the default graph', () => {
    const oracleMatrix = computeFloydWarshallOracle(BASE_GRAPH, new Set());

    for (const sourceId of nodeIds) {
      for (const destId of nodeIds) {
        const dijkstraResult = dijkstra(adj, new Set(), sourceId, destId);
        const expectedDistance = oracleMatrix.get(sourceId)!.get(destId)!;

        if (expectedDistance === Infinity) {
          expect(dijkstraResult.status).toBe('UNREACHABLE');
        } else {
          expect(
            dijkstraResult.totalDistance,
            `Distance mismatch for pair ${sourceId} -> ${destId}`
          ).toBeCloseTo(expectedDistance, 1);
        }
      }
    }
  });

  it('matches Floyd-Warshall across 15 pseudo-random closure sets generated with a fixed seed', () => {
    const rng = new DeterministicRNG(1337);
    const edgeIds = BASE_GRAPH.edges.map((e) => e.id);

    const NUM_SCENARIOS = 15;
    for (let s = 0; s < NUM_SCENARIOS; s++) {
      // Pick 2 to 6 random edges to close
      const numToClose = rng.nextInt(2, 6);
      const closedSet = new Set<string>();
      while (closedSet.size < numToClose) {
        const idx = rng.nextInt(0, edgeIds.length - 1);
        closedSet.add(edgeIds[idx]!);
      }

      const oracleMatrix = computeFloydWarshallOracle(BASE_GRAPH, closedSet);

      // Test 10 randomly picked pairs for this closure set
      for (let p = 0; p < 10; p++) {
        const src = nodeIds[rng.nextInt(0, nodeIds.length - 1)]!;
        const dst = nodeIds[rng.nextInt(0, nodeIds.length - 1)]!;

        const dijkstraRes = dijkstra(adj, closedSet, src, dst);
        const oracleDist = oracleMatrix.get(src)!.get(dst)!;

        if (oracleDist === Infinity) {
          expect(dijkstraRes.status).toBe('UNREACHABLE');
        } else {
          expect(
            dijkstraRes.totalDistance,
            `Mismatch on scenario ${s} for pair ${src} -> ${dst}`
          ).toBeCloseTo(oracleDist, 1);
        }
      }
    }
  });
});
