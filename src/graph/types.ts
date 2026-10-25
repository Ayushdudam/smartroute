/**
 * SmartRoute Graph Types
 * Undirected weighted road network representation for educational algorithm analysis.
 */

export interface LocationNode {
  readonly id: string;
  readonly name: string;
  readonly area: string;
  readonly x: number;
  readonly y: number;
  readonly labelOffset?: {
    readonly dx: number;
    readonly dy: number;
  };
}

export interface RoadEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly weight: number; // illustrative distance in km (positive number, 1 decimal place)
  readonly label?: string;
}

export interface BaseGraphData {
  readonly nodes: readonly LocationNode[];
  readonly edges: readonly RoadEdge[];
}

export interface AdjacencyEntry {
  readonly neighbor: string;
  readonly edgeId: string;
  readonly weight: number;
}

export type AdjacencyList = ReadonlyMap<string, readonly AdjacencyEntry[]>;

export interface GraphView {
  readonly nodes: readonly LocationNode[];
  readonly edges: readonly RoadEdge[];
  readonly closedEdges: ReadonlySet<string>;
  readonly adjacencyList: AdjacencyList;
}

export interface GraphValidationError {
  readonly code:
    | 'DUPLICATE_NODE_ID'
    | 'DUPLICATE_EDGE_ID'
    | 'MISSING_NODE_ENDPOINT'
    | 'SELF_LOOP'
    | 'PARALLEL_EDGE'
    | 'INVALID_WEIGHT'
    | 'MISSING_COORDINATES'
    | 'OUT_OF_BOUNDS_COORDINATES'
    | 'DISCONNECTED_GRAPH';
  readonly message: string;
  readonly entityId?: string;
}

export interface GraphValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly GraphValidationError[];
}
