/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Navigation,
  Search,
  Volume2,
  VolumeX,
  Eye,
  AlertTriangle,
  Accessibility,
  Database,
  Crosshair,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Bot,
  Zap,
  Sun,
  Moon,
  Sunset,
  Clock,
  Play,
  Pause,
  Home,
} from 'lucide-react';
import { CSJMU_BUILDINGS } from '../data/csjmuData';
import {
  BuildingCategory,
  BuildingRecord,
  CameraMode,
  NavigationRoute,
  PlayerState,
  TimePreset,
  TravelMode,
} from '../types/navigation';
import { sounds } from '../utils/soundEffects';

interface GameHUDProps {
  onBackToLanding?: () => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  travelMode: TravelMode;
  onSetTravelMode: (mode: TravelMode) => void;
  timePreset: TimePreset;
  onSetTimePreset: (preset: TimePreset) => void;
  isAutoPilot: boolean;
  onToggleAutoPilot: () => void;
  activeRoute: NavigationRoute | null;
  onCancelRoute: () => void;
  playerState: PlayerState;
  playerGps: { latitude: number; longitude: number };
  onSelectBuilding: (b: BuildingRecord) => void;
  onOpenDirectory: () => void;
  onOpenAccessibility: () => void;
  onOpenEmergency: () => void;
  onOpenAdmin: () => void;
  onOpenAssistant: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  joystickInputRef: React.MutableRefObject<{ x: number; y: number; isSprinting: boolean }>;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  onBackToLanding,
  cameraMode,
  onSetCameraMode,
  travelMode,
  onSetTravelMode,
  timePreset,
  onSetTimePreset,
  isAutoPilot,
  onToggleAutoPilot,
  activeRoute,
  onCancelRoute,
  playerState,
  playerGps,
  onSelectBuilding,
  onOpenDirectory,
  onOpenAccessibility,
  onOpenEmergency,
  onOpenAdmin,
  onOpenAssistant,
  isMuted,
  onToggleMute,
  joystickInputRef,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BuildingCategory | 'all'>('all');

  // Filter buildings for search autocomplete
  const filteredBuildings = CSJMU_BUILDINGS.filter((b) => {
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchesName =
      b.name.toLowerCase().includes(query) ||
      (b.abbreviation && b.abbreviation.toLowerCase().includes(query)) ||
      (b.hindiName && b.hindiName.includes(query)) ||
      b.tags.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesName;
  });

  // Calculate compass heading in degrees
  const compassDegrees = Math.round(((-playerState.rotationY * 180) / Math.PI + 360) % 360);
  const compassDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dirIndex = Math.round(compassDegrees / 45) % 8;
  const compassDirectionStr = compassDirections[dirIndex];

  // Determine current campus zone based on player position
  const getZoneName = (x: number, z: number) => {
    if (z > 250) return 'Gate 1 Southern Entrance Plaza';
    if (x < -200 && z > 0) return 'UIET & Engineering Sector';
    if (x < -100 && z > 150) return 'Auditorium Quadrangle';
    if (x < 0 && z < 0) return 'Central Library & Academic Quad';
    if (x > 100 && z > 0) return 'Sports Stadium & Athletics Grounds';
    if (x > 0 && z > 50) return 'Shahu Ji Memorial Park';
    if (z < -250) return 'Northern Hostels & Residential Sector';
    return 'University Central Ceremonial Avenue';
  };

