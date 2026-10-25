import React from 'react';
import { TraceEvent } from '../algorithms/types';
import { SimulationSpeed } from '../simulation/simulationController';

interface SimulationBarProps {
  readonly trace: readonly TraceEvent[];
  readonly currentStep: number;
  readonly isPlaying: boolean;
  readonly speed: SimulationSpeed;
  readonly statusMessage: string;
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onNextStep: () => void;
  readonly onPrevStep: () => void;
  readonly onResetStep: () => void;
  readonly onJumpToEnd: () => void;
  readonly onGoToStep: (step: number) => void;
  readonly onSetSpeed: (speed: SimulationSpeed) => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  trace,
  currentStep,
  isPlaying,
  speed,
  statusMessage,
  onPlay,
  onPause,
  onNextStep,
  onPrevStep,
  onResetStep,
  onJumpToEnd,
  onGoToStep,
  onSetSpeed,
}) => {
  const totalSteps = trace.length;
  const hasTrace = totalSteps > 0;
  const isAtStart = currentStep <= 0;
  const isAtEnd = currentStep >= totalSteps - 1;

  return (
    <div className="simulation-bar" role="region" aria-label="Algorithm Simulation Controls">
      <div className="sim-controls-row">
        {/* Playback Button Group */}
        <div className="sim-buttons-group">
          {isPlaying ? (
            <button
              className="sim-btn primary"
              onClick={onPause}
              disabled={!hasTrace}
              title="Pause animation"
              aria-label="Pause execution animation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Pause
            </button>
          ) : (
            <button
              className="sim-btn primary"
              onClick={onPlay}
              disabled={!hasTrace}
              title="Play trace animation"
              aria-label="Play execution animation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Play
            </button>
          )}

          <button
            className="sim-btn"
            onClick={onPrevStep}
            disabled={!hasTrace || isAtStart}
            title="Step backward"
            aria-label="Previous step"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Prev
          </button>

          <button
            className="sim-btn"
            onClick={onNextStep}
            disabled={!hasTrace || isAtEnd}
            title="Step forward"
            aria-label="Next step"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="sim-btn"
            onClick={onResetStep}
            disabled={!hasTrace}
            title="Reset step to start"
            aria-label="Reset animation to start"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Reset
          </button>

          <button
            className="sim-btn"
            onClick={onJumpToEnd}
            disabled={!hasTrace || isAtEnd}
            title="Jump straight to completed route"
            aria-label="Jump to end"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
            </svg>
            End
          </button>
        </div>

        {/* Step Slider & Counter */}
        <div className="sim-scrubber-wrap">
          <input
            type="range"
            className="sim-slider"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={Math.max(0, currentStep)}
            disabled={!hasTrace}
            onChange={(e) => onGoToStep(parseInt(e.target.value, 10))}
            aria-label="Simulation step scrubber"
          />
          <span className="sim-counter-badge">
            {hasTrace ? `Step ${Math.max(0, currentStep + 1)} / ${totalSteps}` : 'Step 0 / 0'}
          </span>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Speed:</span>
          <select
            className="sim-speed-select"
            value={speed}
            onChange={(e) => {
              const val = e.target.value;
              onSetSpeed(val === 'instant' ? 'instant' : (parseFloat(val) as SimulationSpeed));
            }}
            aria-label="Simulation playback speed"
          >
            <option value="0.5">0.5x (Slow)</option>
            <option value="1">1.0x (Normal)</option>
            <option value="2">2.0x (Fast)</option>
            <option value="4">4.0x (Very Fast)</option>
            <option value="instant">Instant (Jump to End)</option>
          </select>
        </div>
      </div>

      {/* Current Step Description with ARIA Live Announcement */}
      <div
        className="sim-status-message"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </div>
    </div>
  );
};
