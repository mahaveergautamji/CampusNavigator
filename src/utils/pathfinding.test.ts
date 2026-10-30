/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CSJMU_BUILDINGS, generateCsjmuGeoJson } from '../data/csjmuData';
import { gpsToMetric, metricToGps, metricDistance, calculateBearing } from './geoProjection';
import { calculateCampusRoute, findClosestNode, getBuildingEntranceNode } from './pathfinding';

test('GPS projection converts Central Evaluation Building reference anchor correctly', () => {
  // Central Evaluation Building: Lat 26.498300, Lon 80.264060
  const metric = gpsToMetric(26.498300, 80.264060);
  // dx = (80.264060 - 80.265800) * 99627 ≈ -173.35 m
  assert.ok(Math.abs(metric.x - -173.35) < 1.0, `Expected x around -173.35, got ${metric.x}`);
  assert.equal(metric.z, 0, 'Latitude 26.498300 should map to z = 0 relative to origin');

  // Convert back to GPS
  const gps = metricToGps(metric.x, metric.z);
  assert.ok(Math.abs(gps.latitude - 26.498300) < 0.0001);
  assert.ok(Math.abs(gps.longitude - 80.264060) < 0.0001);
});

test('GPS projection converts Shahu Ji Park reference anchor correctly', () => {
  // Shahu Ji Park: Lat 26.497700, Lon 80.266474
  const metric = gpsToMetric(26.497700, 80.266474);
  assert.ok(metric.x > 60 && metric.x < 75, `Expected x ~67, got ${metric.x}`);
  assert.ok(metric.z > 60 && metric.z < 75, `Expected z ~66, got ${metric.z}`);
});

test('All verified CSJMU buildings exist with non-null coordinates and dimensions', () => {
  assert.ok(CSJMU_BUILDINGS.length >= 10, 'Expected at least 10 major university buildings');
  for (const b of CSJMU_BUILDINGS) {
    assert.ok(b.id, 'Building must have id');
    assert.ok(b.name, 'Building must have name');
    assert.ok(b.coordinates.latitude > 26.48 && b.coordinates.latitude < 26.52, `Latitude out of CSJMU range: ${b.name}`);
    assert.ok(b.coordinates.longitude > 80.25 && b.coordinates.longitude < 80.28, `Longitude out of CSJMU range: ${b.name}`);
    assert.ok(b.footprint.width > 0 && b.footprint.depth > 0 && b.footprint.height > 0);
    assert.ok(b.entrances.length > 0, `Building ${b.name} must have entrance`);
  }
});

test('A* pathfinding finds verified walkable route from Main Gate to UIET Engineering', () => {
  const gate1 = CSJMU_BUILDINGS.find((b) => b.id === 'main_gate')!;
  const uiet = CSJMU_BUILDINGS.find((b) => b.id === 'uiet_engineering')!;
  assert.ok(gate1 && uiet, 'Gate 1 and UIET must be present');

  const route = calculateCampusRoute(gate1, uiet);
  assert.ok(route, 'Should find a valid route between Gate 1 and UIET');
  assert.ok(route.pathNodes.length >= 4, 'Route should traverse multiple campus walkway segments');
  assert.ok(route.totalDistance > 400 && route.totalDistance < 1200, `Expected realistic campus distance, got ${route.totalDistance}m`);
  assert.ok(route.estimatedWalkTimeMinutes >= 5 && route.estimatedWalkTimeMinutes <= 20, `Walk time should be 5-20 min, got ${route.estimatedWalkTimeMinutes}`);
  assert.ok(route.steps.length > 0, 'Route must have turn-by-turn steps');
});

test('A* pathfinding finds verified walkable route from UIET to Central Library', () => {
  const uiet = CSJMU_BUILDINGS.find((b) => b.id === 'uiet_engineering')!;
  const library = CSJMU_BUILDINGS.find((b) => b.id === 'central_library')!;

  const route = calculateCampusRoute(uiet, library);
  assert.ok(route, 'Should find route from UIET to Library');
  assert.ok(route.totalDistance > 200, 'UIET to Library should be at least 200m');
  assert.equal(route.destinationBuilding.id, 'central_library');
});

test('A* pathfinding supports accessible-only routing', () => {
  const gate1 = CSJMU_BUILDINGS.find((b) => b.id === 'main_gate')!;
  const admin = CSJMU_BUILDINGS.find((b) => b.id === 'admin_block')!;

  const accessibleRoute = calculateCampusRoute(gate1, admin, { accessibleOnly: true });
  assert.ok(accessibleRoute, 'Should find accessible route to Admin Block');
  assert.ok(accessibleRoute.isAccessible, 'Route must be marked accessible');
});

test('GeoJSON export produces valid FeatureCollection structure', () => {
  const geojson = generateCsjmuGeoJson();
  assert.equal(geojson.type, 'FeatureCollection');
  assert.ok(geojson.features.length >= 10);
  assert.equal(geojson.institution.name, 'Chhatrapati Shahu Ji Maharaj University (CSJMU)');
});
