import { AdjacencyEntry, AdjacencyList, BaseGraphData, GraphView, LocationNode, RoadEdge } from './types';

/**
 * Builds an immutable adjacency list from base graph data.
 * Neighbors are sorted by node ID to ensure absolute determinism.
 */
export function buildAdjacencyList(graph: BaseGraphData): AdjacencyList {
  const map = new Map<string, AdjacencyEntry[]>();

  for (const node of graph.nodes) {
    map.set(node.id, []);
  }

  for (const edge of graph.edges) {
    map.get(edge.from)?.push({
      neighbor: edge.to,
      edgeId: edge.id,
      weight: edge.weight,
    });
    map.get(edge.to)?.push({
      neighbor: edge.from,
      edgeId: edge.id,
      weight: edge.weight,
    });
  }

  // Freeze and sort arrays for determinism
  const frozenMap = new Map<string, readonly AdjacencyEntry[]>();
  for (const [nodeId, entries] of map.entries()) {
    entries.sort((a, b) => a.neighbor.localeCompare(b.neighbor));
    frozenMap.set(nodeId, Object.freeze([...entries]));
  }

  return frozenMap;
}

/**
 * Creates an immutable derived graph view with the active closed edge set.
 * Base graph data is NEVER mutated.
 */
export function createGraphView(
  graph: BaseGraphData,
  closedEdges: ReadonlySet<string> = new Set()
): GraphView {
  const adjacencyList = buildAdjacencyList(graph);

  return Object.freeze({
    nodes: graph.nodes,
    edges: graph.edges,
    closedEdges: new Set(closedEdges),
    adjacencyList,
  });
}

/**
 * Finds an edge between two node IDs in the base graph.
 */
export function findEdgeBetween(
  edges: readonly RoadEdge[],
  u: string,
  v: string
): RoadEdge | undefined {
  return edges.find(
    (e) => (e.from === u && e.to === v) || (e.from === v && e.to === u)
  );
}

/**
 * Looks up a node by id.
 */
export function getNodeById(
  nodes: readonly LocationNode[],
  id: string
): LocationNode | undefined {
  return nodes.find((n) => n.id === id);
}

/**
 * Looks up an edge by id.
 */
export function getEdgeById(
  edges: readonly RoadEdge[],
  id: string
): RoadEdge | undefined {
  return edges.find((e) => e.id === id);
}
