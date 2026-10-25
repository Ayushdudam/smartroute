import React from 'react';
import { AlgorithmType } from '../algorithms/types';

interface ComplexityPanelProps {
  readonly algorithm: AlgorithmType;
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ algorithm }) => {
  return (
    <div className="panel-card" role="region" aria-label="Complexity Analysis">
      <div className="card-title">
        <span>Asymptotic Complexity</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="complexity-row">
          <span style={{ color: 'var(--text-muted)' }}>Algorithm:</span>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>
            {algorithm === 'DIJKSTRA' ? "Dijkstra's Shortest Path" : 'Breadth-First Search (BFS)'}
          </span>
        </div>

        <div className="complexity-row">
          <span style={{ color: 'var(--text-muted)' }}>Data Structures:</span>
          <span style={{ color: '#cbd5e1', textAlign: 'right' }}>
            {algorithm === 'DIJKSTRA'
              ? 'Adjacency List + Binary Min-Heap (Lazy Deletion)'
              : 'Adjacency List + FIFO Queue + Visited Set'}
          </span>
        </div>

        <div className="complexity-row">
          <span style={{ color: 'var(--text-muted)' }}>Time Complexity:</span>
          <span className="complexity-code">
            {algorithm === 'DIJKSTRA' ? 'O((V + E) log V)' : 'O(V + E)'}
          </span>
        </div>

        <div className="complexity-row">
          <span style={{ color: 'var(--text-muted)' }}>Auxiliary Space:</span>
          <span className="complexity-code">
            {algorithm === 'DIJKSTRA' ? 'O(V + E)' : 'O(V)'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '8px 10px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '4px',
          }}
        >
          <div>
            <strong>Parameters:</strong> <code>V = 25</code> vertices (Mumbai road intersections/locations); <code>E = 41</code> edges (road connections).
          </div>
          <div>
            {algorithm === 'DIJKSTRA' ? (
              <span>
                With lazy deletion, each vertex is settled once (<code>V</code> pops), and each
                relaxation can push an entry into the heap (up to <code>E</code> pushes). Popping
                from a heap of size &le; <code>E</code> takes <code>O(log E) = O(log V)</code> time,
                yielding <code>O((V + E) log V)</code>.
              </span>
            ) : (
              <span>
                BFS traverses each vertex once and each open undirected edge at most twice
                (once from each endpoint), yielding linear <code>O(V + E)</code> time.
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
            Note: Big-O represents asymptotic theoretical worst-case growth. Concrete operation
            counts in this dashboard reflect this specific small educational network.
          </div>
        </div>
      </div>
    </div>
  );
};
