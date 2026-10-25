import React from 'react';
import { AlgorithmType } from '../algorithms/types';

interface AlgorithmControlsProps {
  readonly algorithm: AlgorithmType;
  readonly onSetAlgorithm: (algo: AlgorithmType) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  algorithm,
  onSetAlgorithm,
}) => {
  return (
    <div className="panel-card" role="region" aria-label="Algorithm Selection">
      <div className="card-title">
        <span>Routing Algorithm</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          className={`btn-secondary ${algorithm === 'DIJKSTRA' ? 'primary' : ''}`}
          style={{
            padding: '8px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderColor: algorithm === 'DIJKSTRA' ? 'var(--color-route)' : 'var(--border-default)',
            backgroundColor:
              algorithm === 'DIJKSTRA' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-elevated)',
          }}
          onClick={() => onSetAlgorithm('DIJKSTRA')}
        >
          <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: '#f8fafc' }}>
            Dijkstra's Algorithm
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Shortest weighted distance
          </div>
        </button>

        <button
          className={`btn-secondary ${algorithm === 'BFS' ? 'primary' : ''}`}
          style={{
            padding: '8px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderColor: algorithm === 'BFS' ? 'var(--color-route)' : 'var(--border-default)',
            backgroundColor:
              algorithm === 'BFS' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-elevated)',
          }}
          onClick={() => onSetAlgorithm('BFS')}
        >
          <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: '#f8fafc' }}>
            Breadth-First Search
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Fewest roads (hops)
          </div>
        </button>
      </div>

      {algorithm === 'BFS' && (
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderLeft: '3px solid var(--accent-primary)',
            padding: '8px 10px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
          }}
        >
          <strong>Pedagogical Principle:</strong> BFS minimises the number of roads (hops), not
          total distance. On a weighted graph its route can be longer than Dijkstra&apos;s.
        </div>
      )}
    </div>
  );
};
