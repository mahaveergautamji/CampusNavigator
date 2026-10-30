/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CSJMU_GRAPH_EDGES, CSJMU_GRAPH_NODES } from '../../data/csjmuData';
import { NavigationRoute } from '../../types/navigation';
import { CircleObstacle } from '../../utils/collision';

export interface CharacterRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Group;
  animTime: number;
}

export interface AutoRickshawRig {
  group: THREE.Group;
  frontWheel: THREE.Group;
  rearLeftWheel: THREE.Mesh;
  rearRightWheel: THREE.Mesh;
  headlightLamps: THREE.Mesh[];
  headlightCones: THREE.Mesh[];
  rollAngle: number;
}

export interface StreetlightRig {
  group: THREE.Group;
  bulbMaterials: THREE.MeshStandardMaterial[];
  lightCones: THREE.Mesh[];
}

/**
 * Procedural Student Avatar Character
 */
export function createCharacterAvatar(): CharacterRig {
  const group = new THREE.Group();
  group.name = 'player_character';

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe0ac69,
    roughness: 0.6,
    metalness: 0.05,
  });

  const hoodieMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // CSJMU University Navy Blue
    roughness: 0.7,
    metalness: 0.1,
  });

  const jeansMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.05,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.2,
  });

  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.6,
    metalness: 0.2,
  });

  // Soft Radial Contact Shadow Plane
  const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.14;
  group.add(shadowMesh);

  // Pelvis / Hips
  const hips = new THREE.Group();
  hips.position.y = 0.85;
  group.add(hips);

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.32);
  const torso = new THREE.Mesh(torsoGeo, hoodieMat);
  torso.position.y = 0.35;
  torso.castShadow = true;
  hips.add(torso);

  // University Badge Decal on Chest
  const badgeGeo = new THREE.PlaneGeometry(0.14, 0.14);
  const badgeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const badge = new THREE.Mesh(badgeGeo, badgeMat);
  badge.position.set(-0.14, 0.45, 0.17);
  hips.add(badge);

  // Backpack on Back
  const backpackGeo = new THREE.BoxGeometry(0.38, 0.48, 0.22);
  const backpack = new THREE.Mesh(backpackGeo, backpackMat);
  backpack.position.set(0, 0.35, -0.25);
  backpack.castShadow = true;
  hips.add(backpack);

  // Head & Hair
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.82;

  const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Hair / Cap
  const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.14;
  headGroup.add(cap);

  const capVisorGeo = new THREE.BoxGeometry(0.22, 0.02, 0.16);
  const capVisor = new THREE.Mesh(capVisorGeo, capMat);
  capVisor.position.set(0, 0.1, 0.2);
  headGroup.add(capVisor);

  hips.add(headGroup);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 0.6, 0);
  const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8);
  armGeo.translate(0, -0.27, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, hoodieMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), skinMat);
  leftHand.position.y = -0.56;
  leftArm.add(leftHand);
  hips.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 0.6, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, hoodieMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), skinMat);
  rightHand.position.y = -0.56;
  rightArm.add(rightHand);
  hips.add(rightArm);

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0, 0);
  const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.75, 8);
  legGeo.translate(0, -0.37, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, jeansMat);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const shoeGeo = new THREE.BoxGeometry(0.13, 0.1, 0.24);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.76, 0.05);
  leftShoe.castShadow = true;
  leftLeg.add(leftShoe);
  hips.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, jeansMat);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.76, 0.05);
  rightShoe.castShadow = true;
  rightLeg.add(rightShoe);
  hips.add(rightLeg);

  return {
    group,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    torso,
    head: headGroup,
    animTime: 0,
  };
}

