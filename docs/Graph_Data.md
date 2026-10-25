# SmartRoute: Graph Topology & Verified Properties Data

> **Disclaimer:** Simulated road network for educational purposes. Distances are illustrative weights, not verified real-world distances or driving directions.

---

## 1. Complete Node Inventory (25 Locations)

| # | Node ID | Full Landmark Name | Geographic Area | Canvas X | Canvas Y |
|---|---|---|---|---|---|
| 1 | `bandra_station` | Bandra Station | Bandra & Western connectivity | 260 | 120 |
| 2 | `bkc` | Bandra Kurla Complex | Bandra & Western connectivity | 530 | 130 |
| 3 | `kurla` | Kurla | Other | 790 | 140 |
| 4 | `mahim` | Mahim | Other | 280 | 220 |
| 5 | `sion` | Sion | Other | 670 | 220 |
| 6 | `chembur` | Chembur | Other | 960 | 230 |
| 7 | `sea_link` | Bandra-Worli Sea Link | Bandra & Western connectivity | 170 | 330 |
| 8 | `matunga_station` | Matunga Station | Wadala & Matunga | 420 | 270 |
| 9 | `five_gardens` | Five Gardens | Wadala & Matunga | 570 | 310 |
| 10 | `vit` | Vidyalankar Institute of Technology | Wadala & Matunga | 770 | 330 |
| 11 | `wadala_bridge` | Wadala Bridge | Wadala & Matunga | 670 | 410 |
| 12 | `dadar_station` | Dadar Station | Dadar & Prabhadevi | 390 | 370 |
| 13 | `dadar_west` | Dadar West | Other | 300 | 440 |
| 14 | `dadar_tt` | Dadar TT | Dadar & Prabhadevi | 520 | 420 |
| 15 | `prabhadevi` | Prabhadevi | Other | 330 | 520 |
| 16 | `siddhivinayak` | Siddhivinayak Temple | Dadar & Prabhadevi | 450 | 490 |
| 17 | `worli_fort` | Worli Fort | Worli | 170 | 440 |
| 18 | `worli_sea_face` | Worli Sea Face | Worli | 200 | 530 |
| 19 | `lower_parel_station`| Lower Parel Station | Lower Parel & Mahalaxmi | 440 | 580 |
| 20 | `phoenix_palladium` | Phoenix Palladium | Lower Parel & Mahalaxmi | 570 | 580 |
| 21 | `haji_ali` | Haji Ali | Lower Parel & Mahalaxmi | 240 | 640 |
| 22 | `mahalaxmi_station` | Mahalaxmi Station | Lower Parel & Mahalaxmi | 410 | 660 |
| 23 | `csmt` | Chhatrapati Shivaji Maharaj Terminus | South Mumbai | 620 | 710 |
| 24 | `marine_drive` | Marine Drive | South Mumbai | 300 | 730 |
| 25 | `churchgate_station`| Churchgate Station | South Mumbai | 450 | 740 |

---

## 2. Complete Edge Inventory (41 Road Segments)

