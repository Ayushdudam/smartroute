import { AdjacencyList } from '../graph/types';
import { PredecessorInfo, reconstructRoute } from '../graph/routeReconstruction';
import {
  AlgorithmCounters,
  AlgorithmResult,
  TraceEvent,
  TraceEventInput,
} from './types';

/**
 * Breadth-First Search (BFS) for Fewest Hop Path.
 *
 * IMPORTANT PEDAGOGICAL PRINCIPLE:
 * BFS explores layer-by-layer and minimizes the NUMBER OF EDGES (hops) only.
 * It ignores edge weights during search. On a weighted graph, its path can have
 * fewer hops but a STRICTLY HIGHER total distance than Dijkstra's shortest path.
 *
 * Complexity:
 * - Time: O(V + E)
 * - Auxiliary Space: O(V)
 */
export function bfs(
  adjacencyList: AdjacencyList,
  closedEdges: ReadonlySet<string>,
  sourceId: string,
  destinationId: string
): AlgorithmResult {
  const trace: TraceEvent[] = [];

  let nodesFinalised = 0; // count of dequeued and settled nodes
  let edgesExamined = 0;
  let closedEdgesSkipped = 0;

  function pushEvent(eventData: TraceEventInput): void {
    const event = {
      ...eventData,
      stepIndex: trace.length,
    } as TraceEvent;
    trace.push(event);
  }

  // 1. Validation
  if (!adjacencyList.has(sourceId)) {
    return {
      algorithm: 'BFS',
      sourceId,
      destinationId,
      status: 'ERROR',
      route: reconstructRoute(sourceId, destinationId, new Map()),
      totalDistance: 0,
      hopCount: 0,
      counters: {
        nodesFinalised: 0,
        edgesExamined: 0,
        relaxations: 0,
        staleEntriesSkipped: 0,
        closedEdgesSkipped: 0,
        heapPushes: 0,
        heapPops: 0,
        totalSteps: 0,
      },
      trace: [],
      message: `Source location "${sourceId}" was not found in the graph.`,
      errorDetails: `Node id "${sourceId}" is unknown.`,
    };
  }

  if (!adjacencyList.has(destinationId)) {
    return {
      algorithm: 'BFS',
      sourceId,
      destinationId,
      status: 'ERROR',
      route: reconstructRoute(sourceId, destinationId, new Map()),
      totalDistance: 0,
      hopCount: 0,
      counters: {
        nodesFinalised: 0,
        edgesExamined: 0,
        relaxations: 0,
        staleEntriesSkipped: 0,
        closedEdgesSkipped: 0,
        heapPushes: 0,
        heapPops: 0,
        totalSteps: 0,
      },
      trace: [],
      message: `Destination location "${destinationId}" was not found in the graph.`,
      errorDetails: `Node id "${destinationId}" is unknown.`,
    };
  }

  pushEvent({
    type: 'ALGORITHM_STARTED',
    algorithm: 'BFS',
    sourceId,
    destinationId,
    description: `BFS started from "${sourceId}" to "${destinationId}". Searching for route with fewest hops.`,
  });

  // 2. Base Case: Source == Destination
  if (sourceId === destinationId) {
    pushEvent({
      type: 'SOURCE_INITIALISED',
      sourceId,
      initialDistance: 0,
      description: `Source and destination are identical ("${sourceId}"). Hop count is 0.`,
    });
    pushEvent({
      type: 'DESTINATION_REACHED',
      destinationId,
      totalDistance: 0,
      description: `Target reached immediately at start ("${sourceId}").`,
    });
    pushEvent({
      type: 'ALGORITHM_COMPLETED',
      status: 'SAME_NODE',
      totalDistance: 0,
      hopCount: 0,
      description: 'BFS completed for zero-hop journey.',
    });

    const route = reconstructRoute(sourceId, destinationId, new Map());
    const counters: AlgorithmCounters = {
      nodesFinalised: 0,
      edgesExamined: 0,
      relaxations: 0,
      staleEntriesSkipped: 0,
      closedEdgesSkipped: 0,
      heapPushes: 0,
      heapPops: 0,
      totalSteps: trace.length,
    };

    return {
      algorithm: 'BFS',
      sourceId,
      destinationId,
      status: 'SAME_NODE',
      route,
      totalDistance: 0,
      hopCount: 0,
      counters,
      trace,
      message: `Start and destination are the same location ("${sourceId}"). 0 hops, 0.0 km.`,
    };
  }

  // 3. BFS Execution
  const visited = new Set<string>([sourceId]);
  const queue: Array<{ nodeId: string; hops: number }> = [{ nodeId: sourceId, hops: 0 }];
  const predecessors = new Map<string, PredecessorInfo>();

  pushEvent({
    type: 'SOURCE_INITIALISED',
    sourceId,
    initialDistance: 0,
    description: `Source node "${sourceId}" marked visited and enqueued at depth 0.`,
  });

  let destinationFound = false;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const u = current.nodeId;
    const currentHops = current.hops;
    nodesFinalised++;

    pushEvent({
      type: 'NODE_DEQUEUED',
      nodeId: u,
      hopCount: currentHops,
      description: `Dequeued node "${u}" at layer depth ${currentHops} hops.`,
    });

    if (u === destinationId) {
      destinationFound = true;
      pushEvent({
        type: 'DESTINATION_REACHED',
        destinationId,
        totalDistance: currentHops,
        description: `Destination "${destinationId}" reached in ${currentHops} hops!`,
      });
      break;
    }

    const neighbors = adjacencyList.get(u) ?? [];
    for (const entry of neighbors) {
      const v = entry.neighbor;
      const edgeId = entry.edgeId;
      const weight = entry.weight;

      if (closedEdges.has(edgeId)) {
        closedEdgesSkipped++;
        pushEvent({
          type: 'EDGE_SKIPPED_CLOSED',
          edgeId,
          fromNodeId: u,
          toNodeId: v,
          description: `Skipped road "${edgeId}" (${u} ↔ ${v}) because it is closed.`,
        });
        continue;
      }

      edgesExamined++;
      pushEvent({
        type: 'EDGE_EXAMINED',
        edgeId,
        fromNodeId: u,
        toNodeId: v,
        edgeWeight: weight,
        candidateDistance: currentHops + 1,
        currentDistance: visited.has(v) ? 1 : Infinity,
        description: `Inspected edge "${edgeId}" from "${u}" to "${v}".`,
      });

      if (!visited.has(v)) {
        visited.add(v);
        predecessors.set(v, { node: u, edgeId, weight });
        queue.push({ nodeId: v, hops: currentHops + 1 });

        pushEvent({
          type: 'NODE_ENQUEUED',
          nodeId: v,
          hopCount: currentHops + 1,
          viaEdgeId: edgeId,
          description: `Discovered and enqueued unvisited node "${v}" at depth ${currentHops + 1} hops via "${edgeId}".`,
        });
      }
    }
  }

  if (!destinationFound) {
    pushEvent({
      type: 'DESTINATION_UNREACHABLE',
      destinationId,
      description: `Destination "${destinationId}" is unreachable from "${sourceId}" via BFS.`,
    });
    pushEvent({
      type: 'ALGORITHM_COMPLETED',
      status: 'UNREACHABLE',
      totalDistance: Infinity,
      hopCount: 0,
      description: 'BFS exploration complete. No path exists.',
    });

    const counters: AlgorithmCounters = {
      nodesFinalised,
      edgesExamined,
      relaxations: 0,
      staleEntriesSkipped: 0,
      closedEdgesSkipped,
      heapPushes: 0,
      heapPops: 0,
      totalSteps: trace.length,
    };

    return {
      algorithm: 'BFS',
      sourceId,
      destinationId,
      status: 'UNREACHABLE',
      route: reconstructRoute(sourceId, destinationId, new Map()),
      totalDistance: Infinity,
      hopCount: 0,
      counters,
      trace,
      message: `Destination "${destinationId}" is unreachable from "${sourceId}" with current road closures.`,
    };
  }

  const route = reconstructRoute(sourceId, destinationId, predecessors);

  pushEvent({
    type: 'ALGORITHM_COMPLETED',
    status: 'FOUND',
    totalDistance: route.totalDistance,
    hopCount: route.hopCount,
    description: `BFS completed. Fewest-hop path: ${route.hopCount} hops with summed weight ${route.totalDistance.toFixed(1)} km.`,
  });

  const counters: AlgorithmCounters = {
    nodesFinalised,
    edgesExamined,
    relaxations: 0,
    staleEntriesSkipped: 0,
    closedEdgesSkipped,
    heapPushes: 0,
    heapPops: 0,
    totalSteps: trace.length,
  };

  return {
    algorithm: 'BFS',
    sourceId,
    destinationId,
    status: 'FOUND',
    route,
    totalDistance: route.totalDistance,
    hopCount: route.hopCount,
    counters,
    trace,
    message: `BFS found fewest-hop route: ${route.hopCount} hops, summed distance ${route.totalDistance.toFixed(1)} km (BFS ignores weights).`,
  };
}
