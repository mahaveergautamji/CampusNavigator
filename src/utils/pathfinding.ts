/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CSJMU_BUILDINGS, CSJMU_GRAPH_EDGES, CSJMU_GRAPH_NODES } from '../data/csjmuData';
import {
  BuildingRecord,
  GraphEdge,
  GraphNode,
  MetricCoord,
  NavigationRoute,
  NavigationRouteStep,
} from '../types/navigation';
import { calculateBearing, metricDistance } from './geoProjection';

interface PathfindingOptions {
  accessibleOnly?: boolean;
}

/**
 * Build bidirectional adjacency map from graph nodes and edges
 */
function buildAdjacencyMap(nodes: GraphNode[], edges: GraphEdge[], accessibleOnly = false) {
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const adj = new Map<string, Array<{ toId: string; distance: number; type: string }>>();
  nodes.forEach((n) => adj.set(n.id, []));

  edges.forEach((edge) => {
    if (accessibleOnly && !edge.accessible) return;
    if (!nodeMap.has(edge.from) || !nodeMap.has(edge.to)) return;

    adj.get(edge.from)?.push({
      toId: edge.to,
      distance: edge.distance,
      type: edge.type,
    });
    adj.get(edge.to)?.push({
      toId: edge.from,
      distance: edge.distance,
      type: edge.type,
    });
  });

  return { nodeMap, adj };
}

/**
 * Find the closest graph node to a given metric coordinate
 */
export function findClosestNode(coord: MetricCoord, nodes: GraphNode[] = CSJMU_GRAPH_NODES): GraphNode {
  let closest = nodes[0];
  let minD = Infinity;

  for (const node of nodes) {
    const d = metricDistance(coord, { x: node.x, z: node.z });
    if (d < minD) {
      minD = d;
      closest = node;
    }
  }

  return closest;
}

/**
 * Find entrance node for a building
 */
export function getBuildingEntranceNode(building: BuildingRecord): GraphNode {
  const entranceNode = CSJMU_GRAPH_NODES.find(
    (n) => n.buildingId === building.id && n.isBuildingEntrance
  );
  if (entranceNode) return entranceNode;

  const entrance = building.entrances[0] || building.metric;
  return findClosestNode(entrance);
}

/**
 * A* Pathfinding implementation over real CSJMU campus walkway graph
 */
export function calculateCampusRoute(
  origin: MetricCoord | BuildingRecord,
  destination: BuildingRecord,
  options: PathfindingOptions = {}
): NavigationRoute | null {
  const { nodeMap, adj } = buildAdjacencyMap(
    CSJMU_GRAPH_NODES,
    CSJMU_GRAPH_EDGES,
    options.accessibleOnly
  );

  let startNode: GraphNode;
  let originBuilding: BuildingRecord | undefined;

  if ('footprint' in origin) {
    originBuilding = origin as BuildingRecord;
    startNode = getBuildingEntranceNode(originBuilding);
  } else {
    startNode = findClosestNode(origin);
  }

  const endNode = getBuildingEntranceNode(destination);

  if (startNode.id === endNode.id) {
    // Already at destination
    return {
      pathNodes: [startNode],
      totalDistance: 0,
      estimatedWalkTimeMinutes: 0,
      steps: [
        {
          instruction: `You have arrived at ${destination.name}`,
          distance: 0,
          action: 'arrive',
          nodeId: endNode.id,
          targetCoord: { x: endNode.x, z: endNode.z },
          landmarkNear: destination.name,
        },
      ],
      originBuilding,
      destinationBuilding: destination,
      isAccessible: true,
    };
  }

  // Priority queue / open set for A*
  const openSet = new Set<string>([startNode.id]);
  const cameFrom = new Map<string, string>();

  const gScore = new Map<string, number>();
  gScore.set(startNode.id, 0);

  const fScore = new Map<string, number>();
  fScore.set(startNode.id, metricDistance(startNode, endNode));

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let currentId = '';
    let lowestF = Infinity;
    for (const id of openSet) {
      const score = fScore.get(id) ?? Infinity;
      if (score < lowestF) {
        lowestF = score;
        currentId = id;
      }
    }

    if (currentId === endNode.id) {
      // Reconstruct path
      const pathIds: string[] = [currentId];
      let curr = currentId;
      while (cameFrom.has(curr)) {
        curr = cameFrom.get(curr)!;
        pathIds.unshift(curr);
      }

      const pathNodes = pathIds.map((id) => nodeMap.get(id)!);

      // Compute total distance & steps
      let totalDistance = 0;
      for (let i = 0; i < pathNodes.length - 1; i++) {
        totalDistance += metricDistance(pathNodes[i], pathNodes[i + 1]);
      }

      const steps = generateTurnByTurnSteps(pathNodes, originBuilding, destination);
      const estimatedWalkTimeMinutes = Math.max(1, Math.round(totalDistance / 78)); // ~1.3 m/s = 78 m/min

      return {
        pathNodes,
        totalDistance: Math.round(totalDistance),
        estimatedWalkTimeMinutes,
        steps,
        originBuilding,
        destinationBuilding: destination,
        isAccessible: options.accessibleOnly ?? true,
      };
    }

    openSet.delete(currentId);
    const neighbors = adj.get(currentId) || [];

    for (const neighbor of neighbors) {
      const tentativeG = (gScore.get(currentId) ?? Infinity) + neighbor.distance;
      const neighborG = gScore.get(neighbor.toId) ?? Infinity;

      if (tentativeG < neighborG) {
        cameFrom.set(neighbor.toId, currentId);
        gScore.set(neighbor.toId, tentativeG);
        const neighborNode = nodeMap.get(neighbor.toId)!;
        const h = metricDistance(neighborNode, endNode);
        fScore.set(neighbor.toId, tentativeG + h);
        openSet.add(neighbor.toId);
      }
    }
  }

  // No path found
  return null;
}

