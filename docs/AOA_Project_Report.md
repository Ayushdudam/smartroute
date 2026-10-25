# Academic Project Report

## 1. Title
**SmartRoute: Intelligent Route Planning and Algorithm Analysis System**  
*A Simulated Mumbai Road Network for Live Algorithmic Visualisation, Complexity Analysis, and Dynamic Edge Closure Simulation*  
**Subject:** Analysis and Design of Algorithms (AOA)  
**Academic Level:** Second-Year B.Tech Computer Engineering  

---

## 2. Abstract
Understanding graph traversal and shortest-path algorithms is foundational to computer science and algorithm design. Traditional instruction relies heavily on static pseudocode and small manual traces on whiteboards, which obscures the runtime operational behavior of priority queues, edge relaxations, and dynamic structural changes.

**SmartRoute** is an interactive, browser-based algorithm analysis system modeling a simulated 25-node road network of Mumbai, India. The system provides real-time, deterministic computation and step-by-step trace visualization of **Dijkstra's Shortest Path Algorithm** and **Breadth-First Search (BFS)**. The implementation features a custom binary min-heap with lazy deletion and 3-tier deterministic tie-breaking, a non-mutating road closure engine with baseline route delta comparison, and automated validation against an all-pairs Floyd-Warshall oracle. Every displayed metric is derived from code instrumentation without synthetic or mocked values, bridging the gap between theoretical algorithm analysis and applied software engineering.

---

## 3. Problem Statement
Graph algorithms such as Dijkstra's algorithm and BFS are standard curriculum topics in Analysis of Algorithms. Students frequently struggle with several nuanced concepts:
1. Understanding why BFS cannot be used to find the shortest path in a weighted graph.
2. Conceptualizing edge relaxation, tentative distance updates, and how binary min-heaps handle decrease-key operations via lazy deletion.
3. Analyzing how structural modifications (such as road blockages or closures) invalidate existing paths and alter time complexity.
4. Distinguishing between theoretical asymptotic worst-case bounds ($\mathcal{O}((V + E) \log V)$) and observable hardware execution metrics.

Existing online graph tools either use abstract mathematical nodes with random coordinates, present pre-rendered non-interactive video animations, or rely on heavy external mapping libraries that obscure the underlying data structures. There is a need for an educational system that couples a realistic local geographic road network with rigorous, transparent, and verifiable algorithm execution.

---

## 4. Objectives
The key objectives of this project are:
- **Graph Modeling:** Represent a realistic, connected, undirected weighted graph of 25 prominent Mumbai locations with 41 road segments, maintaining an illustrative distance metric (km).
- **Algorithmic Authenticity:** Implement Dijkstra's algorithm and BFS from first principles in TypeScript without external graph libraries, deriving all paths directly from graph topology.
- **Trace-Driven Replay:** Construct a fine-grained execution trace during algorithm execution, allowing the user to play, pause, single-step forward, single-step backward, and scrub through events using a pure visual state reducer.
- **Dynamic Closure Simulation:** Enable interactive closing and reopening of road segments, instantly recalculating optimal routes and displaying precise quantitative deltas (distance and hop count differences) relative to an immutable baseline.
- **Theoretical & Empirical Comparison:** Provide side-by-side pedagogical comparison of Dijkstra (weighted shortest distance) versus BFS (unweighted hop minimization), supplemented by an empirical 200-iteration micro-benchmark.
- **Rigorous Verification:** Validate graph properties and algorithm correctness through automated unit tests, property tests (P1–P7), and an independent Floyd-Warshall oracle test.

---

## 5. Scope
- **Included:**
  - Undirected weighted graph with 25 vertices and 41 edges.
  - Custom binary min-heap with deterministic tie-breaking (distance, node ID, insertion sequence).
  - Trace-driven execution engine with step-by-step visual state reconstruction.
  - Interactive road closure simulator with deterministic demo mode suggestions.
  - Analysis dashboard displaying operation counters (finalised nodes, examined edges, relaxations, stale skips, closed skips, heap ops).
  - Automated test suite consisting of 40 unit and property tests.
- **Excluded:**
  - Real-world GPS live traffic feeds and driving navigation turn-by-turn routing.
  - Directed one-way road modeling (all edges are bidirectional).
  - External network APIs, backend servers, or third-party mapping tiles.

