import React, { useState, useCallback } from 'react';
import { BASE_GRAPH } from '../graph/graphData';
import { buildAdjacencyList } from '../graph/graphUtils';
import { dijkstra } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';

interface RuntimeBenchmarkProps {
  readonly sourceId: string;
  readonly destinationId: string;
  readonly closedEdges: ReadonlySet<string>;
}

export const RuntimeBenchmark: React.FC<RuntimeBenchmarkProps> = ({
  sourceId,
  destinationId,
  closedEdges,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [dijkstraMedianMs, setDijkstraMedianMs] = useState<number | null>(null);
  const [bfsMedianMs, setBfsMedianMs] = useState<number | null>(null);

  const runBenchmark = useCallback(() => {
    setIsRunning(true);
    // Allow UI to render loading state
    setTimeout(() => {
      const adj = buildAdjacencyList(BASE_GRAPH);
      const REPETITIONS = 200;

      // Dijkstra benchmark
      const dijkstraTimes: number[] = [];
      for (let i = 0; i < REPETITIONS; i++) {
        const t0 = performance.now();
        dijkstra(adj, closedEdges, sourceId, destinationId);
        const t1 = performance.now();
        dijkstraTimes.push(t1 - t0);
      }
      dijkstraTimes.sort((a, b) => a - b);
      const dMed = dijkstraTimes[Math.floor(REPETITIONS / 2)] ?? 0;

      // BFS benchmark
      const bfsTimes: number[] = [];
      for (let i = 0; i < REPETITIONS; i++) {
        const t0 = performance.now();
        bfs(adj, closedEdges, sourceId, destinationId);
        const t1 = performance.now();
        bfsTimes.push(t1 - t0);
      }
      bfsTimes.sort((a, b) => a - b);
      const bMed = bfsTimes[Math.floor(REPETITIONS / 2)] ?? 0;

      setDijkstraMedianMs(dMed);
      setBfsMedianMs(bMed);
      setIsRunning(false);
    }, 20);
  }, [sourceId, destinationId, closedEdges]);

  return (
    <div className="panel-card" role="region" aria-label="Micro-Benchmark Runtime Analysis">
      <div className="card-title">
        <span>Empirical Runtime Benchmark</span>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Measures median browser JavaScript execution latency over 200 un-animated iterations on
        active journey.
      </p>

      <button
        className="btn-secondary"
        onClick={runBenchmark}
        disabled={isRunning}
        style={{ width: '100%', marginTop: '4px' }}
      >
        {isRunning ? 'Benchmarking 200 Iterations...' : 'Run 200-Iteration Microbenchmark'}
      </button>

      {dijkstraMedianMs !== null && bfsMedianMs !== null && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 8px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '4px',
            }}
          >
            <span>Dijkstra Median Latency:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-route)' }}>
              {dijkstraMedianMs < 0.01 ? '< 0.01 ms' : `${dijkstraMedianMs.toFixed(3)} ms`}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              padding: '4px 8px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '4px',
            }}
          >
            <span>BFS Median Latency:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
              {bfsMedianMs < 0.01 ? '< 0.01 ms' : `${bfsMedianMs.toFixed(3)} ms`}
            </span>
          </div>
        </div>
      )}

      {/* Mandatory Benchmark Disclaimer */}
      <div
        style={{
          marginTop: '6px',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          borderLeft: '2px solid var(--color-examined)',
          paddingLeft: '6px',
          fontStyle: 'italic',
        }}
      >
        Measured browser runtime — affected by hardware, browser load and timer resolution. Never
        use it to claim one algorithm is faster. Prefer operation counts for the comparison.
      </div>
    </div>
  );
};
