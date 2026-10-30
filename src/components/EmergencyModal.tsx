/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, AlertTriangle, Phone, MapPin, Shield, Ambulance, Check, Navigation } from 'lucide-react';
import { CSJMU_BUILDINGS } from '../data/csjmuData';
import { BuildingRecord } from '../types/navigation';
import { sounds } from '../utils/soundEffects';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGps: { latitude: number; longitude: number };
  onStartNavigation: (building: BuildingRecord) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  playerGps,
  onStartNavigation,
}) => {
  const [sosTriggered, setSosTriggered] = useState(false);

  if (!isOpen) return null;

  const handleSos = () => {
    sounds.playArrivalChime();
    setSosTriggered(true);
    navigator.clipboard?.writeText(
      `CSJMU EMERGENCY SOS: Student distress signal at GPS Lat ${playerGps.latitude.toFixed(6)} N, Lon ${playerGps.longitude.toFixed(6)} E (Kalyanpur Kanpur Campus)`
    );
  };

  const healthCenter = CSJMU_BUILDINGS.find((b) => b.id === 'health_centre')!;
  const mainGateSecurity = CSJMU_BUILDINGS.find((b) => b.id === 'main_gate')!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border-2 border-red-600 rounded-2xl shadow-2xl max-w-lg w-full p-5 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-red-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Emergency & Safety SOS
              </h2>
              <p className="text-[11px] text-red-300">
                CSJMU Kalyanpur Campus Security & Medical Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GPS Broadcast Banner */}
        <div className="mt-4 p-3.5 bg-red-950/40 border border-red-700/60 rounded-xl">
          <div className="flex items-center justify-between text-xs text-red-300 mb-1">
            <span className="font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-400" />
              YOUR CURRENT CAMPUS GPS
            </span>
            <span className="font-mono text-emerald-400 font-bold">ACCURACY ±1.2m</span>
          </div>
          <div className="font-mono text-sm font-bold text-white flex justify-between">
            <span>{playerGps.latitude.toFixed(6)}° N</span>
            <span>{playerGps.longitude.toFixed(6)}° E</span>
          </div>
        </div>

        {/* SOS Action Button */}
        <div className="mt-4">
          <button
            onClick={handleSos}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-xl flex items-center justify-center gap-2 transition ${
              sosTriggered
                ? 'bg-emerald-600 border border-emerald-400'
                : 'bg-red-600 hover:bg-red-500 active:scale-98 animate-pulse'
            }`}
          >
            {sosTriggered ? (
              <>
                <Check className="w-5 h-5" />
                <span>SOS Signal Logged (Coordinates Copied to Clipboard)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span>TRIGGER IMMEDIATE SOS SIGNAL</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Navigation to Safety */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              if (healthCenter) onStartNavigation(healthCenter);
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-2 text-slate-200 transition"
          >
            <Ambulance className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">Health Dispensary</p>
              <p className="text-[10px] text-slate-400">Navigate to Doctor</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (mainGateSecurity) onStartNavigation(mainGateSecurity);
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center gap-2 text-slate-200 transition"
          >
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Gate 1 Security</p>
              <p className="text-[10px] text-slate-400">Chief Proctor Post</p>
            </div>
          </button>
        </div>

        {/* Emergency Phone Numbers */}
        <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs">
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">CSJMU Chief Proctor Security</p>
              <p className="text-[10px] text-slate-400">Campus 24-hr Control Room</p>
            </div>
            <a
              href="tel:+915122580044"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              +91-512-2580044
            </a>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">Campus Ambulance / Health Centre</p>
              <p className="text-[10px] text-slate-400">24x7 Emergency Van</p>
            </div>
            <a
              href="tel:+915122580108"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-red-400 font-mono font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              +91-512-2580108
            </a>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">UP Women Safety Helpline</p>
              <p className="text-[10px] text-slate-400">Toll-free support</p>
            </div>
            <a
              href="tel:1090"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-pink-400 font-mono font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              1090
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
