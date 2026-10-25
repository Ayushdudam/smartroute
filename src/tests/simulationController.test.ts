import { describe, expect, it } from 'vitest';
import {
  calculateNextStep,
  calculatePreviousStep,
  isSimulationAtEnd,
  isSimulationAtStart,
} from '../simulation/simulationController';
import { BASE_GRAPH } from '../graph/graphData';
import { buildAdjacencyList } from '../graph/graphUtils';
import { dijkstra } from '../algorithms/dijkstra';
import { stateAtStep } from '../simulation/executionTrace';

describe('Simulation Controller and Trace Replay', () => {
  it('correctly calculates step boundaries for next and previous', () => {
    const totalSteps = 10;

    expect(calculateNextStep(0, totalSteps)).toBe(1);
    expect(calculateNextStep(8, totalSteps)).toBe(9);
    expect(calculateNextStep(9, totalSteps)).toBe(9); // clamps at max

    expect(calculatePreviousStep(5)).toBe(4);
    expect(calculatePreviousStep(1)).toBe(0);
    expect(calculatePreviousStep(0)).toBe(0); // clamps at min

    expect(isSimulationAtStart(0)).toBe(true);
    expect(isSimulationAtStart(1)).toBe(false);

    expect(isSimulationAtEnd(9, totalSteps)).toBe(true);
    expect(isSimulationAtEnd(8, totalSteps)).toBe(false);
  });

  it('guarantees stateAtStep(trace, i) is completely deterministic and consistent', () => {
    const adj = buildAdjacencyList(BASE_GRAPH);
    const result = dijkstra(adj, new Set(), 'vit', 'worli_sea_face');
    const trace = result.trace;
    expect(trace.length).toBeGreaterThan(5);

    // Any step i produces identical visual state on multiple replays
    const step = 5;
    const stateA = stateAtStep(trace, step, BASE_GRAPH, new Set(), 'vit', 'worli_sea_face', result.route);
    const stateB = stateAtStep(trace, step, BASE_GRAPH, new Set(), 'vit', 'worli_sea_face', result.route);

    expect(stateA.stepIndex).toBe(step);
    expect(stateA.currentNodeId).toBe(stateB.currentNodeId);
    expect(stateA.statusMessage).toBe(stateB.statusMessage);
    expect(Array.from(stateA.nodeStates.entries())).toEqual(Array.from(stateB.nodeStates.entries()));
    expect(Array.from(stateA.edgeStates.entries())).toEqual(Array.from(stateB.edgeStates.entries()));
  });

  it('reverting back and then forward returns to the exact same visual state', () => {
    const adj = buildAdjacencyList(BASE_GRAPH);
    const result = dijkstra(adj, new Set(), 'vit', 'worli_sea_face');
    const trace = result.trace;

    const originalStep = 7;
    const originalState = stateAtStep(
      trace,
      originalStep,
      BASE_GRAPH,
      new Set(),
      'vit',
      'worli_sea_face',
      result.route
    );

    const prevStep = calculatePreviousStep(originalStep);
    const prevState = stateAtStep(
      trace,
      prevStep,
      BASE_GRAPH,
      new Set(),
      'vit',
      'worli_sea_face',
      result.route
    );
    expect(prevState.stepIndex).toBe(6);

    const reforwardStep = calculateNextStep(prevStep, trace.length);
    const reforwardState = stateAtStep(
      trace,
      reforwardStep,
      BASE_GRAPH,
      new Set(),
      'vit',
      'worli_sea_face',
      result.route
    );

    expect(reforwardState.stepIndex).toBe(originalStep);
    expect(reforwardState.currentNodeId).toBe(originalState.currentNodeId);
    expect(reforwardState.statusMessage).toBe(originalState.statusMessage);
    expect(Array.from(reforwardState.nodeStates.entries())).toEqual(
      Array.from(originalState.nodeStates.entries())
    );
  });
});
