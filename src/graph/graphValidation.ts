import { BaseGraphData, GraphValidationError, GraphValidationResult } from './types';
import { CANVAS_BOUNDS } from './graphData';

/**
 * Validates graph data according to strict integrity rules:
 * - Unique node and edge IDs
 * - Valid endpoint references
 * - No self-loops or parallel edges
 * - Strictly positive finite weights
 * - Coordinates within bounding box
 * - Global graph connectivity
 */
export function validateGraph(
  graph: BaseGraphData,
  options: { allowDisconnected?: boolean } = {}
): GraphValidationResult {
  const errors: GraphValidationError[] = [];
  const nodeIds = new Set<string>();

  // 1. Validate Nodes
  for (const node of graph.nodes) {
    if (!node.id || node.id.trim() === '') {
      errors.push({
        code: 'MISSING_NODE_ENDPOINT',
        message: 'A node has an empty or missing id.',
      });
      continue;
    }

    if (nodeIds.has(node.id)) {
      errors.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node id detected: "${node.id}".`,
        entityId: node.id,
      });
    }
    nodeIds.add(node.id);

    if (
      typeof node.x !== 'number' ||
      typeof node.y !== 'number' ||
      !Number.isFinite(node.x) ||
      !Number.isFinite(node.y)
    ) {
      errors.push({
        code: 'MISSING_COORDINATES',
        message: `Node "${node.id}" has invalid or missing coordinates.`,
        entityId: node.id,
      });
    } else {
      const minX = CANVAS_BOUNDS.padding;
      const maxX = CANVAS_BOUNDS.width - CANVAS_BOUNDS.padding;
      const minY = CANVAS_BOUNDS.padding;
      const maxY = CANVAS_BOUNDS.height - CANVAS_BOUNDS.padding;

      if (node.x < minX || node.x > maxX || node.y < minY || node.y > maxY) {
        errors.push({
          code: 'OUT_OF_BOUNDS_COORDINATES',
          message: `Node "${node.id}" coordinates (${node.x}, ${node.y}) fall outside bounds [${minX}-${maxX}, ${minY}-${maxY}].`,
          entityId: node.id,
        });
      }
    }
  }

  // 2. Validate Edges
  const edgeIds = new Set<string>();
  const seenPairs = new Set<string>();

  for (const edge of graph.edges) {
    if (!edge.id || edge.id.trim() === '') {
      errors.push({
        code: 'DUPLICATE_EDGE_ID',
        message: 'An edge has an empty or missing id.',
      });
      continue;
    }

    if (edgeIds.has(edge.id)) {
      errors.push({
        code: 'DUPLICATE_EDGE_ID',
        message: `Duplicate edge id detected: "${edge.id}".`,
        entityId: edge.id,
      });
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.from)) {
      errors.push({
        code: 'MISSING_NODE_ENDPOINT',
        message: `Edge "${edge.id}" references missing 'from' node: "${edge.from}".`,
        entityId: edge.id,
      });
    }

    if (!nodeIds.has(edge.to)) {
      errors.push({
        code: 'MISSING_NODE_ENDPOINT',
        message: `Edge "${edge.id}" references missing 'to' node: "${edge.to}".`,
        entityId: edge.id,
      });
    }

    if (edge.from === edge.to) {
      errors.push({
        code: 'SELF_LOOP',
        message: `Edge "${edge.id}" is a self-loop on node "${edge.from}".`,
        entityId: edge.id,
      });
    }

    const pairKey = [edge.from, edge.to].sort().join(':::');
    if (seenPairs.has(pairKey)) {
      errors.push({
        code: 'PARALLEL_EDGE',
        message: `Parallel edge detected between "${edge.from}" and "${edge.to}" (edge "${edge.id}").`,
        entityId: edge.id,
      });
    }
    seenPairs.add(pairKey);

    if (
      typeof edge.weight !== 'number' ||
      !Number.isFinite(edge.weight) ||
      Number.isNaN(edge.weight) ||
      edge.weight <= 0
    ) {
      errors.push({
        code: 'INVALID_WEIGHT',
        message: `Edge "${edge.id}" has invalid weight: ${edge.weight}. Must be a strictly positive finite number.`,
        entityId: edge.id,
      });
    }
  }

  // 3. Validate Graph Connectivity (unless explicitly allowed disconnected for test fixtures)
  if (!options.allowDisconnected && graph.nodes.length > 1 && errors.length === 0) {
    const adj = new Map<string, string[]>();
    for (const node of graph.nodes) {
      adj.set(node.id, []);
    }
    for (const edge of graph.edges) {
      adj.get(edge.from)?.push(edge.to);
      adj.get(edge.to)?.push(edge.from);
    }

    const firstNode = graph.nodes[0]!.id;
    const visited = new Set<string>([firstNode]);
    const queue = [firstNode];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const neighbor of adj.get(curr) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    if (visited.size !== graph.nodes.length) {
      errors.push({
        code: 'DISCONNECTED_GRAPH',
        message: `Graph is disconnected. Visited ${visited.size} of ${graph.nodes.length} nodes from "${firstNode}".`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