  // Next turn step from active route
  const currentStep = activeRoute && activeRoute.steps.length > 0 ? activeRoute.steps[0] : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* ================= TOP SECTION ================= */}
      <div className="flex sm:flex-row flex-col justify-between items-start gap-2.5 sm:gap-4 w-full">
        {/* TOP LEFT: BRANDING & SEARCH & TIME & AUTO TOGGLE */}
        <div className="flex flex-col gap-2 max-w-sm sm:max-w-md w-full">
          {/* Institution Header Lockup */}
          <div className="pointer-events-auto bg-slate-950/85 text-white border border-slate-700/60 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-linear-to-tr from-amber-600 to-indigo-600 flex items-center justify-center font-bold text-amber-100 shadow-md shrink-0">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-amber-400 truncate">
                    Campus Compass
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate">
                    CSJMU Kanpur · 264-Acre Real World 3D
                  </p>
                </div>
              </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onBackToLanding && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onBackToLanding();
                      }}
                      aria-label="Back to Campus Portal Landing Page"
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1 transition border border-amber-500/30 cursor-pointer shadow-sm"
                      title="Return to CSJMU Campus Portal"
                    >
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Portal</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenAssistant}
                    aria-label="Open AI Campus Assistant"
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition border border-indigo-400/40 shrink-0 cursor-pointer shadow-sm"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Guide</span>
                  </button>
                </div>
            </div>
          </div>

          {/* Mode Strip: Student Walk vs Campus Auto & Day/Night Cycle */}
          <div className="pointer-events-auto flex items-center justify-between gap-2 bg-slate-950/85 border border-slate-700/60 p-1.5 rounded-xl text-xs text-white shadow-xl">
            {/* Travel Mode: Walk vs Auto */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  onSetTravelMode('walk');
                }}
                className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  travelMode === 'walk'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Walk on foot"
              >
                <span>🚶 Walk</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onSetTravelMode('auto');
                }}
                className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  travelMode === 'auto'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Campus E-Rickshaw Shuttle"
              >
                <span>🛺 Auto</span>
              </button>
            </div>

            {/* Time of Day Cycle */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  onSetTimePreset('realtime');
                }}
                className={`p-1 sm:px-2 sm:py-1 rounded-lg transition text-[11px] font-semibold flex items-center gap-1 ${
                  timePreset === 'realtime'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Synchronized with local real time"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onSetTimePreset('day');
                }}
                className={`p-1 sm:px-1.5 rounded-lg transition ${
                  timePreset === 'day'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Daylight"
                aria-label="Day Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onSetTimePreset('sunset');
                }}
                className={`p-1 sm:px-1.5 rounded-lg transition ${
                  timePreset === 'sunset'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Sunset / Golden Hour"
                aria-label="Sunset Mode"
              >
                <Sunset className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onSetTimePreset('night');
                }}
                className={`p-1 sm:px-1.5 rounded-lg transition ${
                  timePreset === 'night'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Night (Streetlights & Windows ON)"
                aria-label="Night Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search Bar & Auto-Complete */}
          <div className="relative pointer-events-auto">
            <div className="relative flex items-center bg-slate-900/90 border border-slate-700/70 rounded-xl px-3 py-2 text-white shadow-xl focus-within:border-amber-500 transition">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search UIET, Library, Pariksha Bhavan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
                aria-label="Search campus buildings and departments"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="text-slate-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'academic', label: 'Academic' },
                  { id: 'administrative', label: 'Admin' },
                  { id: 'facility', label: 'Facilities' },
                  { id: 'sports', label: 'Sports' },
                  { id: 'hostel', label: 'Hostels' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition border ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Dropdown Results */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-50 p-1.5 text-xs">
                <div className="flex justify-between items-center px-2 py-1 text-[10px] text-slate-400 border-b border-slate-800">
                  <span>FOUND {filteredBuildings.length} LOCATIONS</span>
                  <button onClick={() => setShowSearchDropdown(false)} className="hover:text-white">
                    Close
                  </button>
                </div>
                {filteredBuildings.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No matching campus location found.</div>
                ) : (
                  filteredBuildings.map((building) => (
                    <button
                      key={building.id}
                      onClick={() => {
                        sounds.playClick();
                        onSelectBuilding(building);
                        setShowSearchDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800/90 flex items-start gap-2.5 group transition"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: building.colorTheme.primary }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-100 group-hover:text-amber-400 truncate">
                            {building.name}
                          </span>
                          {building.abbreviation && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {building.abbreviation}
                            </span>
                          )}
                        </div>
                        {building.hindiName && (
                          <p className="text-[10px] text-slate-400 truncate">{building.hindiName}</p>
                        )}
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {building.category.toUpperCase()} · Verified
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 self-center" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* TOP RIGHT: RADAR MINI-MAP & CONTROLS */}
        <div className="flex sm:flex-col flex-wrap items-end gap-2 pointer-events-auto self-end sm:self-auto">
          {/* Quick Action Dock */}
          <div className="flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/60 p-1.5 rounded-xl text-white shadow-xl">
            <button
              onClick={onOpenDirectory}
              title="Campus Directory"
              aria-label="Open Campus Directory"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition"
            >
              <MapPin className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAccessibility}
              title="Accessibility & Voice"
              aria-label="Accessibility Settings"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-teal-400 transition"
            >
              <Accessibility className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenEmergency}
              title="Emergency SOS & Helplines"
              aria-label="Emergency SOS"
              className="p-1.5 rounded-lg hover:bg-red-900/60 text-red-400 hover:text-red-300 transition"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAdmin}
              title="Campus Data & Coordinates"
              aria-label="Open Admin Dashboard"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label="Toggle Sound"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Camera Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/85 border border-slate-700/60 p-1 rounded-xl text-xs font-semibold text-white shadow-xl">
            <button
              onClick={() => onSetCameraMode('third_person')}
              className={`px-2.5 py-1 rounded-lg transition ${
                cameraMode === 'third_person'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              3rd Person [WASD]
            </button>
            <button
              onClick={() => onSetCameraMode('first_person')}
              className={`px-2.5 py-1 rounded-lg transition ${
                cameraMode === 'first_person'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              1st Person
            </button>
            <button
              onClick={() => onSetCameraMode('aerial')}
              className={`px-2.5 py-1 rounded-lg transition ${
                cameraMode === 'aerial'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Aerial 3D
            </button>
          </div>

          {/* Real-time Radar Mini-Map & Compass Lockup */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-slate-950/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Compass Ring Header */}
            <div className="absolute top-1 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-amber-400 z-10">
              <span className="font-bold flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                {compassDirectionStr}
              </span>
              <span>{compassDegrees}°</span>
            </div>

            {/* Radar Grid Circles */}
            <div className="absolute inset-2 rounded-full border border-slate-800 pointer-events-none" />
            <div className="absolute inset-6 rounded-full border border-slate-800/60 pointer-events-none" />
            <div className="absolute inset-10 rounded-full border border-slate-800/40 pointer-events-none" />

            {/* Cardinal Markers */}
            <span className="absolute top-1 text-[9px] font-bold text-red-500">N</span>
            <span className="absolute right-1 text-[9px] font-bold text-slate-400">E</span>
            <span className="absolute bottom-1 text-[9px] font-bold text-slate-400">S</span>
            <span className="absolute left-1 text-[9px] font-bold text-slate-400">W</span>

            {/* Mini-Map Building Blips */}
            {CSJMU_BUILDINGS.map((b) => {
              const relX = (b.metric.x - playerState.x) * 0.14;
              const relZ = (b.metric.z - playerState.z) * 0.14;
              const dist = Math.hypot(relX, relZ);
              if (dist > 52) return null;
              return (
                <div
                  key={b.id}
                  title={b.name}
                  className="absolute w-2 h-2 rounded-sm transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer hover:scale-150"
                  style={{
                    left: `calc(50% + ${relX}px)`,
                    top: `calc(50% + ${relZ}px)`,
                    backgroundColor: b.colorTheme.primary,
                  }}
                  onClick={() => onSelectBuilding(b)}
                />
              );
            })}

            {/* Destination Pin on Radar */}
            {activeRoute && (
              <div
                className="absolute w-3 h-3 rounded-full bg-cyan-400 animate-ping transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${(activeRoute.destinationBuilding.metric.x - playerState.x) * 0.14}px)`,
                  top: `calc(50% + ${(activeRoute.destinationBuilding.metric.z - playerState.z) * 0.14}px)`,
                }}
              />
            )}

            {/* Center Player Arrow */}
            <div
              className="absolute w-3.5 h-3.5 transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${-playerState.rotationY}rad)`,
              }}
            >
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-amber-400 filter drop-shadow(0 0 4px #f59e0b)" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION ================= */}
      {!isHudCollapsed ? (
        <div className="flex flex-col sm:flex-row justify-between items-end gap-3 w-full">
          {/* BOTTOM LEFT: REAL GPS STATUS & CAMPUS ZONE */}
          <div className="pointer-events-auto bg-slate-950/85 border border-slate-700/60 rounded-xl p-3 text-white shadow-2xl max-w-xs w-full">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                RTK GPS LOCKED
              </span>
              <span className="font-mono text-slate-300">UTM 44N</span>
            </div>
            <div className="font-mono text-xs text-slate-200 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">LAT:</span>
                <span className="font-bold">{playerGps.latitude.toFixed(6)}° N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LON:</span>
                <span className="font-bold">{playerGps.longitude.toFixed(6)}° E</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Zone:</span>
              <p className="text-xs font-medium text-amber-300 truncate">
                {getZoneName(playerState.x, playerState.z)}
              </p>
            </div>
          </div>

          {/* BOTTOM CENTER: ACTIVE NAVIGATION TURN-BY-TURN HUD */}
          {activeRoute ? (
            <div className="pointer-events-auto flex-1 max-w-lg w-full bg-slate-950/90 border-2 border-cyan-500/80 rounded-2xl p-3.5 text-white shadow-2xl backdrop-blur-none">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-cyan-400 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Navigating To {activeRoute.destinationBuilding.abbreviation || activeRoute.destinationBuilding.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Auto-Pilot Toggle Button */}
                  <button
                    onClick={onToggleAutoPilot}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition ${
                      isAutoPilot
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                    title="Automatically steer and navigate along route"
                  >
                    {isAutoPilot ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoPilot ? 'Auto-Pilot ON' : 'Auto-Pilot [P]'}</span>
                  </button>
                  <button
                    onClick={onCancelRoute}
                    className="px-2 py-1 rounded bg-red-950/80 hover:bg-red-800 text-red-200 text-xs font-semibold border border-red-700/60 transition"
                  >
                    End
                  </button>
                </div>
              </div>

              {/* Turn Instruction */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center shrink-0">
                  <Navigation className="w-6 h-6 text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-100">
                    {currentStep ? currentStep.instruction : `Follow directional chevrons on ground`}
                  </p>
                  <p className="text-xs text-cyan-300 mt-0.5">
                    {currentStep ? `${currentStep.distance} meters ahead` : 'Follow path arrows'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Route Progress</span>
                  <span>{activeRoute.totalDistance}m total</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                    style={{ width: isAutoPilot ? '65%' : '45%' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Idle Exploration Controls Hint */
            <div className="pointer-events-auto bg-slate-950/80 border border-slate-700/60 rounded-xl px-4 py-2 text-center text-xs text-slate-300 shadow-xl hidden md:block">
              <span className="font-semibold text-amber-400">WASD / Arrows</span> to Walk ·{' '}
              <span className="font-semibold text-emerald-400">🛺 Auto</span> for Shuttle ·{' '}
              <span className="font-semibold text-amber-400">Shift</span> to Sprint ·{' '}
              <span className="font-semibold text-cyan-400">Click Building</span> to Inspect
            </div>
          )}

          {/* BOTTOM RIGHT: TRIP TELEMETRY & CONTROLS */}
          <div className="pointer-events-auto bg-slate-950/85 border border-slate-700/60 rounded-xl p-3 text-white shadow-2xl flex flex-col gap-2 min-w-44">
            {activeRoute ? (
              <div className="flex justify-between items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Remaining</span>
                  <p className="text-base font-bold text-cyan-300 font-mono">
                    {activeRoute.totalDistance} m
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Est. Time</span>
                  <p className="text-base font-bold text-amber-300 font-mono">
                    {travelMode === 'auto'
                      ? Math.max(1, Math.round(activeRoute.estimatedWalkTimeMinutes / 2.5))
                      : activeRoute.estimatedWalkTimeMinutes}{' '}
                    min
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs">
                <span className="text-[10px] text-slate-400 uppercase">Speed & Vehicle</span>
                <p className="text-sm font-bold text-slate-200 font-mono">
                  {playerState.speed} m/s ({travelMode === 'auto' ? '🛺 Campus Auto' : '🚶 On Foot'})
                </p>
              </div>
            )}

            <div className="flex gap-1.5 pt-1 border-t border-slate-800">
              <button
                onClick={() => {
                  playerState.x = 0;
                  playerState.z = 350;
                  sounds.playClick();
                }}
                className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center justify-center gap-1 transition"
                title="Return to Main Gate 1"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Gate 1</span>
              </button>
              <button
                onClick={() => setIsHudCollapsed(true)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Hide HUD [H]"
                aria-label="Collapse HUD"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed Minimal HUD Toggle */
        <div className="flex justify-center w-full pointer-events-auto">
          <button
            onClick={() => setIsHudCollapsed(false)}
            className="px-4 py-1.5 rounded-full bg-slate-950/90 border border-slate-700 text-xs font-semibold text-amber-400 shadow-2xl flex items-center gap-1.5 hover:bg-slate-900 transition"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Show Navigation HUD [H]</span>
          </button>
        </div>
      )}

      {/* MOBILE TOUCH VIRTUAL JOYSTICK */}
      <div className="sm:hidden pointer-events-auto absolute bottom-4 left-4 flex items-center gap-3">
        <div
          className="w-24 h-24 rounded-full bg-slate-950/80 border-2 border-slate-700 flex items-center justify-center touch-none relative"
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (touch.clientX - cx) / (rect.width / 2);
            const dy = (touch.clientY - cy) / (rect.height / 2);
            joystickInputRef.current.x = Math.max(-1, Math.min(1, dx));
            joystickInputRef.current.y = Math.max(-1, Math.min(1, dy));
          }}
          onTouchEnd={() => {
            joystickInputRef.current.x = 0;
            joystickInputRef.current.y = 0;
          }}
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/80 shadow-md" />
        </div>
        <button
          onTouchStart={() => {
            joystickInputRef.current.isSprinting = true;
          }}
          onTouchEnd={() => {
            joystickInputRef.current.isSprinting = false;
          }}
          className="w-12 h-12 rounded-full bg-indigo-600/90 text-white font-bold text-xs flex items-center justify-center shadow-lg active:bg-indigo-400"
          aria-label="Sprint"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
