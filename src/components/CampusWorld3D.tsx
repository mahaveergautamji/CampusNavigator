/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CSJMU_BUILDINGS } from '../data/csjmuData';
import { BuildingRecord, CameraMode, NavigationRoute, PlayerState, TimePreset, TravelMode } from '../types/navigation';
import { getBuildingBoundingBox, resolveCollision } from '../utils/collision';
import { metricToGps } from '../utils/geoProjection';
import { sounds } from '../utils/soundEffects';
import { getLightingForHour, getLocalTimeHour } from '../utils/timeOfDay';
import { createBuildingMesh } from './campus3d/buildingBuilders';
import {
  AutoRickshawRig,
  CharacterRig,
  StreetlightRig,
  createCampusAutoRickshaw,
  createCampusTerrain,
  createCharacterAvatar,
  createInstancedFoliage,
  createRoute3D,
  createStreetlights,
  getCampusTreeObstacles,
  updateAutoRickshawAnimation,
  updateCharacterAnimation,
  updateStreetlightsLighting,
} from './campus3d/environmentBuilders';

interface CampusWorld3DProps {
  cameraMode: CameraMode;
  travelMode: TravelMode;
  timePreset: TimePreset;
  isAutoPilot: boolean;
  onAutoPilotComplete?: () => void;
  activeRoute: NavigationRoute | null;
  selectedBuilding: BuildingRecord | null;
  onSelectBuilding: (building: BuildingRecord) => void;
  onPlayerUpdate: (state: PlayerState, lat: number, lon: number) => void;
  joystickInputRef: React.MutableRefObject<{ x: number; y: number; isSprinting: boolean }>;
}