export function updateCharacterAnimation(rig: CharacterRig, speed: number, dt: number) {
  if (speed > 0.05) {
    const freq = speed > 4.5 ? 12 : 8;
    rig.animTime += dt * freq;
    const swing = Math.sin(rig.animTime);

    rig.leftLeg.rotation.x = swing * 0.6;
    rig.rightLeg.rotation.x = -swing * 0.6;
    rig.leftArm.rotation.x = -swing * 0.55;
    rig.rightArm.rotation.x = swing * 0.55;
    rig.torso.position.y = 0.35 + Math.abs(Math.sin(rig.animTime * 2)) * 0.04;
  } else {
    rig.leftLeg.rotation.x *= 0.85;
    rig.rightLeg.rotation.x *= 0.85;
    rig.leftArm.rotation.x *= 0.85;
    rig.rightArm.rotation.x *= 0.85;
    rig.torso.position.y = 0.35;
  }
}

/**
 * Creates Authentic CSJMU Campus E-Rickshaw / Auto ("Auto accha lao")
 * Procedural Indian Campus Green & Yellow electric shuttle with 3 wheels, seats & headlights.
 */
export function createCampusAutoRickshaw(): AutoRickshawRig {
  const group = new THREE.Group();
  group.name = 'campus_auto_rickshaw';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Indian Auto Green
    roughness: 0.4,
    metalness: 0.3,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Indian Auto Yellow Roof
    roughness: 0.3,
    metalness: 0.2,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x18181b, // Black Steel Frame
    roughness: 0.5,
    metalness: 0.8,
  });

  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x7c2d12, // Brown leatherette upholstery
    roughness: 0.7,
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x27272a, // Rubber tire
    roughness: 0.8,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xe4e4e7, // Silver rim
    roughness: 0.2,
    metalness: 0.9,
  });

  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    emissive: 0x000000,
    roughness: 0.1,
  });

  // 1. Lower Chassis & Floor
  const floorGeo = new THREE.BoxGeometry(1.6, 0.2, 2.8);
  const floor = new THREE.Mesh(floorGeo, bodyMat);
  floor.position.y = 0.5;
  floor.castShadow = true;
  group.add(floor);

  // 2. Yellow Curved Roof Canopy
  const roofGeo = new THREE.BoxGeometry(1.7, 0.15, 2.7);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 1.95, -0.1);
  roof.castShadow = true;
  group.add(roof);

  // 3. Roll Bars & Canopy Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.35, 8);
  [-0.75, 0.75].forEach((px) => {
    [-1.2, 0.2, 1.0].forEach((pz) => {
      const pillar = new THREE.Mesh(pillarGeo, frameMat);
      pillar.position.set(px, 1.25, pz);
      pillar.castShadow = true;
      group.add(pillar);
    });
  });

  // 4. Passenger Rear Bench
  const rearBenchGeo = new THREE.BoxGeometry(1.4, 0.35, 0.6);
  const rearBench = new THREE.Mesh(rearBenchGeo, seatMat);
  rearBench.position.set(0, 0.75, -0.7);
  rearBench.castShadow = true;
  group.add(rearBench);

  // 5. Driver Front Bench & Handlebar Console
  const driverSeatGeo = new THREE.BoxGeometry(0.7, 0.35, 0.45);
  const driverSeat = new THREE.Mesh(driverSeatGeo, seatMat);
  driverSeat.position.set(0, 0.75, 0.3);
  group.add(driverSeat);

  const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);
  const handle = new THREE.Mesh(handleGeo, frameMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, 1.15, 0.85);
  group.add(handle);

  // 6. Front Nose Fairing
  const noseGeo = new THREE.BoxGeometry(1.0, 0.6, 0.6);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.position.set(0, 0.75, 1.2);
  group.add(nose);

  // 7. Wheels
  // Front Steering Wheel
  const frontWheel = new THREE.Group();
  frontWheel.position.set(0, 0.4, 1.3);

  const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
  tireGeo.rotateZ(Math.PI / 2);
  const fTire = new THREE.Mesh(tireGeo, wheelMat);
  fTire.castShadow = true;
  frontWheel.add(fTire);

  const fRim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16), rimMat);
  fRim.rotation.z = Math.PI / 2;
  frontWheel.add(fRim);
  group.add(frontWheel);

  // Rear Left Wheel
  const rTireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16);
  rTireGeo.rotateZ(Math.PI / 2);

  const rearLeftWheel = new THREE.Mesh(rTireGeo, wheelMat);
  rearLeftWheel.position.set(-0.85, 0.4, -0.6);
  rearLeftWheel.castShadow = true;
  group.add(rearLeftWheel);

  // Rear Right Wheel
  const rearRightWheel = new THREE.Mesh(rTireGeo, wheelMat);
  rearRightWheel.position.set(0.85, 0.4, -0.6);
  rearRightWheel.castShadow = true;
  group.add(rearRightWheel);

  // 8. Headlights with night beams
  const headlightLamps: THREE.Mesh[] = [];
  const headlightCones: THREE.Mesh[] = [];

  [-0.32, 0.32].forEach((hx) => {
    const lampGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    lampGeo.rotateX(Math.PI / 2);
    const lamp = new THREE.Mesh(lampGeo, lampMat.clone());
    lamp.position.set(hx, 0.9, 1.52);
    group.add(lamp);
    headlightLamps.push(lamp);

    // Light projection beam cone
    const coneGeo = new THREE.ConeGeometry(3.5, 14, 16);
    coneGeo.translate(0, 7, 0);
    coneGeo.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(hx, 0.9, 1.55);
    group.add(cone);
    headlightCones.push(cone);
  });

  // Soft Radial Contact Shadow
  const autoShadowGeo = new THREE.PlaneGeometry(2.2, 3.6);
  const autoShadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const autoShadow = new THREE.Mesh(autoShadowGeo, autoShadowMat);
  autoShadow.rotation.x = -Math.PI / 2;
  autoShadow.position.y = 0.12;
  group.add(autoShadow);

  return {
    group,
    frontWheel,
    rearLeftWheel,
    rearRightWheel,
    headlightLamps,
    headlightCones,
    rollAngle: 0,
  };
}

