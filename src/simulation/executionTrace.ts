import { BaseGraphData } from '../graph/types';
import { ReconstructedRoute } from '../graph/routeReconstruction';
import { TraceEvent } from '../algorithms/types';

export type NodeVisualStatus =
  | 'unvisited'
  | 'frontier'
  | 'current'
  | 'finalised'
  | 'start'
  | 'destination';

export type EdgeVisualStatus =
  | 'normal'
  | 'examined'
  | 'candidate-tree'
  | 'closed'
  | 'on-final-route';

export interface VisualState {
  readonly stepIndex: number;
  readonly nodeStates: ReadonlyMap<string, NodeVisualStatus>;
  readonly edgeStates: ReadonlyMap<string, EdgeVisualStatus>;
  readonly tentativeDistances: ReadonlyMap<string, number>;
  readonly predecessors: ReadonlyMap<string, { node: string; edgeId: string }>;
  readonly currentNodeId: string | null;
  readonly currentEdgeId: string | null;
  readonly isCompleted: boolean;
  readonly statusMessage: string;
}

/**
 * Creates the initial visual state before any trace events are applied.
 */
export function createInitialVisualState(
  baseGraph: BaseGraphData,
  closedEdges: ReadonlySet<string>,
  sourceId?: string,
  destinationId?: string
): VisualState {
  const nodeStates = new Map<string, NodeVisualStatus>();
  const edgeStates = new Map<string, EdgeVisualStatus>();
  const tentativeDistances = new Map<string, number>();

  for (const node of baseGraph.nodes) {
    if (node.id === sourceId) {
      nodeStates.set(node.id, 'start');
    } else if (node.id === destinationId) {
      nodeStates.set(node.id, 'destination');
    } else {
      nodeStates.set(node.id, 'unvisited');
    }
    tentativeDistances.set(node.id, Infinity);
  }

  for (const edge of baseGraph.edges) {
    if (closedEdges.has(edge.id)) {
      edgeStates.set(edge.id, 'closed');
    } else {
      edgeStates.set(edge.id, 'normal');
    }
  }

  return Object.freeze({
    stepIndex: -1,
    nodeStates: Object.freeze(nodeStates),
    edgeStates: Object.freeze(edgeStates),
    tentativeDistances: Object.freeze(tentativeDistances),
    predecessors: Object.freeze(new Map()),
    currentNodeId: null,
    currentEdgeId: null,
    isCompleted: false,
    statusMessage: 'Ready to run.',
  });
}

/**
 * Pure reducer that applies a single TraceEvent onto VisualState.
 */
