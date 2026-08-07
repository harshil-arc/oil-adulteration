/**
 * OverpassSummaryCard.jsx
 * Dynamic Emergency Summary Card displaying counts for nearby emergency resources
 */

import React from 'react';
import { Building2, Activity, Tent, Shield, Flame, Truck, Utensils, Stethoscope } from 'lucide-react';
import { OVERPASS_CATEGORIES } from '../../models/overpassModel';

export default function OverpassSummaryCard({ counts }) {
  const summaryItems = [
    { key: 'NGO', label: 'NGOs', count: counts?.NGO || 0, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { key: 'Hospital', label: 'Hospitals', count: counts?.Hospital || 0, icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    { key: 'Clinic', label: 'Clinics', count: counts?.Clinic || 0, icon: Stethoscope, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
    { key: 'Shelter', label: 'Shelters', count: counts?.Shelter || 0, icon: Tent, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { key: 'Police', label: 'Police', count: counts?.Police || 0, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { key: 'Fire', label: 'Fire Stations', count: counts?.Fire || 0, icon: Flame, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
    { key: 'Ambulance', label: 'Ambulance', count: counts?.Ambulance || 0, icon: Truck, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { key: 'FoodBank', label: 'Food Banks', count: counts?.FoodBank || 0, icon: Utensils, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' }
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Emergency Resources Nearby
          </h2>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            OpenStreetMap Overpass API Live Spatial Query
          </p>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
          Overpass OSM
        </span>
      </div>

      {/* Grid of Dynamic Counter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`p-2.5 rounded-2xl border ${item.bg} backdrop-blur-md flex items-center justify-between transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-[#161b22] flex items-center justify-center shadow-xs">
                  <Icon size={14} className={item.color} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-black text-gray-900 dark:text-white font-mono">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
