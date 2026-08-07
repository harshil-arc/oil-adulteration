/**
 * OverpassResourceCard.jsx
 * Individual Emergency Resource Card Component with Navigate Action
 */

import React from 'react';
import { 
  Navigation, Phone, Globe, Clock, MapPin, 
  Building2, Activity, Tent, Shield, Flame, Truck, Utensils, Stethoscope 
} from 'lucide-react';
import { getNavigationUrl } from '../../models/overpassModel';

// Icon Resolver Component
function CategoryIcon({ categoryKey, className = "w-5 h-5" }) {
  if (categoryKey === 'NGO') return <Building2 className={className} />;
  if (categoryKey === 'Hospital') return <Activity className={className} />;
  if (categoryKey === 'Clinic') return <Stethoscope className={className} />;
  if (categoryKey === 'Shelter') return <Tent className={className} />;
  if (categoryKey === 'Police') return <Shield className={className} />;
  if (categoryKey === 'Fire') return <Flame className={className} />;
  if (categoryKey === 'Ambulance') return <Truck className={className} />;
  if (categoryKey === 'FoodBank') return <Utensils className={className} />;
  return <Building2 className={className} />;
}

export default function OverpassResourceCard({ resource, onSelect }) {
  const navUrl = getNavigationUrl(resource.latitude, resource.longitude, resource.name);
  const config = resource.categoryConfig;

  return (
    <div className="group relative rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-5 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header & Category Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: `${config.color}15`,
                borderColor: `${config.color}40`,
                color: config.color
              }}
            >
              <CategoryIcon categoryKey={resource.category} className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                {resource.categoryLabel}
              </span>
              <span className="text-xs font-black text-gray-900 dark:text-white font-mono">
                {resource.distanceKm} km away
              </span>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold border ${config.badgeBg}`}>
            <span>{config.symbol}</span>
            <span>{resource.categoryLabel}</span>
          </span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-black text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-blue-500 transition-colors">
          {resource.name}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300 mb-3">
          <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
          <span className="line-clamp-2 font-medium">{resource.address}</span>
        </div>

        {/* Meta info: Phone, Website, Hours */}
        <div className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400 mb-4 pt-2 border-t border-gray-100 dark:border-[#30363d]">
          {resource.phone && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <Phone size={12} className="shrink-0" />
              <a href={`tel:${resource.phone}`} className="hover:underline">
                {resource.phone}
              </a>
            </div>
          )}

          {resource.website && (
            <div className="flex items-center gap-1.5 text-indigo-500 truncate">
              <Globe size={12} className="shrink-0" />
              <a href={resource.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                {resource.website}
              </a>
            </div>
          )}

          {resource.openingHours && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Clock size={12} className="shrink-0" />
              <span>{resource.openingHours}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-[#30363d]">
        <button
          onClick={() => onSelect && onSelect(resource)}
          className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
        >
          View Details
        </button>

        {/* Navigate Button */}
        <a
          href={navUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <Navigation size={14} />
          <span>Navigate</span>
        </a>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader Card Component
 */
export function OverpassSkeletonCard() {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-1">
            <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="w-full h-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="flex justify-between pt-2">
        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}
