import { AdjacencyList } from '../graph/types';
import { PredecessorInfo, reconstructRoute } from '../graph/routeReconstruction';
import { PriorityQueue } from './priorityQueue';
import {
  AlgorithmCounters,
  AlgorithmResult,
  TraceEvent,
  TraceEventInput,
} from './types';

export interface DijkstraOptions {
  readonly stopAtDestination?: boolean;
}

/**
 * Dijkstra's Shortest Path Algorithm with Binary Min-Heap and Lazy Deletion.
 *
 * Theoretical Complexity:
 * - Time: O((V + E) log V)
 *   Each vertex is finalised at most once. Each relaxation inserts into the heap (up to E entries),
 *   and popping from a heap of size <= E takes O(log E) = O(log V) time.
 * - Auxiliary Space: O(V + E)
 *   O(V) for dist, pred, and finalised tables; O(E) worst-case heap elements with lazy deletion.
 */
export function dijkstra(
  adjacencyList: AdjacencyList,
  closedEdges: ReadonlySet<string>,
  sourceId: string,
  destinationId: string,
  options: DijkstraOptions = {}
): AlgorithmResult {
  const stopAtDestination = options.stopAtDestination ?? true;
  const trace: TraceEvent[] = [];

  let nodesFinalised = 0;
  let edgesExamined = 0;
  let relaxations = 0;
  let staleEntriesSkipped = 0;
  let closedEdgesSkipped = 0;
  let heapPushes = 0;
  let heapPops = 0;

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
      algorithm: 'DIJKSTRA',
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
      algorithm: 'DIJKSTRA',
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

  // Verify non-negative weights
  for (const [nodeId, entries] of adjacencyList.entries()) {
    for (const entry of entries) {
      if (
        typeof entry.weight !== 'number' ||
        !Number.isFinite(entry.weight) ||
        Number.isNaN(entry.weight) ||
        entry.weight <= 0
      ) {
        return {
          algorithm: 'DIJKSTRA',
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
          message: `Invalid weight ${entry.weight} detected on edge "${entry.edgeId}" from "${nodeId}". Dijkstra requires strictly positive weights.`,
          errorDetails: `Edge "${entry.edgeId}" has non-positive or non-finite weight.`,
        };
      }
    }
  }

  pushEvent({
    type: 'ALGORITHM_STARTED',
    algorithm: 'DIJKSTRA',
    sourceId,
    destinationId,
    description: `Dijkstra started from "${sourceId}" to "${destinationId}" (stopAtDestination: ${stopAtDestination}).`,
  });

  // 2. Base Case: Source == Destination
  if (sourceId === destinationId) {
    pushEvent({
      type: 'SOURCE_INITIALISED',
      sourceId,
      initialDistance: 0,
      description: `Source and destination are identical ("${sourceId}"). Distance is 0 km.`,
    });
    pushEvent({
      type: 'DESTINATION_REACHED',
      destinationId,
      totalDistance: 0,
      description: `Journey completed immediately at starting point ("${sourceId}").`,
    });
    pushEvent({
      type: 'ALGORITHM_COMPLETED',
      status: 'SAME_NODE',
      totalDistance: 0,
      hopCount: 0,
      description: 'Algorithm completed for zero-length journey.',
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
      algorithm: 'DIJKSTRA',
      sourceId,
      destinationId,
      status: 'SAME_NODE',
      route,
      totalDistance: 0,
      hopCount: 0,
      counters,
      trace,
      message: `Start and destination are the same location ("${sourceId}"). Distance: 0.0 km (0 hops).`,
    };
  }

  // 3. Normal Dijkstra Execution
  const dist = new Map<string, number>();
  const predecessors = new Map<string, PredecessorInfo>();
  const finalised = new Set<string>();
  const pq = new PriorityQueue<string>();

  for (const nodeId of adjacencyList.keys()) {
    dist.set(nodeId, Infinity);
  }

  dist.set(sourceId, 0);
  pq.push(sourceId, 0, sourceId);
  heapPushes++;

  pushEvent({
    type: 'SOURCE_INITIALISED',
    sourceId,
    initialDistance: 0,
    description: `Initialised distance to start "${sourceId}" = 0.0 km. Pushed to priority queue.`,
  });

  let destinationReached = false;

  while (!pq.isEmpty()) {
    const top = pq.pop()!;
    heapPops++;
    const u = top.item;
    const d = top.priority;

    pushEvent({
      type: 'NODE_SELECTED',
      nodeId: u,
      distance: d,
      description: `Popped node "${u}" with priority distance ${d.toFixed(1)} km from heap.`,
    });

    // Lazy deletion check: if already finalised, skip stale entry
    if (finalised.has(u)) {
      staleEntriesSkipped++;
      pushEvent({
        type: 'STALE_ENTRY_SKIPPED',
        nodeId: u,
        poppedDistance: d,
        currentFinalDistance: dist.get(u)!,
        description: `Skipped stale heap entry for "${u}" (distance ${d.toFixed(1)} km >= settled distance ${dist.get(u)!.toFixed(1)} km).`,
      });
      continue;
    }

    // Finalise node u
    finalised.add(u);
    nodesFinalised++;

    pushEvent({
      type: 'NODE_FINALISED',
      nodeId: u,
      finalDistance: d,
      description: `Finalised shortest distance to "${u}": ${d.toFixed(1)} km.`,
    });

    if (u === destinationId && stopAtDestination) {
      destinationReached = true;
      pushEvent({
        type: 'DESTINATION_REACHED',
        destinationId,
        totalDistance: d,
        description: `Destination "${destinationId}" reached with minimal distance ${d.toFixed(1)} km! Stopping search early.`,
      });
      break;
    }

    // Examine neighbors
    const neighbors = adjacencyList.get(u) ?? [];
    for (const edgeEntry of neighbors) {
      const v = edgeEntry.neighbor;
      const edgeId = edgeEntry.edgeId;
      const weight = edgeEntry.weight;

      // Check closed road
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

      // Check if neighbor is already settled
      if (finalised.has(v)) {
        continue;
      }

      edgesExamined++;
      const candidateDist = Math.round((d + weight) * 10) / 10;
      const currentDist = dist.get(v) ?? Infinity;

      pushEvent({
        type: 'EDGE_EXAMINED',
        edgeId,
        fromNodeId: u,
        toNodeId: v,
        edgeWeight: weight,
        candidateDistance: candidateDist,
        currentDistance: currentDist,
        description: `Examined road "${edgeId}" to "${v}": candidate ${d.toFixed(1)} + ${weight.toFixed(1)} = ${candidateDist.toFixed(1)} km (current: ${currentDist === Infinity ? '∞' : currentDist.toFixed(1)} km).`,
      });

      if (candidateDist < currentDist) {
        dist.set(v, candidateDist);
        predecessors.set(v, { node: u, edgeId, weight });
        relaxations++;

        pq.push(v, candidateDist, v);
        heapPushes++;

        pushEvent({
          type: 'DISTANCE_UPDATED',
          nodeId: v,
          previousDistance: currentDist,
          newDistance: candidateDist,
          viaEdgeId: edgeId,
          viaNodeId: u,
          description: `Relaxed edge: Updated distance to "${v}" from ${currentDist === Infinity ? '∞' : currentDist.toFixed(1)} km to ${candidateDist.toFixed(1)} km via "${u}". Pushed to heap.`,
        });
      } else {
        pushEvent({
          type: 'DISTANCE_NOT_IMPROVED',
          nodeId: v,
          candidateDistance: candidateDist,
          existingDistance: currentDist,
          description: `Distance not improved for "${v}": candidate ${candidateDist.toFixed(1)} km >= existing ${currentDist.toFixed(1)} km.`,
        });
      }
    }
  }

  // 4. Outcome Resolution
  const finalDestDist = dist.get(destinationId) ?? Infinity;
  const isReachable = destinationReached || (finalDestDist !== Infinity && finalised.has(destinationId));

  if (!isReachable) {
    pushEvent({
      type: 'DESTINATION_UNREACHABLE',
      destinationId,
      description: `Destination "${destinationId}" is unreachable from "${sourceId}" with current road closures.`,
    });
    pushEvent({
      type: 'ALGORITHM_COMPLETED',
      status: 'UNREACHABLE',
      totalDistance: Infinity,
      hopCount: 0,
      description: 'Search terminated. No open path connects source and destination.',
    });

    const counters: AlgorithmCounters = {
      nodesFinalised,
      edgesExamined,
      relaxations,
      staleEntriesSkipped,
      closedEdgesSkipped,
      heapPushes,
      heapPops,
      totalSteps: trace.length,
    };

    return {
      algorithm: 'DIJKSTRA',
      sourceId,
      destinationId,
      status: 'UNREACHABLE',
      route: reconstructRoute(sourceId, destinationId, new Map()),
      totalDistance: Infinity,
      hopCount: 0,
      counters,
      trace,
      message: `Destination "${destinationId}" is unreachable from "${sourceId}". Check for closed roads blocking all available corridors.`,
    };
  }

  const route = reconstructRoute(sourceId, destinationId, predecessors);

  pushEvent({
    type: 'ALGORITHM_COMPLETED',
    status: 'FOUND',
    totalDistance: route.totalDistance,
    hopCount: route.hopCount,
    description: `Dijkstra completed. Shortest path found: ${route.totalDistance.toFixed(1)} km across ${route.hopCount} road segments.`,
  });

  const counters: AlgorithmCounters = {
    nodesFinalised,
    edgesExamined,
    relaxations,
    staleEntriesSkipped,
    closedEdgesSkipped,
    heapPushes,
    heapPops,
    totalSteps: trace.length,
  };

  return {
    algorithm: 'DIJKSTRA',
    sourceId,
    destinationId,
    status: 'FOUND',
    route,
    totalDistance: route.totalDistance,
    hopCount: route.hopCount,
    counters,
    trace,
    message: `Shortest path from "${sourceId}" to "${destinationId}" found: ${route.totalDistance.toFixed(1)} km (${route.hopCount} roads).`,
  };
}