| # | Edge ID | From Node | To Node | Weight (km) | Illustrative Road / Corridor Label |
|---|---|---|---|---|---|
| 1 | `bandra_station-bkc` | `bandra_station` | `bkc` | 3.2 | BKC Connector |
| 2 | `bandra_station-mahim` | `bandra_station` | `mahim` | 2.1 | Mahim Causeway |
| 3 | `bandra_station-sea_link` | `bandra_station` | `sea_link` | 2.8 | Sea Link Toll Approach |
| 4 | `bkc-kurla` | `bkc` | `kurla` | 2.6 | BKC Kurla Link |
| 5 | `bkc-sion` | `bkc` | `sion` | 3.4 | Sion-Bandra Link Rd |
| 6 | `kurla-chembur` | `kurla` | `chembur` | 3.8 | SCLR |
| 7 | `sion-chembur` | `chembur` | `sion` | 4.1 | Eastern Express Hwy Ext |
| 8 | `mahim-matunga_station` | `mahim` | `matunga_station` | 2.3 | Lady Jamshetjee Rd |
| 9 | `mahim-dadar_west` | `mahim` | `dadar_west` | 2.9 | Senapati Bapat Marg N |
| 10 | `sion-matunga_station` | `sion` | `matunga_station` | 2.5 | Dr Ambedkar Rd N |
| 11 | `sion-vit` | `sion` | `vit` | 2.4 | Sion Wadala Link |
| 12 | `sea_link-worli_sea_face` | `sea_link` | `worli_sea_face` | 4.7 | Rajiv Gandhi Sea Link |
| 13 | `vit-wadala_bridge` | `vit` | `wadala_bridge` | 1.2 | Barkat Ali Dargah Rd |
| 14 | `wadala_bridge-five_gardens`| `wadala_bridge` | `five_gardens` | 1.1 | Mancherji Joshi Rd |
| 15 | `matunga_station-five_gardens`| `matunga_station`| `five_gardens` | 1.4 | Parsi Colony Ave |
| 16 | `matunga_station-dadar_station`| `matunga_station`| `dadar_station` | 1.6 | Lakhamsi Napoo Rd |
| 17 | `vit-dadar_tt` | `vit` | `dadar_tt` | 4.6 | Wadala-Dadar Arterial (Heavy Shortcut) |
| 18 | `dadar_tt-worli_sea_face` | `dadar_tt` | `worli_sea_face` | 5.2 | Dadar-Worli Direct Link (Heavy Shortcut) |
| 19 | `five_gardens-dadar_tt` | `five_gardens` | `dadar_tt` | 1.3 | Tilak Bridge Approach |
| 20 | `dadar_station-dadar_tt` | `dadar_station` | `dadar_tt` | 1.0 | Pritam Hotel Crossway |
| 21 | `dadar_station-dadar_west` | `dadar_station` | `dadar_west` | 1.1 | Ranade Rd |
| 22 | `dadar_west-prabhadevi` | `dadar_west` | `prabhadevi` | 1.4 | Sayani Rd |
| 23 | `dadar_tt-siddhivinayak` | `dadar_tt` | `siddhivinayak` | 1.5 | SK Bole Rd |
| 24 | `siddhivinayak-prabhadevi` | `siddhivinayak` | `prabhadevi` | 1.0 | Khedkar Marg |
| 25 | `worli_fort-worli_sea_face` | `worli_fort` | `worli_sea_face` | 1.5 | Worli Village Coastal Rd |
| 26 | `worli_fort-prabhadevi` | `worli_fort` | `prabhadevi` | 1.9 | Koliwada Approach |
| 27 | `siddhivinayak-worli_sea_face`| `siddhivinayak` | `worli_sea_face` | 2.1 | Khan Abdul Ghaffar Khan Rd |
| 28 | `prabhadevi-worli_sea_face` | `prabhadevi` | `worli_sea_face` | 1.3 | Prabhadevi Coastal Cut |
| 29 | `prabhadevi-lower_parel_station`| `prabhadevi` | `lower_parel_station` | 1.7 | NM Joshi Marg N |
| 30 | `siddhivinayak-lower_parel_station`| `siddhivinayak`| `lower_parel_station` | 2.0 | Senapati Bapat Marg S |
| 31 | `wadala_bridge-phoenix_palladium`| `wadala_bridge`| `phoenix_palladium` | 3.5 | Sewri-Parel Link |
| 32 | `lower_parel_station-phoenix_palladium`| `lower_parel_station`| `phoenix_palladium`| 1.2 | High Street Phoenix Ln |
| 33 | `worli_sea_face-haji_ali` | `worli_sea_face` | `haji_ali` | 2.6 | Annie Besant Coastal Rd |
| 34 | `lower_parel_station-mahalaxmi_station`| `lower_parel_station`| `mahalaxmi_station`| 1.8 | Dr E Moses Rd |
| 35 | `phoenix_palladium-mahalaxmi_station`| `phoenix_palladium`| `mahalaxmi_station`| 1.5 | Famous Studio Lane |
| 36 | `haji_ali-mahalaxmi_station`| `haji_ali` | `mahalaxmi_station` | 1.4 | Mahalaxmi Temple Rd |
| 37 | `haji_ali-marine_drive` | `haji_ali` | `marine_drive` | 3.6 | Pedder Rd / Marine Drive |
| 38 | `mahalaxmi_station-csmt` | `mahalaxmi_station` | `csmt` | 4.2 | P D'Mello Freeway Approach |
| 39 | `phoenix_palladium-csmt` | `phoenix_palladium` | `csmt` | 4.8 | JJ Flyover Route |
| 40 | `marine_drive-churchgate_station`| `marine_drive`| `churchgate_station`| 1.2 | Veer Nariman Rd |
| 41 | `churchgate_station-csmt` | `churchgate_station`| `csmt` | 1.8 | DN Road Corridor |