export function updateAutoRickshawAnimation(
  rig: AutoRickshawRig,
  speed: number,
  turnInput: number,
  dt: number,
  isNight: boolean
) {
  // Steer front wheel
  rig.frontWheel.rotation.y = turnInput * 0.45;

  // Spin wheels with forward speed
  if (Math.abs(speed) > 0.05) {
    const rotDelta = (speed / 0.38) * dt;
    rig.rollAngle += rotDelta;
    rig.rearLeftWheel.rotation.x = rig.rollAngle;
    rig.rearRightWheel.rotation.x = rig.rollAngle;
  }

  // Headlights at sunset / night
  rig.headlightLamps.forEach((lamp) => {
    const mat = lamp.material as THREE.MeshStandardMaterial;
    mat.emissive.setHex(isNight ? 0xfef08a : 0x000000);
    mat.emissiveIntensity = isNight ? 2.5 : 0;
  });

  rig.headlightCones.forEach((cone) => {
    const mat = cone.material as THREE.MeshBasicMaterial;
    mat.opacity = isNight ? 0.28 : 0;
  });
}

/**
 * Creates Ground Terrain, Campus Avenues, and Walkways with ZERO Z-fighting
 */
export function createCampusTerrain(): THREE.Group {
  const terrainGroup = new THREE.Group();

  // 1. Broad CSJMU Green Ground (264 Acres Canvas ~ 1200m x 1200m) at Y = 0.0
  const groundGeo = new THREE.PlaneGeometry(1200, 1200);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x334e2c, // Lawn grass
    roughness: 0.9,
    metalness: 0.05,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = 0.0;
  groundMesh.receiveShadow = true;
  terrainGroup.add(groundMesh);

  // 2. Surrounding Kalyanpur GT Road on South Boundary at Y = 0.08
  const gtRoadGeo = new THREE.PlaneGeometry(1000, 24);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.7,
    metalness: 0.1,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const gtRoad = new THREE.Mesh(gtRoadGeo, roadMat);
  gtRoad.rotation.x = -Math.PI / 2;
  gtRoad.position.set(0, 0.08, 380);
  gtRoad.receiveShadow = true;
  terrainGroup.add(gtRoad);

  // Yellow Road Divider Stripes at Y = 0.14
  const stripeGeo = new THREE.PlaneGeometry(1000, 0.6);
  const stripeMat = new THREE.MeshBasicMaterial({
    color: 0xeab308,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });
  const divider = new THREE.Mesh(stripeGeo, stripeMat);
  divider.rotation.x = -Math.PI / 2;
  divider.position.set(0, 0.14, 380);
  terrainGroup.add(divider);

  // 3. Internal Campus Roads (Y = 0.08) & Walkways (Y = 0.12)
  const nodeMap = new Map(CSJMU_GRAPH_NODES.map((n) => [n.id, n]));

  const campusRoadMat = new THREE.MeshStandardMaterial({
    color: 0x3f3f46, // Internal asphalt road
    roughness: 0.8,
    metalness: 0.1,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const walkwayMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Light stone pavers
    roughness: 0.75,
    metalness: 0.1,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  CSJMU_GRAPH_EDGES.forEach((edge) => {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);
    if (!from || !to) return;

    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const len = Math.hypot(dx, dz);
    const midX = (from.x + to.x) / 2;
    const midZ = (from.z + to.z) / 2;
    const angle = Math.atan2(dz, dx);

    const isRoad = edge.type === 'campus_road';
    const width = isRoad ? 9.5 : 4.8;
    const yElev = isRoad ? 0.08 : 0.12;
    const mat = isRoad ? campusRoadMat : walkwayMat;

    const meshGeo = new THREE.PlaneGeometry(len, width);
    const pathMesh = new THREE.Mesh(meshGeo, mat);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.rotation.z = -angle;
    pathMesh.position.set(midX, yElev, midZ);
    pathMesh.receiveShadow = true;
    terrainGroup.add(pathMesh);
  });

  // 4. Central Roundabout / Plaza at Origin (0, 0) at Y = 0.13
  const plazaGeo = new THREE.CircleGeometry(26, 32);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.65,
    metalness: 0.1,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.13, 0);
  plaza.receiveShadow = true;
  terrainGroup.add(plaza);

  return terrainGroup;
}

