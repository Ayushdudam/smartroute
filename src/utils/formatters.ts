import { BaseGraphData, LocationNode } from '../graph/types';
import { dijkstra } from '../algorithms/dijkstra';
import { buildAdjacencyList } from '../graph/graphUtils';

export function formatKm(val: number): string {
  if (!Number.isFinite(val)) return '∞';
  return `${val.toFixed(1)} km`;
}

export function formatHops(val: number): string {
  return `${val} ${val === 1 ? 'road' : 'roads'}`;
}

/**
 * Deterministic suggestion rule for Demo Mode:
 * "The first road on the route, in order from the start, whose closure
 * still leaves an alternate route — computed by actually testing each candidate with Dijkstra."
 */
export function findDeterministicDemoClosureEdge(
  baseGraph: BaseGraphData,
  currentRoute: readonly string[], // edge IDs in route order
  closedEdges: ReadonlySet<string>,
  sourceId: string,
  destinationId: string
): {
  readonly edgeId: string | null;
  readonly reason: string;
  readonly candidateList: readonly {
    readonly edgeId: string;
    readonly from: string;
    readonly to: string;
    readonly wouldRemainReachable: boolean;
    readonly alternateDist?: number;
  }[];
} {
  const adj = buildAdjacencyList(baseGraph);
  const candidates: {
    edgeId: string;
    from: string;
    to: string;
    wouldRemainReachable: boolean;
    alternateDist?: number;
  }[] = [];

  for (const edgeId of currentRoute) {
    const edge = baseGraph.edges.find((e) => e.id === edgeId);
    if (!edge) continue;

    const testClosures = new Set(closedEdges);
    testClosures.add(edgeId);

    const testRun = dijkstra(adj, testClosures, sourceId, destinationId);
    const wouldRemainReachable = testRun.status === 'FOUND';

    candidates.push({
      edgeId,
      from: edge.from,
      to: edge.to,
      wouldRemainReachable,
      alternateDist: wouldRemainReachable ? testRun.totalDistance : undefined,
    });
  }

  const suggested = candidates.find((c) => c.wouldRemainReachable);

  if (!suggested) {
    return {
      edgeId: null,
      reason: 'No road on the current route can be closed without completely disconnecting the destination.',
      candidateList: candidates,
    };
  }

  return {
    edgeId: suggested.edgeId,
    reason: `Deterministic rule: First road from start ("${suggested.edgeId}") whose closure leaves an alternate route (${formatKm(suggested.alternateDist ?? 0)}).`,
    candidateList: candidates,
  };
}

/**
 * Groups location nodes by their area for clean select menus.
 */
export function groupNodesByArea(
  nodes: readonly LocationNode[]
): Record<string, LocationNode[]> {
  const groups: Record<string, LocationNode[]> = {};
  for (const node of nodes) {
    if (!groups[node.area]) {
      groups[node.area] = [];
    }
    groups[node.area]!.push(node);
  }
  return groups;
}

export function generateJourneyKey(
  sourceId: string,
  destId: string,
  algorithm: string
): string {
  return `${sourceId}:::${destId}:::${algorithm}`;
}
