/**
 * frontend/src/pages/DisasterDashboard.jsx
 * Comprehensive Disaster & Emergency Platform
 * Combines GDACS Live Global Disaster Monitoring + OpenStreetMap Overpass Nearby Emergency Services
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, RefreshCw, Layers, Heart, 
  MapPin, ShieldAlert, Radio, Compass 
} from 'lucide-react';
import { useGdacsDisasters } from '../hooks/useGdacsDisasters';
import GdacsHeaderCard from '../components/gdacs/GdacsHeaderCard';
import GdacsStatsRow from '../components/gdacs/GdacsStatsRow';
import GdacsAiSummaryCard from '../components/gdacs/GdacsAiSummaryCard';
import GdacsFilterBar from '../components/gdacs/GdacsFilterBar';
import GdacsInteractiveMap from '../components/gdacs/GdacsInteractiveMap';
import GdacsAlertCard, { GdacsAlertSkeleton } from '../components/gdacs/GdacsAlertCard';
import GdacsEmergencyActions from '../components/gdacs/GdacsEmergencyActions';
import OverpassEmergencySection from '../components/overpass/OverpassEmergencySection';

export default function DisasterDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'gdacs' | 'overpass'

  // ViewModel Custom Hook for GDACS
  const {
    alerts,
    stats,
    aiSummary,
    loading,
    error,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    refresh
  } = useGdacsDisasters();

  // Modal detail state
  const [selectedAlertModal, setSelectedAlertModal] = useState(null);

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe relative overflow-x-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto relative z-10">

        {/* ── 1. TOP HEADER CARD ────────────────────────────────────────── */}
        <GdacsHeaderCard 
          lastUpdated={lastUpdated} 
          loading={loading} 
          onRefresh={refresh} 
        />

        {/* Section Navigation Tabs (GDACS Live Feed vs Overpass OSM Services) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-[#161b22]/60 border border-gray-200 dark:border-[#30363d] backdrop-blur-md overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Radio size={14} className="animate-pulse" />
            <span>Full Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('overpass')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'overpass'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Compass size={14} />
            <span>Nearby OSM Services (10km)</span>
          </button>

          <button
            onClick={() => navigate('/relief')}
            className="flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all border border-rose-500/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Heart size={14} />
            <span>NGO Food Relief →</span>
          </button>
        </div>

        {/* ── 2. GDACS LIVE MONTIORING SECTION ──────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'gdacs') && (
          <div className="space-y-6 animate-in fade-in">
            {/* STATS BAR */}
            <GdacsStatsRow stats={stats} />

            {/* DYNAMIC AI SITUATION SUMMARY */}
            <GdacsAiSummaryCard aiSummary={aiSummary} />

            {/* SEARCH, CATEGORY FILTERS & SORTING */}
            <GdacsFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* INTERACTIVE DISASTER MAP */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  Live Interactive Disaster Map ({alerts.length} Locations)
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
                </div>
              </div>

              <GdacsInteractiveMap alerts={alerts} />
            </div>

            {/* LIVE ALERTS CARDS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pl-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Live Disaster Alerts Feed ({alerts.length})
                </h2>
                {selectedCategory !== 'All' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                    Filtered: {selectedCategory}
                  </span>
                )}
              </div>

              {/* Skeleton Loaders */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GdacsAlertSkeleton />
                  <GdacsAlertSkeleton />
                </div>
              )}

              {/* Empty / Error State */}
              {!loading && error && alerts.length === 0 && (
                <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-8 text-center space-y-4 shadow-md">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">
                      No live disaster alerts available at the moment.
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                      Unable to retrieve active disaster warnings from GDACS feed.
                    </p>
                  </div>
                  <button
                    onClick={refresh}
                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md inline-flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>Retry Fetching Feed</span>
                  </button>
                </div>
              )}

              {/* Alert Cards Grid */}
              {!loading && alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alerts.map((alert) => (
                    <GdacsAlertCard
                      key={alert.id}
                      alert={alert}
                      onSelect={(item) => setSelectedAlertModal(item)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* EMERGENCY SOS QUICK ACTIONS */}
            <GdacsEmergencyActions 
              onSelectReliefCamp={() => navigate('/relief')}
              onSelectHospital={() => setActiveTab('overpass')}
            />
          </div>
        )}

        {/* ── 3. OPENSTREETMAP OVERPASS NEARBY SERVICES SECTION ──────────── */}
        {(activeTab === 'all' || activeTab === 'overpass') && (
          <div className="pt-4 border-t border-gray-200 dark:border-[#30363d] animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pl-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Compass size={18} className="text-blue-500" />
                Nearby Emergency Services (Overpass API)
              </h2>
              <span className="text-[10px] font-mono text-gray-400">
                100% Free OpenStreetMap Data
              </span>
            </div>

            <OverpassEmergencySection activeGdacsAlert={alerts[0]} />
          </div>
        )}
      </div>

      {/* GDACS Detail Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedAlertModal(null)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">
                GDACS Alert Details
              </span>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                {selectedAlertModal.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>📍 {selectedAlertModal.country}</span>
                <span>•</span>
                <span>📅 {selectedAlertModal.date}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedAlertModal.description}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Close
              </button>
              <a
                href={selectedAlertModal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Open Full GDACS Report
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