---

## 3. Formally Verified Graph Properties (P1 – P7)

### Property P1: Reachability & Multiple Distinct Routes
- **Requirement:** `vit` &rarr; `worli_sea_face` is reachable with at least two clearly different routes.
- **Computed Primary Route:**
  `vit` &rarr; `wadala_bridge` &rarr; `five_gardens` &rarr; `dadar_tt` &rarr; `siddhivinayak` &rarr; `worli_sea_face` (Distance: **7.2 km**).
- **Computed Alternate Route (closing `vit-wadala_bridge`):**
  `vit` &rarr; `dadar_tt` &rarr; `siddhivinayak` &rarr; `worli_sea_face` (Distance: **8.2 km**), or via Sion &rarr; Matunga &rarr; Dadar &rarr; Prabhadevi.

### Property P2: Minimum 5 Edges on Default Route
- **Requirement:** The Dijkstra shortest route for default journey has &ge; 5 edges.
- **Computed Result:** Exactly **5 edges**:
  1. `vit-wadala_bridge` (1.2 km)
  2. `wadala_bridge-five_gardens` (1.1 km)
  3. `five_gardens-dadar_tt` (1.3 km)
  4. `dadar_tt-siddhivinayak` (1.5 km)
  5. `siddhivinayak-worli_sea_face` (2.1 km)
  Sum = $1.2 + 1.1 + 1.3 + 1.5 + 2.1 = \mathbf{7.2\text{ km}}$.

### Property P3: Road Closure Increases Shortest Path
- **Requirement:** At least one road on the default route increases total path distance when closed.
- **Computed Impact on Default Edges:**
  - Closing `vit-wadala_bridge`: New distance = **8.2 km** (+1.0 km)
  - Closing `wadala_bridge-five_gardens`: New distance = **8.2 km** (+1.0 km)
  - Closing `five_gardens-dadar_tt`: New distance = **8.2 km** (+1.0 km)
  - Closing `dadar_tt-siddhivinayak` (Default Demo Suggestion): New distance = **8.4 km** (+1.2 km)
  - Closing `siddhivinayak-worli_sea_face`: New distance = **7.4 km** (+0.2 km)

### Property P4: BFS Selects Fewer Hops with Higher Weight
- **Requirement:** BFS on the default journey returns a route different from Dijkstra with strictly higher weight and &le; edges.
- **Computed Values:**
  - **Dijkstra:** 5 hops, **7.2 km**.
  - **BFS:** 2 hops (`vit` &rarr; `dadar_tt` &rarr; `worli_sea_face`), **9.8 km**.
  - **Comparison:** BFS hops (2) &le; Dijkstra hops (5); BFS distance (9.8 km) > Dijkstra distance (7.2 km).

### Property P5: Complete Isolation of a Specific Location
- **Requirement:** At least one location can be isolated by closing a specific small set of roads.
- **Target Location:** `chembur` (Chembur).
- **Incident Road Set:** `{ kurla-chembur, sion-chembur }`.
- **Outcome:** Closing both roads completely disconnects `chembur` from the rest of Mumbai. Any route to `chembur` returns status `'UNREACHABLE'` with distance $\infty$.

### Property P6: Uniqueness of Default Route (No Ties)
- **Requirement:** No two distinct shortest routes of equal weight for the default journey.
- **Computed Verification:** The default route has distance **7.2 km**. If any of its 5 edges is closed, the next best alternative distance is strictly $> 7.2\text{ km}$ (the closest alternate path is 7.4 km). Thus, 7.2 km is the strictly unique shortest path.

### Property P7: Invariance Under Irrelevant Closures
- **Requirement:** Closing a road not on the default route leaves the default route unchanged.
- **Tested Road:** `marine_drive-churchgate_station` (South Mumbai).
- **Outcome:** Shortest path remains identical in sequence (`['vit', 'wadala_bridge', 'five_gardens', 'dadar_tt', 'siddhivinayak', 'worli_sea_face']`), hop count (5), and distance (7.2 km).
