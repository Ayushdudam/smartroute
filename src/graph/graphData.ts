import { BaseGraphData, LocationNode, RoadEdge } from './types';

/**
 * SIMULATED ROAD NETWORK DISCLAIMER:
 * Simulated road network for educational purposes. Distances are illustrative weights,
 * not verified real-world distances or driving directions.
 */
export const NETWORK_DISCLAIMER =
  'Simulated road network for educational purposes. Distances are illustrative weights, not verified real-world distances or driving directions.';

export const CANVAS_BOUNDS = Object.freeze({
  width: 1200,
  height: 800,
  padding: 50,
});

const RAW_NODES: readonly LocationNode[] = Object.freeze([
  // Bandra & Western connectivity (North / North-West)
  {
    id: 'bandra_station',
    name: 'Bandra Station',
    area: 'Bandra & Western connectivity',
    x: 260,
    y: 120,
    labelOffset: { dx: -15, dy: -18 },
  },
  {
    id: 'bkc',
    name: 'Bandra Kurla Complex',
    area: 'Bandra & Western connectivity',
    x: 530,
    y: 130,
    labelOffset: { dx: 0, dy: -18 },
  },
  {
    id: 'kurla',
    name: 'Kurla',
    area: 'Other',
    x: 790,
    y: 140,
    labelOffset: { dx: 15, dy: -18 },
  },
  {
    id: 'mahim',
    name: 'Mahim',
    area: 'Other',
    x: 280,
    y: 220,
    labelOffset: { dx: -15, dy: 5 },
  },
  {
    id: 'sion',
    name: 'Sion',
    area: 'Other',
    x: 670,
    y: 220,
    labelOffset: { dx: 18, dy: -10 },
  },
  {
    id: 'chembur',
    name: 'Chembur',
    area: 'Other',
    x: 960,
    y: 230,
    labelOffset: { dx: 15, dy: 5 },
  },
  {
    id: 'sea_link',
    name: 'Bandra-Worli Sea Link',
    area: 'Bandra & Western connectivity',
    x: 170,
    y: 330,
    labelOffset: { dx: -20, dy: -15 },
  },

  // Wadala & Matunga (Central / East)
  {
    id: 'matunga_station',
    name: 'Matunga Station',
    area: 'Wadala & Matunga',
    x: 420,
    y: 270,
    labelOffset: { dx: -20, dy: -15 },
  },
  {
    id: 'five_gardens',
    name: 'Five Gardens',
    area: 'Wadala & Matunga',
    x: 570,
    y: 310,
    labelOffset: { dx: 15, dy: -12 },
  },
  {
    id: 'vit',
    name: 'Vidyalankar Institute of Technology',
    area: 'Wadala & Matunga',
    x: 770,
    y: 330,
    labelOffset: { dx: 15, dy: 5 },
  },
  {
    id: 'wadala_bridge',
    name: 'Wadala Bridge',
    area: 'Wadala & Matunga',
    x: 670,
    y: 410,
    labelOffset: { dx: 15, dy: 15 },
  },

  // Dadar & Prabhadevi
  {
    id: 'dadar_station',
    name: 'Dadar Station',
    area: 'Dadar & Prabhadevi',
    x: 390,
    y: 370,
    labelOffset: { dx: -20, dy: -12 },
  },
  {
    id: 'dadar_west',
    name: 'Dadar West',
    area: 'Other',
    x: 300,
    y: 440,
    labelOffset: { dx: -22, dy: 5 },
  },
  {
    id: 'dadar_tt',
    name: 'Dadar TT',
    area: 'Dadar & Prabhadevi',
    x: 520,
    y: 420,
    labelOffset: { dx: 15, dy: -10 },
  },
  {
    id: 'prabhadevi',
    name: 'Prabhadevi',
    area: 'Other',
    x: 330,
    y: 520,
    labelOffset: { dx: -15, dy: 18 },
  },
  {
    id: 'siddhivinayak',
    name: 'Siddhivinayak Temple',
    area: 'Dadar & Prabhadevi',
    x: 450,
    y: 490,
    labelOffset: { dx: 20, dy: -10 },
  },

  // Worli & Lower Parel & Mahalaxmi
  {
    id: 'worli_fort',
    name: 'Worli Fort',
    area: 'Worli',
    x: 170,
    y: 440,
    labelOffset: { dx: -20, dy: -10 },
  },
  {
    id: 'worli_sea_face',
    name: 'Worli Sea Face',
    area: 'Worli',
    x: 200,
    y: 530,
    labelOffset: { dx: -25, dy: 15 },
  },
  {
    id: 'lower_parel_station',
    name: 'Lower Parel Station',
    area: 'Lower Parel & Mahalaxmi',
    x: 440,
    y: 580,
    labelOffset: { dx: -20, dy: 18 },
  },
  {
    id: 'phoenix_palladium',
    name: 'Phoenix Palladium',
    area: 'Lower Parel & Mahalaxmi',
    x: 570,
    y: 580,
    labelOffset: { dx: 18, dy: -10 },
  },
  {
    id: 'haji_ali',
    name: 'Haji Ali',
    area: 'Lower Parel & Mahalaxmi',
    x: 240,
    y: 640,
    labelOffset: { dx: -20, dy: 15 },
  },
  {
    id: 'mahalaxmi_station',
    name: 'Mahalaxmi Station',
    area: 'Lower Parel & Mahalaxmi',
    x: 410,
    y: 660,
    labelOffset: { dx: 15, dy: 15 },
  },

  // South Mumbai
  {
    id: 'csmt',
    name: 'Chhatrapati Shivaji Maharaj Terminus',
    area: 'South Mumbai',
    x: 620,
    y: 710,
    labelOffset: { dx: 15, dy: -15 },
  },
  {
    id: 'marine_drive',
    name: 'Marine Drive',
    area: 'South Mumbai',
    x: 300,
    y: 730,
    labelOffset: { dx: -20, dy: 18 },
  },
  {
    id: 'churchgate_station',
    name: 'Churchgate Station',
    area: 'South Mumbai',
    x: 450,
    y: 740,
    labelOffset: { dx: 15, dy: 18 },
  },
]);

