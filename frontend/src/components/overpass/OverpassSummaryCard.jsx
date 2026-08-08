/**
 * OverpassSummaryCard.jsx
 * Dynamic Emergency Summary Card displaying counts for nearby emergency resources
 */

import React from 'react';
import { Building2, Activity, Tent, Shield, Flame, Truck, Utensils, Stethoscope } from 'lucide-react';
import { OVERPASS_CATEGORIES } from '../../models/overpassModel';

export default function OverpassSummaryCard({ counts }) {
  const summaryItems = [
    { key: 'NGO', label: 'NGOs', count: counts?.NGO || 0, icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { key: 'Hospital', label: 'Hospitals', count: counts?.Hospital || 0, icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    { key: 'Clinic', label: 'Clinics', count: counts?.Clinic || 0, icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { key: 'Shelter', label: 'Shelters', count: counts?.Shelter || 0, icon: Tent, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { key: 'Police', label: 'Police', count: counts?.Police || 0, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { key: 'Fire', label: 'Fire Stations', count: counts?.Fire || 0, icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    { key: 'Ambulance', label: 'Ambulance', count: counts?.Ambulance || 0, icon: Truck, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    { key: 'FoodBank', label: 'Food Banks', count: counts?.FoodBank || 0, icon: Utensils, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
  ];

  return (
    <div className="rounded-3xl bg-[#11151e] border border-gray-800 p-5 shadow-lg space-y-3 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider !text-white forced-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Emergency Resources Nearby
          </h2>
          <p className="text-[10px] text-gray-400">
            OpenStreetMap Overpass API Live Spatial Query
          </p>
        </div>
        <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
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
              className={`p-2.5 rounded-2xl border ${item.bg} flex items-center justify-between transition-all hover:scale-[1.02] shadow-sm`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#161c28] border border-gray-800 flex items-center justify-center shadow-xs">
                  <Icon size={14} className={item.color} />
                </div>
                <span className="text-[11px] font-bold text-gray-200">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-black text-white font-mono">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