---

## 6. Proposed System
The proposed system consists of an autonomous single-page web application built with React, TypeScript, and SVG. The system separates the domain model (graph and algorithms) from UI state and visual presentation.

```
+-------------------------------------------------------------------------+
|                              USER INTERFACE                             |
|  [Header & Controls]     [Interactive SVG Map]     [Sidebar Dashboard]  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                        SIMULATION CONTROLLER HOOK                       |
|   - Play / Pause / Step Controls          - Speed Management            |
|   - Baseline Journey Delta Tracker        - Road Closure State (Set)    |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       EXECUTION & TRACE ENGINE                          |
|   - Pure Reducer: applyEvent()            - stateAtStep(trace, i)       |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     CORE ALGORITHMIC IMPLEMENTATION                     |
|   - Dijkstra with Lazy Deletion           - Breadth-First Search (BFS)  |
|   - Binary Min-Heap (PriorityQueue)       - Route Reconstruction        |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                            IMMUTABLE GRAPH                              |
|   - 25 Locations (V)   - 41 Roads (E)    - Adjacency List (Sorted)      |
+-------------------------------------------------------------------------+
```

---

## 7. Hardware and Software Requirements

### Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher (minimum 1.5 GHz dual-core).
- **RAM:** 4 GB minimum (8 GB recommended for simultaneous development server and testing).
- **Display Resolution:** 1366 &times; 768 minimum (optimized for standard laptop screens up to 4K displays).
- **Input:** Standard keyboard and mouse / trackpad.

### Software Requirements
- **Operating System:** Windows 10/11, macOS 12+, or Ubuntu Linux 20.04+.
- **Runtime Environment:** Node.js version &ge; 20.0.0.
- **Package Manager:** npm version &ge; 10.0.0.
- **Web Browser:** Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari (supporting ES2022 and modern SVG).
- **Build & Test Tools:** Vite 6, Vitest 3, TypeScript 5.7.

---

## 8. System Architecture
The application strictly enforces separation of concerns:
1. `src/graph/`: Contains data definitions, graph validation logic, adjacency list generators, and route reconstruction routines. No DOM or UI code is present in this module.
2. `src/algorithms/`: Contains the pure implementations of the binary min-heap, Dijkstra's algorithm, and BFS. These functions receive an adjacency list and closed-edge set, returning structured result objects containing route data, operation counters, and granular trace event logs.
3. `src/simulation/`: Implements the pure replay reducer `applyEvent` and the function `stateAtStep`, ensuring time-travel debugging and step reversal are completely deterministic.
4. `src/components/`: Modular React components handling map rendering, user controls, data tables, and SVG metric visualizations.

---

## 9. Graph Representation
The network is modeled as an **undirected, positively weighted graph** $G = (V, E, W)$:
- **Vertices ($V$):** 25 named landmarks and transit stations across Mumbai.
- **Edges ($E$):** 41 bidirectional road corridors connecting adjacent areas.
- **Weights ($W$):** Illustrative physical distances in kilometers (single decimal precision, strictly $> 0$).

### Adjacency List Representation
The graph is stored using an **adjacency list** represented as a `ReadonlyMap<string, readonly AdjacencyEntry[]>`. To guarantee deterministic traversal orders across different platforms and engines, neighbors for each node are sorted alphabetically by their unique vertex ID.

**Adjacency List vs. Adjacency Matrix:**
- For a sparse graph where $V = 25$ and $E = 41$, the ratio $E \ll V(V - 1)/2 = 300$.
- An adjacency matrix would consume $\mathcal{O}(V^2) = 625$ entries and require scanning all $V$ entries per vertex during traversal, giving an edge inspection bound of $\mathcal{O}(V^2)$.
- The adjacency list consumes only $\mathcal{O}(V + E) = 66$ structural entries, allowing neighbor exploration in $\mathcal{O}(\text{deg}(u))$ time, which is optimal for Dijkstra's algorithm.

---

## 10. Algorithm Explanation