export function applyEvent(
  prevState: VisualState,
  event: TraceEvent,
  _baseGraph: BaseGraphData,
  closedEdges: ReadonlySet<string>,
  sourceId: string,
  destinationId: string,
  finalRoute?: ReconstructedRoute
): VisualState {
  const nodeStates = new Map<string, NodeVisualStatus>(prevState.nodeStates);
  const edgeStates = new Map<string, EdgeVisualStatus>(prevState.edgeStates);
  const tentativeDistances = new Map<string, number>(prevState.tentativeDistances);
  const predecessors = new Map<string, { node: string; edgeId: string }>(prevState.predecessors);

  let currentNodeId: string | null = null;
  let currentEdgeId: string | null = null;
  let isCompleted = prevState.isCompleted;

  // Clear previous transient 'current' or 'examined' styles
  for (const [nId, nState] of nodeStates.entries()) {
    if (nState === 'current') {
      nodeStates.set(nId, nId === sourceId ? 'start' : nId === destinationId ? 'destination' : 'frontier');
    }
  }
  for (const [eId, eState] of edgeStates.entries()) {
    if (eState === 'examined') {
      // Revert examined edges to candidate-tree or normal or closed
      const isCandidate = Array.from(predecessors.values()).some((p) => p.edgeId === eId);
      edgeStates.set(eId, closedEdges.has(eId) ? 'closed' : isCandidate ? 'candidate-tree' : 'normal');
    }
  }

  switch (event.type) {
    case 'ALGORITHM_STARTED':
      isCompleted = false;
      break;

    case 'SOURCE_INITIALISED':
      tentativeDistances.set(event.sourceId, event.initialDistance);
      nodeStates.set(event.sourceId, 'start');
      currentNodeId = event.sourceId;
      break;

    case 'NODE_SELECTED':
    case 'NODE_DEQUEUED':
      currentNodeId = event.nodeId;
      nodeStates.set(event.nodeId, 'current');
      break;

    case 'STALE_ENTRY_SKIPPED':
      currentNodeId = event.nodeId;
      break;

    case 'NODE_FINALISED':
      nodeStates.set(event.nodeId, 'finalised');
      tentativeDistances.set(event.nodeId, event.finalDistance);
      currentNodeId = event.nodeId;
      break;

    case 'EDGE_EXAMINED':
      currentEdgeId = event.edgeId;
      edgeStates.set(event.edgeId, 'examined');
      currentNodeId = event.fromNodeId;
      break;

    case 'EDGE_SKIPPED_CLOSED':
      currentEdgeId = event.edgeId;
      edgeStates.set(event.edgeId, 'closed');
      break;

    case 'DISTANCE_UPDATED':
      tentativeDistances.set(event.nodeId, event.newDistance);
      predecessors.set(event.nodeId, {
        node: event.viaNodeId,
        edgeId: event.viaEdgeId,
      });
      edgeStates.set(event.viaEdgeId, 'candidate-tree');
      if (nodeStates.get(event.nodeId) !== 'finalised' && event.nodeId !== sourceId) {
        nodeStates.set(event.nodeId, event.nodeId === destinationId ? 'destination' : 'frontier');
      }
      break;

    case 'NODE_ENQUEUED':
      predecessors.set(event.nodeId, {
        node: prevState.currentNodeId ?? sourceId,
        edgeId: event.viaEdgeId,
      });
      edgeStates.set(event.viaEdgeId, 'candidate-tree');
      if (event.nodeId !== sourceId && event.nodeId !== destinationId) {
        nodeStates.set(event.nodeId, 'frontier');
      }
      break;

    case 'DISTANCE_NOT_IMPROVED':
      break;

    case 'DESTINATION_REACHED':
      nodeStates.set(event.destinationId, 'destination');
      break;

    case 'DESTINATION_UNREACHABLE':
      isCompleted = true;
      break;

    case 'ALGORITHM_COMPLETED':
      isCompleted = true;
      if (event.status === 'FOUND' && finalRoute && finalRoute.steps.length > 0) {
        // Highlight final route permanently
        for (const step of finalRoute.steps) {
          edgeStates.set(step.edgeId, 'on-final-route');
        }
      }
      break;
  }

  return Object.freeze({
    stepIndex: event.stepIndex,
    nodeStates: Object.freeze(nodeStates),
    edgeStates: Object.freeze(edgeStates),
    tentativeDistances: Object.freeze(tentativeDistances),
    predecessors: Object.freeze(predecessors),
    currentNodeId,
    currentEdgeId,
    isCompleted,
    statusMessage: event.description,
  });
}

/**
 * Reconstructs exact visual state at step i by replaying events from 0 to i.
 * Ensures "Previous Step" is 100% deterministic and safe.
 */
export function stateAtStep(
  trace: readonly TraceEvent[],
  stepIndex: number,
  baseGraph: BaseGraphData,
  closedEdges: ReadonlySet<string>,
  sourceId: string,
  destinationId: string,
  finalRoute?: ReconstructedRoute
): VisualState {
  let state = createInitialVisualState(baseGraph, closedEdges, sourceId, destinationId);
  if (trace.length === 0 || stepIndex < 0) return state;

  const targetStep = Math.min(stepIndex, trace.length - 1);
  for (let i = 0; i <= targetStep; i++) {
    const event = trace[i]!;
    state = applyEvent(
      state,
      event,
      baseGraph,
      closedEdges,
      sourceId,
      destinationId,
      i === trace.length - 1 ? finalRoute : undefined
    );
  }

  // If at or past the last step and route exists, highlight final route
  if (targetStep === trace.length - 1 && finalRoute && finalRoute.steps.length > 0) {
    const finalEdges = new Map<string, EdgeVisualStatus>(state.edgeStates);
    for (const step of finalRoute.steps) {
      finalEdges.set(step.edgeId, 'on-final-route');
    }
    state = Object.freeze({
      ...state,
      edgeStates: Object.freeze(finalEdges),
      isCompleted: true,
    });
  }

  return state;
}
