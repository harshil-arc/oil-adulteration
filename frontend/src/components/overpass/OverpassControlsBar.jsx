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
    <div className="space-y-3.5 text-white">
      {/* Top Location & Radius Control Row */}
      <div className="p-4 rounded-3xl bg-[#11151e] border border-gray-800 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* GPS Status Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Navigation size={18} className={locationStatus === 'locating' ? 'animate-spin text-amber-400' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black !text-white forced-white">
                  {locationName}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                  locationStatus === 'located' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  locationStatus === 'ip_located' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  locationStatus === 'locating' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }`}>
                  {locationStatus === 'located' ? 'GPS Lock' : locationStatus === 'ip_located' ? 'IP Location' : locationStatus === 'locating' ? 'Locating...' : 'Custom Center'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                Current Location Reference Point
              </p>
            </div>
          </div>

          {/* Action Buttons: Request GPS & Refresh */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onRequestGps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold transition-all border border-blue-500/40 cursor-pointer"
              title="Detect GPS Location"
            >
              <Compass size={14} />
              <span>Auto GPS</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 text-gray-200 hover:text-white text-xs font-bold transition-all border border-gray-700 cursor-pointer disabled:opacity-50"
              title="Refresh Overpass Query"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* City/Address Search Geocoder Bar */}
        <div className="relative pt-2 border-t border-gray-800">
          <div className="relative">
            <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              value={addressSearchQuery}
              onChange={(e) => {
                onAddressSearch(e.target.value);
                setShowAddressDropdown(true);
              }}
              onFocus={() => setShowAddressDropdown(true)}
              placeholder="Search any City, Address or Pincode in India (e.g. Delhi, Mumbai, Kolkata, Bangalore...)"
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#161c28] border border-gray-800 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/60"
            />
            {addressSearchQuery && (
              <button
                onClick={() => {
                  onAddressSearch('');
                  setShowAddressDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Address Search Autocomplete Dropdown */}
          {showAddressDropdown && addressSearchResults && addressSearchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#161c28] border border-gray-800 rounded-2xl shadow-2xl z-[100] max-h-48 overflow-y-auto divide-y divide-gray-800">
              {addressSearchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectPreset(res.lat, res.lon, res.name);
                    setShowAddressDropdown(false);
                  }}
                  className="w-full p-2.5 text-left text-xs text-gray-200 hover:bg-blue-500/20 transition-colors flex items-start gap-2 cursor-pointer"
                >
                  <MapPin size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="truncate font-bold !text-white forced-white">{res.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City Presets Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin size={12} />
            Quick Presets:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
            {LOCATION_PRESETS.slice(1).map((preset) => (
              <button
                key={preset.label}
                onClick={() => onSelectPreset(preset.lat, preset.lon, preset.label)}
                className="px-3 py-1 rounded-xl text-[11px] font-bold bg-[#161c28] hover:bg-blue-500/20 text-gray-200 hover:text-white transition-all border border-gray-800 cursor-pointer whitespace-nowrap"
              >
                {preset.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Search Radius Options Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-gray-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Search Radius:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar scrollbar-none">
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onRadiusChange(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 !text-white forced-white shadow-md shadow-blue-600/30 scale-105'
                      : 'bg-[#161c28] text-gray-300 hover:text-white border border-gray-800'
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
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search nearby hospital, NGO, shelter, police or food bank..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#121620] border border-gray-800 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/60 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121620] border border-gray-800 text-xs font-bold text-gray-200 shadow-sm">
            <ArrowUpDown size={14} className="text-blue-500" />
            <span className="text-gray-400 font-normal">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="nearest" className="bg-slate-900 text-white font-medium">Nearest First</option>
              <option value="alphabetical" className="bg-slate-900 text-white font-medium">Alphabetical</option>
              <option value="category" className="bg-slate-900 text-white font-medium">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Chips Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0 flex items-center gap-1 pl-1">
          <Filter size={12} />
          FILTER:
        </span>
        {Object.entries(OVERPASS_CATEGORIES).map(([key, cat]) => {
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 !text-white forced-white shadow-md shadow-blue-600/30 scale-105 font-black'
                  : 'bg-[#121620] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-600'
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
