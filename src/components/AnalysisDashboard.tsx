import React from 'react';
import { AlgorithmCounters } from '../algorithms/types';
import { BASE_GRAPH } from '../graph/graphData';

interface AnalysisDashboardProps {
  readonly counters?: AlgorithmCounters;
  readonly closedEdgesCount: number;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  counters,
  closedEdgesCount,
}) => {
  const totalVertices = BASE_GRAPH.nodes.length;
  const totalEdges = BASE_GRAPH.edges.length;
  const openEdges = totalEdges - closedEdgesCount;

  return (
    <div className="panel-card" role="region" aria-label="Analysis and Execution Statistics">
      <div className="card-title">
        <span>Execution Metrics</span>
      </div>

      {/* Network Topology Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          backgroundColor: 'var(--bg-secondary)',
          padding: '8px',
          borderRadius: '6px',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Locations (V)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#f8fafc' }}>
            {totalVertices}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Roads (E)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#f8fafc' }}>
            {totalEdges}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Open</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-start)' }}>
            {openEdges}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Closed</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-closed)' }}>
            {closedEdgesCount}
          </div>
        </div>
      </div>

      {/* Execution Instrumentation Counters */}
      {counters ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            title="Number of vertices whose minimal shortest distance was finalized and settled"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Nodes Finalised:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#f8fafc' }}>
              {counters.nodesFinalised}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            title="Number of times an open road adjacent to a settled node was inspected"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Edges Examined:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#f8fafc' }}>
              {counters.edgesExamined}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            title="Number of successful distance improvements (edge relaxations)"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Distance Relaxations:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-route)' }}>
              {counters.relaxations}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            title="Sub-optimal heap entries discarded via lazy deletion after the node was already settled"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Stale Entries Skipped:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-examined)' }}>
              {counters.staleEntriesSkipped}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            title="Edges that were closed and skipped before examining neighbor weights"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Closed Roads Skipped:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-closed)' }}>
              {counters.closedEdgesSkipped}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            title="Heap operations (pushes / pops)"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Heap Ops (Pushes / Pops):</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#f8fafc' }}>
              {counters.heapPushes} / {counters.heapPops}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 0',
            }}
            title="Total number of granular trace events generated during this algorithm run"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Total Trace Steps:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
              {counters.totalSteps}
            </span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Run an algorithm to record instrumented execution counters.
        </p>
      )}
    </div>
  );
};
