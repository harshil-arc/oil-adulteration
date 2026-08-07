/**
 * OverpassControlsBar.jsx
 * GPS status, Address Search Geocoder, Radius Selector, Search, Category Chips & Sorting controls
 */

import React, { useState } from 'react';
import { 
  Navigation, MapPin, Search, Filter, ArrowUpDown, 
  X, RefreshCw, Compass, Globe 
} from 'lucide-react';
import { 
  OVERPASS_CATEGORIES, 
  RADIUS_OPTIONS, 
  LOCATION_PRESETS 
} from '../../models/overpassModel';

export default function OverpassControlsBar({
  locationStatus,
  locationName,
  onRequestGps,
  onSelectPreset,
  addressSearchQuery,
  addressSearchResults,
  isSearchingAddress,
  onAddressSearch,
  radius,
  onRadiusChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading
}) {
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  return (
    <div className="space-y-3.5">
      {/* Top Location & Radius Control Row */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* GPS Status Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Navigation size={18} className={locationStatus === 'locating' ? 'animate-spin text-amber-500' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  {locationName}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                  locationStatus === 'located' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  locationStatus === 'ip_located' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  locationStatus === 'locating' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-purple-500/10 text-purple-500 border-purple-500/20'
                }`}>
                  {locationStatus === 'located' ? 'GPS Lock' : locationStatus === 'ip_located' ? 'IP Location' : locationStatus === 'locating' ? 'Locating...' : 'Custom Center'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Current Location Reference Point
              </p>
            </div>
          </div>

          {/* Action Buttons: Request GPS & Refresh */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onRequestGps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all border border-blue-500/30 cursor-pointer"
              title="Detect GPS Location"
            >
              <Compass size={14} />
              <span>Auto GPS</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-white text-xs font-bold transition-all border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50"
              title="Refresh Overpass Query"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-amber-500' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* City/Address Search Geocoder Bar */}
        <div className="relative pt-2 border-t border-gray-100 dark:border-[#30363d]">
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              value={addressSearchQuery}
              onChange={(e) => {
                onAddressSearch(e.target.value);
                setShowAddressDropdown(true);
              }}
              onFocus={() => setShowAddressDropdown(true)}
              placeholder="Search any City, Address or Pincode in India (e.g. Delhi, Mumbai, Kolkata, Bangalore...)"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {addressSearchQuery && (
              <button
                onClick={() => {
                  onAddressSearch('');
                  setShowAddressDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Address Search Autocomplete Dropdown */}
          {showAddressDropdown && addressSearchResults && addressSearchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[100] max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {addressSearchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectPreset(res.lat, res.lon, res.name);
                    setShowAddressDropdown(false);
                  }}
                  className="w-full p-2.5 text-left text-xs text-gray-800 dark:text-gray-200 hover:bg-blue-500/10 transition-colors flex items-start gap-2 cursor-pointer"
                >
                  <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="truncate font-semibold">{res.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City Presets Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin size={12} />
            Quick Presets:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {LOCATION_PRESETS.slice(1).map((preset) => (
              <button
                key={preset.label}
                onClick={() => onSelectPreset(preset.lat, preset.lon, preset.label)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-blue-500/10 text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-all border border-gray-200 dark:border-gray-700 cursor-pointer whitespace-nowrap"
              >
                {preset.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Search Radius Options Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-[#30363d]">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Search Radius:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onRadiusChange(opt.value)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {opt.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Input & Sorting Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search nearby hospital, NGO, shelter, police or food bank..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm">
            <ArrowUpDown size={14} className="text-blue-500" />
            <span className="hidden sm:inline text-gray-400 font-normal">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="nearest" className="dark:bg-[#161b22]">Nearest First</option>
              <option value="alphabetical" className="dark:bg-[#161b22]">Alphabetical</option>
              <option value="category" className="dark:bg-[#161b22]">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Chips Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1 pl-1">
          <Filter size={12} />
          Filter:
        </span>
        {Object.entries(OVERPASS_CATEGORIES).map(([key, cat]) => {
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105'
                  : 'bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{cat.symbol}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
