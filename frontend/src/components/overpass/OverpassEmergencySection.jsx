/**
 * OverpassEmergencySection.jsx
 * Full OpenStreetMap Overpass Nearby Emergency Services Component
 */

import React, { useState } from 'react';
import { 
  Building2, Activity, Tent, Shield, Flame, 
  Truck, Utensils, AlertTriangle, RefreshCw, Layers 
} from 'lucide-react';
import { useOverpassEmergency } from '../../hooks/useOverpassEmergency';
import OverpassSummaryCard from './OverpassSummaryCard';
import OverpassControlsBar from './OverpassControlsBar';
import OverpassInteractiveMap from './OverpassInteractiveMap';
import OverpassResourceCard, { OverpassSkeletonCard } from './OverpassResourceCard';
import { getNavigationUrl } from '../../models/overpassModel';

export default function OverpassEmergencySection({ activeGdacsAlert = null }) {
  const {
    resources,
    allResources,
    counts,
    loading,
    error,
    coords,
    locationStatus,
    locationName,
    requestGpsLocation,
    setPresetLocation,
    addressSearchQuery,
    addressSearchResults,
    isSearchingAddress,
    handleAddressSearch,
    radius,
    setRadius,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    refresh
  } = useOverpassEmergency();

  const [selectedDetailResource, setSelectedDetailResource] = useState(null);

  // Group resources by category for categorized list view
  const categorizedGroups = [
    { key: 'NGO', title: 'Nearby NGOs & Relief Services', icon: Building2, color: 'text-emerald-500', items: resources.filter(r => r.category === 'NGO') },
    { key: 'Hospital', title: 'Nearby Hospitals & Clinics', icon: Activity, color: 'text-red-500', items: resources.filter(r => r.category === 'Hospital' || r.category === 'Clinic') },
    { key: 'Shelter', title: 'Nearby Emergency Shelters', icon: Tent, color: 'text-amber-500', items: resources.filter(r => r.category === 'Shelter') },
    { key: 'Police', title: 'Nearby Police Stations', icon: Shield, color: 'text-blue-500', items: resources.filter(r => r.category === 'Police') },
    { key: 'Fire', title: 'Nearby Fire Stations', icon: Flame, color: 'text-purple-500', items: resources.filter(r => r.category === 'Fire') },
    { key: 'Ambulance', title: 'Nearby Ambulance Stations', icon: Truck, color: 'text-yellow-500', items: resources.filter(r => r.category === 'Ambulance') },
    { key: 'FoodBank', title: 'Nearby Food Distribution & Banks', icon: Utensils, color: 'text-emerald-600', items: resources.filter(r => r.category === 'FoodBank') }
  ];

  return (
    <div className="space-y-6">

      {/* ── 1. ACTIVE GDACS DISASTER BANNER (if present) ──────────────── */}
      {activeGdacsAlert && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-950/80 to-amber-950/80 border border-red-500/40 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 border border-red-500/40">
                  Active Disaster Alert
                </span>
                <span className="text-xs font-bold text-red-200">
                  {activeGdacsAlert.country}
                </span>
              </div>
              <h3 className="text-sm font-black text-white leading-tight mt-0.5">
                {activeGdacsAlert.title}
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-300 bg-black/40 px-3 py-1 rounded-xl shrink-0">
            Shelters & Emergency Services Prioritized Below
          </span>
        </div>
      )}

      {/* ── 2. EMERGENCY SUMMARY CARD ──────────────────────────────────── */}
      <OverpassSummaryCard counts={counts} />

      {/* ── 3. CONTROLS BAR (GPS, Radius, Search, Category Chips, Sort) ── */}
      <OverpassControlsBar
        locationStatus={locationStatus}
        locationName={locationName}
        onRequestGps={requestGpsLocation}
        onSelectPreset={setPresetLocation}
        addressSearchQuery={addressSearchQuery}
        addressSearchResults={addressSearchResults}
        isSearchingAddress={isSearchingAddress}
        onAddressSearch={handleAddressSearch}
        radius={radius}
        onRadiusChange={setRadius}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refresh}
        loading={loading}
      />

      {/* ── 4. INTERACTIVE OPENSTREETMAP LEAFLET MAP ───────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pl-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Layers size={16} className="text-blue-500" />
            Nearby Emergency Spatial Map ({resources.length} Found)
          </h3>
          <span className="text-[10px] font-mono text-gray-500">
            Within {(radius / 1000)} km radius
          </span>
        </div>

        <OverpassInteractiveMap 
          userCoords={coords} 
          resources={resources} 
          onSelectLocation={setPresetLocation}
        />
      </div>

      {/* ── 5. LIST VIEW & CATEGORIZED SECTIONS ────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pl-1 border-b border-gray-200 dark:border-[#30363d] pb-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Categorized Emergency Facilities ({resources.length})
          </h3>
          {selectedCategory !== 'All' && (
            <span className="text-xs font-bold text-blue-500">
              Showing: {selectedCategory}
            </span>
          )}
        </div>

        {/* Skeleton Loader while fetching */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OverpassSkeletonCard />
            <OverpassSkeletonCard />
            <OverpassSkeletonCard />
            <OverpassSkeletonCard />
          </div>
        )}

        {/* Empty State */}
        {!loading && (error || resources.length === 0) && (
          <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                No emergency resources found nearby.
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                No facilities matching your filter were detected within {(radius / 1000)} km. Try increasing the search radius to 20 km or 50 km.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setRadius(20000)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Expand Radius to 20 km
              </button>
              <button
                onClick={refresh}
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs transition-all border cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Render Categorized Groups */}
        {!loading && resources.length > 0 && selectedCategory === 'All' && (
          <div className="space-y-6">
            {categorizedGroups.map((group) => {
              if (group.items.length === 0) return null;
              const Icon = group.icon;

              return (
                <div key={group.key} className="space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Icon size={16} className={group.color} />
                      {group.title} ({group.items.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.items.map((item) => (
                      <OverpassResourceCard
                        key={item.id}
                        resource={item}
                        onSelect={(res) => setSelectedDetailResource(res)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Render Filtered Single List */}
        {!loading && resources.length > 0 && selectedCategory !== 'All' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((item) => (
              <OverpassResourceCard
                key={item.id}
                resource={item}
                onSelect={(res) => setSelectedDetailResource(res)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedDetailResource && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDetailResource(null)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] pb-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${selectedDetailResource.categoryConfig.badgeBg}`}>
                {selectedDetailResource.categoryConfig.symbol} {selectedDetailResource.categoryLabel}
              </span>
              <button
                onClick={() => setSelectedDetailResource(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                {selectedDetailResource.name}
              </h3>
              <p className="text-xs font-bold text-blue-500 mt-1 font-mono">
                {selectedDetailResource.distanceKm} km away from your location
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Address:</strong> {selectedDetailResource.address}
              </p>
              {selectedDetailResource.phone && (
                <p className="text-blue-500 font-bold">
                  <strong>Phone:</strong> {selectedDetailResource.phone}
                </p>
              )}
              {selectedDetailResource.openingHours && (
                <p className="text-emerald-500 font-medium">
                  <strong>Hours:</strong> {selectedDetailResource.openingHours}
                </p>
              )}
              <p className="text-gray-400 font-mono text-[10px]">
                OSM Identifier: {selectedDetailResource.id}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDetailResource(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Close
              </button>
              <a
                href={getNavigationUrl(selectedDetailResource.latitude, selectedDetailResource.longitude, selectedDetailResource.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                Navigate via Maps →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
