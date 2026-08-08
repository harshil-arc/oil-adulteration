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
      label: 'TOTAL ALERTS',
      value: stats?.total || 0,
      textColor: 'text-amber-400',
      bgColor: 'bg-[#1e1b18] border-amber-500/40'
    },
    {
      label: 'FLOODS',
      value: stats?.floods || 0,
      textColor: 'text-blue-400',
      bgColor: 'bg-[#151c28] border-blue-500/40'
    },
    {
      label: 'EARTHQUAKES',
      value: stats?.earthquakes || 0,
      textColor: 'text-yellow-400',
      bgColor: 'bg-[#1e1c14] border-yellow-500/40'
    },
    {
      label: 'CYCLONES',
      value: stats?.cyclones || 0,
      textColor: 'text-cyan-400',
      bgColor: 'bg-[#13222a] border-cyan-500/40'
    },
    {
      label: 'WILDFIRES',
      value: stats?.wildfires || 0,
      textColor: 'text-rose-400',
      bgColor: 'bg-[#23171b] border-rose-500/40'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
      {statItems.map((item, idx) => {
        return (
          <div
            key={idx}
            className={`p-3 rounded-2xl border ${item.bgColor} flex flex-col justify-between transition-all hover:scale-[1.02] shadow-md`}
          >
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-300">
              {item.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-black font-mono ${item.textColor}`}>
                {item.value}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                ACTIVE
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
