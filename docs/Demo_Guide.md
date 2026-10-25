# SmartRoute: 3–5 Minute Demonstration Script

This guide provides a timed, sentence-level speaking script for demonstrating **SmartRoute** to an examiner or audience during a lab viva or project review.

---

## Preparation & Pre-Demo Setup
1. Open terminal in the project directory:
   ```bash
   cd C:\Users\dudam\.gemini\antigravity\scratch\smartroute
   npm run preview
   ```
2. Open your web browser to `http://localhost:4173/`.
3. Press **F11** for clean full-screen viewing.
4. Ensure default state is loaded (VIT as Start, Worli Sea Face as Destination). If not, click **"Load Default Demo"** in the top navigation header.

---

## Timed Demonstration Script

### Minute 0:00 – 0:45: Project Introduction & Graph Overview
* **Action:** Gesture toward the high-contrast SVG map. Point out the Arabian Sea on the left, the northern nodes (Bandra, BKC), central nodes (Wadala, Dadar), and southern transit nodes.
* **Speaking Script:**
  > *"Good morning. Today I am presenting SmartRoute, an intelligent route planning and algorithm analysis system built for the Analysis and Design of Algorithms curriculum.
  >
  > Rather than using abstract nodes, SmartRoute models a realistic, simulated 25-location road network of Mumbai with 41 road segments. Distances are illustrative weights in kilometers.
  >
  > Every path you see is genuinely computed from the underlying graph data—nothing is hardcoded or mocked. We are going to explore Dijkstra's algorithm, see how it compares against Breadth-First Search, and simulate dynamic road closures in real time."*

---

### Minute 0:45 – 1:45: Computing Default Route & Explaining Dijkstra
* **Action:** Click the blue **"Find Shortest Route"** button. The trace animation begins at normal (1.0x) speed.
* **Speaking Script:**
  > *"Here, our source is Vidyalankar Institute of Technology (VIT) and our destination is Worli Sea Face. When I click 'Find Shortest Route', Dijkstra's algorithm executes immediately.
  >
  > Notice the simulation bar at the bottom: our animation is not an aesthetic simulation; it is an exact replay of the algorithm's execution trace.
  >
  > As the algorithm runs, the green ring indicates settled vertices, the indigo dashed lines highlight the priority queue frontier, and the amber lines show active edge relaxations where tentative distances are updated."*

---

### Minute 1:45 – 2:45: Stepping, Time-Travel Replay, & Final Route
* **Action:** Click **"Pause"** on the simulation bar. Click **"Prev"** twice to step backward, then drag the scrubber slider forward to the end, or click **"End"**.
* **Speaking Script:**
  > *"Because our execution engine uses a pure reducer function called `stateAtStep`, we have full time-travel capability. I can pause at any step, single-step backward safely, or scrub directly to the conclusion.
  >
  > The algorithm finishes and settles on our optimal route, highlighted here in cyan:
  > VIT &rarr; Wadala Bridge &rarr; Five Gardens &rarr; Dadar TT &rarr; Siddhivinayak &rarr; Worli Sea Face.
  >
  > The total computed shortest distance is exactly 7.2 km across 5 road segments."*

---

### Minute 2:45 – 3:30: Road Closure Simulator & Demo Mode Rerouting
* **Action:** Under Route Controls, click **"Demo Mode: Close a Road on Current Route"**. Highlight the suggested edge `dadar_tt-siddhivinayak` and click **"Close Road"**.
* **Speaking Script:**
  > *"Now, let us examine what happens when unexpected events occur, such as monsoon waterlogging or road construction.
  >
  > In Demo Mode, our system deterministically evaluates candidate roads on the active path using a stated rule: 'The first road from the start whose closure still leaves an alternate path.' It selects `dadar_tt-siddhivinayak`.
  >
  > Notice the red dashed line with the cross marker showing that the road is now closed. Our previous route is immediately flagged as stale.
  >
  > When I click 'Recalculate', Dijkstra re-runs on the modified graph without ever mutating the base graph data. The route diverts around the closure via Dadar West and Prabhadevi, yielding a new distance of 8.4 km—an exact increase of +1.2 km, as quantitatively reported in our comparison summary."*

---

### Minute 3:30 – 4:15: Pedagogical Contrast: Dijkstra vs. BFS
* **Action:** Click on the **"Analysis & Comparison"** tab in the sidebar. Scroll to the comparison table and bar chart.
* **Speaking Script:**
  > *"Next, we address a classic examination question: 'Why can BFS not be used for shortest paths on a weighted graph?'
  >
  > In this comparison panel, both algorithms are evaluated on this exact same journey:
  > - Dijkstra prioritizes physical weight, finding the 7.2 km route across 5 hops.
  > - BFS ignores road weights entirely and optimizes solely for hop count. It selects an express bypass through Dadar TT in just 2 hops, but its total distance is 9.8 km!
  >
  > BFS yields a path with 3 fewer roads, but 2.6 km longer than Dijkstra. This gives students clear quantitative and visual evidence of BFS's sub-optimality on weighted road networks."*

---

### Minute 4:15 – 5:00: Asymptotic Complexity & Conclusion
* **Action:** Point to the **Execution Metrics** and **Asymptotic Complexity** cards.
* **Speaking Script:**
  > *"Finally, looking at our metrics dashboard, every single counter—such as 12 nodes finalised, 21 edges examined, and 3 stale heap entries skipped—is instrumented directly in our code.
  >
  > Our time complexity is $\mathcal{O}((V + E) \log V)$ with $\mathcal{O}(V + E)$ auxiliary space, verified by 40 automated unit tests including an all-pairs Floyd-Warshall oracle.
  >
  > In conclusion, SmartRoute bridges the gap between theoretical algorithm analysis and applied software engineering. Thank you, and I welcome any questions."*

---

## Backup Plan & Troubleshooting
- **If animation is running too slow for your allotted time:** Change the speed selector from `1.0x` to `4.0x` or `Instant` to immediately jump to the finalized path.
- **To reset between rehearsal runs:** Click the **"Reset Simulation"** button in the header. This clears closures, resets endpoints to default, and clears the route in one click.
- **If an examiner asks to isolate a node:** Select destination `Chembur`. In Road Inspector, click on `kurla-chembur` and close it, then click on `sion-chembur` and close it. Click "Find Shortest Route": the system immediately confirms status `UNREACHABLE` with distance $\infty$.
