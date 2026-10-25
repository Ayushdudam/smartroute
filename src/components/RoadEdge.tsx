import React from 'react';
import { LocationNode, RoadEdge as RoadEdgeType } from '../graph/types';
import { EdgeVisualStatus } from '../simulation/executionTrace';

interface RoadEdgeProps {
  readonly edge: RoadEdgeType;
  readonly fromNode: LocationNode;
  readonly toNode: LocationNode;
  readonly status: EdgeVisualStatus;
  readonly isSelected: boolean;
  readonly showWeight: boolean;
  readonly onSelectEdge: (id: string) => void;
}

export const RoadEdge: React.FC<RoadEdgeProps> = ({
  edge,
  fromNode,
  toNode,
  status,
  isSelected,
  showWeight,
  onSelectEdge,
}) => {
  const midX = (fromNode.x + toNode.x) / 2;
  const midY = (fromNode.y + toNode.y) / 2;

  // Visual styling logic
  let strokeColor = '#334155';
  let strokeWidth = 2.5;
  let strokeDasharray: string | undefined = undefined;
  let opacity = 0.7;

  if (status === 'closed') {
    strokeColor = '#f43f5e';
    strokeWidth = 3;
    strokeDasharray = '6,4';
    opacity = 0.9;
  } else if (status === 'on-final-route') {
    strokeColor = '#38bdf8';
    strokeWidth = 5.5;
    opacity = 1;
  } else if (status === 'examined') {
    strokeColor = '#f59e0b';
    strokeWidth = 4.5;
    opacity = 1;
  } else if (status === 'candidate-tree') {
    strokeColor = '#818cf8';
    strokeWidth = 2.8;
    strokeDasharray = '4,3';
    opacity = 0.85;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectEdge(edge.id);
    }
  };

  return (
    <g
      className={`edge-group edge-status-${status} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectEdge(edge.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Road ${edge.label ?? edge.id} between ${fromNode.name} and ${toNode.name}. Weight: ${edge.weight} km. Status: ${status === 'closed' ? 'Closed' : 'Open'}. Click to inspect or close.`}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <title>{`${edge.label ? `${edge.label}\n` : ''}${fromNode.name} ↔ ${toNode.name} (${edge.weight} km)\nStatus: ${status === 'closed' ? 'CLOSED' : 'OPEN'}\nClick to inspect / close road`}</title>

      {/* Invisible thick hit area for easy clicking on roads */}
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke="transparent"
        strokeWidth="18"
      />

      {/* Selection Halo */}
      {isSelected && (
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke="#f8fafc"
          strokeWidth={strokeWidth + 5}
          opacity="0.4"
          strokeLinecap="round"
        />
      )}

      {/* Glowing underlay for final route */}
      {status === 'on-final-route' && (
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke="#38bdf8"
          strokeWidth="10"
          opacity="0.25"
          strokeLinecap="round"
        />
      )}

      {/* Main road line */}
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        opacity={opacity}
        strokeLinecap="round"
      />

      {/* Cross Marker for Closed Roads at midpoint */}
      {status === 'closed' && (
        <g transform={`translate(${midX}, ${midY})`}>
          <circle
            r="8"
            fill="#0f172a"
            stroke="#f43f5e"
            strokeWidth="1.5"
          />
          <line
            x1="-4"
            y1="-4"
            x2="4"
            y2="4"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="4"
            y1="-4"
            x2="-4"
            y2="4"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Road weight badge */}
      {showWeight && status !== 'closed' && (
        <g
          transform={`translate(${midX}, ${midY})`}
          pointerEvents="none"
        >
          <rect
            x="-16"
            y="-8"
            width="32"
            height="16"
            rx="4"
            fill="#090e17"
            stroke={isSelected ? '#38bdf8' : status === 'on-final-route' ? '#38bdf8' : '#334155'}
            strokeWidth={isSelected ? 1.5 : 1}
            opacity="0.9"
          />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fill={status === 'on-final-route' ? '#38bdf8' : '#94a3b8'}
            fontSize="9"
            fontWeight="600"
            fontFamily="monospace"
          >
            {edge.weight.toFixed(1)}
          </text>
        </g>
      )}
    </g>
  );
};
