/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CSJMU_BUILDINGS } from '../data/csjmuData';
import { getBuildingBoundingBox, resolveCollision } from './collision';
import { getLightingForHour } from './timeOfDay';

test('Building bounding boxes have positive area and enclose building metric coordinates', () => {
  for (const b of CSJMU_BUILDINGS) {
    const box = getBuildingBoundingBox(b);
    assert.ok(box.maxX > box.minX);
    assert.ok(box.maxZ > box.minZ);
    assert.ok(b.metric.x >= box.minX && b.metric.x <= box.maxX);
    assert.ok(b.metric.z >= box.minZ && b.metric.z <= box.maxZ);
  }
});

test('Collision resolution prevents player from penetrating building wall', () => {
  const admin = CSJMU_BUILDINGS.find((b) => b.id === 'admin_block')!;
  const box = getBuildingBoundingBox(admin);
  const playerRadius = 0.6;

  // Attempt to walk directly into the center of the Admin block
  const insideX = admin.metric.x;
  const insideZ = admin.metric.z;
  const outsideX = box.minX - 2.0;
  const outsideZ = admin.metric.z;

  const resolved = resolveCollision(insideX, insideZ, outsideX, outsideZ, playerRadius, [box]);

  // Player must be pushed outside the box + playerRadius
  const isOutside =
    resolved.x <= box.minX - playerRadius + 0.01 ||
    resolved.x >= box.maxX + playerRadius - 0.01 ||
    resolved.z <= box.minZ - playerRadius + 0.01 ||
    resolved.z >= box.maxZ + playerRadius - 0.01;

  assert.ok(isOutside, `Player was not pushed outside: resolved pos (${resolved.x}, ${resolved.z})`);
});

test('Collision resolution keeps player away from tree trunks', () => {
  const tree = { x: 50, z: 50, radius: 0.5 };
  const playerRadius = 0.5;

  // Walk directly on top of tree
  const resolved = resolveCollision(50.1, 50.1, 48, 48, playerRadius, [], [tree]);
  const dist = Math.hypot(resolved.x - tree.x, resolved.z - tree.z);
  assert.ok(dist >= playerRadius + tree.radius - 0.05, `Dist from tree must be >= 1.0, got ${dist}`);
});

test('Time of day lighting correctly detects day, sunset, and night', () => {
  // Noon (12:00)
  const noon = getLightingForHour(12);
  assert.equal(noon.areStreetlightsOn, false, 'Streetlights should be OFF at noon');
  assert.equal(noon.skyColor, 0x93c5fd);

  // Sunset (18:00)
  const sunset = getLightingForHour(18);
  assert.equal(sunset.areStreetlightsOn, true, 'Streetlights should be ON at sunset');
  assert.equal(sunset.skyColor, 0xfdba74);

  // Midnight (23:00)
  const night = getLightingForHour(23);
  assert.equal(night.areStreetlightsOn, true, 'Streetlights should be ON at night');
  assert.equal(night.skyColor, 0x090d16);
});
