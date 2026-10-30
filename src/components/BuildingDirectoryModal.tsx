/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Search,
  Navigation,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Building2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { CSJMU_BUILDINGS } from '../data/csjmuData';
import { BuildingCategory, BuildingRecord } from '../types/navigation';
import { sounds } from '../utils/soundEffects';

interface BuildingDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNavigation: (building: BuildingRecord) => void;
  selectedBuilding: BuildingRecord | null;
  onSelectBuilding: (building: BuildingRecord) => void;
}

export const BuildingDirectoryModal: React.FC<BuildingDirectoryModalProps> = ({
  isOpen,
  onClose,
  onStartNavigation,
  selectedBuilding,
  onSelectBuilding,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<BuildingCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>(selectedBuilding ? 'detail' : 'list');

  if (!isOpen) return null;

  const currentBuilding = selectedBuilding || CSJMU_BUILDINGS[0];

  const filtered = CSJMU_BUILDINGS.filter((b) => {
    const matchesCategory = category === 'all' || b.category === category;
    const q = search.toLowerCase().trim();
    if (!q) return matchesCategory;
    return (
      matchesCategory &&
      (b.name.toLowerCase().includes(q) ||
        (b.abbreviation && b.abbreviation.toLowerCase().includes(q)) ||
        (b.hindiName && b.hindiName.includes(q)) ||
        b.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">CSJMU Campus Directory</h2>
              <p className="text-xs text-slate-400">
                Verified Buildings, Facilities & Departments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by building name, department, facility, or abbreviation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
            {(
              [
                { id: 'all', label: 'All Locations' },
                { id: 'academic', label: 'Academic & Schools' },
                { id: 'administrative', label: 'Admin & Exams' },
                { id: 'facility', label: 'Student Facilities' },
                { id: 'sports', label: 'Sports Arena' },
                { id: 'hostel', label: 'Hostels' },
                { id: 'gate', label: 'Gates' },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap transition border text-xs ${
                  category === c.id
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Split View or Tabs */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Buildings List */}
          <div className="space-y-2 overflow-y-auto max-h-[50vh] md:max-h-[58vh] pr-1">
            {filtered.map((b) => {
              const isSelected = currentBuilding?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectBuilding(b);
                    setActiveTab('detail');
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-md mt-0.5 shrink-0"
                    style={{ backgroundColor: b.colorTheme.primary }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-white truncate">{b.name}</h3>
                      {b.abbreviation && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                          {b.abbreviation}
                        </span>
                      )}
                    </div>
                    {b.hindiName && (
                      <p className="text-[11px] text-slate-400 truncate">{b.hindiName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                      <span>{b.footprint.floors} Floors</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" /> GPS Verified
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Building Details Card */}
          {currentBuilding && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {currentBuilding.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {currentBuilding.name}
                    </h3>
                    {currentBuilding.hindiName && (
                      <p className="text-xs text-slate-400">{currentBuilding.hindiName}</p>
                    )}
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: currentBuilding.colorTheme.primary,
                      color: currentBuilding.colorTheme.accent,
                    }}
                  >
                    {currentBuilding.abbreviation?.slice(0, 3) || 'BLD'}
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {currentBuilding.description}
                </p>

                {/* Departments list */}
                {currentBuilding.departments && currentBuilding.departments.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" /> Departments & Wings
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {currentBuilding.departments.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700/60"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities list */}
                {currentBuilding.facilities && currentBuilding.facilities.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase">
                      Facilities & Services
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {currentBuilding.facilities.map((f) => (
                        <span
                          key={f}
                          className="text-[10px] bg-slate-850 text-amber-200/90 px-2 py-0.5 rounded-md border border-amber-900/30"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timings & Contact */}
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                  {currentBuilding.timings && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{currentBuilding.timings}</span>
                    </div>
                  )}
                  {currentBuilding.contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{currentBuilding.contact}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {currentBuilding.coordinates.latitude.toFixed(6)}° N,{' '}
                      {currentBuilding.coordinates.longitude.toFixed(6)}° E
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onStartNavigation(currentBuilding);
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-xl bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate Here (Walk Route)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