/**
 * Convert sequence of path nodes into human & HUD readable turn-by-turn instructions
 */
function generateTurnByTurnSteps(
  pathNodes: GraphNode[],
  originBuilding: BuildingRecord | undefined,
  destinationBuilding: BuildingRecord
): NavigationRouteStep[] {
  const steps: NavigationRouteStep[] = [];

  if (pathNodes.length <= 1) {
    return steps;
  }

  // Initial departure step
  const firstSegmentDist = Math.round(metricDistance(pathNodes[0], pathNodes[1]));
  const startPlaceName = originBuilding ? originBuilding.name : pathNodes[0].label || 'Current Location';

  steps.push({
    instruction: `Depart from ${startPlaceName} along ${pathNodes[1].label || 'campus walkway'}`,
    distance: firstSegmentDist,
    action: 'depart',
    nodeId: pathNodes[0].id,
    targetCoord: { x: pathNodes[1].x, z: pathNodes[1].z },
    landmarkNear: pathNodes[0].label,
  });

  // Intermediate turns
  for (let i = 1; i < pathNodes.length - 1; i++) {
    const prev = pathNodes[i - 1];
    const curr = pathNodes[i];
    const next = pathNodes[i + 1];

    const bearingIn = calculateBearing(prev, curr);
    const bearingOut = calculateBearing(curr, next);

    let delta = bearingOut - bearingIn;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const segmentDist = Math.round(metricDistance(curr, next));
    const nextLabel = next.label || 'pedestrian walkway';

    let action: NavigationRouteStep['action'] = 'straight';
    let turnPhrase = 'Continue straight on';

    if (delta > 45 && delta <= 120) {
      action = 'turn_right';
      turnPhrase = 'Turn right toward';
    } else if (delta > 15 && delta <= 45) {
      action = 'slight_right';
      turnPhrase = 'Bear slight right onto';
    } else if (delta < -45 && delta >= -120) {
      action = 'turn_left';
      turnPhrase = 'Turn left toward';
    } else if (delta < -15 && delta >= -45) {
      action = 'slight_left';
      turnPhrase = 'Bear slight left onto';
    } else if (Math.abs(delta) > 120) {
      action = delta > 0 ? 'turn_right' : 'turn_left';
      turnPhrase = 'Make a sharp turn toward';
    }

    steps.push({
      instruction: `${turnPhrase} ${nextLabel}`,
      distance: segmentDist,
      action,
      nodeId: curr.id,
      targetCoord: { x: next.x, z: next.z },
      landmarkNear: curr.label,
    });
  }

  // Arrival step
  const lastNode = pathNodes[pathNodes.length - 1];
  steps.push({
    instruction: `Arrive at ${destinationBuilding.name}`,
    distance: 0,
    action: 'arrive',
    nodeId: lastNode.id,
    targetCoord: { x: lastNode.x, z: lastNode.z },
    landmarkNear: destinationBuilding.name,
  });

  return steps;
}
