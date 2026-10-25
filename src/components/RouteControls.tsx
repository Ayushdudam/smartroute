import React, { useState } from 'react';
import { BASE_GRAPH } from '../graph/graphData';
import { AlgorithmResult } from '../algorithms/types';
import {
  findDeterministicDemoClosureEdge,
  groupNodesByArea,
} from '../utils/formatters';

interface RouteControlsProps {
  readonly sourceId: string;
  readonly destinationId: string;
  readonly currentResult: AlgorithmResult | null;
  readonly closedEdges: ReadonlySet<string>;
  readonly onSetSource: (id: string) => void;
  readonly onSetDestination: (id: string) => void;
  readonly onSwapEndpoints: () => void;
  readonly onFindRoute: () => void;
  readonly onResetJourney: () => void;
  readonly onCloseRoad: (edgeId: string) => void;
}

export const RouteControls: React.FC<RouteControlsProps> = ({
  sourceId,
  destinationId,
  currentResult,
  closedEdges,
  onSetSource,
  onSetDestination,
  onSwapEndpoints,
  onFindRoute,
  onResetJourney,
  onCloseRoad,
}) => {
  const [showDemoChooser, setShowDemoChooser] = useState(false);
  const groupedNodes = groupNodesByArea(BASE_GRAPH.nodes);

  // Compute deterministic suggestion for demo mode
  const currentRouteEdgeIds = currentResult?.route.steps.map((s) => s.edgeId) ?? [];
  const demoAnalysis = findDeterministicDemoClosureEdge(
    BASE_GRAPH,
    currentRouteEdgeIds,
    closedEdges,
    sourceId,
    destinationId
  );

  return (
    <div className="panel-card" role="region" aria-label="Route Selection and Planning Controls">
      <div className="card-title">
        <span>Route Selection</span>
      </div>

      {/* Start Location Dropdown */}
      <div className="control-group">
        <label htmlFor="source-select" className="control-label">
          <span>Start Location (A)</span>
        </label>
        <select
          id="source-select"
          className="select-input"
          value={sourceId}
          onChange={(e) => onSetSource(e.target.value)}
        >
          {Object.entries(groupedNodes).map(([area, nodes]) => (
            <optgroup key={area} label={area}>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Swap Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn-secondary"
          onClick={onSwapEndpoints}
          title="Swap start and destination locations"
          aria-label="Swap start and destination"
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
            <polyline points="17 14 12 9 7 14" />
            <line x1="12" y1="9" x2="12" y2="21" />
          </svg>
          Swap Endpoints
        </button>
      </div>

      {/* Destination Location Dropdown */}
      <div className="control-group">
        <label htmlFor="destination-select" className="control-label">
          <span>Destination Location (B)</span>
        </label>
        <select
          id="destination-select"
          className="select-input"
          value={destinationId}
          onChange={(e) => onSetDestination(e.target.value)}
        >
          {Object.entries(groupedNodes).map(([area, nodes]) => (
            <optgroup key={area} label={area}>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="action-row" style={{ marginTop: '4px' }}>
        <button
          className="btn-cta"
          onClick={onFindRoute}
          style={{ flex: 1 }}
          aria-label="Calculate shortest route"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Find Shortest Route
        </button>
        <button
          className="btn-secondary"
          onClick={onResetJourney}
          title="Clear current route and reset search"
        >
          Clear
        </button>
      </div>

      {/* Demo Mode Button */}
      {currentResult && currentResult.status === 'FOUND' && currentRouteEdgeIds.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => setShowDemoChooser(!showDemoChooser)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              color: '#fef3c7',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            Demo Mode: Close a Road on Current Route
          </button>

          {showDemoChooser && (
            <div
              style={{
                marginTop: '8px',
                padding: '10px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                fontSize: '0.75rem',
              }}
            >
              <p style={{ color: 'var(--color-examined)', marginBottom: '6px', fontWeight: 600 }}>
                {demoAnalysis.reason}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {demoAnalysis.candidateList.map((cand) => (
                  <div
                    key={cand.edgeId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: '4px',
                    }}
                  >
                    <span>
                      <strong>{cand.edgeId}</strong> ({cand.from} ↔ {cand.to})
                      {cand.wouldRemainReachable ? (
                        <span style={{ color: 'var(--color-settled)', marginLeft: '6px' }}>
                          (Alt: {cand.alternateDist?.toFixed(1)} km)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-closed)', marginLeft: '6px' }}>
                          (Becomes Unreachable)
                        </span>
                      )}
                    </span>
                    <button
                      className="btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                      onClick={() => {
                        onCloseRoad(cand.edgeId);
                        setShowDemoChooser(false);
                      }}
                    >
                      Close Road
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
