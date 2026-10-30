/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingRecord } from '../../types/navigation';

/**
 * Creates high-detail procedural composite 3D models for CSJMU buildings
 * Assembled as THREE.Group of 4-12 distinct parts with realistic PBR materials.
 */
export function createBuildingMesh(building: BuildingRecord): THREE.Group {
  const group = new THREE.Group();
  group.name = `building_${building.id}`;
  group.position.set(building.metric.x, 0, building.metric.z);

  const { width, depth, height } = building.footprint;
  const pColor = new THREE.Color(building.colorTheme.primary);
  const aColor = new THREE.Color(building.colorTheme.accent);
  const rColor = new THREE.Color(building.colorTheme.roof);

  // Materials
  const basePlinthMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.85,
    metalness: 0.1,
  });

  const facadeMat = new THREE.MeshStandardMaterial({
    color: pColor,
    roughness: 0.65,
    metalness: 0.15,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: aColor,
    roughness: 0.4,
    metalness: 0.25,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: rColor,
    roughness: 0.8,
    metalness: 0.2,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x60a5fa,
    roughness: 0.1,
    metalness: 0.85,
    transmission: 0.35,
    transparent: true,
    opacity: 0.8,
  });

  const metalAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.25,
    metalness: 0.85,
  });

  // Part 1: Plinth / Foundation (Sits flush on ground)
  const plinthHeight = 0.8;
  const plinthGeo = new THREE.BoxGeometry(width + 2, plinthHeight, depth + 2);
  const plinthMesh = new THREE.Mesh(plinthGeo, basePlinthMat);
  plinthMesh.position.y = plinthHeight / 2;
  plinthMesh.receiveShadow = true;
  plinthMesh.castShadow = true;
  group.add(plinthMesh);

  // Part 2: Main Facade Core
  const coreHeight = height - plinthHeight - 1.2;
  const coreGeo = new THREE.BoxGeometry(width, coreHeight, depth);
  const coreMesh = new THREE.Mesh(coreGeo, facadeMat);
  coreMesh.position.y = plinthHeight + coreHeight / 2;
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  group.add(coreMesh);

  // Part 3: Window Strips / Louvers
  const numFloors = building.footprint.floors || 3;
  const floorHeight = coreHeight / numFloors;
  for (let f = 0; f < numFloors; f++) {
    const wy = plinthHeight + f * floorHeight + floorHeight * 0.55;
    // Front window strip
    const frontWindowGeo = new THREE.BoxGeometry(width * 0.8, floorHeight * 0.45, 0.4);
    const frontWindow = new THREE.Mesh(frontWindowGeo, glassMat.clone());
    frontWindow.name = 'building_window';
    frontWindow.position.set(0, wy, depth / 2 + 0.1);
    group.add(frontWindow);

    // Back window strip
    const backWindowGeo = new THREE.BoxGeometry(width * 0.8, floorHeight * 0.45, 0.4);
    const backWindow = new THREE.Mesh(backWindowGeo, glassMat.clone());
    backWindow.name = 'building_window';
    backWindow.position.set(0, wy, -depth / 2 - 0.1);
    group.add(backWindow);

    // Decorative Floor cornice bands
    const bandGeo = new THREE.BoxGeometry(width + 0.6, 0.3, depth + 0.6);
    const bandMesh = new THREE.Mesh(bandGeo, trimMat);
    bandMesh.position.set(0, plinthHeight + (f + 1) * floorHeight, 0);
    group.add(bandMesh);
  }

  // Part 4: Roof Parapet & Slab
  const parapetHeight = 1.0;
  const parapetGeo = new THREE.BoxGeometry(width + 0.8, parapetHeight, depth + 0.8);
  const parapetMesh = new THREE.Mesh(parapetGeo, trimMat);
  parapetMesh.position.y = height - parapetHeight / 2;
  parapetMesh.castShadow = true;
  group.add(parapetMesh);

  // Part 5: Roof Floor & HVAC / Solar Arrays
  const roofGeo = new THREE.BoxGeometry(width - 1.5, 0.2, depth - 1.5);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.y = height - parapetHeight;
  roofMesh.receiveShadow = true;
  group.add(roofMesh);

  // Rooftop mechanical unit / elevator machine room
  const mechGeo = new THREE.BoxGeometry(width * 0.25, 2.4, depth * 0.25);
  const mechMesh = new THREE.Mesh(mechGeo, facadeMat);
  mechMesh.position.set(-width * 0.2, height + 1.2, -depth * 0.15);
  mechMesh.castShadow = true;
  group.add(mechMesh);

  // Rooftop solar panel array
  const solarGeo = new THREE.BoxGeometry(width * 0.4, 0.15, depth * 0.3);
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.2,
    metalness: 0.9,
  });
  const solarMesh = new THREE.Mesh(solarGeo, solarMat);
  solarMesh.rotation.x = 0.2;
  solarMesh.position.set(width * 0.2, height + 0.6, depth * 0.1);
  group.add(solarMesh);

  // Part 6: Entrance Portico & Canopy (Facing front)
  const canopyWidth = Math.min(width * 0.35, 18);
  const canopyDepth = 5;
  const canopyHeight = 0.5;
  const canopyGeo = new THREE.BoxGeometry(canopyWidth, canopyHeight, canopyDepth);
  const canopyMesh = new THREE.Mesh(canopyGeo, trimMat);
  canopyMesh.position.set(0, plinthHeight + floorHeight * 0.9, depth / 2 + canopyDepth / 2);
  canopyMesh.castShadow = true;
  group.add(canopyMesh);

  // Entrance Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, floorHeight * 0.9, 12);
  const leftPillar = new THREE.Mesh(pillarGeo, trimMat);
  leftPillar.position.set(-canopyWidth / 2 + 0.8, plinthHeight + (floorHeight * 0.9) / 2, depth / 2 + canopyDepth - 0.8);
  leftPillar.castShadow = true;
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, trimMat);
  rightPillar.position.set(canopyWidth / 2 - 0.8, plinthHeight + (floorHeight * 0.9) / 2, depth / 2 + canopyDepth - 0.8);
  rightPillar.castShadow = true;
  group.add(rightPillar);

  // Entrance Doorway
  const doorGeo = new THREE.BoxGeometry(canopyWidth * 0.6, floorHeight * 0.8, 0.3);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.3,
    metalness: 0.7,
  });
  const doorMesh = new THREE.Mesh(doorGeo, doorMat);
  doorMesh.position.set(0, plinthHeight + (floorHeight * 0.8) / 2, depth / 2 + 0.05);
  group.add(doorMesh);

  // Building Unique Architectural Signatures:
  if (building.id === 'admin_block') {
    // Clock Tower on VC Secretariat
    const towerWidth = 8;
    const towerHeight = 12;
    const towerGeo = new THREE.BoxGeometry(towerWidth, towerHeight, towerWidth);
    const towerMesh = new THREE.Mesh(towerGeo, facadeMat);
    towerMesh.position.set(0, height + towerHeight / 2, 0);
    towerMesh.castShadow = true;
    group.add(towerMesh);

    // Clock Face (Circular)
    const clockGeo = new THREE.CylinderGeometry(2, 2, 0.3, 24);
    const clockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.2,
    });
    const clockMesh = new THREE.Mesh(clockGeo, clockMat);
    clockMesh.rotation.x = Math.PI / 2;
    clockMesh.position.set(0, height + towerHeight - 3, towerWidth / 2 + 0.1);
    group.add(clockMesh);

    // Cupola / Spire
    const spireGeo = new THREE.ConeGeometry(3, 5, 8);
    const spireMesh = new THREE.Mesh(spireGeo, trimMat);
    spireMesh.position.set(0, height + towerHeight + 2.5, 0);
    group.add(spireMesh);
  } else if (building.id === 'central_library') {
    // Grand Central Dome on Swami Vivekananda Library
    const domeGeo = new THREE.SphereGeometry(width * 0.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, trimMat);
    domeMesh.position.set(0, height, 0);
    domeMesh.castShadow = true;
    group.add(domeMesh);

    // Grand Entrance Colonnade
    for (let c = -3; c <= 3; c++) {
      if (c === 0) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, height * 0.7, 16), trimMat);
      col.position.set(c * (width / 9), (height * 0.7) / 2, depth / 2 + 3);
      col.castShadow = true;
      group.add(col);
    }
  } else if (building.id === 'auditorium') {
    // Curved Hall / Segmented Roof
    const curvedRoofGeo = new THREE.CylinderGeometry(width * 0.45, width * 0.45, depth, 24, 1, false, 0, Math.PI);
    const curvedRoofMesh = new THREE.Mesh(curvedRoofGeo, trimMat);
    curvedRoofMesh.rotation.z = Math.PI / 2;
    curvedRoofMesh.position.set(0, height + 1, 0);
    curvedRoofMesh.castShadow = true;
    group.add(curvedRoofMesh);
  } else if (building.id === 'main_gate' || building.id === 'gate_2_west' || building.id === 'gate_3_northeast') {
    // Monumental Gate Arches with Ashoka Emblem Insignia
    const archPillarGeo = new THREE.BoxGeometry(4, height, 4);
    const leftGatePillar = new THREE.Mesh(archPillarGeo, facadeMat);
    leftGatePillar.position.set(-width / 2 + 2, height / 2, 0);
    leftGatePillar.castShadow = true;
    group.add(leftGatePillar);

    const rightGatePillar = new THREE.Mesh(archPillarGeo, facadeMat);
    rightGatePillar.position.set(width / 2 - 2, height / 2, 0);
    rightGatePillar.castShadow = true;
    group.add(rightGatePillar);

    // Top Beam
    const archBeamGeo = new THREE.BoxGeometry(width + 2, 2.5, 4.5);
    const archBeam = new THREE.Mesh(archBeamGeo, trimMat);
    archBeam.position.set(0, height + 1.25, 0);
    archBeam.castShadow = true;
    group.add(archBeam);

    // University Crest Roundel
    const crestGeo = new THREE.CylinderGeometry(2, 2, 0.4, 32);
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, height + 3.5, 0);
    group.add(crest);
  } else if (building.id === 'shahu_ji_park') {
    // Memorial Statue Pavilion in Park
    const pedGeo = new THREE.CylinderGeometry(4, 5, 2.5, 16);
    const ped = new THREE.Mesh(pedGeo, trimMat);
    ped.position.set(0, 1.25, 0);
    ped.receiveShadow = true;
    group.add(ped);

    // Bronze Statue Silhouette
    const statueGeo = new THREE.CylinderGeometry(0.8, 1.2, 4.5, 12);
    const statueMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.3,
      metalness: 0.85,
    });
    const statue = new THREE.Mesh(statueGeo, statueMat);
    statue.position.set(0, 4.75, 0);
    statue.castShadow = true;
    group.add(statue);

    // Fountain Basin Ring
    const basinGeo = new THREE.TorusGeometry(12, 0.8, 12, 32);
    const basin = new THREE.Mesh(basinGeo, trimMat);
    basin.rotation.x = Math.PI / 2;
    basin.position.set(0, 0.4, 0);
    group.add(basin);
  } else if (building.id === 'sports_stadium') {
    // Running Track Oval & Bleachers
    const turfGeo = new THREE.PlaneGeometry(width * 0.75, depth * 0.75);
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.9,
      metalness: 0.05,
    });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.rotation.x = -Math.PI / 2;
    turf.position.set(0, 0.85, 0);
    turf.receiveShadow = true;
    group.add(turf);

    // Spectator Bleachers
    const bleacherGeo = new THREE.BoxGeometry(width * 0.8, 4, 8);
    const bleacherMesh = new THREE.Mesh(bleacherGeo, facadeMat);
    bleacherMesh.position.set(0, 2, -depth / 2 + 4);
    bleacherMesh.castShadow = true;
    group.add(bleacherMesh);
  }

  // Floating 3D Building Billboard / Marker Sign (High-res 1024x256 with mipmapping for crisp readability)
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 1024;
  labelCanvas.height = 256;
  const ctx = labelCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.roundRect(20, 20, 984, 216, 32);
    ctx.fill();

    ctx.strokeStyle = building.colorTheme.primary;
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(building.abbreviation || building.name, 512, 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 40px Inter, system-ui, sans-serif';
    const subText = building.category.toUpperCase();
    ctx.fillText(subText, 512, 172);
  }

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.minFilter = THREE.LinearMipmapLinearFilter;
  labelTex.magFilter = THREE.LinearFilter;
  labelTex.generateMipmaps = true;

  const spriteMat = new THREE.SpriteMaterial({
    map: labelTex,
    transparent: true,
    depthTest: true,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(22, 5.5, 1);
  sprite.position.set(0, height + 8, 0);
  sprite.name = `label_${building.id}`;
  group.add(sprite);

  return group;
}