// Tree obstacle registry for collision detection
let campusTreeObstacles: CircleObstacle[] = [];

export function getCampusTreeObstacles(): CircleObstacle[] {
  return campusTreeObstacles;
}

/**
 * Creates Instanced Trees across the campus and registers collision coordinates
 */
export function createInstancedFoliage(): THREE.Group {
  const foliageGroup = new THREE.Group();
  campusTreeObstacles = [];

  const countAshoka = 280;
  const ashokaTrunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 3, 8);
  ashokaTrunkGeo.translate(0, 1.5, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x573a21, roughness: 0.9 });
  const ashokaTrunks = new THREE.InstancedMesh(ashokaTrunkGeo, trunkMat, countAshoka);

  const ashokaFoliageGeo = new THREE.ConeGeometry(1.6, 7, 8);
  ashokaFoliageGeo.translate(0, 6, 0);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 });
  const ashokaFoliages = new THREE.InstancedMesh(ashokaFoliageGeo, foliageMat, countAshoka);

  const dummy = new THREE.Object3D();
  let idx = 0;

  // Along south avenue from Gate 1 to Origin
  for (let z = 330; z >= 20; z -= 14) {
    [-8.5, 8.5].forEach((xOffset) => {
      if (idx >= countAshoka) return;
      dummy.position.set(xOffset, 0, z);
      const s = 0.85 + Math.random() * 0.3;
      dummy.scale.set(s, s, s);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      ashokaTrunks.setMatrixAt(idx, dummy.matrix);
      ashokaFoliages.setMatrixAt(idx, dummy.matrix);
      campusTreeObstacles.push({ x: xOffset, z, radius: 0.5 });
      idx++;
    });
  }

  // Along UIET boulevard
  for (let x = -30; x >= -320; x -= 18) {
    [-15, 25].forEach((zOffset) => {
      if (idx >= countAshoka) return;
      dummy.position.set(x, 0, zOffset);
      const s = 0.85 + Math.random() * 0.3;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      ashokaTrunks.setMatrixAt(idx, dummy.matrix);
      ashokaFoliages.setMatrixAt(idx, dummy.matrix);
      campusTreeObstacles.push({ x, z: zOffset, radius: 0.5 });
      idx++;
    });
  }

  // Around Shahu Ji Park
  for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
    if (idx >= countAshoka) break;
    const px = 67 + Math.cos(angle) * 32;
    const pz = 66 + Math.sin(angle) * 30;
    dummy.position.set(px, 0, pz);
    dummy.scale.set(1.1, 1.1, 1.1);
    dummy.updateMatrix();

    ashokaTrunks.setMatrixAt(idx, dummy.matrix);
    ashokaFoliages.setMatrixAt(idx, dummy.matrix);
    campusTreeObstacles.push({ x: px, z: pz, radius: 0.5 });
    idx++;
  }

  // Rest scatter in perimeter
  while (idx < countAshoka) {
    const rx = (Math.random() - 0.5) * 800;
    const rz = (Math.random() - 0.5) * 800;
    dummy.position.set(rx, 0, rz);
    dummy.scale.set(0.9, 0.9, 0.9);
    dummy.updateMatrix();

    ashokaTrunks.setMatrixAt(idx, dummy.matrix);
    ashokaFoliages.setMatrixAt(idx, dummy.matrix);
    idx++;
  }

  ashokaTrunks.instanceMatrix.needsUpdate = true;
  ashokaFoliages.instanceMatrix.needsUpdate = true;
  ashokaTrunks.computeBoundingSphere();
  ashokaFoliages.computeBoundingSphere();

  foliageGroup.add(ashokaTrunks);
  foliageGroup.add(ashokaFoliages);

  return foliageGroup;
}

