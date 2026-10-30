/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Compass, Navigation, MapPin, Sparkles, Shield, ArrowRight, Play } from 'lucide-react';
import { CSJMU_BUILDINGS } from './data/csjmuData';
import { BuildingRecord, CameraMode, NavigationRoute, PlayerState, TimePreset, TravelMode } from './types/navigation';
import { calculateCampusRoute } from './utils/pathfinding';
import { sounds } from './utils/soundEffects';
import { CampusWorld3D } from './components/CampusWorld3D';
import { GameHUD } from './components/GameHUD';
import { BuildingDirectoryModal } from './components/BuildingDirectoryModal';
import { CampusAssistantModal } from './components/CampusAssistantModal';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { EmergencyModal } from './components/EmergencyModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CampusLandingPage } from './components/CampusLandingPage';

export default function App() {
  // Query param autostart check for Ultra Mode
  const isAutostart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';

  // Application View: 'landing' (Default university portal) vs 'navigator' (3D Open World)
  const [currentView, setCurrentView] = useState<'landing' | 'navigator'>(isAutostart ? 'navigator' : 'landing');

  // Navigation & World State
  const [cameraMode, setCameraMode] = useState<CameraMode>('third_person');
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');
  const [timePreset, setTimePreset] = useState<TimePreset>('realtime');
  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingRecord | null>(null);
  const [buildings, setBuildings] = useState<BuildingRecord[]>(CSJMU_BUILDINGS);

  // Player telemetry
  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 0,
    z: 350,
    rotationY: Math.PI,
    speed: 0,
    isMoving: false,
    isSprinting: false,
    travelMode: 'walk',
    isAutoPilot: false,
  });
  const [playerGps, setPlayerGps] = useState<{ latitude: number; longitude: number }>({
    latitude: 26.49509,
    longitude: 80.26580,
  });

  // Settings & Preferences
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [voicePromptsEnabled, setVoicePromptsEnabled] = useState<boolean>(false);
  const [highContrastEnabled, setHighContrastEnabled] = useState<boolean>(false);
  const [walkingSpeedMultiplier, setWalkingSpeedMultiplier] = useState<number>(1.3);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // Mutable Joystick input ref for zero-re-render 60fps touch control
  const joystickInputRef = useRef<{ x: number; y: number; isSprinting: boolean }>({
    x: 0,
    y: 0,
    isSprinting: false,
  });

  // Throttled player update from 3D world loop
  const handlePlayerUpdate = useCallback(
    (state: PlayerState, lat: number, lon: number) => {
      setPlayerState(state);
      setPlayerGps({ latitude: lat, longitude: lon });
    },
    []
  );

  // Spoken voice navigation prompt helper
  const speakInstruction = useCallback(
    (text: string) => {
      if (!voicePromptsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech API unsupported fallback
      }
    },
    [voicePromptsEnabled]
  );

  // Start Navigation Action
  const handleStartNavigation = useCallback(
    (destination: BuildingRecord) => {
      setSelectedBuilding(destination);
      const playerMetric = { x: playerState.x, z: playerState.z };
      const route = calculateCampusRoute(playerMetric, destination, {
        accessibleOnly,
      });

      if (route) {
        setActiveRoute(route);
        sounds.playRouteStart();
        if (route.steps.length > 0) {
          speakInstruction(route.steps[0].instruction);
        }
      }
    },
    [playerState.x, playerState.z, accessibleOnly, speakInstruction]
  );

  // Re-calculate route if accessibility mode toggles
  useEffect(() => {
    if (activeRoute) {
      const playerMetric = { x: playerState.x, z: playerState.z };
      const updated = calculateCampusRoute(playerMetric, activeRoute.destinationBuilding, {
        accessibleOnly,
      });
      if (updated) {
        setActiveRoute(updated);
      }
    }
  }, [accessibleOnly]);

  // Audio Mute toggle
  const handleToggleMute = useCallback(() => {
    sounds.isMuted = !sounds.isMuted;
    setIsMuted(sounds.isMuted);
  }, []);

  // Launch from Landing Page into 3D Navigator
  const handleLaunchFromLanding = useCallback(
    (mode: TravelMode = 'walk', targetBuildingId?: string) => {
      setTravelMode(mode);
      setCurrentView('navigator');
      if (targetBuildingId) {
        const b = buildings.find((item) => item.id === targetBuildingId);
        if (b) {
          setTimeout(() => {
            handleStartNavigation(b);
          }, 150);
        }
      }
    },
    [buildings, handleStartNavigation]
  );

  // Return from 3D Navigator back to Landing Page
  const handleBackToLanding = useCallback(() => {
    setActiveRoute(null);
    setIsAutoPilot(false);
    setCurrentView('landing');
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDirectoryOpen(false);
        setIsAccessibilityOpen(false);
        setIsEmergencyOpen(false);
        setIsAdminOpen(false);
        setIsAssistantOpen(false);
      } else if (e.key === 'c' || e.key === 'C') {
        setCameraMode((prev) =>
          prev === 'third_person' ? 'first_person' : prev === 'first_person' ? 'aerial' : 'third_person'
        );
      } else if (e.key === 'v' || e.key === 'V') {
        setTravelMode((prev: TravelMode) => (prev === 'walk' ? 'auto' : 'walk'));
      } else if (e.key === 't' || e.key === 'T') {
        setTimePreset((prev: TimePreset) =>
          prev === 'realtime' ? 'day' : prev === 'day' ? 'sunset' : prev === 'sunset' ? 'night' : 'realtime'
        );
      } else if (e.key === 'p' || e.key === 'P') {
        setIsAutoPilot((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMute]);

  // If user is on the Landing Page, render the official CSJMU Campus Portal
  if (currentView === 'landing') {
    return <CampusLandingPage onLaunchNavigator={handleLaunchFromLanding} />;
  }

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden bg-slate-950 font-sans ${
        highContrastEnabled ? 'contrast-125' : ''
      }`}
      data-testid="campus-compass-app"
    >
      {/* 3D WebGL Canvas Layer */}
      <CampusWorld3D
        cameraMode={cameraMode}
        travelMode={travelMode}
        timePreset={timePreset}
        isAutoPilot={isAutoPilot}
        onAutoPilotComplete={() => setIsAutoPilot(false)}
        activeRoute={activeRoute}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          setIsDirectoryOpen(true);
        }}
        onPlayerUpdate={handlePlayerUpdate}
        joystickInputRef={joystickInputRef}
      />

      {/* Cinematic Game Navigation HUD */}
      <GameHUD
        onBackToLanding={handleBackToLanding}
        cameraMode={cameraMode}
        onSetCameraMode={setCameraMode}
        travelMode={travelMode}
        onSetTravelMode={setTravelMode}
        timePreset={timePreset}
        onSetTimePreset={setTimePreset}
        isAutoPilot={isAutoPilot}
        onToggleAutoPilot={() => setIsAutoPilot((prev) => !prev)}
        activeRoute={activeRoute}
        onCancelRoute={() => {
          setActiveRoute(null);
          setIsAutoPilot(false);
        }}
        playerState={playerState}
        playerGps={playerGps}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          handleStartNavigation(b);
        }}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        joystickInputRef={joystickInputRef}
      />

      {/* Modals */}
      <BuildingDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(b) => setSelectedBuilding(b)}
        onStartNavigation={(b) => handleStartNavigation(b)}
      />

      <CampusAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onStartNavigation={(b) => handleStartNavigation(b)}
      />

      <AccessibilityPanel
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        accessibleOnly={accessibleOnly}
        onToggleAccessibleOnly={() => setAccessibleOnly((v) => !v)}
        voicePromptsEnabled={voicePromptsEnabled}
        onToggleVoicePrompts={() => setVoicePromptsEnabled((v) => !v)}
        highContrastEnabled={highContrastEnabled}
        onToggleHighContrast={() => setHighContrastEnabled((v) => !v)}
        walkingSpeedMultiplier={walkingSpeedMultiplier}
        onSetWalkingSpeed={(s) => setWalkingSpeedMultiplier(s)}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        playerGps={playerGps}
        onStartNavigation={(b) => handleStartNavigation(b)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        buildings={buildings}
        onUpdateBuilding={(updated) => {
          setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        }}
      />
    </div>
  );
}