### Dijkstra's Shortest Path Algorithm
Dijkstra's algorithm solves the single-source shortest path problem on graphs with non-negative edge weights.
1. It maintains a tentative distance table `dist[u]`, initialised to $0$ for the source node and $\infty$ for all other nodes.
2. A binary min-heap stores pairs `(dist[u], u)`.
3. At each step, the vertex $u$ with the minimal tentative distance is extracted from the heap.
4. If $u$ has already been settled (finalised), the entry is discarded (lazy deletion).
5. Otherwise, $u$ is marked as settled, and its incident open edges $(u, v, w)$ are examined. If $\text{dist}[u] + w < \text{dist}[v]$, an edge relaxation occurs: `dist[v]` is updated, a predecessor pointer is recorded, and the new pair `(dist[v], v)` is pushed onto the heap.
6. The process repeats until the destination is settled or the heap is exhausted.

### Breadth-First Search (BFS)
BFS explores vertices in order of increasing hop count (number of edges from the source).
1. It maintains a FIFO queue and a `visited` set.
2. The source vertex is enqueued at depth 0.
3. While the queue is non-empty, the front node $u$ is dequeued.
4. All unvisited neighbors $v$ reachable via open edges are marked visited and enqueued at depth $\text{depth}[u] + 1$.
5. BFS terminates when the destination is discovered. Because all edges are treated as unit cost (1 hop), BFS finds the path with the fewest road segments, irrespective of physical distance.

---

## 11. Dijkstra Pseudocode
```text
Algorithm Dijkstra(AdjList, ClosedEdges, source, destination, stopAtDestination):
    Input:  AdjList: Map of vertex -> list of (neighbor, edgeId, weight)
            ClosedEdges: Set of closed edge IDs
            source, destination: vertex identifiers
            stopAtDestination: boolean flag (default true)
    Output: shortest path, total distance, counters, execution trace

    dist = Map with all vertices mapped to Infinity
    predecessors = Map()
    finalised = Set()
    pq = MinPriorityQueue(order by: priority, then nodeId, then insertionSeq)
    trace = List()

    dist[source] = 0.0
    pq.push(source, priority: 0.0)
    emit ALGORITHM_STARTED, SOURCE_INITIALISED

    while not pq.isEmpty():
        (u, d) = pq.pop()
        emit NODE_SELECTED(u, d)

        // Lazy deletion check
        if u in finalised:
            emit STALE_ENTRY_SKIPPED(u, d)
            continue

        finalised.add(u)
        emit NODE_FINALISED(u, d)

        if u == destination and stopAtDestination:
            emit DESTINATION_REACHED(u)
            break

        for each (v, edgeId, weight) in AdjList[u]:
            if edgeId in ClosedEdges:
                emit EDGE_SKIPPED_CLOSED(edgeId)
                continue

            if v in finalised:
                continue

            candidateDist = round(d + weight, 1)
            emit EDGE_EXAMINED(edgeId, candidateDist, dist[v])

            if candidateDist < dist[v]:
                dist[v] = candidateDist
                predecessors[v] = (node: u, edgeId: edgeId, weight: weight)
                pq.push(v, priority: candidateDist)
                emit DISTANCE_UPDATED(v, candidateDist)
            else:
                emit DISTANCE_NOT_IMPROVED(v)

    if destination not in finalised and dist[destination] == Infinity:
        emit DESTINATION_UNREACHABLE
        return UNREACHABLE

    route = ReconstructRoute(source, destination, predecessors)
    emit ALGORITHM_COMPLETED(route)
    return FOUND, route
```

---

## 12. BFS Pseudocode
```text
Algorithm BFS(AdjList, ClosedEdges, source, destination):
    Input:  AdjList, ClosedEdges, source, destination
    Output: fewest-hop path, total weight, hop count, trace

    queue = Queue()
    visited = Set()
    predecessors = Map()
    trace = List()

    visited.add(source)
    queue.enqueue((node: source, hops: 0))
    emit ALGORITHM_STARTED, SOURCE_INITIALISED

    found = false
    while not queue.isEmpty():
        (u, hops) = queue.dequeue()
        emit NODE_DEQUEUED(u, hops)

        if u == destination:
            found = true
            emit DESTINATION_REACHED(u)
            break

        for each (v, edgeId, weight) in AdjList[u]:
            if edgeId in ClosedEdges:
                emit EDGE_SKIPPED_CLOSED(edgeId)
                continue

            emit EDGE_EXAMINED(edgeId, u, v)

            if v not in visited:
                visited.add(v)
                predecessors[v] = (node: u, edgeId: edgeId, weight: weight)
                queue.enqueue((node: v, hops: hops + 1))
                emit NODE_ENQUEUED(v, hops + 1)

    if not found:
        emit DESTINATION_UNREACHABLE
        return UNREACHABLE

    route = ReconstructRoute(source, destination, predecessors)
    emit ALGORITHM_COMPLETED(route)
    return FOUND, route
```

