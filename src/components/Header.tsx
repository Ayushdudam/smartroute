import React from 'react';
import { AlgorithmType } from '../algorithms/types';

interface HeaderProps {
  readonly activeAlgorithm: AlgorithmType;
  readonly onLoadDemo: () => void;
  readonly onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeAlgorithm,
  onLoadDemo,
  onResetAll,
}) => {
  return (
    <header className="app-header" role="banner">
      <div className="brand-section">
        <svg
          className="brand-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="6" cy="19" r="3" />
          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
          <circle cx="18" cy="5" r="3" />
        </svg>
        <div className="brand-title-wrap">
          <h1 className="brand-title">
            SmartRoute
            <span className="brand-badge">AOA Mini-Project</span>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--color-frontier)',
                border: '1px solid var(--border-default)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Mode: {activeAlgorithm}
            </span>
          </h1>
          <p className="brand-subtitle">
            Intelligent Route Planning & Algorithm Analysis System — Mumbai Road Network
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-secondary"
          onClick={onLoadDemo}
          title="Load default scenario: VIT -> Worli Sea Face (Dijkstra)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Load Default Demo
        </button>
        <button
          className="btn-secondary"
          onClick={onResetAll}
          title="Reset entire simulation, graph closures, and inputs"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset Simulation
        </button>
      </div>
    </header>
  );
};
