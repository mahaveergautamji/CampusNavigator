/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Navigation,
  MapPin,
  Clock,
  Car,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  Search,
  BookOpen,
  GraduationCap,
  Building2,
  Trophy,
  HeartPulse,
  Landmark,
  Home,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { CSJMU_BUILDINGS } from '../data/csjmuData';
import { BuildingRecord, TravelMode } from '../types/navigation';
import { sounds } from '../utils/soundEffects';

interface CampusLandingPageProps {
  onLaunchNavigator: (mode?: TravelMode, targetBuildingId?: string) => void;
}

export const CampusLandingPage: React.FC<CampusLandingPageProps> = ({
  onLaunchNavigator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Buildings' },
    { id: 'academic', label: 'Academic & Schools' },
    { id: 'administrative', label: 'Administration' },
    { id: 'facilities', label: 'Campus Facilities' },
    { id: 'sports', label: 'Sports & Parks' },
    { id: 'hostel', label: 'Hostels' },
  ];

  const filteredBuildings = CSJMU_BUILDINGS.filter((b) => {
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.abbreviation && b.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.departments && b.departments.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesQuery;
  });

  const handleLaunch = (mode: TravelMode = 'walk', buildingId?: string) => {
    sounds.playClick();
    onLaunchNavigator(mode, buildingId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Official Institutional Announcement & Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="bg-linear-to-r from-amber-950/50 via-slate-900 to-amber-950/50 border-b border-amber-500/20 px-4 py-1.5 text-center text-[11px] text-amber-200/90 font-medium">
          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 font-bold mr-2 text-[10px] uppercase tracking-wider">
            Official Portal
          </span>
          छत्रपति शाहू जी महाराज विश्वविद्यालय, कानपुर • State University of UP • NAAC A++ Accredited • Kalyanpur, Kanpur
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & University Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 shrink-0">
              <Compass className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">CSJMU</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                  Campus Compass
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-md">
                Chhatrapati Shahu Ji Maharaj University • 264-Acre Digital Campus
              </p>
            </div>
          </div>

          {/* Quick Nav & Main CTA */}
          <div className="flex items-center gap-3">
            <a
              href="#directory"
              className="hidden md:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Building Directory
            </a>
            <a
              href="#about"
              className="hidden md:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              About Campus
            </a>

            {/* Standout Campus Navigator Button */}
            <button
              onClick={() => handleLaunch('walk')}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition transform active:scale-95 cursor-pointer border border-amber-300"
            >
              <Compass className="w-4 h-4 text-slate-950 animate-spin-slow" />
              <span>Campus Navigator</span>
              <ArrowRight className="w-4 h-4 text-slate-950 hidden sm:inline" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800">
        {/* Ambient Backlight Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-amber-500/10 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 shadow-md">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Kalyanpur, Kanpur, Uttar Pradesh (PIN 208024)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Explore CSJMU&apos;s 264-Acre Campus in{' '}
              <span className="bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Real-Time 3D
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Step directly into the real geographical layout of Chhatrapati Shahu Ji Maharaj University. Navigate academic departments at UIET Engineering, locate Central Evaluation (Pariksha Bhavan), visit Central Library, student hostels, and Shahu Ji Park with centimeter-precise WGS84 GPS.
            </p>

            {/* Main Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleLaunch('walk')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer border border-amber-300"
              >
                <Compass className="w-5 h-5 text-slate-950" />
                <span>Launch 3D Campus Navigator</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => handleLaunch('auto')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg"
              >
                <span className="text-base">🛺</span>
                <span>Ride Campus Auto Shuttle</span>
              </button>

              <button
                onClick={() => handleLaunch('walk', 'uiet_engineering')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 font-bold text-sm border border-cyan-500/30 hover:border-cyan-500/50 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Direct Route to UIET</span>
              </button>
            </div>

            {/* Quick Campus Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Campus Area</span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">264 Acres</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Kalyanpur, Kanpur</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">Key Facilities</span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">16+ Blocks</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Verified GPS Footprints</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Spatial System</span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">UTM 44N</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Metric WGS84 Geo-Scale</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">Lighting Engine</span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">Live Day/Night</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Automatic Streetlights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Experience Modes */}
      <section className="py-14 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Digital Spatial Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Purpose-Built for CSJMU Students, Faculty & Visitors
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Explore every corner of the university using specialized navigation tools and real-time environment simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mode 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">A* Paved Pathfinding</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Graph-calculated routes along official concrete walkways and avenues with non-flickering directional arrows.
              </p>
            </div>

            {/* Mode 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition text-lg">
                🛺
              </div>
              <h3 className="text-sm font-bold text-white">Campus Auto Shuttle</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Ride or drive the authentic green-and-yellow CSJMU e-rickshaw shuttle, or hit Auto-Pilot (`P`) for hands-free transit.
              </p>
            </div>

            {/* Mode 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Collision Sliding Physics</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Accurate perimeter collision boxes prevent walking through building walls or campus tree trunks with smooth sliding.
              </p>
            </div>

            {/* Mode 4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition">
                <Moon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Day & Night Simulation</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Sun trajectory matches local Kanpur time. Lampposts and building windows automatically illuminate at nightfall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Building Directory Section */}
      <section id="directory" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Georeferenced Campus Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Select Any Building to Navigate
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Click any campus department, school, or facility to launch direct 3D turn-by-turn navigation.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UIET, Library, Bank..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuildings.map((building) => (
            <div
              key={building.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between group shadow-sm hover:shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: building.colorTheme.primary }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300">
                      {building.category}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {building.footprint.floors ? `${building.footprint.floors} Floors` : 'Ground'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                  {building.name}
                </h3>
                <p className="text-[11px] text-amber-300/80 font-semibold mt-0.5">
                  {building.abbreviation}
                </p>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {building.description}
                </p>

                {/* Coordinates & Footprint */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{building.coordinates.latitude.toFixed(6)}° N</span>
                  </span>
                  <span>{building.coordinates.longitude.toFixed(6)}° E</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 flex items-center gap-2">
                <button
                  onClick={() => handleLaunch('walk', building.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 hover:border-amber-500 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate in 3D</span>
                </button>

                <button
                  onClick={() => handleLaunch('auto', building.id)}
                  title="Travel via Campus Auto"
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center transition cursor-pointer"
                >
                  <span>🛺 Auto</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. About CSJMU & Verified Reference Anchors */}
      <section id="about" className="py-14 bg-slate-900/60 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Geographic Foundation
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Authentic CSJMU Kalyanpur Campus
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Campus Compass is built directly on the verified survey coordinates of Chhatrapati Shahu Ji Maharaj University, Kanpur. Spanning approximately 264 acres along Kalyanpur Main Road, the entire 3D virtual environment is metric-scaled to UTM Zone 44N to maintain real distances.
              </p>

              <div className="mt-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Central Evaluation Building (Pariksha Bhavan)</span>
                    <span className="text-[11px] text-slate-400 font-mono">Latitude: 26.498300° N • Longitude: 80.264060° E</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Shahu Ji Memorial Park & Monument</span>
                    <span className="text-[11px] text-slate-400 font-mono">Latitude: 26.497700° N • Longitude: 80.266474° E</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Campus Datum Origin (Gate 1 Corridor)</span>
                    <span className="text-[11px] text-slate-400 font-mono">Latitude: 26.498300° N • Longitude: 80.265800° E (EPSG:4326)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Transport & Access Card */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-amber-400" />
                <span>Visitor Information & Transit</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="border-b border-slate-800/80 pb-3">
                  <p className="font-bold text-white text-xs">University Address</p>
                  <p className="text-slate-400 mt-0.5">
                    Chhatrapati Shahu Ji Maharaj University, Kalyanpur, Kanpur, Uttar Pradesh, PIN 208024, India.
                  </p>
                </div>

                <div className="border-b border-slate-800/80 pb-3">
                  <p className="font-bold text-white text-xs">Rail Connectivity</p>
                  <p className="text-slate-400 mt-0.5">
                    Kalyanpur Railway Station (2.5 km) • Kanpur Central Junction (14 km). Direct Kanpur Metro access at Kalyanpur Station.
                  </p>
                </div>

                <div className="border-b border-slate-800/80 pb-3">
                  <p className="font-bold text-white text-xs">Air Connectivity</p>
                  <p className="text-slate-400 mt-0.5">
                    Kanpur Airport Chakeri (28 km) • Chaudhary Charan Singh International Airport, Lucknow (85 km via Kanpur-Lucknow Expressway).
                  </p>
                </div>

                <div>
                  <p className="font-bold text-white text-xs">Campus Gates</p>
                  <p className="text-slate-400 mt-0.5">
                    Gate 1 (Southern Main Kalyanpur Entrance) • Gate 2 (Auditorium & Admin Entrance) • UIET Specialized North Gate.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleLaunch('walk')}
                  className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-slate-950" />
                  <span>Start 3D Exploration Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Institutional Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">
              CS
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Chhatrapati Shahu Ji Maharaj University, Kanpur
              </p>
              <p className="text-[11px] text-slate-400">
                Campus Compass 3D Spatial Navigation System • GIS Department & UIET
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => handleLaunch('walk')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Launch 3D Navigator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