---

## 13. Time and Space Complexity Analysis

### Dijkstra's Algorithm
- **Priority Queue Operations:**
  - With lazy deletion, every vertex is settled at most once: $\mathcal{O}(V)$ successful pop operations.
  - Every edge relaxation pushes an entry into the heap. In the worst case, at most $\mathcal{O}(E)$ insertions occur.
  - The maximum size of the binary min-heap is $\mathcal{O}(E)$.
  - A push or pop operation on a binary heap of size $K \le E$ requires $\mathcal{O}(\log K) = \mathcal{O}(\log E) = \mathcal{O}(\log V)$ comparisons (since $E \le V^2$, $\log E \le 2 \log V$).
- **Total Time Complexity:**
  $$\mathcal{O}(V \log V + E \log V) = \mathcal{O}((V + E) \log V)$$
- **Auxiliary Space Complexity:**
  - Distance map: $\mathcal{O}(V)$
  - Predecessor map: $\mathcal{O}(V)$
  - Finalised set: $\mathcal{O}(V)$
  - Binary min-heap entries: $\mathcal{O}(E)$
  - Adjacency list: $\mathcal{O}(V + E)$
  - Total auxiliary space: $\mathcal{O}(V + E)$.

### Breadth-First Search (BFS)
- Each vertex enters and leaves the queue at most once: $\mathcal{O}(V)$.
- In an undirected graph, each open edge is inspected at most twice (once from each incident vertex): $\mathcal{O}(E)$.
- **Total Time Complexity:** $\mathcal{O}(V + E)$.
- **Auxiliary Space Complexity:** $\mathcal{O}(V)$ for queue and visited set.

---

## 14. Implementation Details
1. **Deterministic Tie-Breaking:**
   To guarantee platform-independent determinism, the binary min-heap prioritizes:
   - Primary: Tentative distance `priority`
   - Secondary: Node ID string (`localeCompare`)
   - Tertiary: Monotonically increasing insertion counter `seq` (FIFO)
2. **Immutability of Graph Data:**
   The base graph (`BASE_GRAPH`) is deeply frozen using `Object.freeze`. Closures are maintained in a React state `Set<string>`. The algorithm operates on the base adjacency list and skips any edge present in the closed set.
3. **Execution Trace & Time-Travel Reducer:**
   Every discrete algorithmic decision emits a discriminated union `TraceEvent`. The replay function `stateAtStep(trace, i)` replays events $0 \dots i$ from the initial state, ensuring that clicking "Previous Step" is 100% bug-free and exact.

---

## 15. Sample Test Cases and Expected Outcomes

| Test Case | Source | Destination | Active Closures | Algorithm | Expected Distance | Observed Distance | Expected Hops | Observed Hops | Status |
|---|---|---|---|---|---|---|---|---|---|
| TC-01 (Default Demo) | `vit` | `worli_sea_face` | None | Dijkstra | 7.2 km | 7.2 km | 5 | 5 | PASSED |
| TC-02 (BFS Contrast) | `vit` | `worli_sea_face` | None | BFS | 9.8 km | 9.8 km | 2 | 2 | PASSED |
| TC-03 (Single Closure) | `vit` | `worli_sea_face` | `dadar_tt-siddhivinayak` | Dijkstra | 8.4 km | 8.4 km | 7 | 7 | PASSED |
| TC-04 (First Hop Closure) | `vit` | `worli_sea_face` | `vit-wadala_bridge` | Dijkstra | 8.2 km | 8.2 km | 3 | 3 | PASSED |
| TC-05 (Irrelevant Closure) | `vit` | `worli_sea_face` | `marine_drive-churchgate_station` | Dijkstra | 7.2 km | 7.2 km | 5 | 5 | PASSED |
| TC-06 (Node Isolation) | `vit` | `chembur` | `kurla-chembur`, `sion-chembur` | Dijkstra | $\infty$ | $\infty$ | 0 | 0 | PASSED |
| TC-07 (Same Node) | `vit` | `vit` | None | Dijkstra | 0.0 km | 0.0 km | 0 | 0 | PASSED |
| TC-08 (Floyd-Warshall Oracle) | All 625 pairs | All 625 pairs | None & 15 Random Sets | Dijkstra | Match Oracle | Match Oracle | N/A | N/A | PASSED |

