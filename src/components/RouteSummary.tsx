import React from 'react';
import { AlgorithmResult } from '../algorithms/types';
import { JourneyBaseline } from '../hooks/useSmartRoute';
import { BASE_GRAPH } from '../graph/graphData';
import { getNodeById } from '../graph/graphUtils';
import { formatKm, formatHops } from '../utils/formatters';

interface RouteSummaryProps {
  readonly currentResult: AlgorithmResult | null;
  readonly baselineResult: JourneyBaseline | null;
  readonly isRouteStale: boolean;
  readonly comparisonNote: string;
  readonly onRecalculate: () => void;
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({
  currentResult,
  baselineResult,
  isRouteStale,
  comparisonNote,
  onRecalculate,
}) => {
  if (!currentResult) {
    return (
      <div className="panel-card" role="region" aria-label="Route Summary">
        <div className="card-title">
          <span>Route Summary</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          No route computed yet. Select endpoints and click &quot;Find Shortest Route&quot; or &quot;Load Default Demo&quot;.
        </p>
      </div>
    );
  }

  const { status, totalDistance, hopCount, route, message } = currentResult;

  // Comparison logic against baseline
  let deltaText: string | null = null;
  let deltaColor: string = 'var(--text-secondary)';
  let routeChangedText: string | null = null;

  if (baselineResult && baselineResult.result.status === 'FOUND') {
    const prevDist = baselineResult.result.totalDistance;
    const prevHops = baselineResult.result.hopCount;
    const prevPath = baselineResult.result.route.path;

    if (status === 'UNREACHABLE') {
      deltaText = 'Route became UNREACHABLE due to road closures.';
      deltaColor = 'var(--color-closed)';
      routeChangedText = 'Yes (no path remains)';
    } else if (status === 'FOUND') {
      const diffDist = Math.round((totalDistance - prevDist) * 10) / 10;
      const diffHops = hopCount - prevHops;
      const pathChanged = JSON.stringify(prevPath) !== JSON.stringify(route.path);

      if (diffDist > 0) {
        deltaText = `+${diffDist.toFixed(1)} km longer than previous route (${formatKm(prevDist)} → ${formatKm(totalDistance)}).`;
        deltaColor = 'var(--color-examined)';
      } else if (diffDist < 0) {
        deltaText = `${diffDist.toFixed(1)} km shorter than previous route (${formatKm(prevDist)} → ${formatKm(totalDistance)}).`;
        deltaColor = 'var(--color-settled)';
      } else {
        deltaText = `Distance unchanged (${formatKm(totalDistance)}).`;
      }

      routeChangedText = pathChanged
        ? `Yes (diverted to alternate roads, ${diffHops >= 0 ? `+${diffHops}` : diffHops} hops)`
        : 'No (same route sequence)';
    }
  }

  return (
    <div className="panel-card" role="region" aria-label="Route Summary and Comparison">
      <div className="card-title">
        <span>Route Summary</span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor:
              status === 'FOUND'
                ? 'rgba(34, 197, 94, 0.15)'
                : status === 'UNREACHABLE'
                ? 'rgba(244, 63, 94, 0.15)'
                : 'rgba(56, 189, 248, 0.15)',
            color:
              status === 'FOUND'
                ? 'var(--color-start)'
                : status === 'UNREACHABLE'
                ? 'var(--color-closed)'
                : 'var(--color-route)',
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      </div>

      {/* Stale Route Prompt Banner */}
      {isRouteStale && (
        <div className="stale-banner" role="alert">
          <div>
            <strong>Road network changed!</strong> Closures modified since calculation.
          </div>
          <button
            className="btn-secondary"
            style={{
              padding: '2px 8px',
              fontSize: '0.72rem',
              backgroundColor: 'var(--color-examined)',
              color: '#090e17',
              fontWeight: 'bold',
            }}
            onClick={onRecalculate}
          >
            Recalculate
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Simulated Distance</span>
          <span className="metric-val">
            {status === 'UNREACHABLE' ? '∞' : formatKm(totalDistance)}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Road Segments</span>
          <span className="metric-val">{formatHops(hopCount)}</span>
        </div>
      </div>

      {/* Status Description Message */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '6px 10px',
          borderRadius: '4px',
        }}
      >
        {message}
      </div>

      {/* Comparison against Baseline Journey */}
      {deltaText && (
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '0.72rem',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Rerouting Impact Analysis:
          </div>
          <div style={{ color: deltaColor, marginBottom: '2px' }}>{deltaText}</div>
          {routeChangedText && (
            <div style={{ color: 'var(--text-muted)' }}>
              Path Changed: <strong>{routeChangedText}</strong>
            </div>
          )}
        </div>
      )}

      {comparisonNote && (
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {comparisonNote}
        </div>
      )}

      {/* Ordered Stops List */}
      {status === 'FOUND' && route.path.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            Turn-by-Turn Sequence ({route.path.length} locations):
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxHeight: '130px',
              overflowY: 'auto',
              fontSize: '0.72rem',
              paddingRight: '4px',
            }}
          >
            {route.path.map((nodeId, idx) => {
              const node = getNodeById(BASE_GRAPH.nodes, nodeId);
              const step = idx > 0 ? route.steps[idx - 1] : undefined;
              return (
                <div
                  key={nodeId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 6px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${
                      idx === 0
                        ? 'var(--color-start)'
                        : idx === route.path.length - 1
                        ? 'var(--color-dest)'
                        : 'var(--color-route)'
                    }`,
                  }}
                >
                  <span>
                    <strong>{idx + 1}.</strong> {node?.name ?? nodeId}
                  </span>
                  {step && (
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      +{step.weight.toFixed(1)} km
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
