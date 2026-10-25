# SmartRoute: Lab Viva Guide & Code Walkthrough

---

## Part 1: Comprehensive Viva Questions & Model Answers

### 1. What data structure is used to represent the road network in SmartRoute, and why?
**Answer:** An **Adjacency List** (`Map<string, AdjacencyEntry[]>`), where neighbors are sorted by node ID. We chose an adjacency list over an adjacency matrix because road networks are inherently sparse graphs ($V = 25$, $E = 41$). An adjacency matrix would consume $\mathcal{O}(V^2) = 625$ entries and waste time iterating over non-existent connections. The adjacency list requires only $\mathcal{O}(V + E) = 66$ space and allows inspecting incident roads in $\mathcal{O}(\text{deg}(u))$ time.

### 2. Is the road network directed or undirected? How is that modeled?
**Answer:** The network is **undirected** and weighted. Every road can be traversed in both directions. In the adjacency list builder (`buildAdjacencyList`), each edge $(u, v, w)$ inserts an entry into $u$'s list pointing to $v$ and an entry into $v$'s list pointing to $u$.

### 3. Why must all edge weights in Dijkstra's algorithm be strictly positive?
**Answer:** Dijkstra's algorithm relies on a greedy property: once a vertex $u$ is extracted from the priority queue with minimal tentative distance, its distance is finalized and guaranteed to be optimal. If negative edge weights were permitted, a subsequent path could reduce the cost of an already-settled vertex, violating the greedy invariant and producing incorrect results.

### 4. What priority queue implementation is used, and what are its operations?
**Answer:** A custom **Binary Min-Heap** (`PriorityQueue<T>`). It implements:
- `push(item, priority, id)`: Adds element and sifts up in $\mathcal{O}(\log N)$ time.
- `pop()`: Extracts the minimum element and sifts down in $\mathcal{O}(\log N)$ time.
- `peek()`: Returns the minimum element without removal in $\mathcal{O}(1)$ time.
- `size` and `isEmpty()`: Evaluated in $\mathcal{O}(1)$ time.

### 5. Why did you use lazy deletion instead of decrease-key in the priority queue?
**Answer:** In JavaScript/TypeScript, standard binary heaps do not support an $\mathcal{O}(\log N)$ `decrease-key` operation without maintaining an auxiliary node-index lookup map that must be updated on every swap during sift-up and sift-down. **Lazy deletion** simplifies the heap: when a shorter distance to node $v$ is discovered, we simply push a new pair `(newDist, v)` into the heap. When a stale entry is later popped, we check if $v$ has already been finalized; if so, we discard it as `STALE_ENTRY_SKIPPED` in $\mathcal{O}(1)$ time. This maintains the same asymptotic time complexity $\mathcal{O}((V + E) \log V)$ with significantly cleaner, less error-prone code.

### 6. What is the deterministic tie-breaking rule in your priority queue?
**Answer:** When two elements in the heap have the exact same priority (tentative distance), the tie is broken first by **alphabetical comparison of node IDs** (`a.id.localeCompare(b.id)`). If node IDs are identical, the tie is broken by **insertion sequence number** (FIFO order). This ensures 100% deterministic, reproducible execution across all machines and browsers.

### 7. What is edge relaxation?
**Answer:** Edge relaxation is the process of checking whether traversing an edge $(u, v)$ with weight $w$ through vertex $u$ provides a shorter path to $v$ than the currently known shortest distance to $v$. If $\text{dist}[u] + w < \text{dist}[v]$, we relax the edge by updating $\text{dist}[v] = \text{dist}[u] + w$ and recording $u$ as the predecessor of $v$.

### 8. How is the final shortest path reconstructed after Dijkstra finishes?
**Answer:** During relaxation, we record each node's predecessor: `predecessors[v] = { node: u, edgeId, weight }`. Once the destination is reached, `reconstructRoute` starts at the destination and backtracks predecessor pointers iteratively until reaching the source. The resulting sequence is reversed to yield the start-to-destination path.

### 9. What is the exact time complexity of your Dijkstra implementation?
**Answer:** $\mathcal{O}((V + E) \log V)$.
- Each of the $V$ vertices is finalized at most once ($\mathcal{O}(V \log V)$).
- Each of the $E$ edges is examined, causing at most $E$ insertions into the heap ($\mathcal{O}(E \log E)$).
- Since $E \le V^2$, $\log E \le 2 \log V$, so $\mathcal{O}(E \log E) = \mathcal{O}(E \log V)$.
- Adding these yields $\mathcal{O}((V + E) \log V)$.

