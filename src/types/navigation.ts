/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MetricCoord {
  x: number; // meters East from origin (Lon 80.265800)
  z: number; // meters South from origin (Lat 26.498300)
}

export type BuildingCategory =
  | 'academic'
  | 'administrative'
  | 'facility'
  | 'sports'
  | 'hostel'
  | 'gate'
  | 'landmark';

export interface BuildingEntrance {
  id: string;
  name: string;
  x: number;
  z: number;
  latitude: number;
  longitude: number;
  isWheelchairAccessible: boolean;
}

export interface BuildingRecord {
  id: string;
  name: string;
  hindiName?: string;
  abbreviation?: string;
  category: BuildingCategory;
  coordinates: LatLng;
  metric: MetricCoord;
  footprint: {
    width: number; // meters
    depth: number; // meters
    height: number; // meters
    floors: number;
  };
  colorTheme: {
    primary: string;
    accent: string;
    roof: string;
  };
  architecturalStyle: 'modern_academic' | 'classical_brick' | 'auditorium_curved' | 'sports_arena' | 'gate_monument' | 'hostel_block' | 'garden_pavilion';
  departments?: string[];
  facilities?: string[];
  timings?: string;
  contact?: string;
  description: string;
  entrances: BuildingEntrance[];
  verified: boolean;
  source: string;
  tags: string[];
}

export interface GraphNode {
  id: string;
  x: number;
  z: number;
  latitude: number;
  longitude: number;
  label?: string;
  isBuildingEntrance?: boolean;
  buildingId?: string;
  isAccessible: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  distance: number;
  type: 'paved_walkway' | 'campus_road' | 'ramp' | 'corridor';
  accessible: boolean;
}

export interface NavigationRouteStep {
  instruction: string;
  distance: number; // in meters
  action: 'depart' | 'straight' | 'turn_left' | 'turn_right' | 'slight_left' | 'slight_right' | 'arrive';
  nodeId: string;
  targetCoord: MetricCoord;
  landmarkNear?: string;
}

export interface NavigationRoute {
  pathNodes: GraphNode[];
  totalDistance: number; // in meters
  estimatedWalkTimeMinutes: number; // at ~1.3 m/s walking speed
  steps: NavigationRouteStep[];
  originBuilding?: BuildingRecord;
  destinationBuilding: BuildingRecord;
  isAccessible: boolean;
}

export type CameraMode = 'third_person' | 'first_person' | 'aerial';
export type TravelMode = 'walk' | 'auto';
export type TimePreset = 'realtime' | 'day' | 'sunset' | 'night';

export interface PlayerState {
  x: number;
  z: number;
  rotationY: number;
  speed: number;
  isMoving: boolean;
  isSprinting: boolean;
  travelMode: TravelMode;
  isAutoPilot: boolean;
}