/**
 * Creates Procedural Campus Streetlights with Automatic Night Illumination
 */
export function createStreetlights(): StreetlightRig {
  const group = new THREE.Group();
  group.name = 'campus_streetlights';

  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.8,
  });

  const bulbMaterials: THREE.MeshStandardMaterial[] = [];
  const lightCones: THREE.Mesh[] = [];

  const postPositions: Array<{ x: number; z: number }> = [];

  // Along main central avenue
  for (let z = 340; z >= 20; z -= 35) {
    postPositions.push({ x: -6.5, z });
    postPositions.push({ x: 6.5, z });
  }

  // Along UIET boulevard
  for (let x = -40; x >= -320; x -= 40) {
    postPositions.push({ x, z: 12 });
  }

  // Around Shahu Ji Park
  [
    { x: 42, z: 66 },
    { x: 92, z: 66 },
    { x: 67, z: 40 },
    { x: 67, z: 92 },
  ].forEach((pos) => postPositions.push(pos));

  postPositions.forEach((pos) => {
    const postGroup = new THREE.Group();
    postGroup.position.set(pos.x, 0, pos.z);

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6.5, 8);
    poleGeo.translate(0, 3.25, 0);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.castShadow = true;
    postGroup.add(pole);

    // Horizontal Arm
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);
    armGeo.rotateZ(Math.PI / 2);
    armGeo.translate(0.9, 6.4, 0);
    const arm = new THREE.Mesh(armGeo, poleMat);
    postGroup.add(arm);

    // Lantern Head
    const headGeo = new THREE.ConeGeometry(0.4, 0.3, 8);
    headGeo.translate(1.8, 6.3, 0);
    const head = new THREE.Mesh(headGeo, poleMat);
    postGroup.add(head);

    // Frosted Light Bulb
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.2,
    });
    bulbMaterials.push(bulbMat);

    const bulbGeo = new THREE.SphereGeometry(0.22, 12, 12);
    bulbGeo.translate(1.8, 6.1, 0);
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    postGroup.add(bulb);

    // Soft downward illumination cone
    const coneGeo = new THREE.ConeGeometry(6.5, 6.2, 16);
    coneGeo.translate(1.8, 3.1, 0);
    coneGeo.rotateX(Math.PI);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    postGroup.add(cone);
    lightCones.push(cone);

    group.add(postGroup);
  });

  return {
    group,
    bulbMaterials,
    lightCones,
  };
}