### 10. What is the auxiliary space complexity of your Dijkstra implementation?
**Answer:** $\mathcal{O}(V + E)$.
- Distance table: $\mathcal{O}(V)$
- Predecessor map: $\mathcal{O}(V)$
- Finalised set: $\mathcal{O}(V)$
- Binary min-heap entries (with lazy deletion): at most $\mathcal{O}(E)$
- Adjacency list: $\mathcal{O}(V + E)$
- Total auxiliary space is $\mathcal{O}(V + E)$.

### 11. Why does Breadth-First Search (BFS) fail to find the shortest path on a weighted graph?
**Answer:** BFS assumes all edges have uniform (equal) cost and expands uniformly in concentric layers based on hop count (depth). It finds the path with the **minimum number of edges**, completely ignoring weights. If a 2-hop route has high-weight roads (e.g., 9.8 km) while an alternative 5-hop route has low-weight roads (e.g., 7.2 km), BFS will pick the 2-hop route because $2 < 5$, resulting in a strictly longer physical distance.

### 12. Can you give the real numbers from SmartRoute demonstrating this BFS discrepancy?
**Answer:** Yes! For the default journey from **VIT to Worli Sea Face**:
- **Dijkstra** selects the 5-hop path via Wadala Bridge, Five Gardens, Dadar TT, Siddhivinayak, and Worli Sea Face, with total weight **7.2 km**.
- **BFS** selects the 2-hop express corridor via Wadala-Dadar Arterial (`vit-dadar_tt`, 4.6 km) and Dadar-Worli Link (`dadar_tt-worli_sea_face`, 5.2 km), totaling **9.8 km**.
- BFS finds fewer hops ($2 < 5$), but its distance is **2.6 km longer** than Dijkstra ($9.8 > 7.2$).

### 13. How are road closures represented and simulated without mutating base graph data?
**Answer:** The base graph data (`BASE_GRAPH`) is frozen using `Object.freeze`. The active closures are maintained separately in a state `Set<string>` of closed edge IDs. When Dijkstra or BFS executes, it receives the base adjacency list and the closed-edge set. If an edge ID is in the set, the algorithm skips it and increments the `closedEdgesSkipped` counter. The underlying graph definition is never mutated.

### 14. What happens when the destination is unreachable?
**Answer:** When all corridors to a destination are blocked by closures (or on a disconnected graph), the priority queue empties without the destination ever being settled. The algorithm detects this, records a `DESTINATION_UNREACHABLE` trace event, sets distance to $\infty$, hop count to 0, status to `'UNREACHABLE'`, and returns a clear descriptive message.

### 15. What happens when the start and destination locations are identical?
**Answer:** The algorithm intercepts this as a base case: distance is $0.0\text{ km}$, hop count is $0$, path is `[source]`, status is `'SAME_NODE'`, and the short trace records completion in 0 steps.

### 16. What is the difference between theoretical time complexity and measured browser runtime?
**Answer:** Theoretical time complexity ($\mathcal{O}((V + E) \log V)$) describes asymptotic growth as input size approaches infinity, independent of hardware. Measured browser runtime (e.g., $0.05\text{ ms}$ over 200 iterations) is hardware-, OS-, and garbage-collection-dependent. For small graphs, microbenchmarks can be noisy due to timer resolution, which is why operation counts (relaxations, edges examined) are far more reliable for algorithmic analysis.

### 17. How does the execution trace visualization ensure that "Previous Step" is 100% bug-free?
**Answer:** Through a **pure reducer pattern**. We implement `stateAtStep(trace, i)` which takes the immutable trace events and replays events from index $0$ to $i$ using `applyEvent`. Stepping backward simply evaluates `stateAtStep(trace, currentStep - 1)`. Because the reducer is a pure function without side effects, time-travel stepping forward or backward is mathematically exact and deterministic.

### 18. How did you verify the mathematical correctness of your Dijkstra implementation?
**Answer:** Through an automated **Floyd-Warshall all-pairs shortest path Oracle test** (`oracle.test.ts`):
1. We compute all shortest paths for all $25 \times 25 = 625$ ordered node pairs using Floyd-Warshall and assert that Dijkstra produces identical distances for every single pair.
2. We repeat this check across 15 pseudo-random road closure scenarios generated with a fixed-seed PRNG (Linear Congruential Generator).

