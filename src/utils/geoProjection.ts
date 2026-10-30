/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LatLng, MetricCoord } from '../types/navigation';

/**
 * CSJMU Kalyanpur, Kanpur Geographic Reference Anchors
 * Primary reference: 26.498300° N, 80.265800° E
 * UTM Zone: 44N (EPSG:32644)
 */
export const CSJMU_ORIGIN_LAT = 26.498300;
export const CSJMU_ORIGIN_LON = 80.265800;

// Metric scaling at 26.4983° N latitude
// 1 deg Lat ≈ 110,816 m
// 1 deg Lon ≈ 111,320 * cos(26.4983°) ≈ 99,627 m
const METERS_PER_DEG_LAT = 110816;
const METERS_PER_DEG_LON = 99627;

/**
 * Convert real WGS84 GPS coordinates to local 3D campus metric coordinates.
 * X = East (+X is East, -X is West)
 * Z = South (+Z is South, -Z is North in Three.js coordinates)
 */
export function gpsToMetric(lat: number, lon: number): MetricCoord {
  const x = (lon - CSJMU_ORIGIN_LON) * METERS_PER_DEG_LON;
  const z = -(lat - CSJMU_ORIGIN_LAT) * METERS_PER_DEG_LAT;
  const rx = Math.round(x * 100) / 100;
  const rz = Math.round(z * 100) / 100;
  return {
    x: rx === 0 ? 0 : rx,
    z: rz === 0 ? 0 : rz,
  };
}

/**
 * Convert local 3D campus metric coordinates back to real WGS84 GPS coordinates.
 */
export function metricToGps(x: number, z: number): LatLng {
  const longitude = CSJMU_ORIGIN_LON + x / METERS_PER_DEG_LON;
  const latitude = CSJMU_ORIGIN_LAT - z / METERS_PER_DEG_LAT;
  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}

/**
 * Calculate Euclidean distance between two metric coordinates in meters.
 */
export function metricDistance(a: MetricCoord, b: MetricCoord): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  return Math.hypot(dx, dz);
}

/**
 * Calculate bearing angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 */
export function calculateBearing(from: MetricCoord, to: MetricCoord): number {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  // in 3D: -Z is North, +X is East, +Z is South, -X is West
  let angle = (Math.atan2(dx, -dz) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return Math.round(angle);
}
