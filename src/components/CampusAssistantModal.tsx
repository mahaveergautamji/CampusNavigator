/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Bot, Send, Sparkles, Navigation, MapPin } from 'lucide-react';
import { CSJMU_BUILDINGS } from '../data/csjmuData';
import { BuildingRecord } from '../types/navigation';
import { sounds } from '../utils/soundEffects';

interface CampusAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNavigation: (building: BuildingRecord) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  targetBuildingId?: string;
}

const FAQ_PROMPTS = [
  'How do I reach UIET from Main Gate 1?',
  'Where is the Central Evaluation Building for degree verification?',
  'What are the Library timings and facilities?',
  'Where is the 24x7 Health Centre & Ambulance?',
  'Which gate connects towards Kalyanpur Railway Station?',
];

export const CampusAssistantModal: React.FC<CampusAssistantModalProps> = ({
  isOpen,
  onClose,
  onStartNavigation,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Namaste! Welcome to Campus Compass AI. I am your guide to Chhatrapati Shahu Ji Maharaj University (CSJMU) across our 264-acre Kalyanpur campus. Ask me about departments, lecture halls, exam cell, library, or anywhere you need to walk!',
    },
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    sounds.playClick();
    const newMessages: Message[] = [...messages, { sender: 'user', text: query }];
    setInput('');

    // Process campus knowledge base
    const qLower = query.toLowerCase();
    let reply = '';
    let targetBuildingId: string | undefined;

    if (qLower.includes('uiet') || qLower.includes('engineering') || qLower.includes('cse')) {
      reply =
        'UIET (School of Engineering & Technology) is located on the West Academic Avenue (approx 550m from Gate 1). It houses CSE, IT, ECE, Mechanical, Chemical, and the Chhatrapati Innovation Center.';
      targetBuildingId = 'uiet_engineering';
    } else if (qLower.includes('eval') || qLower.includes('pariksha') || qLower.includes('exam') || qLower.includes('degree') || qLower.includes('marksheet')) {
      reply =
        'The Central Evaluation Building (Pariksha Bhavan) is situated on the West Quadrangle (Lat: 26.498300, Lon: 80.264060). The Degree and Marksheet distribution counter operates between 11:00 AM and 02:00 PM on working days.';
      targetBuildingId = 'central_eval_building';
    } else if (qLower.includes('library') || qLower.includes('book') || qLower.includes('reading')) {
      reply =
        'Swami Vivekananda Central Library is located North of the Central Circle. It features 3-tier air-conditioned reading halls, 100,000+ volumes, RFID checkout, and stays open from 8:00 AM to 8:00 PM (Reading Room till 10:00 PM).';
      targetBuildingId = 'central_library';
    } else if (qLower.includes('health') || qLower.includes('medical') || qLower.includes('ambulance') || qLower.includes('doctor')) {
      reply =
        'The University Health Centre & Dispensary is situated on the South-East inner link road near Gate 1 Avenue. Free emergency medical aid and 24x7 ambulance service are available (+91-512-2580108).';
      targetBuildingId = 'health_centre';
    } else if (qLower.includes('gate 2') || qLower.includes('station') || qLower.includes('railway')) {
      reply =
        'Campus Gate 2 (West Gate) connects directly to Kalyanpur Railway Station and Kalyanpur Metro link road. Ideal for day scholars commuting via suburban trains.';
      targetBuildingId = 'gate_2_west';
    } else if (qLower.includes('sports') || qLower.includes('stadium') || qLower.includes('gym')) {
      reply =
        'The University Sports Stadium & Athletics Complex is on the Eastern sector of the campus, featuring a 400m Olympic standard running track, football turf, and gymnasium.';
      targetBuildingId = 'sports_stadium';
    } else if (qLower.includes('bank') || qLower.includes('atm') || qLower.includes('post office') || qLower.includes('fee')) {
      reply =
        'Bank of Baroda Campus Branch and dual 24x7 ATMs, along with the University Sub-Post Office (PIN 208024), are located on the South Avenue just inside Main Gate 1.';
      targetBuildingId = 'bank_post_office';
    } else if (qLower.includes('hostel')) {
      reply =
        'CSJMU residential hostels are in the Northern campus sector: Shivaji Boys Hostel Complex on the North-East avenue and Ganga Girls Hostel on the North-West avenue.';
      targetBuildingId = 'shivaji_boys_hostel';
    } else {
      reply =
        `I understand you are asking about: "${query}". You can search any CSJMU building using the search bar above or choose a location from the Directory to compute an accurate 3D walking route on campus!`;
    }

    newMessages.push({
      sender: 'assistant',
      text: reply,
      targetBuildingId,
    });
    setMessages(newMessages);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-xl w-full h-[75vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                CSJMU Campus AI Assistant
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400">
                Live Directions, Department Info & Campus Services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-xs'
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>

              {/* Action button if target building exists */}
              {m.targetBuildingId && (
                <div className="mt-1.5">
                  {(() => {
                    const b = CSJMU_BUILDINGS.find((x) => x.id === m.targetBuildingId);
                    if (!b) return null;
                    return (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onStartNavigation(b);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate to {b.name}</span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Preset Prompt Chips */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          {FAQ_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything about CSJMU campus navigation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