### 19. How did you test that Chembur can be isolated (Property P5)?
**Answer:** `chembur` has exactly two incident roads in our graph: `kurla-chembur` and `sion-chembur`. In `propertiesP1P7.test.ts`, closing both edges and running Dijkstra from `vit` to `chembur` confirms that `chembur` becomes unreachable (status `'UNREACHABLE'`).

### 20. How does the deterministic suggestion rule in Demo Mode work?
**Answer:** It follows a stated rule: *The first road on the route, in order from the start, whose closure still leaves an alternate route.* The code actually executes a dry-run Dijkstra for each road on the current path, filtering for those that leave the destination reachable, and suggests the first candidate. It never picks a random road.

### 21. What are the values of $V$ and $E$ in SmartRoute?
**Answer:** $V = 25$ vertices (locations) and $E = 41$ edges (road links).

### 22. Why did you not use an external charting or mapping library like Leaflet or Chart.js?
**Answer:** External libraries introduce heavy bundle overhead, external network dependencies, tile licensing, and abstract canvas layers that make it impossible to directly bind graph algorithms to SVG DOM elements. Implementing the SVG canvas and CSS bars directly ensures zero external dependencies, 100% offline functionality, and complete control over accessibility and styling.

### 23. How is web accessibility (a11y) maintained in the application?
**Answer:** 
- Visual status does not rely on color alone (we use labels, icons, dashed strokes, and cross markers).
- Semantic HTML and ARIA landmarks (`role="region"`, `role="tablist"`).
- Keyboard navigation: nodes and edges have `tabIndex={0}`, with Enter and Space key handlers.
- Real-time step announcements are delivered to screen readers via an `aria-live="polite"` status region.
- All text meets WCAG AA contrast ratio standards against dark backgrounds.

### 24. What does the "Stale Route" banner mean in the UI?
**Answer:** When a user closes or reopens a road, the underlying network topology changes. If an existing route was calculated prior to that change, that route may now be suboptimal or invalid. The system flags the route as "stale" and provides an immediate one-click "Recalculate" action.

### 25. How does Dijkstra handle cycles in an undirected graph?
**Answer:** In an undirected graph, every edge $(u, v)$ is effectively a 2-cycle $(u \leftrightarrow v)$. Dijkstra prevents infinite cycling by maintaining a `finalised` set. Once vertex $u$ is popped and settled, it is never relaxed or re-expanded, preventing the algorithm from looping back.

---

## Part 2: Code Walkthrough for Lab Viva Narration

When explaining the codebase to an examiner, narrate these key files in sequence:

### 1. `src/graph/graphData.ts` & `types.ts`
> *"Here we define our graph domain model. `LocationNode` contains geographic coordinates $(x, y)$, name, and area. `RoadEdge` contains endpoint IDs and weight in kilometers. All 25 nodes and 41 edges are frozen in `BASE_GRAPH` with `Object.freeze` to guarantee immutability."*

### 2. `src/graph/graphUtils.ts`
> *"This utility builds our adjacency list. Notice that we sort neighbor entries alphabetically by node ID. This ensures our graph traversal is completely deterministic across different JavaScript engines."*

### 3. `src/algorithms/priorityQueue.ts`
> *"This is our custom binary min-heap. Notice the `compare` method on line 64: it breaks ties first by numeric priority, then by node ID, and finally by insertion sequence counter. This guarantees strict reproducibility."*

### 4. `src/algorithms/dijkstra.ts`
> *"This is our primary shortest path algorithm. We maintain `dist`, `predecessors`, and `finalised`. Notice lines 218-230: when a node is popped, if it is already in `finalised`, we skip it via lazy deletion and emit a `STALE_ENTRY_SKIPPED` event. On line 282, if an edge is in `closedEdges`, we skip it without evaluating weights. On successful relaxation (line 307), we update distance, record the predecessor, and push to our min-heap."*

### 5. `src/algorithms/bfs.ts`
> *"This is our BFS comparison implementation. It uses a standard FIFO queue and `visited` set. It ignores weights and tracks hop count, allowing us to demonstrate why BFS chooses fewer roads but higher distance."*

### 6. `src/simulation/executionTrace.ts`
> *"This engine powers our step-by-step animation. `applyEvent` is a pure reducer that transitions visual state based on algorithm events. `stateAtStep` replays events from 0 to $i$, making 'Previous Step' safe and bug-free."*

### 7. `src/tests/` (Vitest Suite)
> *"We have 40 comprehensive automated tests across 8 test suites. `propertiesP1P7.test.ts` formally tests all seven required project properties on the Mumbai network, and `oracle.test.ts` tests Dijkstra against an all-pairs Floyd-Warshall implementation."*
