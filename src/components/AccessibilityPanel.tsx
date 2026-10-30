/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Accessibility, Volume2, Eye, Gauge, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  accessibleOnly: boolean;
  onToggleAccessibleOnly: () => void;
  voicePromptsEnabled: boolean;
  onToggleVoicePrompts: () => void;
  highContrastEnabled: boolean;
  onToggleHighContrast: () => void;
  walkingSpeedMultiplier: number;
  onSetWalkingSpeed: (speed: number) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  accessibleOnly,
  onToggleAccessibleOnly,
  voicePromptsEnabled,
  onToggleVoicePrompts,
  highContrastEnabled,
  onToggleHighContrast,
  walkingSpeedMultiplier,
  onSetWalkingSpeed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Accessibility className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Campus Accessibility</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close accessibility panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="mt-4 space-y-4">
          {/* Wheelchair Accessible Routes */}
          <div className="flex items-start justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                Wheelchair Accessible Routing
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Routes exclusively via ramps, gentle inclines, and paved curb-cut avenues.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onToggleAccessibleOnly();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                accessibleOnly ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  accessibleOnly ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Audio Navigation Prompts */}
          <div className="flex items-start justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Spoken Turn-by-Turn Audio
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Synthesizes real-time vocal guidance using speech audio for low-vision navigation.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onToggleVoicePrompts();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                voicePromptsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  voicePromptsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* High Contrast UI Mode */}
          <div className="flex items-start justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                High-Contrast HUD Display
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Boosts HUD text contrast, bold borders, and oversized navigation badges.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onToggleHighContrast();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                highContrastEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  highContrastEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Walking Pace / Speed */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-400" /> Walking Pace Estimation
              </span>
              <span className="text-xs font-mono text-indigo-300">
                {walkingSpeedMultiplier === 0.8
                  ? '0.8 m/s (Accessible / Casual)'
                  : walkingSpeedMultiplier === 1.3
                  ? '1.3 m/s (Standard Walk)'
                  : '1.8 m/s (Brisk Walk)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2.5">
              {[
                { speed: 0.8, label: '0.8 m/s' },
                { speed: 1.3, label: '1.3 m/s (Avg)' },
                { speed: 1.8, label: '1.8 m/s (Fast)' },
              ].map((s) => (
                <button
                  key={s.speed}
                  onClick={() => {
                    sounds.playClick();
                    onSetWalkingSpeed(s.speed);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                    walkingSpeedMultiplier === s.speed
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
