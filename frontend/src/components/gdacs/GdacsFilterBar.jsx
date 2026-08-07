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
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by country, location, or disaster type..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-sm"
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
            <ArrowUpDown size={14} className="text-red-500" />
            <span className="hidden sm:inline text-gray-400 font-normal">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="dark:bg-[#161b22]">Newest First</option>
              <option value="severity" className="dark:bg-[#161b22]">Highest Severity</option>
              <option value="country" className="dark:bg-[#161b22]">Country Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Region Quick Filters */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSearchChange('India')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
            searchQuery.toLowerCase().includes('india')
              ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <span>🇮🇳</span>
          <span>India Emergencies Only</span>
        </button>

        <button
          onClick={() => onSearchChange('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
            !searchQuery
              ? 'bg-red-500 text-white border-red-400 shadow-md'
              : 'bg-gray-100 dark:bg-[#161b22] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#30363d] hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>🌐</span>
          <span>All Global Alerts</span>
        </button>
      </div>

      {/* Category Chips Scrollable Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1 pl-1">
          <Filter size={12} />
          Filter:
        </span>
        {DISASTER_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20 scale-105'
                  : 'bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
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
