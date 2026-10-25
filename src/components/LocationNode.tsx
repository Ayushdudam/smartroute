import React from 'react';
import { LocationNode as LocationNodeType } from '../graph/types';
import { NodeVisualStatus } from '../simulation/executionTrace';

interface LocationNodeProps {
  readonly node: LocationNodeType;
  readonly status: NodeVisualStatus;
  readonly distance?: number;
  readonly isStart: boolean;
  readonly isDestination: boolean;
  readonly onSelectAsStart: (id: string) => void;
  readonly onSelectAsDestination: (id: string) => void;
}

export const LocationNode: React.FC<LocationNodeProps> = ({
  node,
  status,
  distance,
  isStart,
  isDestination,
  onSelectAsStart,
  onSelectAsDestination,
}) => {
  const dx = node.labelOffset?.dx ?? 0;
  const dy = node.labelOffset?.dy ?? 16;

  // Determine styles by status
  let circleFill = '#334155';
  let circleStroke = '#64748b';
  let strokeWidth = 2;
  let strokeDasharray: string | undefined = undefined;
  let r = 8;
  let badgeText: string | null = null;
  let badgeColor = '#94a3b8';

  if (isStart) {
    circleFill = '#22c55e';
    circleStroke = '#ffffff';
    strokeWidth = 3;
    r = 11;
    badgeText = 'START';
    badgeColor = '#22c55e';
  } else if (isDestination) {
    circleFill = '#ef4444';
    circleStroke = '#ffffff';
    strokeWidth = 3;
    r = 11;
    badgeText = 'DEST';
    badgeColor = '#ef4444';
  } else if (status === 'current') {
    circleFill = '#38bdf8';
    circleStroke = '#ffffff';
    strokeWidth = 3;
    r = 10;
    badgeText = 'CURRENT';
    badgeColor = '#38bdf8';
  } else if (status === 'finalised') {
    circleFill = '#10b981';
    circleStroke = '#a7f3d0';
    strokeWidth = 2.5;
    r = 9;
  } else if (status === 'frontier') {
    circleFill = '#4338ca';
    circleStroke = '#a5b4fc';
    strokeWidth = 2;
    strokeDasharray = '3,2';
    r = 8.5;
  }

  const distText =
    distance !== undefined && Number.isFinite(distance)
      ? `${distance.toFixed(1)} km`
      : undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSelectAsStart(node.id);
    } else if (e.key === ' ') {
      e.preventDefault();
      onSelectAsDestination(node.id);
    }
  };

  return (
    <g
      className={`node-group node-status-${status}`}
      transform={`translate(${node.x}, ${node.y})`}
      tabIndex={0}
      role="button"
      aria-label={`${node.name} (${node.area}). Status: ${status}.${
        distText ? ` Distance: ${distText}.` : ''
      } Press Enter to set as Start, Space to set as Destination.`}
      onKeyDown={handleKeyDown}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <title>{`${node.name} [${node.area}]${distText ? ` — Dist: ${distText}` : ''}\nClick to set Start (or press Space for Dest)`}</title>

      {/* Outer pulsing ring for current active node */}
      {status === 'current' && (
        <circle
          r={r + 6}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values={`${r + 3};${r + 9};${r + 3}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main Node Circle */}
      <circle
        r={r}
        fill={circleFill}
        stroke={circleStroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />

      {/* Distinct Shape Icon Inner for Accessibility */}
      {isStart && (
        <polygon
          points="-2,-4 4,0 -2,4"
          fill="#ffffff"
        />
      )}
      {isDestination && (
        <circle
          r={3}
          fill="#ffffff"
        />
      )}

      {/* Badge label (START / DEST / CURRENT) */}
      {badgeText && (
        <g transform="translate(0, -18)">
          <rect
            x={-24}
            y={-8}
            width={48}
            height={14}
            rx={3}
            fill="#0f172a"
            stroke={badgeColor}
            strokeWidth="1.2"
          />
          <text
            x={0}
            y={2}
            textAnchor="middle"
            fill={badgeColor}
            fontSize="8"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            {badgeText}
          </text>
        </g>
      )}

      {/* Node Name Text */}
      <text
        x={dx}
        y={dy}
        textAnchor={dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle'}
        fill={isStart || isDestination || status === 'current' ? '#f8fafc' : '#cbd5e1'}
        fontSize="11"
        fontWeight={isStart || isDestination || status === 'current' ? '700' : '500'}
        paintOrder="stroke"
        stroke="#090e17"
        strokeWidth="3.5"
        strokeLinejoin="round"
        pointerEvents="none"
      >
        {node.name}
      </text>

      {/* Tentative Distance Text if discovered */}
      {distText && (
        <text
          x={dx}
          y={dy + 12}
          textAnchor={dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle'}
          fill={status === 'finalised' ? '#34d399' : '#93c5fd'}
          fontSize="9.5"
          fontWeight="600"
          fontFamily="monospace"
          paintOrder="stroke"
          stroke="#090e17"
          strokeWidth="3"
          strokeLinejoin="round"
          pointerEvents="none"
        >
          {distText}
        </text>
      )}
    </g>
  );
};
