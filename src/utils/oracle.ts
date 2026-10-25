import { BaseGraphData } from '../graph/types';

/**
 * Floyd-Warshall All-Pairs Shortest Path Oracle.
 * Used exclusively for offline and unit test verification against Dijkstra.
 */
export function computeFloydWarshallOracle(
  graph: BaseGraphData,
  closedEdges: ReadonlySet<string> = new Set()
): Map<string, Map<string, number>> {
  const nodeIds = graph.nodes.map((n) => n.id);
  const dist = new Map<string, Map<string, number>>();

  // Initialise distance matrix
  for (const u of nodeIds) {
    const row = new Map<string, number>();
    for (const v of nodeIds) {
      row.set(v, u === v ? 0 : Infinity);
    }
    dist.set(u, row);
  }

  // Populate direct edge weights
  for (const edge of graph.edges) {
    if (closedEdges.has(edge.id)) continue;
    const currentUV = dist.get(edge.from)!.get(edge.to)!;
    if (edge.weight < currentUV) {
      dist.get(edge.from)!.set(edge.to, edge.weight);
      dist.get(edge.to)!.set(edge.from, edge.weight);
    }
  }

  // Triple nested loop
  for (const k of nodeIds) {
    const rowK = dist.get(k)!;
    for (const i of nodeIds) {
      const rowI = dist.get(i)!;
      const dIK = rowI.get(k)!;
      if (dIK === Infinity) continue;

      for (const j of nodeIds) {
        const dKJ = rowK.get(j)!;
        if (dKJ === Infinity) continue;

        const candidate = Math.round((dIK + dKJ) * 10) / 10;
        if (candidate < rowI.get(j)!) {
          rowI.set(j, candidate);
        }
      }
    }
  }

  return dist;
}

/**
 * Deterministic Linear Congruential Generator (LCG) for reproducible pseudo-random testing.
 */
export class DeterministicRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  public nextFloat(): number {
    // Numerical Recipes LCG parameters
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }
}
