/**
 * GdacsFilterBar.jsx
 * Search input, Category Filter chips, and Sorting selectors for GDACS Alerts
 */

import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { DISASTER_CATEGORIES } from '../../models/gdacsModel';

export default function GdacsFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="space-y-3">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by country..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#121620] border border-gray-800 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500/60 transition-all shadow-sm"
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
            <ArrowUpDown size={14} className="text-red-500" />
            <span className="text-gray-400 font-normal">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-white font-medium">Newest First</option>
              <option value="severity" className="bg-slate-900 text-white font-medium">Highest Severity</option>
              <option value="country" className="bg-slate-900 text-white font-medium">Country Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Region Quick Filters */}
      <div className="flex items-center gap-2.5 pt-0.5">
        <button
          onClick={() => onSearchChange('India')}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
            searchQuery.toLowerCase().includes('india')
              ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'
          }`}
        >
          <span>🇮🇳</span>
          <span>India Emergencies Only</span>
        </button>

        <button
          onClick={() => onSearchChange('')}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
            !searchQuery
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
              : 'bg-[#121620] text-gray-300 border-gray-800 hover:text-white'
          }`}
        >
          <span>🌐</span>
          <span>All Global Alerts</span>
        </button>
      </div>

      {/* Category Chips Scrollable Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0 flex items-center gap-1 pl-1">
          <Filter size={12} />
          FILTER:
        </span>
        {DISASTER_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/30 scale-105'
                  : 'bg-[#121620] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-600'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
