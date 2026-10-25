import { describe, expect, it } from 'vitest';
import { dijkstra } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import { buildAdjacencyList } from '../graph/graphUtils';
import { BASE_GRAPH } from '../graph/graphData';

describe('Required Graph Properties P1 through P7 (Default Mumbai Network)', () => {
  const adj = buildAdjacencyList(BASE_GRAPH);
  const defaultSource = 'vit';
  const defaultDest = 'worli_sea_face';

  // P1: vit -> worli_sea_face is reachable, and at least two clearly different routes exist
  it('P1: vit -> worli_sea_face is reachable with at least two clearly different routes', () => {
    const route1 = dijkstra(adj, new Set(), defaultSource, defaultDest);
    expect(route1.status).toBe('FOUND');
    expect(route1.totalDistance).toBe(7.2);

    // Close the primary corridor to force the alternate route
    const firstEdgeOnRoute = route1.route.steps[0]!.edgeId;
    const route2 = dijkstra(adj, new Set([firstEdgeOnRoute]), defaultSource, defaultDest);

    expect(route2.status).toBe('FOUND');
    expect(route2.route.path).not.toEqual(route1.route.path);
    // Two distinct paths exist
    expect(route1.route.path.length).toBeGreaterThan(0);
    expect(route2.route.path.length).toBeGreaterThan(0);
  });

  // P2: Dijkstra shortest route for default journey has at least 5 edges
  it('P2: default Dijkstra shortest route has at least 5 edges', () => {
    const defaultRoute = dijkstra(adj, new Set(), defaultSource, defaultDest);
    expect(defaultRoute.status).toBe('FOUND');
    expect(defaultRoute.hopCount).toBeGreaterThanOrEqual(5);
    expect(defaultRoute.route.steps).toHaveLength(5);
    expect(defaultRoute.route.path).toEqual([
      'vit',
      'wadala_bridge',
      'five_gardens',
      'dadar_tt',
      'siddhivinayak',
      'worli_sea_face',
    ]);
    expect(defaultRoute.totalDistance).toBe(7.2);
  });

  // P3: There exists at least one road on the default shortest route whose closure causes a strictly longer route
  it('P3: closing a road on the default route increases the shortest path distance', () => {
    const baseline = dijkstra(adj, new Set(), defaultSource, defaultDest);
    expect(baseline.status).toBe('FOUND');

    let foundStrictlyLonger = false;
    for (const step of baseline.route.steps) {
      const closedResult = dijkstra(adj, new Set([step.edgeId]), defaultSource, defaultDest);
      if (closedResult.status === 'FOUND' && closedResult.totalDistance > baseline.totalDistance) {
        foundStrictlyLonger = true;
        // Verify path changed
        expect(closedResult.route.path).not.toEqual(baseline.route.path);
        expect(closedResult.totalDistance).toBeGreaterThan(baseline.totalDistance);
      }
    }

    expect(foundStrictlyLonger).toBe(true);

    // Specific verified example: closing "dadar_tt-siddhivinayak" changes distance from 7.2 to 8.4 km
    const closedDadarSiddhi = dijkstra(adj, new Set(['dadar_tt-siddhivinayak']), defaultSource, defaultDest);
    expect(closedDadarSiddhi.status).toBe('FOUND');
    expect(closedDadarSiddhi.totalDistance).toBe(8.4);
    expect(closedDadarSiddhi.totalDistance).toBeGreaterThan(7.2);
  });

  // P4: BFS returns a route DIFFERENT from Dijkstra, with STRICTLY HIGHER weight and <= edges
  it('P4: BFS for default journey returns a route different from Dijkstra with higher weight and fewer-or-equal hops', () => {
    const dijkstraRes = dijkstra(adj, new Set(), defaultSource, defaultDest);
    const bfsRes = bfs(adj, new Set(), defaultSource, defaultDest);

    expect(dijkstraRes.status).toBe('FOUND');
    expect(bfsRes.status).toBe('FOUND');

    // Route differs
    expect(bfsRes.route.path).not.toEqual(dijkstraRes.route.path);

    // Hops: BFS hops <= Dijkstra hops (2 hops <= 5 hops)
    expect(bfsRes.hopCount).toBeLessThanOrEqual(dijkstraRes.hopCount);
    expect(bfsRes.hopCount).toBe(2);
    expect(dijkstraRes.hopCount).toBe(5);

    // Distance: BFS weight > Dijkstra weight (9.8 km > 7.2 km)
    expect(bfsRes.totalDistance).toBeGreaterThan(dijkstraRes.totalDistance);
    expect(bfsRes.totalDistance).toBe(9.8);
    expect(dijkstraRes.totalDistance).toBe(7.2);
  });

  // P5: At least one location can be isolated by closing a specific small set of roads
  it('P5: Chembur is isolated and becomes unreachable when its 2 incident roads are closed', () => {
    const chemburIncidentRoads = new Set(['kurla-chembur', 'sion-chembur']);

    // Reachable with roads open
    const openRes = dijkstra(adj, new Set(), defaultSource, 'chembur');
    expect(openRes.status).toBe('FOUND');

    // Unreachable with incident roads closed
    const isolatedRes = dijkstra(adj, chemburIncidentRoads, defaultSource, 'chembur');
    expect(isolatedRes.status).toBe('UNREACHABLE');
    expect(isolatedRes.route.path).toHaveLength(0);

    const isolatedBfs = bfs(adj, chemburIncidentRoads, defaultSource, 'chembur');
    expect(isolatedBfs.status).toBe('UNREACHABLE');
  });

  // P6: No two distinct shortest routes of equal weight for the DEFAULT journey
  it('P6: default shortest route of 7.2 km is strictly unique with no equal-weight ties', () => {
    const defaultRoute = dijkstra(adj, new Set(), defaultSource, defaultDest);
    expect(defaultRoute.totalDistance).toBe(7.2);

    // If we close any single edge on the 7.2 km route, every alternative route is strictly > 7.2 km
    for (const step of defaultRoute.route.steps) {
      const alt = dijkstra(adj, new Set([step.edgeId]), defaultSource, defaultDest);
      expect(alt.status).toBe('FOUND');
      expect(alt.totalDistance).toBeGreaterThan(7.2);
    }
  });

  // P7: Closing a road NOT on the default route does not change the default route
  it('P7: closing an irrelevant road leaves the default route completely unchanged', () => {
    const baseline = dijkstra(adj, new Set(), defaultSource, defaultDest);

    // Edge "marine_drive-churchgate_station" is in South Mumbai, completely outside vit -> worli_sea_face
    const irrelevantClosure = new Set(['marine_drive-churchgate_station']);
    const closedResult = dijkstra(adj, irrelevantClosure, defaultSource, defaultDest);

    expect(closedResult.status).toBe('FOUND');
    expect(closedResult.totalDistance).toBe(baseline.totalDistance);
    expect(closedResult.hopCount).toBe(baseline.hopCount);
    expect(closedResult.route.path).toEqual(baseline.route.path);
    expect(closedResult.route.steps).toEqual(baseline.route.steps);
  });
});