export const CampusWorld3D: React.FC<CampusWorld3DProps> = ({
  cameraMode,
  travelMode,
  timePreset,
  isAutoPilot,
  onAutoPilotComplete,
  activeRoute,
  selectedBuilding,
  onSelectBuilding,
  onPlayerUpdate,
  joystickInputRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store mutable props in refs to avoid recreating Three.js scene on prop changes
  const cameraModeRef = useRef<CameraMode>(cameraMode);
  cameraModeRef.current = cameraMode;

  const travelModeRef = useRef<TravelMode>(travelMode);
  travelModeRef.current = travelMode;

  const timePresetRef = useRef<TimePreset>(timePreset);
  timePresetRef.current = timePreset;

  const isAutoPilotRef = useRef<boolean>(isAutoPilot);
  isAutoPilotRef.current = isAutoPilot;

  const onAutoPilotCompleteRef = useRef(onAutoPilotComplete);
  onAutoPilotCompleteRef.current = onAutoPilotComplete;

  const activeRouteRef = useRef<NavigationRoute | null>(activeRoute);
  activeRouteRef.current = activeRoute;

  const selectedBuildingRef = useRef<BuildingRecord | null>(selectedBuilding);
  selectedBuildingRef.current = selectedBuilding;

  const onSelectBuildingRef = useRef(onSelectBuilding);
  onSelectBuildingRef.current = onSelectBuilding;

  const onPlayerUpdateRef = useRef(onPlayerUpdate);
  onPlayerUpdateRef.current = onPlayerUpdate;

  // Scene object refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const routeGroupRef = useRef<THREE.Group | null>(null);
  const characterRigRef = useRef<CharacterRig | null>(null);
  const autoRigRef = useRef<AutoRickshawRig | null>(null);
  const streetlightsRef = useRef<StreetlightRig | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const playerPosRef = useRef<{ x: number; z: number; rotY: number }>({ x: 0, z: 350, rotY: Math.PI });

  // Auto-pilot waypoint tracker
  const autoPilotIndexRef = useRef<number>(0);

  // Focus target helper for camera
  const focusTargetRef = useRef<{ x: number; y: number; z: number } | null>(null);

  // Reset auto-pilot waypoint when route changes
  useEffect(() => {
    autoPilotIndexRef.current = 1;
  }, [activeRoute]);

  // When selectedBuilding changes, focus camera towards it
  useEffect(() => {
    if (selectedBuilding) {
      focusTargetRef.current = {
        x: selectedBuilding.metric.x,
        y: selectedBuilding.footprint.height / 2,
        z: selectedBuilding.metric.z,
      };
    }
  }, [selectedBuilding]);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    const initialWidth = container.clientWidth || window.innerWidth || 1280;
    const initialHeight = container.clientHeight || window.innerHeight || 720;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';

    container.appendChild(renderer.domElement);

    // 3. Setup Scene & Camera (Wide crisp linear fog instead of dense blur fog)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x93c5fd);
    scene.fog = new THREE.Fog(0x93c5fd, 450, 2200);

    const camera = new THREE.PerspectiveCamera(
      55,
      initialWidth / initialHeight,
      0.5,
      2500
    );
    camera.position.set(0, 4.5, 360);
    camera.lookAt(0, 1.4, 350);

    // 4. Studio Environment Lighting
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Directional Sun / Moon Light
    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    sunLight.position.set(150, 250, 180);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 600;
      const d = 260;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    // Sky & Ground Fill
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x14532d, 0.7);
    scene.add(hemiLight);

    // 5. Populate World: Terrain, Roads, Trees, Streetlights
    const terrain = createCampusTerrain();
    scene.add(terrain);

    const foliage = createInstancedFoliage();
    scene.add(foliage);

    const streetlights = createStreetlights();
    streetlightsRef.current = streetlights;
    scene.add(streetlights.group);

    // 6. Populate Verified CSJMU Buildings
    const buildingMeshesGroup = new THREE.Group();
    buildingMeshesGroup.name = 'buildings_collection';
    buildingGroupRef.current = buildingMeshesGroup;
    CSJMU_BUILDINGS.forEach((b) => {
      const mesh = createBuildingMesh(b);
      buildingMeshesGroup.add(mesh);
    });
    scene.add(buildingMeshesGroup);

    // 7. Add Student Avatar
    const charRig = createCharacterAvatar();
    characterRigRef.current = charRig;
    charRig.group.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
    charRig.group.rotation.y = playerPosRef.current.rotY;
    scene.add(charRig.group);

    // 8. Add CSJMU Campus Auto / E-Rickshaw
    const autoRig = createCampusAutoRickshaw();
    autoRigRef.current = autoRig;
    autoRig.group.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
    autoRig.group.rotation.y = playerPosRef.current.rotY;
    autoRig.group.visible = false;
    scene.add(autoRig.group);

    // 9. Add Route Group Container
    const routeGroup = new THREE.Group();
    routeGroupRef.current = routeGroup;
    scene.add(routeGroup);

    // Cache building bounding boxes and tree obstacles for collision detection
    const buildingBoxes = CSJMU_BUILDINGS.map((b) => getBuildingBoundingBox(b, 1.4));
    const treeObstacles = getCampusTreeObstacles();

    // 10. Input Listeners
    const keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.w = true;
      if (k === 's' || k === 'arrowdown') keys.s = true;
      if (k === 'a' || k === 'arrowleft') keys.a = true;
      if (k === 'd' || k === 'arrowright') keys.d = true;
      if (e.shiftKey) keys.shift = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.w = false;
      if (k === 's' || k === 'arrowdown') keys.s = false;
      if (k === 'a' || k === 'arrowleft') keys.a = false;
      if (k === 'd' || k === 'arrowright') keys.d = false;
      if (!e.shiftKey) keys.shift = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Dragging Orbit / Camera Pitch & Yaw
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let cameraYawOffset = 0;
    let cameraPitch = 0.25;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      cameraYawOffset -= dx * 0.005;
      cameraPitch = Math.max(0.05, Math.min(1.3, cameraPitch + dy * 0.005));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    // Raycast on Click to Select Buildings
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(buildingMeshesGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name.startsWith('building_')) {
          obj = obj.parent;
        }
        if (obj) {
          const buildingId = obj.name.replace('building_', '');
          const found = CSJMU_BUILDINGS.find((b) => b.id === buildingId);
          if (found) {
            sounds.playClick();
            onSelectBuildingRef.current(found);
          }
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);

    // Window Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 11. Animation & Simulation Game Loop
    let lastTime = performance.now();
    let frameId = 0;
    let stepSoundTimer = 0;
    let lastHudUpdateTime = 0;
    let prevRouteInstance: NavigationRoute | null = null;
    let prevDarkState = false;

    function tick() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // 1. Update Time-of-Day Lighting
      const timePresetVal = timePresetRef.current;
      let effectiveHour = 13.0; // Day default
      if (timePresetVal === 'realtime') {
        effectiveHour = getLocalTimeHour();
      } else if (timePresetVal === 'sunset') {
        effectiveHour = 18.2;
      } else if (timePresetVal === 'night') {
        effectiveHour = 22.5;
      }

      const lightState = getLightingForHour(effectiveHour);

      // Smoothly update environment colors
      sunLight.position.set(lightState.sunPosition.x, lightState.sunPosition.y, lightState.sunPosition.z);
      sunLight.color.setHex(lightState.sunColor);
      sunLight.intensity = lightState.sunIntensity;

      hemiLight.color.setHex(lightState.hemiSkyColor);
      hemiLight.groundColor.setHex(lightState.hemiGroundColor);

      scene.background = new THREE.Color(lightState.skyColor);
      scene.fog = new THREE.FogExp2(lightState.fogColor, lightState.areStreetlightsOn ? 0.0022 : 0.0018);

      // Automatic Streetlights & Window lights on darkness
      if (lightState.areStreetlightsOn !== prevDarkState) {
        prevDarkState = lightState.areStreetlightsOn;
        if (streetlightsRef.current) {
          updateStreetlightsLighting(streetlightsRef.current, lightState.areStreetlightsOn);
        }

        // Illuminate building windows
        if (buildingGroupRef.current) {
          buildingGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name === 'building_window') {
              const mat = child.material as THREE.MeshStandardMaterial;
              mat.emissive.setHex(lightState.areWindowLightsOn ? 0xfef08a : 0x000000);
              mat.emissiveIntensity = lightState.areWindowLightsOn ? 1.5 : 0;
            }
          });
        }
      }

      // 2. Update 3D Route if changed
      if (activeRouteRef.current !== prevRouteInstance) {
        prevRouteInstance = activeRouteRef.current;
        while (routeGroup.children.length > 0) {
          const child = routeGroup.children[0];
          routeGroup.remove(child);
        }
        if (prevRouteInstance) {
          const newRoute3d = createRoute3D(prevRouteInstance);
          routeGroup.add(newRoute3d);
          sounds.playRouteStart();
        }
      }

      // 3. Movement Controls (Auto-Pilot vs Manual)
      const isAuto = travelModeRef.current === 'auto';
      const autoPilotActive = isAutoPilotRef.current && activeRouteRef.current && activeRouteRef.current.pathNodes.length > 1;

      let moveForward = 0;
      let turnInput = 0;

      if (autoPilotActive) {
        // Auto-Pilot: autonomously follow route waypoints
        const route = activeRouteRef.current!;
        const currIdx = autoPilotIndexRef.current;
        if (currIdx < route.pathNodes.length) {
          const targetNode = route.pathNodes[currIdx];
          const dx = targetNode.x - playerPosRef.current.x;
          const dz = targetNode.z - playerPosRef.current.z;
          const distToWp = Math.hypot(dx, dz);

          if (distToWp < 3.5) {
            // Reached waypoint: advance to next
            autoPilotIndexRef.current += 1;
            if (autoPilotIndexRef.current >= route.pathNodes.length) {
              // Reached final destination
              sounds.playArrivalChime();
              if (onAutoPilotCompleteRef.current) onAutoPilotCompleteRef.current();
            }
          } else {
            // Steer towards target waypoint
            const desiredYaw = Math.atan2(dx, dz);
            let diffYaw = desiredYaw - playerPosRef.current.rotY;
            while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
            while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;

            turnInput = Math.max(-1, Math.min(1, diffYaw * 2.5));
            moveForward = Math.cos(diffYaw) > 0.1 ? 1 : 0.4;
          }
        }
      } else {
        // Manual Keyboard + Virtual Joystick
        const joy = joystickInputRef.current;
        if (keys.w) moveForward += 1;
        if (keys.s) moveForward -= 1;
        if (keys.a) turnInput += 1;
        if (keys.d) turnInput -= 1;

        if (Math.abs(joy.y) > 0.1) moveForward -= joy.y;
        if (Math.abs(joy.x) > 0.1) turnInput -= joy.x;
      }

      const isSprinting = keys.shift || joystickInputRef.current.isSprinting;
      const baseSpeed = isAuto ? 13.5 : isSprinting ? 9.5 : 4.8;
      const turnSpeed = isAuto ? 2.8 : 2.5;

      // Update Heading
      if (turnInput !== 0) {
        playerPosRef.current.rotY += turnInput * turnSpeed * dt;
      }

      const isMoving = Math.abs(moveForward) > 0.05;
      const currentSpeed = isMoving ? baseSpeed : 0;

      // 4. Collision-Aware Movement Response
      if (isMoving) {
        const moveDist = moveForward * baseSpeed * dt;
        const targetX = playerPosRef.current.x + Math.sin(playerPosRef.current.rotY) * moveDist;
        const targetZ = playerPosRef.current.z + Math.cos(playerPosRef.current.rotY) * moveDist;

        // Resolve collision against all building bounding boxes and tree obstacles!
        const playerRadius = isAuto ? 1.2 : 0.6;
        const resolved = resolveCollision(
          targetX,
          targetZ,
          playerPosRef.current.x,
          playerPosRef.current.z,
          playerRadius,
          buildingBoxes,
          treeObstacles
        );

        playerPosRef.current.x = resolved.x;
        playerPosRef.current.z = resolved.z;

        // Footstep sound for student on foot
        if (!isAuto) {
          stepSoundTimer += dt;
          const stepInterval = isSprinting ? 0.28 : 0.42;
          if (stepSoundTimer >= stepInterval) {
            stepSoundTimer = 0;
            sounds.playFootstep();
          }
        }
      }

      // 5. Update Visible Avatar vs Auto-Rickshaw
      const p = playerPosRef.current;
      if (isAuto) {
        charRig.group.visible = false;
        autoRig.group.visible = true;
        autoRig.group.position.set(p.x, 0, p.z);
        autoRig.group.rotation.y = p.rotY;
        updateAutoRickshawAnimation(autoRig, currentSpeed, turnInput, dt, lightState.areStreetlightsOn);
      } else {
        autoRig.group.visible = false;
        charRig.group.visible = true;
        charRig.group.position.set(p.x, 0, p.z);
        charRig.group.rotation.y = p.rotY;
        updateCharacterAnimation(charRig, currentSpeed, dt);
      }

      // 6. Damped Camera Following
      const mode = cameraModeRef.current;
      const smoothFactor = 1 - Math.exp(-8 * dt);

      if (focusTargetRef.current && mode === 'aerial') {
        const ft = focusTargetRef.current;
        const targetCamX = ft.x + Math.sin(cameraYawOffset) * 75;
        const targetCamZ = ft.z + Math.cos(cameraYawOffset) * 75;
        const targetCamY = Math.max(35, 75 * Math.sin(cameraPitch));

        camera.position.x += (targetCamX - camera.position.x) * smoothFactor;
        camera.position.y += (targetCamY - camera.position.y) * smoothFactor;
        camera.position.z += (targetCamZ - camera.position.z) * smoothFactor;
        camera.lookAt(ft.x, ft.y, ft.z);
      } else if (mode === 'third_person') {
        const yaw = p.rotY + cameraYawOffset;
        const camDist = isAuto ? 12.0 : 9.5;
        const targetCamX = p.x - Math.sin(yaw) * camDist;
        const targetCamZ = p.z - Math.cos(yaw) * camDist;
        const targetCamY = (isAuto ? 4.4 : 3.6) + cameraPitch * 3.5;

        camera.position.x += (targetCamX - camera.position.x) * smoothFactor;
        camera.position.y += (targetCamY - camera.position.y) * smoothFactor;
        camera.position.z += (targetCamZ - camera.position.z) * smoothFactor;
        camera.lookAt(p.x, 1.4, p.z);
      } else if (mode === 'first_person') {
        camera.position.x = p.x;
        camera.position.y = isAuto ? 1.5 : 1.7;
        camera.position.z = p.z;

        const yaw = p.rotY + cameraYawOffset;
        const lookX = p.x + Math.sin(yaw) * 10;
        const lookZ = p.z + Math.cos(yaw) * 10;
        const lookY = (isAuto ? 1.5 : 1.7) - (cameraPitch - 0.25) * 4;
        camera.lookAt(lookX, lookY, lookZ);
      } else {
        // Aerial Overview
        const targetCamX = p.x + Math.sin(cameraYawOffset) * 140;
        const targetCamZ = p.z + Math.cos(cameraYawOffset) * 140;
        const targetCamY = 120;

        camera.position.x += (targetCamX - camera.position.x) * smoothFactor;
        camera.position.y += (targetCamY - camera.position.y) * smoothFactor;
        camera.position.z += (targetCamZ - camera.position.z) * smoothFactor;
        camera.lookAt(p.x, 0, p.z);
      }

      // Render Frame
      renderer.render(scene, camera);

      // Throttled Player State callback to React HUD (10Hz)
      if (now - lastHudUpdateTime > 100) {
        lastHudUpdateTime = now;
        const gps = metricToGps(p.x, p.z);
        onPlayerUpdateRef.current(
          {
            x: Math.round(p.x),
            z: Math.round(p.z),
            rotationY: p.rotY,
            speed: Math.round(currentSpeed * 10) / 10,
            isMoving,
            isSprinting,
            travelMode: travelModeRef.current,
            isAutoPilot: autoPilotActive ?? false,
          },
          gps.latitude,
          gps.longitude
        );
      }

      if (isSoftwareGl) {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
        gl.flush();
        const poll = () => {
          const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.ALREADY_SIGNALED;
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(tick, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      data-testid="campus-3d-viewport"
    />
  );
};
