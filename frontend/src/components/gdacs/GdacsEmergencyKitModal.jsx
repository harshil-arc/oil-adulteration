/**
 * GdacsEmergencyKitModal.jsx
 * Interactive Emergency Kit Checklist Modal Widget
 */

import React, { useState } from 'react';
import { X, CheckSquare, Square, PackageCheck, AlertCircle } from 'lucide-react';

const INITIAL_CHECKLIST = [
  { id: 'water', category: 'Essential', item: 'Clean Drinking Water (1 Gallon per person per day for 3 days)', checked: true },
  { id: 'food', category: 'Essential', item: 'Non-Perishable Food (Ready-to-eat cans, high-energy bars)', checked: true },
  { id: 'flashlight', category: 'Gear', item: 'Flashlight & Extra Batteries', checked: false },
  { id: 'firstaid', category: 'Medical', item: 'First Aid Kit (Bandages, Antiseptics, Scissors, Sterile Gauze)', checked: true },
  { id: 'meds', category: 'Medical', item: '7-Day Supply of Essential Medications & Prescriptions', checked: false },
  { id: 'whistle', category: 'Gear', item: 'Signal Whistle (to signal for emergency rescue)', checked: false },
  { id: 'radio', category: 'Communication', item: 'Battery-Powered or Hand-Crank Emergency NOAA Radio', checked: false },
  { id: 'powerbank', category: 'Communication', item: 'Fully Charged Power Bank & Charging Cables', checked: true },
  { id: 'docs', category: 'Essential', item: 'Waterproof Bag containing ID, Passport & Insurance Papers', checked: false },
  { id: 'cash', category: 'Essential', item: 'Emergency Cash & Small Bills', checked: false },
  { id: 'sanitation', category: 'Hygiene', item: 'Hand Sanitizer, Disinfectant Wipes & Moist Towelettes', checked: false },
];

export default function GdacsEmergencyKitModal({ isOpen, onClose }) {
  const [items, setItems] = useState(INITIAL_CHECKLIST);

  if (!isOpen) return null;

  const toggleItem = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const completedCount = items.filter(i => i.checked).length;
  const percent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-3xl p-6 shadow-2xl z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <PackageCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white leading-none">
                Emergency Kit Checklist
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                72-Hour Survival & Readiness Essentials
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

        {/* Progress Bar */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white mb-1.5">
            <span>Readiness Score</span>
            <span className="text-amber-500">{percent}% Ready ({completedCount}/{items.length})</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-500" 
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Checklist Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                item.checked
                  ? 'bg-amber-500/10 border-amber-500/30 text-gray-900 dark:text-white'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-amber-500/30'
              }`}
            >
              {item.checked ? (
                <CheckSquare size={18} className="text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <Square size={18} className="text-gray-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-xs font-bold ${item.checked ? 'line-through opacity-80' : ''}`}>
                  {item.item}
                </p>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500/80">
                  {item.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#30363d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            Done Checking
          </button>
        </div>
      </div>
    </div>
  );
}
