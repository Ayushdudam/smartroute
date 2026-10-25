import React, { useEffect, useRef } from 'react';
import { TraceEvent } from '../algorithms/types';

interface ExecutionLogProps {
  readonly trace: readonly TraceEvent[];
  readonly currentStep: number;
  readonly onGoToStep: (step: number) => void;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({
  trace,
  currentStep,
  onGoToStep,
}) => {
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStep]);

  if (trace.length === 0) {
    return (
      <div className="panel-card" role="region" aria-label="Execution Trace Log">
        <div className="card-title">
          <span>Execution Log</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Run an algorithm to record and inspect granular trace events.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card" role="region" aria-label="Execution Trace Log">
      <div className="card-title">
        <span>Execution Trace Log</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          Step {Math.max(0, currentStep + 1)} of {trace.length}
        </span>
      </div>

      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        Click any log entry to jump the simulation state directly to that step.
      </div>

      <div className="trace-log-list" tabIndex={0} aria-label="Trace event list">
        {trace.map((evt, idx) => {
          const isActive = idx === currentStep;
          return (
            <div
              key={idx}
              ref={isActive ? activeItemRef : null}
              className={`trace-log-item ${isActive ? 'active' : ''}`}
              onClick={() => onGoToStep(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onGoToStep(idx);
                }
              }}
              aria-label={`Step ${idx + 1}: ${evt.description}`}
            >
              <span style={{ color: isActive ? 'var(--color-route)' : '#64748b', minWidth: '24px' }}>
                #{idx + 1}
              </span>
              <span>{evt.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
