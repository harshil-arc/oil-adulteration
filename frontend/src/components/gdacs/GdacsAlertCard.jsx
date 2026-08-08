/**
 * GdacsAlertCard.jsx
 * Individual GDACS Live Disaster Alert Card Widget
 */

import React from 'react';
import { 
  Droplets, Activity, Wind, Flame, Waves, 
  CloudRain, Sun, Mountain, AlertTriangle, 
  MapPin, Calendar, ExternalLink, ChevronRight 
} from 'lucide-react';
import { SEVERITY_CONFIG } from '../../models/gdacsModel';

// Icon Resolver Component
function CategoryIcon({ disasterType, className = "w-5 h-5" }) {
  const type = (disasterType || '').toLowerCase();

  if (type.includes('flood')) return <Droplets className={className} />;
  if (type.includes('earthquake')) return <Activity className={className} />;
  if (type.includes('cyclone') || type.includes('storm')) return <Wind className={className} />;
  if (type.includes('volcano')) return <Flame className={className} />;
  if (type.includes('tsunami')) return <Waves className={className} />;
  if (type.includes('wildfire')) return <Flame className={className} />;
  if (type.includes('storm')) return <CloudRain className={className} />;
  if (type.includes('drought')) return <Sun className={className} />;
  if (type.includes('landslide')) return <Mountain className={className} />;

  return <AlertTriangle className={className} />;
}

export default function GdacsAlertCard({ alert, onSelect }) {
  const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.Green;

  return (
    <div className="group relative rounded-3xl bg-[#11151e] border border-gray-800 p-5 shadow-lg hover:shadow-2xl hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between">
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30 group-hover:scale-110 transition-transform">
              <CategoryIcon disasterType={alert.disasterType} className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider !text-gray-200">
                  {alert.disasterType}
                </span>
                <span className="text-[10px] text-gray-500">•</span>
                <span className="text-[10px] font-bold !text-gray-300 flex items-center gap-0.5">
                  <MapPin size={10} className="text-red-400" />
                  {alert.country}
                </span>
              </div>
            </div>
          </div>

          {/* Severity Badge */}
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${severityConfig.badgeBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${severityConfig.dotClass}`} />
              {alert.severity === 'Red' ? 'RED (HIGH)' : alert.severity === 'Orange' ? 'ORANGE (MEDIUM)' : `${alert.severity} (LOW)`}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-black !text-white forced-white leading-snug line-clamp-2 mb-2 group-hover:!text-red-400 transition-colors">
          {alert.title}
        </h3>

        {/* Location & Date */}
        <div className="flex items-center justify-between text-[10px] font-semibold !text-gray-300 mb-3 pt-1 border-t border-gray-800/80">
          <span className="truncate max-w-[200px] !text-gray-300">Lo... 📅 {alert.date}</span>
        </div>

        {/* Description */}
        <p className="text-xs !text-gray-200 line-clamp-3 leading-relaxed mb-4">
          {alert.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-800/80">
        <button
          onClick={() => onSelect && onSelect(alert)}
          className="text-xs font-bold !text-gray-300 hover:!text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight size={14} />
        </button>

        <button
          onClick={() => onSelect && onSelect(alert)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-red-600/30 cursor-pointer"
        >
          <span className="!text-white forced-white">Read More</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader Component
 */
export function GdacsAlertSkeleton() {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-1">
            <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="w-3/4 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="flex justify-between pt-2">
        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}
