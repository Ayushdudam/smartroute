import { ReconstructedRoute } from '../graph/routeReconstruction';

export type AlgorithmType = 'DIJKSTRA' | 'BFS';

export type AlgorithmStatus = 'FOUND' | 'UNREACHABLE' | 'SAME_NODE' | 'ERROR';

export interface AlgorithmCounters {
  readonly nodesFinalised: number;
  readonly edgesExamined: number;
  readonly relaxations: number;
  readonly staleEntriesSkipped: number;
  readonly closedEdgesSkipped: number;
  readonly heapPushes: number;
  readonly heapPops: number;
  readonly totalSteps: number;
}

export type TraceEventType =
  | 'ALGORITHM_STARTED'
  | 'SOURCE_INITIALISED'
  | 'NODE_SELECTED'
  | 'STALE_ENTRY_SKIPPED'
  | 'NODE_FINALISED'
  | 'EDGE_EXAMINED'
  | 'EDGE_SKIPPED_CLOSED'
  | 'DISTANCE_UPDATED'
  | 'DISTANCE_NOT_IMPROVED'
  | 'DESTINATION_REACHED'
  | 'ALGORITHM_COMPLETED'
  | 'DESTINATION_UNREACHABLE'
  // BFS specific event variants
  | 'NODE_ENQUEUED'
  | 'NODE_DEQUEUED';

export interface BaseTraceEvent {
  readonly stepIndex: number;
  readonly type: TraceEventType;
  readonly description: string;
}

export interface AlgorithmStartedEvent extends BaseTraceEvent {
  readonly type: 'ALGORITHM_STARTED';
  readonly algorithm: AlgorithmType;
  readonly sourceId: string;
  readonly destinationId: string;
}

export interface SourceInitialisedEvent extends BaseTraceEvent {
  readonly type: 'SOURCE_INITIALISED';
  readonly sourceId: string;
  readonly initialDistance: number;
}

export interface NodeSelectedEvent extends BaseTraceEvent {
  readonly type: 'NODE_SELECTED';
  readonly nodeId: string;
  readonly distance: number;
}

export interface StaleEntrySkippedEvent extends BaseTraceEvent {
  readonly type: 'STALE_ENTRY_SKIPPED';
  readonly nodeId: string;
  readonly poppedDistance: number;
  readonly currentFinalDistance: number;
}

export interface NodeFinalisedEvent extends BaseTraceEvent {
  readonly type: 'NODE_FINALISED';
  readonly nodeId: string;
  readonly finalDistance: number;
}

export interface EdgeExaminedEvent extends BaseTraceEvent {
  readonly type: 'EDGE_EXAMINED';
  readonly edgeId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly edgeWeight: number;
  readonly candidateDistance: number;
  readonly currentDistance: number;
}

export interface EdgeSkippedClosedEvent extends BaseTraceEvent {
  readonly type: 'EDGE_SKIPPED_CLOSED';
  readonly edgeId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
}

export interface DistanceUpdatedEvent extends BaseTraceEvent {
  readonly type: 'DISTANCE_UPDATED';
  readonly nodeId: string;
  readonly previousDistance: number;
  readonly newDistance: number;
  readonly viaEdgeId: string;
  readonly viaNodeId: string;
}

export interface DistanceNotImprovedEvent extends BaseTraceEvent {
  readonly type: 'DISTANCE_NOT_IMPROVED';
  readonly nodeId: string;
  readonly candidateDistance: number;
  readonly existingDistance: number;
}

export interface DestinationReachedEvent extends BaseTraceEvent {
  readonly type: 'DESTINATION_REACHED';
  readonly destinationId: string;
  readonly totalDistance: number;
}

export interface AlgorithmCompletedEvent extends BaseTraceEvent {
  readonly type: 'ALGORITHM_COMPLETED';
  readonly status: AlgorithmStatus;
  readonly totalDistance: number;
  readonly hopCount: number;
}

export interface DestinationUnreachableEvent extends BaseTraceEvent {
  readonly type: 'DESTINATION_UNREACHABLE';
  readonly destinationId: string;
}

export interface NodeEnqueuedEvent extends BaseTraceEvent {
  readonly type: 'NODE_ENQUEUED';
  readonly nodeId: string;
  readonly hopCount: number;
  readonly viaEdgeId: string;
}

export interface NodeDequeuedEvent extends BaseTraceEvent {
  readonly type: 'NODE_DEQUEUED';
  readonly nodeId: string;
  readonly hopCount: number;
}

export type TraceEvent =
  | AlgorithmStartedEvent
  | SourceInitialisedEvent
  | NodeSelectedEvent
  | StaleEntrySkippedEvent
  | NodeFinalisedEvent
  | EdgeExaminedEvent
  | EdgeSkippedClosedEvent
  | DistanceUpdatedEvent
  | DistanceNotImprovedEvent
  | DestinationReachedEvent
  | AlgorithmCompletedEvent
  | DestinationUnreachableEvent
  | NodeEnqueuedEvent
  | NodeDequeuedEvent;

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type TraceEventInput = DistributiveOmit<TraceEvent, 'stepIndex'>;

export interface AlgorithmResult {
  readonly algorithm: AlgorithmType;
  readonly sourceId: string;
  readonly destinationId: string;
  readonly status: AlgorithmStatus;
  readonly route: ReconstructedRoute;
  readonly totalDistance: number;
  readonly hopCount: number;
  readonly counters: AlgorithmCounters;
  readonly trace: readonly TraceEvent[];
  readonly message: string;
  readonly errorDetails?: string;
}