---

## 16. Road Closure Simulation
Road closures simulate real-world traffic restrictions (e.g., flyover repairs, waterlogging during Mumbai monsoons).
- **Inspection:** Clicking an edge opens the Road Inspector with endpoints, weight, and current status.
- **Closure State:** Closing an edge marks it with a red dashed line and a midpoint cross marker `X`.
- **Rerouting:** The active route is marked stale, prompting recalculation. When recalculated, the system compares the new result with the baseline journey, reporting exact quantitative deltas (e.g., `+1.2 km longer than previous route`).
- **Deterministic Demo Mode:** Implements the deterministic rule: *The first road on the route, in order from the start, whose closure still leaves an alternate route.*

---

## 17. Screenshots
> *Screenshots not captured in this environment — insert manually.*  
> Recommended captures from the running application:
> 1. Initial application overview with default Mumbai graph and VIT/Worli Sea Face preselected.
> 2. Live Dijkstra execution trace at step 12 showing amber edge relaxations and frontier nodes.
> 3. Completed shortest route highlighting the 5-hop 7.2 km corridor in cyan.
> 4. Side-by-side comparison panel displaying Dijkstra (7.2 km, 5 hops) vs BFS (9.8 km, 2 hops).
> 5. Road Inspector with active closures list and the rerouting delta notice.

---

## 18. Results and Discussion
All 40 automated tests passed in Vitest with zero failures. The empirical results verify:
1. **Dijkstra Optimality:** On the default network, Dijkstra correctly identified the unique minimum weight path of 7.2 km across 5 segments:
   $$\text{vit} \rightarrow \text{wadala\_bridge} \rightarrow \text{five\_gardens} \rightarrow \text{dadar\_tt} \rightarrow \text{siddhivinayak} \rightarrow \text{worli\_sea\_face}$$
2. **BFS Suboptimality for Weighted Distance:** BFS selected the 2-hop express corridor:
   $$\text{vit} \rightarrow \text{dadar\_tt} \rightarrow \text{worli\_sea\_face}$$
   Total distance = $4.6 + 5.2 = 9.8\text{ km}$, which is $2.6\text{ km}$ longer than Dijkstra. This provides undeniable visual and quantitative proof to students of why BFS cannot be used for weighted distance minimization.
3. **Execution Trace Invariance:** Replaying 100% of recorded events yielded the identical graph state and distance, confirming mathematical determinism.

---

## 19. Limitations
- Distances are illustrative weights chosen for pedagogical clarity, not verified satellite road mileage.
- Elevation, traffic signal delays, and multi-lane road capacities are not modeled.
- Graph edges are undirected; one-way traffic restrictions are not represented.

---

## 20. Conclusion
SmartRoute successfully demonstrates how classical algorithms can be brought to life through clean software engineering and pedagogical visualization. By combining rigorous graph representation, deterministic min-heaps, trace-driven state reconstruction, dynamic road closures, and automated oracle verification, the project serves as an exemplary educational platform for students, educators, and examiners alike.

---

## 21. References
1. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press. [Suggested Reading - Graph Algorithms & Dijkstra]
2. Sedgewick, R., & Wayne, K. (2011). *Algorithms* (4th ed.). Addison-Wesley Professional. [Suggested Reading - Priority Queues & Shortest Paths]
3. Kleinberg, J., & Tardos, É. (2006). *Algorithm Design*. Pearson. [Suggested Reading - Greedy Algorithms & BFS Layers]
4. W3C SVG Working Group. (2018). *Scalable Vector Graphics (SVG) 2 Specification*. World Wide Web Consortium (W3C).
