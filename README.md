# SmartRoute — Intelligent Route Planning and Algorithm Analysis System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://ayushdudam.github.io/smartroute/)
[![GitHub Repo](https://img.shields.io/badge/Repository-Ayushdudam%2Fsmartroute-black?style=for-the-badge&logo=github)](https://github.com/Ayushdudam/smartroute)

🌐 **Live URL:** [https://ayushdudam.github.io/smartroute/](https://ayushdudam.github.io/smartroute/)  
📁 **Repository:** [https://github.com/Ayushdudam/smartroute](https://github.com/Ayushdudam/smartroute)

> **Simulated Road Network Disclaimer:**  
> *Simulated road network for educational purposes. Distances are illustrative weights, not verified real-world distances or driving directions.*

---

## 1. Project Overview & Problem Statement
In computer engineering curricula (specifically **Analysis and Design of Algorithms - AOA**), students frequently learn shortest-path algorithms such as **Dijkstra's Algorithm** and **Breadth-First Search (BFS)** through theoretical pseudocode, matrix traces, and static diagrams. However, abstract pencil-and-paper analysis often fails to convey critical real-world engineering subtleties, such as:
1. Why BFS fails to find shortest paths on weighted road networks.
2. How priority queue tie-breaking and lazy deletion affect settling order.
3. How graph closures (e.g., road construction, waterlogging, accidents) dynamically invalidate route optimality and require rerouting.
4. The exact relationship between theoretical asymptotic time complexity ($O((V+E)\log V)$) and observable execution operations (relaxations, heap pushes, stale skips).

**SmartRoute** solves this pedagogical gap by providing an interactive, simulated 25-location Mumbai road network engineered from first principles in React, TypeScript, and SVG. Every path is genuinely computed from underlying graph data, every animation step is driven by an immutable execution trace, and all dashboard metrics are computed from instrumentation within the algorithm code.

---

## 2. Core Objectives
- **Algorithmic Authenticity:** No hardcoded routes, distances, or canned animations. Algorithms execute on demand on an undirected weighted adjacency list.
- **Trace-Driven Visualisation:** The visual playback engine replays the exact sequence of events emitted by the algorithm (`NODE_SELECTED`, `EDGE_EXAMINED`, `DISTANCE_UPDATED`, `STALE_ENTRY_SKIPPED`, `NODE_FINALISED`).
- **Dynamic Road Closure Simulator:** Interactive toggling of road closures without mutating base graph data, maintaining immutable baseline comparisons and providing deterministic rerouting suggestions.
- **Rigorous Complexity & Metric Verification:** Side-by-side comparison of Dijkstra (weighted shortest distance) vs BFS (fewest hops), paired with an automated Floyd-Warshall oracle test suite.

---

## 3. Technology Stack & Architectural Separation
Designed with minimal dependencies to ensure long-term reproducibility, fast offline evaluation, and zero external runtime dependencies:
- **Language & Runtime:** TypeScript 5.7 (`strict: true`, `noUncheckedIndexedAccess: true`), Node.js &ge; 20.
- **Framework & Tooling:** React 19, Vite 6, Vitest 3.
- **Styling & Rendering:** Pure CSS with CSS custom properties (variables), native SVG for high-contrast map rendering and bar charts.
- **Zero Heavy Dependencies:** No external state management library, no third-party map tiles, and no charting packages.

### Directory Structure
```
smartroute/
├── src/
│   ├── graph/                 # Immutable graph domain
│   │   ├── types.ts           # LocationNode, RoadEdge, AdjacencyList
│   │   ├── graphData.ts       # 25 nodes, 41 edges (Object.freeze)
│   │   ├── graphValidation.ts # Self-loops, parallel edges, bounds, connectivity
│   │   ├── graphUtils.ts      # Adjacency list builder (sorted for determinism)
│   │   └── routeReconstruction.ts # Predecessor chain backtracking
│   ├── algorithms/            # Pure algorithmic implementations (no DOM/React imports)
│   │   ├── types.ts           # Trace events, algorithm results, counters
│   │   ├── priorityQueue.ts   # Binary min-heap with deterministic tie-breaking
│   │   ├── dijkstra.ts        # Lazy-deletion Dijkstra with trace instrumentation
│   │   └── bfs.ts             # Fewest-hop BFS with trace instrumentation
│   ├── simulation/            # Pure execution trace replay engine
│   │   ├── executionTrace.ts  # Pure reducer applyEvent() and stateAtStep()
│   │   └── simulationController.ts # Playback logic, step bounds, speed configs
│   ├── hooks/                 # Custom React state hooks
│   │   └── useSmartRoute.ts   # Central coordination hook
│   ├── components/            # Focused presentational and interactive UI
│   │   ├── Header.tsx         # Title, status badges, global actions
│   │   ├── MapCanvas.tsx      # SVG map, pan/zoom, coastline, nodes, edges
│   │   ├── LocationNode.tsx   # SVG node element with accessible badges
│   │   ├── RoadEdge.tsx       # SVG road lines, weight badges, closure markers
│   │   ├── SimulationBar.tsx  # Scrubber slider, Play/Pause/Prev/Next, speed selector
│   │   ├── RouteControls.tsx  # Endpoint selectors, swap, find route, demo mode
│   │   ├── AlgorithmControls.tsx # Dijkstra vs BFS mode toggle
│   │   ├── RoadInspector.tsx  # Edge inspection, closure toggles, closed list
│   │   ├── RouteSummary.tsx   # Distance, hops, turn-by-turn sequence, stale banner
│   │   ├── AnalysisDashboard.tsx # V, E, relaxations, heap pushes, stale skips
│   │   ├── ComplexityPanel.tsx   # Theoretical asymptotic bounds explanation
│   │   ├── ComparisonPanel.tsx   # Side-by-side Dijkstra vs BFS comparison
│   │   ├── ExecutionLog.tsx   # Clickable step-by-step trace event log
│   │   └── RuntimeBenchmark.tsx # 200-iteration latency benchmark with disclaimer
│   ├── styles/                # CSS custom properties and main styles
│   ├── utils/                 # Formatters and Floyd-Warshall test oracle
│   └── tests/                 # Comprehensive Vitest test suite (40 tests)
├── docs/                      # Comprehensive technical documentation
│   ├── AOA_Project_Report.md  # 21-section formal academic project report
│   ├── Viva_Guide.md          # 30 viva exam questions + code walkthrough
│   ├── Demo_Guide.md          # 3-5 minute live demonstration script
│   └── Graph_Data.md          # Complete node/edge table and verified P1-P7 outcomes
├── package.json
└── tsconfig.json
```

---

## 4. Algorithms Implemented

### 4.1 Dijkstra's Shortest Path Algorithm
- **Role:** Primary weighted shortest path algorithm.
- **Priority Queue:** Custom generic binary min-heap (`PriorityQueue<T>`).
- **Tie-Breaking:** Deterministic 3-tier ordering:
  1. Priority (tentative distance, ascending)
  2. Node ID (alphabetical ascending string comparison)
  3. Insertion sequence number (FIFO)
- **Lazy Deletion:** When a node's distance is improved, a new element is pushed into the heap. On `pop()`, stale entries whose popped distance exceeds the settled distance are recorded as `STALE_ENTRY_SKIPPED` and ignored.
- **Early Termination:** Search safely halts when the destination vertex is settled (`stopAtDestination: true`).
- **Asymptotic Complexity:**
  - **Time:** $\mathcal{O}((V + E) \log V)$
  - **Auxiliary Space:** $\mathcal{O}(V + E)$ (storing distance/predecessor tables plus up to $E$ heap entries)

### 4.2 Breadth-First Search (BFS)
- **Role:** Comparison algorithm to demonstrate fewest-hop path discovery.
- **Principle:** BFS ignores edge weights and minimizes the **number of road segments (hops)** only.
- **Pedagogical Contrast:** On this Mumbai road network, BFS finds an express corridor from VIT to Worli Sea Face in **2 hops (9.8 km)**, whereas Dijkstra finds the true shortest path in **5 hops (7.2 km)**.
- **Asymptotic Complexity:**
  - **Time:** $\mathcal{O}(V + E)$
  - **Auxiliary Space:** $\mathcal{O}(V)$

---

## 5. Verified Graph Properties (P1 – P7)
The default simulated graph ($V=25, E=41$) satisfies all seven formal properties:
- **P1:** Vidyalankar Institute of Technology (`vit`) &rarr; Worli Sea Face (`worli_sea_face`) is fully connected with multiple distinct alternative routes.
- **P2:** Default Dijkstra shortest route has **5 edges** (distance **7.2 km**).
- **P3:** Closing any road on the default route forces an alternate route (e.g., closing `dadar_tt-siddhivinayak` reroutes to **8.4 km**).
- **P4:** BFS default route has fewer hops (**2 hops**) but strictly higher weight (**9.8 km > 7.2 km**).
- **P5:** Chembur can be completely isolated by closing its 2 incident roads (`kurla-chembur` and `sion-chembur`).
- **P6:** Default shortest route of 7.2 km is strictly unique with no equal-weight ties.
- **P7:** Closing an irrelevant road (e.g., `marine_drive-churchgate_station`) leaves the default route unchanged.

---

## 6. Installation & Execution Commands

### Prerequisites
- Node.js &ge; 20.0.0
- npm &ge; 10.0.0

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Run test suite (Vitest single run)
npm run test

# 3. Type check (strict TypeScript)
npm run typecheck

# 4. Start local development server
npm run dev

# 5. Build optimized production bundle
npm run build

# 6. Preview production build locally
npm run preview
```

---

## 7. How to Demonstrate in 3 Minutes
1. **Initial Screen:** Observe the 25 Mumbai locations on the high-contrast SVG map. Start is preselected as `VIT` and Destination as `Worli Sea Face`.
2. **Find Shortest Route:** Click the blue **Find Shortest Route** button. Watch Dijkstra explore frontiers, relax edges in amber, and highlight the final 7.2 km path in cyan.
3. **Inspect Trace Controls:** Click **Pause**, click **Prev** to step backward (safely rebuilt via pure reducer `stateAtStep`), or drag the scrubber slider.
4. **Simulate Road Closure (Demo Mode):** In Route Controls, click **Demo Mode: Close a Road on Current Route**. The system deterministically suggests closing `dadar_tt-siddhivinayak`. Click to close and recalculate: the route immediately shifts to an 8.4 km alternate path.
5. **Compare Dijkstra vs BFS:** Switch to the **Analysis & Comparison** tab. See Dijkstra (7.2 km, 5 hops) side-by-side with BFS (9.8 km, 2 hops), demonstrating why BFS cannot be used for weighted shortest distance.

---

## 8. Limitations & Future Scope
- **Illustrative Distances:** Distances are static illustrative weights designed for educational clarity, not live GPS or driving directions.
- **Undirected Network:** All roads are bidirectional. Future enhancements could support one-way streets via directed edges.
- **Static Weights:** Real-world traffic congestion is not modeled in real time. Future iterations could integrate real-time API feeds or $A^*$ heuristic search using Euclidean coordinate distances.