const RAW_EDGES: readonly RoadEdge[] = Object.freeze([
  // North / Bandra / BKC / Kurla / Chembur
  { id: 'bandra_station-bkc', from: 'bandra_station', to: 'bkc', weight: 3.2, label: 'BKC Connector' },
  { id: 'bandra_station-mahim', from: 'bandra_station', to: 'mahim', weight: 2.1, label: 'Mahim Causeway' },
  { id: 'bandra_station-sea_link', from: 'bandra_station', to: 'sea_link', weight: 2.8, label: 'Sea Link Toll Approach' },
  { id: 'bkc-kurla', from: 'bkc', to: 'kurla', weight: 2.6, label: 'BKC Kurla Link' },
  { id: 'bkc-sion', from: 'bkc', to: 'sion', weight: 3.4, label: 'Sion-Bandra Link Rd' },
  { id: 'kurla-chembur', from: 'kurla', to: 'chembur', weight: 3.8, label: 'SCLR' },
  { id: 'sion-chembur', from: 'chembur', to: 'sion', weight: 4.1, label: 'Eastern Express Hwy Ext' },
  { id: 'mahim-matunga_station', from: 'mahim', to: 'matunga_station', weight: 2.3, label: 'Lady Jamshetjee Rd' },
  { id: 'mahim-dadar_west', from: 'mahim', to: 'dadar_west', weight: 2.9, label: 'Senapati Bapat Marg N' },
  { id: 'sion-matunga_station', from: 'sion', to: 'matunga_station', weight: 2.5, label: 'Dr Ambedkar Rd N' },
  { id: 'sion-vit', from: 'sion', to: 'vit', weight: 2.4, label: 'Sion Wadala Link' },

  // Sea Link
  { id: 'sea_link-worli_sea_face', from: 'sea_link', to: 'worli_sea_face', weight: 4.7, label: 'Rajiv Gandhi Sea Link' },

  // Wadala & Matunga
  { id: 'vit-wadala_bridge', from: 'vit', to: 'wadala_bridge', weight: 1.2, label: 'Barkat Ali Dargah Rd' },
  { id: 'wadala_bridge-five_gardens', from: 'wadala_bridge', to: 'five_gardens', weight: 1.1, label: 'Mancherji Joshi Rd' },
  { id: 'matunga_station-five_gardens', from: 'matunga_station', to: 'five_gardens', weight: 1.4, label: 'Parsi Colony Ave' },
  { id: 'matunga_station-dadar_station', from: 'matunga_station', to: 'dadar_station', weight: 1.6, label: 'Lakhamsi Napoo Rd' },

  // Deliberate Heavy Shortcut Corridor for BFS (P4):
  // vit -> dadar_tt direct heavy arterial (4.6 km) vs vit->wadala_bridge->five_gardens->dadar_tt (1.2+1.1+1.3 = 3.6 km)
  { id: 'vit-dadar_tt', from: 'vit', to: 'dadar_tt', weight: 4.6, label: 'Wadala-Dadar Arterial' },
  // dadar_tt -> worli_sea_face direct heavy expressway (5.2 km) vs dadar_tt->siddhivinayak->worli_sea_face (1.5+2.1 = 3.6 km)
  { id: 'dadar_tt-worli_sea_face', from: 'dadar_tt', to: 'worli_sea_face', weight: 5.2, label: 'Dadar-Worli Direct Link' },

  // Dadar & Prabhadevi core
  { id: 'five_gardens-dadar_tt', from: 'five_gardens', to: 'dadar_tt', weight: 1.3, label: 'Tilak Bridge Approach' },
  { id: 'dadar_station-dadar_tt', from: 'dadar_station', to: 'dadar_tt', weight: 1.0, label: 'Pritam Hotel Crossway' },
  { id: 'dadar_station-dadar_west', from: 'dadar_station', to: 'dadar_west', weight: 1.1, label: 'Ranade Rd' },
  { id: 'dadar_west-prabhadevi', from: 'dadar_west', to: 'prabhadevi', weight: 1.4, label: 'Sayani Rd' },
  { id: 'dadar_tt-siddhivinayak', from: 'dadar_tt', to: 'siddhivinayak', weight: 1.5, label: 'SK Bole Rd' },
  { id: 'siddhivinayak-prabhadevi', from: 'siddhivinayak', to: 'prabhadevi', weight: 1.0, label: 'Khedkar Marg' },

  // Worli area
  { id: 'worli_fort-worli_sea_face', from: 'worli_fort', to: 'worli_sea_face', weight: 1.5, label: 'Worli Village Coastal Rd' },
  { id: 'worli_fort-prabhadevi', from: 'worli_fort', to: 'prabhadevi', weight: 1.9, label: 'Koliwada Approach' },
  { id: 'siddhivinayak-worli_sea_face', from: 'siddhivinayak', to: 'worli_sea_face', weight: 2.1, label: 'Khan Abdul Ghaffar Khan Rd' },
  { id: 'prabhadevi-worli_sea_face', from: 'prabhadevi', to: 'worli_sea_face', weight: 1.3, label: 'Prabhadevi Coastal Cut' },

  // Lower Parel & Mahalaxmi
  { id: 'prabhadevi-lower_parel_station', from: 'prabhadevi', to: 'lower_parel_station', weight: 1.7, label: 'NM Joshi Marg N' },
  { id: 'siddhivinayak-lower_parel_station', from: 'siddhivinayak', to: 'lower_parel_station', weight: 2.0, label: 'Senapati Bapat Marg S' },
  { id: 'wadala_bridge-phoenix_palladium', from: 'wadala_bridge', to: 'phoenix_palladium', weight: 3.5, label: 'Sewri-Parel Link' },
  { id: 'lower_parel_station-phoenix_palladium', from: 'lower_parel_station', to: 'phoenix_palladium', weight: 1.2, label: 'High Street Phoenix Ln' },
  { id: 'worli_sea_face-haji_ali', from: 'worli_sea_face', to: 'haji_ali', weight: 2.6, label: 'Annie Besant Coastal Rd' },
  { id: 'lower_parel_station-mahalaxmi_station', from: 'lower_parel_station', to: 'mahalaxmi_station', weight: 1.8, label: 'Dr E Moses Rd' },
  { id: 'phoenix_palladium-mahalaxmi_station', from: 'phoenix_palladium', to: 'mahalaxmi_station', weight: 1.5, label: 'Famous Studio Lane' },
  { id: 'haji_ali-mahalaxmi_station', from: 'haji_ali', to: 'mahalaxmi_station', weight: 1.4, label: 'Mahalaxmi Temple Rd' },

  // South Mumbai
  { id: 'haji_ali-marine_drive', from: 'haji_ali', to: 'marine_drive', weight: 3.6, label: 'Pedder Rd / Marine Drive' },
  { id: 'mahalaxmi_station-csmt', from: 'mahalaxmi_station', to: 'csmt', weight: 4.2, label: "P D'Mello Freeway Approach" },
  { id: 'phoenix_palladium-csmt', from: 'phoenix_palladium', to: 'csmt', weight: 4.8, label: 'JJ Flyover Route' },
  { id: 'marine_drive-churchgate_station', from: 'marine_drive', to: 'churchgate_station', weight: 1.2, label: 'Veer Nariman Rd' },
  { id: 'churchgate_station-csmt', from: 'churchgate_station', to: 'csmt', weight: 1.8, label: 'DN Road Corridor' },
]);

export const BASE_GRAPH: BaseGraphData = Object.freeze({
  nodes: RAW_NODES,
  edges: RAW_EDGES,
});
