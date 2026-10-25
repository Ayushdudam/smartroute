export interface RouteStep {
  readonly from: string;
  readonly to: string;
  readonly edgeId: string;
  readonly weight: number;
}

export interface PredecessorInfo {
  readonly node: string;
  readonly edgeId: string;
  readonly weight: number;
}

export interface ReconstructedRoute {
  readonly path: readonly string[]; // Node IDs from source to destination
  readonly steps: readonly RouteStep[];
  readonly totalDistance: number;
  readonly hopCount: number;
}

/**
 * Reconstructs the complete route and hop sequence from predecessor mappings.
 */
export function reconstructRoute(
  sourceId: string,
  destinationId: string,
  predecessors: ReadonlyMap<string, PredecessorInfo>
): ReconstructedRoute {
  if (sourceId === destinationId) {
    return Object.freeze({
      path: Object.freeze([sourceId]),
      steps: Object.freeze([]),
      totalDistance: 0,
      hopCount: 0,
    });
  }

  const path: string[] = [];
  const steps: RouteStep[] = [];
  let curr = destinationId;
  let totalWeight = 0;

  while (curr !== sourceId) {
    path.unshift(curr);
    const pred = predecessors.get(curr);
    if (!pred) {
      // Incomplete predecessor chain (should not happen if reachable)
      return Object.freeze({
        path: Object.freeze([]),
        steps: Object.freeze([]),
        totalDistance: 0,
        hopCount: 0,
      });
    }

    steps.unshift({
      from: pred.node,
      to: curr,
      edgeId: pred.edgeId,
      weight: pred.weight,
    });
    totalWeight += pred.weight;
    curr = pred.node;
  }

  path.unshift(sourceId);

  return Object.freeze({
    path: Object.freeze(path),
    steps: Object.freeze(steps),
    totalDistance: Math.round(totalWeight * 10) / 10,
    hopCount: steps.length,
  });
}
