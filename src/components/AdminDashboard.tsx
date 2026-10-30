/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Copy,
  Check,
  Edit2,
  Save,
  MapPin,
  Share2,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { CSJMU_BUILDINGS, CSJMU_GRAPH_EDGES, CSJMU_GRAPH_NODES, generateCsjmuGeoJson } from '../data/csjmuData';
import { BuildingRecord } from '../types/navigation';
import { gpsToMetric } from '../utils/geoProjection';
import { sounds } from '../utils/soundEffects';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingRecord[];
  onUpdateBuilding: (updated: BuildingRecord) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  buildings,
  onUpdateBuilding,
}) => {
  const [activeTab, setActiveTab] = useState<'buildings' | 'geojson' | 'graph'>('buildings');
  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [editLat, setEditLat] = useState<number>(0);
  const [editLon, setEditLon] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (b: BuildingRecord) => {
    setEditingBuildingId(b.id);
    setEditLat(b.coordinates.latitude);
    setEditLon(b.coordinates.longitude);
  };

  const handleSaveEdit = (b: BuildingRecord) => {
    const newMetric = gpsToMetric(editLat, editLon);
    const updated: BuildingRecord = {
      ...b,
      coordinates: {
        latitude: editLat,
        longitude: editLon,
      },
      metric: newMetric,
    };
    onUpdateBuilding(updated);
    setEditingBuildingId(null);
    sounds.playClick();
  };

  const geoJsonData = generateCsjmuGeoJson();

  const handleCopyGeoJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(geoJsonData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">CSJMU Geographic Data Administration</h2>
              <p className="text-xs text-slate-400">
                WGS84 Coordinates, Metric Offsets, GeoJSON Pipeline & Graph Nodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close admin dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('buildings')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'buildings'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Buildings & Anchors ({buildings.length})
          </button>
          <button
            onClick={() => setActiveTab('geojson')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'geojson'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            GeoJSON Pipeline
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'graph'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Walkway Graph ({CSJMU_GRAPH_NODES.length} Nodes · {CSJMU_GRAPH_EDGES.length} Edges)
          </button>
        </div>

        {/* Tab 1: Buildings List & Coordinates */}
        {activeTab === 'buildings' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              All coordinates are calibrated relative to CSJMU Origin (Lat 26.498300° N, Lon 80.265800° E). Modifying coordinates recalculates 3D metric projection in real time.
            </div>

            {buildings.map((b) => {
              const isEditing = editingBuildingId === b.id;
              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{b.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {b.abbreviation || b.id}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <ShieldCheck className="w-3 h-3" /> {b.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{b.source}</p>
                    <div className="font-mono text-slate-300 text-[11px]">
                      Metric 3D: X={b.metric.x}m, Z={b.metric.z}m · Footprint: {b.footprint.width}x{b.footprint.depth}m, H={b.footprint.height}m
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-cyan-500">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Lat</label>
                        <input
                          type="number"
                          step="0.00001"
                          value={editLat}
                          onChange={(e) => setEditLat(parseFloat(e.target.value) || 0)}
                          className="w-24 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Lon</label>
                        <input
                          type="number"
                          step="0.00001"
                          value={editLon}
                          onChange={(e) => setEditLon(parseFloat(e.target.value) || 0)}
                          className="w-24 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveEdit(b)}
                        className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 self-end"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-slate-200 text-right">
                        <div>{b.coordinates.latitude.toFixed(6)}° N</div>
                        <div>{b.coordinates.longitude.toFixed(6)}° E</div>
                      </div>
                      <button
                        onClick={() => handleStartEdit(b)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Coordinates"
                        aria-label={`Edit coordinates for ${b.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: GeoJSON Pipeline */}
        {activeTab === 'geojson' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Official GeoJSON FeatureCollection representation of CSJMU Kalyanpur campus.
              </span>
              <button
                onClick={handleCopyGeoJson}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy GeoJSON'}</span>
              </button>
            </div>
            <pre className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-auto">
              {JSON.stringify(geoJsonData, null, 2)}
            </pre>
          </div>
        )}

        {/* Tab 3: Walkway Graph Stats */}
        {activeTab === 'graph' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Total Intersections</span>
                <p className="text-xl font-bold text-amber-400">{CSJMU_GRAPH_NODES.length}</p>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Walkway Edges</span>
                <p className="text-xl font-bold text-cyan-400">{CSJMU_GRAPH_EDGES.length}</p>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Campus Area</span>
                <p className="text-xl font-bold text-emerald-400">~264 Acres</p>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-300 mt-4 uppercase">
              Registered Intersections & Entrances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {CSJMU_GRAPH_NODES.map((n) => (
                <div
                  key={n.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{n.label || n.id}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      X={n.x}m, Z={n.z}m {n.isBuildingEntrance ? '· [Entrance Node]' : ''}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                    Accessible
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