export function updateStreetlightsLighting(rig: StreetlightRig, isDark: boolean) {
  rig.bulbMaterials.forEach((mat) => {
    mat.emissive.setHex(isDark ? 0xf59e0b : 0x000000);
    mat.emissiveIntensity = isDark ? 2.8 : 0;
  });

  rig.lightCones.forEach((cone) => {
    const mat = cone.material as THREE.MeshBasicMaterial;
    mat.opacity = isDark ? 0.18 : 0.0;
  });
}

/**
 * Creates Solid Non-Flickering Navigation Route with Directional "Go Here" Chevron Arrows
 * Completely eliminates Z-fighting and replaces flickering tube with clear guidance arrows.
 */
export function createRoute3D(route: NavigationRoute | null): THREE.Group {
  const routeGroup = new THREE.Group();
  routeGroup.name = 'navigation_route_3d';

  if (!route || route.pathNodes.length < 2) {
    return routeGroup;
  }

  const nodes = route.pathNodes;

  // 1. Flat Glowing Ground Path Ribbon (at Y = 0.22)
  for (let i = 0; i < nodes.length - 1; i++) {
    const p1 = nodes[i];
    const p2 = nodes[i + 1];

    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const len = Math.hypot(dx, dz);
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const angle = Math.atan2(dz, dx);

    // Clean flat ribbon on top of road
    const ribbonGeo = new THREE.PlaneGeometry(len, 2.2);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan
      emissive: 0x0891b2,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.5,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.rotation.x = -Math.PI / 2;
    ribbon.rotation.z = -angle;
    ribbon.position.set(midX, 0.22, midZ);
    routeGroup.add(ribbon);

    // 2. Directional "Go Here / Take This Turn" 3D Chevron Arrows along the segment
    const numArrows = Math.max(1, Math.floor(len / 14));
    for (let a = 1; a <= numArrows; a++) {
      const t = a / (numArrows + 1);
      const ax = p1.x + dx * t;
      const az = p1.z + dz * t;

      // 3D Chevron Arrow pointing forward along path
      const arrowShape = new THREE.Shape();
      arrowShape.moveTo(0, 1.4);
      arrowShape.lineTo(0.9, -0.6);
      arrowShape.lineTo(0.35, -0.4);
      arrowShape.lineTo(0.35, -1.2);
      arrowShape.lineTo(-0.35, -1.2);
      arrowShape.lineTo(-0.35, -0.4);
      arrowShape.lineTo(-0.9, -0.6);
      arrowShape.closePath();

      const arrowGeo = new THREE.ShapeGeometry(arrowShape);
      const arrowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -5,
        polygonOffsetUnits: -5,
      });
      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
      arrowMesh.rotation.x = -Math.PI / 2;
      arrowMesh.rotation.z = -angle - Math.PI / 2; // Point forward along path segment
      arrowMesh.position.set(ax, 0.26, az);
      routeGroup.add(arrowMesh);
    }
  }

  // 3. Waypoint Junction Rings at Turns (Y = 0.25)
  const ringGeo = new THREE.RingGeometry(1.4, 2.0, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    polygonOffsetUnits: -5,
  });

  nodes.forEach((node, i) => {
    if (i === 0 || i === nodes.length - 1) return;
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(node.x, 0.25, node.z);
    routeGroup.add(ring);
  });

  // 4. Destination Pulsing Light Beacon (Vertical Beam + Ground Rings)
  const lastNode = nodes[nodes.length - 1];

  const beamGeo = new THREE.CylinderGeometry(0.8, 1.6, 60, 16);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(lastNode.x, 30, lastNode.z);
  routeGroup.add(beam);

  const destRingGeo = new THREE.RingGeometry(2.4, 3.8, 32);
  const destRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    polygonOffsetUnits: -5,
  });
  const destRing = new THREE.Mesh(destRingGeo, destRingMat);
  destRing.rotation.x = -Math.PI / 2;
  destRing.position.set(lastNode.x, 0.27, lastNode.z);
  routeGroup.add(destRing);

  return routeGroup;
}
