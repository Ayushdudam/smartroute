import React from 'react';
import { RoadEdge } from '../graph/types';
import { BASE_GRAPH } from '../graph/graphData';
import { getNodeById } from '../graph/graphUtils';

interface RoadInspectorProps {
  readonly selectedEdge: RoadEdge | undefined;
  readonly closedEdges: ReadonlySet<string>;
  readonly currentRouteEdgeIds: ReadonlySet<string>;
  readonly onCloseRoad: (edgeId: string) => void;
  readonly onReopenRoad: (edgeId: string) => void;
  readonly onResetAllClosures: () => void;
  readonly onSelectEdge: (edgeId: string) => void;
}

export const RoadInspector: React.FC<RoadInspectorProps> = ({
  selectedEdge,
  closedEdges,
  currentRouteEdgeIds,
  onCloseRoad,
  onReopenRoad,
  onResetAllClosures,
  onSelectEdge,
}) => {
  const fromNode = selectedEdge ? getNodeById(BASE_GRAPH.nodes, selectedEdge.from) : undefined;
  const toNode = selectedEdge ? getNodeById(BASE_GRAPH.nodes, selectedEdge.to) : undefined;
  const isSelectedClosed = selectedEdge ? closedEdges.has(selectedEdge.id) : false;
  const isOnRoute = selectedEdge ? currentRouteEdgeIds.has(selectedEdge.id) : false;

  const closedEdgeObjects = Array.from(closedEdges)
    .map((id) => BASE_GRAPH.edges.find((e) => e.id === id))
    .filter((e): e is RoadEdge => e !== undefined);

  return (
    <div className="panel-card" role="region" aria-label="Road Inspector and Closures">
      <div className="card-title">
        <span>Road Inspector</span>
        {closedEdges.size > 0 && (
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-closed)',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {closedEdges.size} Closed
          </span>
        )}
      </div>

      {selectedEdge && fromNode && toNode ? (
        <div className="inspector-detail">
          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
            {selectedEdge.label ?? selectedEdge.id}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Endpoints: <strong>{fromNode.name}</strong> ↔ <strong>{toNode.name}</strong>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Illustrative Distance: <strong>{selectedEdge.weight.toFixed(1)} km</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '3px',
                backgroundColor: isSelectedClosed
                  ? 'rgba(244, 63, 94, 0.2)'
                  : 'rgba(34, 197, 94, 0.2)',
                color: isSelectedClosed ? 'var(--color-closed)' : 'var(--color-start)',
                fontWeight: 600,
              }}
            >
              Status: {isSelectedClosed ? 'CLOSED' : 'OPEN'}
            </span>
            {isOnRoute && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(56, 189, 248, 0.2)',
                  color: 'var(--color-route)',
                  fontWeight: 600,
                }}
              >
                On Active Route
              </span>
            )}
          </div>

          <div style={{ marginTop: '8px' }}>
            {isSelectedClosed ? (
              <button
                className="btn-secondary"
                style={{
                  width: '100%',
                  borderColor: 'var(--color-start)',
                  color: 'var(--color-start)',
                }}
                onClick={() => onReopenRoad(selectedEdge.id)}
              >
                Reopen This Road
              </button>
            ) : (
              <button
                className="btn-secondary"
                style={{
                  width: '100%',
                  borderColor: 'var(--color-closed)',
                  color: 'var(--color-closed)',
                }}
                onClick={() => onCloseRoad(selectedEdge.id)}
              >
                Close This Road
              </button>
            )}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click any road on the map to inspect its properties, view closure status, or simulate a
          road closure.
        </p>
      )}

      {/* Closed Roads List */}
      <div style={{ marginTop: '4px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Active Closures ({closedEdges.size})
          </span>
          {closedEdges.size > 0 && (
            <button
              className="btn-secondary"
              style={{ fontSize: '0.68rem', padding: '2px 6px' }}
              onClick={onResetAllClosures}
            >
              Reset All Closures
            </button>
          )}
        </div>

        {closedEdgeObjects.length === 0 ? (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            All roads are currently open.
          </p>
        ) : (
          <div className="closed-list">
            {closedEdgeObjects.map((e) => (
              <div key={e.id} className="closed-item">
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => onSelectEdge(e.id)}
                  title="Click to highlight on map"
                >
                  {e.label ?? e.id} ({e.weight} km)
                </span>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                  onClick={() => onReopenRoad(e.id)}
                >
                  Reopen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
