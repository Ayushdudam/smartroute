import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BASE_GRAPH } from '../graph/graphData';
import { buildAdjacencyList, getEdgeById } from '../graph/graphUtils';
import { AlgorithmResult, AlgorithmType } from '../algorithms/types';
import { dijkstra } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import {
  createInitialVisualState,
  stateAtStep,
  VisualState,
} from '../simulation/executionTrace';
import {
  calculateNextStep,
  calculatePreviousStep,
  loadStoredSpeed,
  saveStoredSpeed,
  SimulationSpeed,
  SPEED_INTERVALS,
} from '../simulation/simulationController';
import { generateJourneyKey } from '../utils/formatters';

export interface JourneyBaseline {
  readonly journeyKey: string;
  readonly result: AlgorithmResult;
}

export function useSmartRoute() {
  // 1. Core Selection & Graph State
  const [sourceId, setSourceId] = useState<string>('vit');
  const [destinationId, setDestinationId] = useState<string>('worli_sea_face');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('DIJKSTRA');
  const [closedEdges, setClosedEdges] = useState<Set<string>>(new Set());
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showWeights, setShowWeights] = useState<boolean>(true);

  // 2. Algorithm Results & Journey Comparison
  const [currentResult, setCurrentResult] = useState<AlgorithmResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<JourneyBaseline | null>(null);
  const [isRouteStale, setIsRouteStale] = useState<boolean>(false);
  const [comparisonNote, setComparisonNote] = useState<string>('');

  // 3. Simulation & Animation State
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeedState] = useState<SimulationSpeed>(loadStoredSpeed);

  // Pre-built adjacency list
  const adjacencyList = useMemo(() => buildAdjacencyList(BASE_GRAPH), []);

  // Update speed in state and localStorage
  const setSpeed = useCallback((newSpeed: SimulationSpeed) => {
    setSpeedState(newSpeed);
    saveStoredSpeed(newSpeed);
  }, []);

  // Compute visual state at current step
  const visualState: VisualState = useMemo(() => {
    if (!currentResult || currentStep < 0) {
      return createInitialVisualState(BASE_GRAPH, closedEdges, sourceId, destinationId);
    }
    return stateAtStep(
      currentResult.trace,
      currentStep,
      BASE_GRAPH,
      closedEdges,
      sourceId,
      destinationId,
      currentResult.route
    );
  }, [currentResult, currentStep, closedEdges, sourceId, destinationId]);

  // Run Algorithm Handler
  const runAlgorithm = useCallback(
    (customSource?: string, customDest?: string, customAlgo?: AlgorithmType) => {
      const src = customSource ?? sourceId;
      const dst = customDest ?? destinationId;
      const algo = customAlgo ?? algorithm;

      const journeyKey = generateJourneyKey(src, dst, algo);

      // Save previous result as baseline IF it was for the SAME journey
      if (currentResult && currentResult.status !== 'ERROR') {
        const prevKey = generateJourneyKey(
          currentResult.sourceId,
          currentResult.destinationId,
          currentResult.algorithm
        );
        if (prevKey === journeyKey) {
          setBaselineResult({
            journeyKey: prevKey,
            result: currentResult,
          });
          setComparisonNote('');
        } else {
          setBaselineResult(null);
          setComparisonNote('New journey selected — baseline comparison reset.');
        }
      }

      const result: AlgorithmResult =
        algo === 'DIJKSTRA'
          ? dijkstra(adjacencyList, closedEdges, src, dst)
          : bfs(adjacencyList, closedEdges, src, dst);

      setCurrentResult(result);
      setIsRouteStale(false);

      if (speed === 'instant' || result.trace.length <= 1) {
        setCurrentStep(result.trace.length - 1);
        setIsPlaying(false);
      } else {
        setCurrentStep(0);
        setIsPlaying(true);
      }
    },
    [sourceId, destinationId, algorithm, adjacencyList, closedEdges, currentResult, speed]
  );

  // Road Closure Operations
  const closeRoad = useCallback(
    (edgeId: string) => {
      setClosedEdges((prev) => {
        if (prev.has(edgeId)) return prev;
        const next = new Set(prev);
        next.add(edgeId);
        return next;
      });
      if (currentResult) {
        setIsRouteStale(true);
      }
    },
    [currentResult]
  );

  const reopenRoad = useCallback(
    (edgeId: string) => {
      setClosedEdges((prev) => {
        if (!prev.has(edgeId)) return prev;
        const next = new Set(prev);
        next.delete(edgeId);
        return next;
      });
      if (currentResult) {
        setIsRouteStale(true);
      }
    },
    [currentResult]
  );

  const resetAllClosures = useCallback(() => {
    setClosedEdges(new Set());
    if (currentResult) {
      setIsRouteStale(true);
    }
  }, [currentResult]);

  // Endpoint Operations
  const setSource = useCallback(
    (id: string) => {
      setSourceId(id);
      setBaselineResult(null);
      setComparisonNote('Start location changed — comparison reset.');
      setCurrentResult(null);
      setCurrentStep(-1);
      setIsPlaying(false);
    },
    []
  );

  const setDestination = useCallback(
    (id: string) => {
      setDestinationId(id);
      setBaselineResult(null);
      setComparisonNote('Destination changed — comparison reset.');
      setCurrentResult(null);
      setCurrentStep(-1);
      setIsPlaying(false);
    },
    []
  );

  const swapEndpoints = useCallback(() => {
    const tempSrc = sourceId;
    const tempDst = destinationId;
    setSourceId(tempDst);
    setDestinationId(tempSrc);
    setBaselineResult(null);
    setComparisonNote('Endpoints swapped — comparison reset.');
    setCurrentResult(null);
    setCurrentStep(-1);
    setIsPlaying(false);
  }, [sourceId, destinationId]);

  // Simulation Controls
  const play = useCallback(() => {
    if (!currentResult) return;
    if (currentStep >= currentResult.trace.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentResult, currentStep]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentResult) return;
    setIsPlaying(false);
    setCurrentStep((curr) => calculateNextStep(curr, currentResult.trace.length));
  }, [currentResult]);

  const prevStep = useCallback(() => {
    if (!currentResult) return;
    setIsPlaying(false);
    setCurrentStep((curr) => calculatePreviousStep(curr));
  }, [currentResult]);

  const jumpToEnd = useCallback(() => {
    if (!currentResult) return;
    setIsPlaying(false);
    setCurrentStep(currentResult.trace.length - 1);
  }, [currentResult]);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (!currentResult) return;
      setIsPlaying(false);
      const clamped = Math.max(0, Math.min(step, currentResult.trace.length - 1));
      setCurrentStep(clamped);
    },
    [currentResult]
  );

  // High-level Resets
  const resetJourney = useCallback(() => {
    setIsPlaying(false);
    setCurrentResult(null);
    setCurrentStep(-1);
    setBaselineResult(null);
    setIsRouteStale(false);
    setComparisonNote('');
  }, []);

  const resetEntireSimulation = useCallback(() => {
    setIsPlaying(false);
    setSourceId('vit');
    setDestinationId('worli_sea_face');
    setAlgorithm('DIJKSTRA');
    setClosedEdges(new Set());
    setSelectedEdgeId(null);
    setCurrentResult(null);
    setCurrentStep(-1);
    setBaselineResult(null);
    setIsRouteStale(false);
    setComparisonNote('');
  }, []);

  const loadDefaultDemo = useCallback(() => {
    setIsPlaying(false);
    setSourceId('vit');
    setDestinationId('worli_sea_face');
    setAlgorithm('DIJKSTRA');
    setClosedEdges(new Set());
    setSelectedEdgeId(null);
    setBaselineResult(null);
    setIsRouteStale(false);
    setComparisonNote('');
    // Run Dijkstra on default network
    const result = dijkstra(adjacencyList, new Set(), 'vit', 'worli_sea_face');
    setCurrentResult(result);
    setCurrentStep(0);
    setIsPlaying(true);
  }, [adjacencyList]);

  // Animation Step Effect
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || !currentResult || speed === 'instant') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = SPEED_INTERVALS[speed];
    timerRef.current = window.setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= currentResult.trace.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentResult, speed]);

  return {
    // State
    sourceId,
    destinationId,
    algorithm,
    closedEdges,
    selectedEdgeId,
    showWeights,
    currentResult,
    baselineResult,
    isRouteStale,
    comparisonNote,
    currentStep,
    isPlaying,
    speed,
    visualState,
    adjacencyList,
    selectedEdge: selectedEdgeId ? getEdgeById(BASE_GRAPH.edges, selectedEdgeId) : undefined,

    // Actions
    setSource,
    setDestination,
    swapEndpoints,
    setAlgorithm,
    setShowWeights,
    setSelectedEdgeId,
    closeRoad,
    reopenRoad,
    resetAllClosures,
    runAlgorithm,
    play,
    pause,
    nextStep,
    prevStep,
    jumpToEnd,
    resetSimulation,
    goToStep,
    setSpeed,
    resetJourney,
    resetEntireSimulation,
    loadDefaultDemo,
  };
}
