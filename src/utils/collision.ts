/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BuildingRecord } from '../types/navigation';

export interface BoundingBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CircleObstacle {
  x: number;
  z: number;
  radius: number;
}

/**
 * Get axis-aligned bounding box for a building with safety padding
 */
export function getBuildingBoundingBox(b: BuildingRecord, padding = 1.2): BoundingBox {
  const halfW = b.footprint.width / 2 + padding;
  const halfD = b.footprint.depth / 2 + padding;

  return {
    minX: b.metric.x - halfW,
    maxX: b.metric.x + halfW,
    minZ: b.metric.z - halfD,
    maxZ: b.metric.z + halfD,
  };
}

/**
 * Resolve collision between player circle and building bounding boxes + obstacles.
 * Slides smoothly along walls instead of sticking or clipping through.
 */
export function resolveCollision(
  newX: number,
  newZ: number,
  oldX: number,
  oldZ: number,
  playerRadius: number,
  buildingBoxes: BoundingBox[],
  treeObstacles: CircleObstacle[] = []
): { x: number; z: number } {
  let resX = newX;
  let resZ = newZ;

  // 1. Resolve building collisions (AABB vs Circle)
  for (const box of buildingBoxes) {
    const closestX = Math.max(box.minX, Math.min(resX, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(resZ, box.maxZ));

    const distX = resX - closestX;
    const distZ = resZ - closestZ;
    const distSq = distX * distX + distZ * distZ;

    if (distSq < playerRadius * playerRadius) {
      const dist = Math.sqrt(distSq);
      if (dist > 0.0001) {
        // Push out along normal
        const overlap = playerRadius - dist;
        resX += (distX / dist) * overlap;
        resZ += (distZ / dist) * overlap;
      } else {
        // Completely inside box: push out to nearest edge
        const dLeft = Math.abs(oldX - box.minX);
        const dRight = Math.abs(oldX - box.maxX);
        const dTop = Math.abs(oldZ - box.minZ);
        const dBottom = Math.abs(oldZ - box.maxZ);
        const minEdge = Math.min(dLeft, dRight, dTop, dBottom);

        if (minEdge === dLeft) resX = box.minX - playerRadius;
        else if (minEdge === dRight) resX = box.maxX + playerRadius;
        else if (minEdge === dTop) resZ = box.minZ - playerRadius;
        else resZ = box.maxZ + playerRadius;
      }
    }
  }

  // 2. Resolve tree trunk collisions (Circle vs Circle)
  for (const tree of treeObstacles) {
    const dx = resX - tree.x;
    const dz = resZ - tree.z;
    const minDist = playerRadius + tree.radius;
    const distSq = dx * dx + dz * dz;

    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq);
      if (dist > 0.0001) {
        const overlap = minDist - dist;
        resX += (dx / dist) * overlap;
        resZ += (dz / dist) * overlap;
      } else {
        resX = tree.x + minDist;
      }
    }
  }

  // 3. Keep within outer campus boundaries
  resX = Math.max(-480, Math.min(420, resX));
  resZ = Math.max(-440, Math.min(400, resZ));

  return { x: resX, z: resZ };
}
