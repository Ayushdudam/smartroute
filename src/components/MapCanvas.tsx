import React, { useRef, useState, useCallback } from 'react';
import { BASE_GRAPH, CANVAS_BOUNDS, NETWORK_DISCLAIMER } from '../graph/graphData';
import { getNodeById } from '../graph/graphUtils';
import { VisualState } from '../simulation/executionTrace';
import { LocationNode } from './LocationNode';
import { RoadEdge } from './RoadEdge';

interface MapCanvasProps {
  readonly visualState: VisualState;
  readonly sourceId: string;
  readonly destinationId: string;
  readonly selectedEdgeId: string | null;
  readonly showWeights: boolean;
  readonly onSelectEdge: (edgeId: string) => void;
  readonly onSelectAsStart: (nodeId: string) => void;
  readonly onSelectAsDestination: (nodeId: string) => void;
  readonly onToggleWeights: (show: boolean) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  visualState,
  sourceId,
  destinationId,
  selectedEdgeId,
  showWeights,
  onSelectEdge,
  onSelectAsStart,
  onSelectAsDestination,
  onToggleWeights,
}) => {
  // Hand-implemented Pan and Zoom
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Left click only
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 3.0));
  };

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * 1.2, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev * 0.8, 0.6));
  }, []);

  const handleResetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div className="map-panel" role="region" aria-label="Interactive Mumbai road network map">
      {/* Map Toolbar */}
      <div className="map-toolbar">
        <button
          className="map-tool-btn"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in on map"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          className="map-tool-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out on map"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          className="map-tool-btn"
          onClick={handleResetView}
          title="Reset View to Fit"
          aria-label="Reset zoom and center map"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        <div className="map-toolbar-divider" />

        <label className="map-toggle-label">
          <input
            type="checkbox"
            checked={showWeights}
            onChange={(e) => onToggleWeights(e.target.checked)}
          />
          Show weights (km)
        </label>
      </div>

      {/* SVG Canvas */}
      <div className="map-canvas-container">
        <svg
          className="map-svg"
          viewBox={`0 0 ${CANVAS_BOUNDS.width} ${CANVAS_BOUNDS.height}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162032" strokeWidth="0.8" />
            </pattern>
            {/* Water Wave Pattern for Arabian Sea */}
            <pattern id="waterWave" width="60" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 0 10 Q 15 5 30 10 T 60 10"
                fill="none"
                stroke="rgba(56, 189, 248, 0.08)"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="#090e17" />
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Stylized Western Coastline & Arabian Sea */}
          <g className="coastline-layer" pointerEvents="none">
            {/* Stylized Arabian Sea Area on West/Left */}
            <path
              d="M 0 0 L 140 0 C 130 120 180 200 130 320 C 100 390 120 460 110 550 C 90 640 180 720 190 800 L 0 800 Z"
              fill="rgba(14, 165, 233, 0.04)"
            />
            <path
              d="M 0 0 L 140 0 C 130 120 180 200 130 320 C 100 390 120 460 110 550 C 90 640 180 720 190 800 L 0 800 Z"
              fill="url(#waterWave)"
            />
            <path
              d="M 140 0 C 130 120 180 200 130 320 C 100 390 120 460 110 550 C 90 640 180 720 190 800"
              fill="none"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <text
              x="30"
              y="180"
              fill="rgba(56, 189, 248, 0.2)"
              fontSize="14"
              fontWeight="bold"
              letterSpacing="0.2em"
              transform="rotate(-90, 30, 180)"
            >
              ARABIAN SEA
            </text>
          </g>

          {/* Zoom/Pan Transform Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            {/* Layer 1: Edges */}
            <g className="edges-layer">
              {BASE_GRAPH.edges.map((edge) => {
                const fromNode = getNodeById(BASE_GRAPH.nodes, edge.from);
                const toNode = getNodeById(BASE_GRAPH.nodes, edge.to);
                if (!fromNode || !toNode) return null;

                const edgeStatus = visualState.edgeStates.get(edge.id) ?? 'normal';
                const isSelected = selectedEdgeId === edge.id;

                return (
                  <RoadEdge
                    key={edge.id}
                    edge={edge}
                    fromNode={fromNode}
                    toNode={toNode}
                    status={edgeStatus}
                    isSelected={isSelected}
                    showWeight={showWeights}
                    onSelectEdge={onSelectEdge}
                  />
                );
              })}
            </g>

            {/* Layer 2: Nodes */}
            <g className="nodes-layer">
              {BASE_GRAPH.nodes.map((node) => {
                const nodeStatus = visualState.nodeStates.get(node.id) ?? 'unvisited';
                const dist = visualState.tentativeDistances.get(node.id);
                const isStart = node.id === sourceId;
                const isDest = node.id === destinationId;

                return (
                  <LocationNode
                    key={node.id}
                    node={node}
                    status={nodeStatus}
                    distance={dist}
                    isStart={isStart}
                    isDestination={isDest}
                    onSelectAsStart={onSelectAsStart}
                    onSelectAsDestination={onSelectAsDestination}
                  />
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {/* Overlay: Legend & Mandatory Disclaimer */}
      <div className="map-overlay-info">
        <div className="map-legend" role="note" aria-label="Map symbology legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#22c55e' }} />
            <span>Start</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#ef4444' }} />
            <span>Destination</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#10b981' }} />
            <span>Finalised</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#818cf8' }} />
            <span>Frontier</span>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: '#38bdf8', height: 4 }} />
            <span>Final Route</span>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: '#f59e0b', height: 3 }} />
            <span>Examined</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-line"
              style={{
                backgroundColor: '#f43f5e',
                borderTop: '2px dashed #f43f5e',
                height: 0,
              }}
            />
            <span>Closed Road</span>
          </div>
        </div>

        <div className="map-disclaimer">
          <strong>Note:</strong> {NETWORK_DISCLAIMER}
        </div>
      </div>
    </div>
  );
};
