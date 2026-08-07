/**
 * GdacsStatsRow.jsx
 * Statistics bar displaying automatically calculated disaster counters:
 * Total Active Alerts, Floods, Earthquakes, Cyclones, Wildfires
 */

import React from 'react';
import { AlertCircle, Droplets, Activity, Wind, Flame } from 'lucide-react';

export default function GdacsStatsRow({ stats }) {
  const statItems = [
    {
      label: 'Total Alerts',
      value: stats?.total || 0,
      icon: AlertCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Floods',
      value: stats?.floods || 0,
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Earthquakes',
      value: stats?.earthquakes || 0,
      icon: Activity,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      label: 'Cyclones',
      value: stats?.cyclones || 0,
      icon: Wind,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      label: 'Wildfires',
      value: stats?.wildfires || 0,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border ${item.bgColor} backdrop-blur-md flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
              <Icon size={16} className={item.color} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                {item.value}
              </span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
                Active
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
