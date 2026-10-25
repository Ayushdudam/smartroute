import React, { useMemo } from 'react';
import { BASE_GRAPH } from '../graph/graphData';
import { buildAdjacencyList, getNodeById } from '../graph/graphUtils';
import { dijkstra } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import { formatKm, formatHops } from '../utils/formatters';

interface ComparisonPanelProps {
  readonly sourceId: string;
  readonly destinationId: string;
  readonly closedEdges: ReadonlySet<string>;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  sourceId,
  destinationId,
  closedEdges,
}) => {
  const adj = useMemo(() => buildAdjacencyList(BASE_GRAPH), []);

  const dijkstraResult = useMemo(
    () => dijkstra(adj, closedEdges, sourceId, destinationId),
    [adj, closedEdges, sourceId, destinationId]
  );

  const bfsResult = useMemo(
    () => bfs(adj, closedEdges, sourceId, destinationId),
    [adj, closedEdges, sourceId, destinationId]
  );

  const fromNode = getNodeById(BASE_GRAPH.nodes, sourceId);
  const toNode = getNodeById(BASE_GRAPH.nodes, destinationId);

  // Dynamic explanation text
  let explanationText = '';
  if (dijkstraResult.status === 'UNREACHABLE' && bfsResult.status === 'UNREACHABLE') {
    explanationText = 'Both algorithms confirmed the destination is unreachable under current road closures.';
  } else if (dijkstraResult.status === 'SAME_NODE') {
    explanationText = 'Start and destination are identical; both algorithms terminate immediately with 0 distance and 0 hops.';
  } else if (dijkstraResult.status === 'FOUND' && bfsResult.status === 'FOUND') {
    const diffKm = Math.round((bfsResult.totalDistance - dijkstraResult.totalDistance) * 10) / 10;
    const diffHops = dijkstraResult.hopCount - bfsResult.hopCount;

    if (diffKm > 0 && diffHops > 0) {
      explanationText = `BFS found a route with ${diffHops} fewer ${
        diffHops === 1 ? 'road' : 'roads'
      } than Dijkstra, but its total distance is ${diffKm.toFixed(
        1
      )} km MORE (${formatKm(bfsResult.totalDistance)} vs ${formatKm(
        dijkstraResult.totalDistance
      )}), because BFS minimizes edge count only and ignores weights.`;
    } else if (diffKm === 0 && diffHops === 0) {
      explanationText =
        'Both algorithms found the exact same route and distance in this case. When the fewest-hop path is also the path with minimal accumulated weight, Dijkstra and BFS coincide.';
    } else if (diffKm > 0 && diffHops === 0) {
      explanationText = `Both routes have equal hop count (${dijkstraResult.hopCount} roads), but Dijkstra found an alternate corridor with ${diffKm.toFixed(
        1
      )} km lower cumulative distance.`;
    } else {
      explanationText = `Dijkstra identified the minimum distance path (${formatKm(
        dijkstraResult.totalDistance
      )}), while BFS prioritized minimum hop count (${formatHops(bfsResult.hopCount)}).`;
    }
  }

  // Max value for bar visual
  const maxEdgesExamined = Math.max(
    dijkstraResult.counters.edgesExamined,
    bfsResult.counters.edgesExamined,
    1
  );

  return (
    <div className="panel-card" role="region" aria-label="Dijkstra vs BFS Algorithm Comparison">
      <div className="card-title">
        <span>Algorithm Comparison: Dijkstra vs BFS</span>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Side-by-side evaluation for journey <strong>{fromNode?.name ?? sourceId}</strong> ➔{' '}
        <strong>{toNode?.name ?? destinationId}</strong> with identical active road closures ({closedEdges.size}).
      </div>

      {/* Comparison Table */}
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Dijkstra (Weighted)</th>
            <th>BFS (Fewest Hops)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Objective</td>
            <td>Minimise total distance (km)</td>
            <td>Minimise road count (hops)</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>
              <span
                style={{
                  color:
                    dijkstraResult.status === 'FOUND'
                      ? 'var(--color-start)'
                      : 'var(--color-closed)',
                  fontWeight: 600,
                }}
              >
                {dijkstraResult.status}
              </span>
            </td>
            <td>
              <span
                style={{
                  color:
                    bfsResult.status === 'FOUND'
                      ? 'var(--color-start)'
                      : 'var(--color-closed)',
                  fontWeight: 600,
                }}
              >
                {bfsResult.status}
              </span>
            </td>
          </tr>
          <tr>
            <td>Simulated Distance</td>
            <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-route)' }}>
              {formatKm(dijkstraResult.totalDistance)}
            </td>
            <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
              {formatKm(bfsResult.totalDistance)}
            </td>
          </tr>
          <tr>
            <td>Road Count (Hops)</td>
            <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {formatHops(dijkstraResult.hopCount)}
            </td>
            <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {formatHops(bfsResult.hopCount)}
            </td>
          </tr>
          <tr>
            <td>Edges Examined</td>
            <td style={{ fontFamily: 'monospace' }}>{dijkstraResult.counters.edgesExamined}</td>
            <td style={{ fontFamily: 'monospace' }}>{bfsResult.counters.edgesExamined}</td>
          </tr>
          <tr>
            <td>Nodes Settled</td>
            <td style={{ fontFamily: 'monospace' }}>{dijkstraResult.counters.nodesFinalised}</td>
            <td style={{ fontFamily: 'monospace' }}>{bfsResult.counters.nodesFinalised}</td>
          </tr>
        </tbody>
      </table>

      {/* Pure CSS/SVG Operation Bar Comparison */}
      <div style={{ marginTop: '4px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Edges Examined Comparison (Pure CSS Bars):
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '2px' }}>
              <span>Dijkstra ({dijkstraResult.counters.edgesExamined} ops)</span>
            </div>
            <div
              style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(dijkstraResult.counters.edgesExamined / maxEdgesExamined) * 100}%`,
                  backgroundColor: 'var(--color-route)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '2px' }}>
              <span>BFS ({bfsResult.counters.edgesExamined} ops)</span>
            </div>
            <div
              style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(bfsResult.counters.edgesExamined / maxEdgesExamined) * 100}%`,
                  backgroundColor: 'var(--accent-cyan)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pedagogical Explanation Card */}
      {explanationText && (
        <div
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            borderLeft: '3px solid var(--color-route)',
            borderRadius: '4px',
            padding: '8px 10px',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            marginTop: '4px',
          }}
        >
          <strong>Analysis:</strong> {explanationText}
        </div>
      )}
    </div>
  );
};
