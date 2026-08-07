/**
 * GdacsOfflineGuideModal.jsx
 * Offline Safety Guide Modal with disaster survival instructions
 */

import React, { useState } from 'react';
import { X, BookOpen, ShieldAlert, Droplets, Activity, Wind, Flame, Radio } from 'lucide-react';

const GUIDES = [
  {
    id: 'flood',
    title: 'Flood Safety Guide',
    icon: Droplets,
    color: 'text-blue-500',
    steps: [
      'Move immediately to higher ground. Do not wait for instructions.',
      'Never walk, swim, or drive through flood waters. 6 inches of moving water can knock you down.',
      'Disconnect electrical appliances before water enters your premises.',
      'Keep drinking water sealed in clean containers. Do not consume flood water.'
    ]
  },
  {
    id: 'earthquake',
    title: 'Earthquake Safety Guide',
    icon: Activity,
    color: 'text-yellow-500',
    steps: [
      'DROP, COVER, AND HOLD ON under a sturdy table or desk.',
      'Stay away from glass windows, unanchored heavy furniture, and exterior walls.',
      'If outdoors, move to an open area away from power lines, trees, and buildings.',
      'Expect aftershocks. Inspect gas lines for leaks before striking matches.'
    ]
  },
  {
    id: 'cyclone',
    title: 'Cyclone & Storm Guide',
    icon: Wind,
    color: 'text-cyan-500',
    steps: [
      'Board up windows or secure storm shutters. Stay inside the innermost room.',
      'Beware of the "Eye of the Storm" — calm conditions are temporary before winds reverse.',
      'Keep battery-operated radio tuned to local emergency broadcast channel.',
      'Charge cell phones and power banks to maximum capacity.'
    ]
  },
  {
    id: 'wildfire',
    title: 'Wildfire Defense Guide',
    icon: Flame,
    color: 'text-red-500',
    steps: [
      'Evacuate immediately if ordered by emergency services.',
      'Wear N95 masks or wet cloths over mouth and nose to prevent smoke inhalation.',
      'Close all doors and windows to reduce drafts.',
      'Turn on interior and exterior lights so your house is visible in dense smoke.'
    ]
  }
];

export default function GdacsOfflineGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('flood');

  if (!isOpen) return null;

  const currentGuide = GUIDES.find(g => g.id === activeTab) || GUIDES[0];
  const CurrentIcon = currentGuide.icon;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-3xl p-6 shadow-2xl z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white leading-none">
                Offline Safety Guide
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Instant Life-Saving Disaster Protocols
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {GUIDES.map((g) => {
            const Icon = g.icon;
            const isSelected = activeTab === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveTab(g.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white' : g.color} />
                <span>{g.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Guide Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            <CurrentIcon size={20} className={currentGuide.color} />
            <h3 className="text-sm font-black tracking-tight">{currentGuide.title}</h3>
          </div>

          <div className="space-y-2.5">
            {currentGuide.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#30363d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs transition-colors shadow-md"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
