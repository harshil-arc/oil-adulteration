import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, RefreshCw, Layers, Heart, 
  MapPin, ShieldAlert, Radio, Compass, Utensils, LifeBuoy
} from 'lucide-react';
import { useGdacsDisasters } from '../hooks/useGdacsDisasters';
import GdacsHeaderCard from '../components/gdacs/GdacsHeaderCard';
import GdacsStatsRow from '../components/gdacs/GdacsStatsRow';
import GdacsAiSummaryCard from '../components/gdacs/GdacsAiSummaryCard';
import GdacsFilterBar from '../components/gdacs/GdacsFilterBar';
import GdacsInteractiveMap from '../components/gdacs/GdacsInteractiveMap';
import GdacsAlertCard, { GdacsAlertSkeleton } from '../components/gdacs/GdacsAlertCard';
import GdacsEmergencyActions from '../components/gdacs/GdacsEmergencyActions';
import GdacsAlertDetailModal from '../components/gdacs/GdacsAlertDetailModal';
import OverpassEmergencySection from '../components/overpass/OverpassEmergencySection';
import FoodReliefNetwork from './FoodReliefNetwork';

export default function DisasterDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // 'disaster' | 'relief' | 'overpass' | 'all'
  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam === 'relief' || tabParam === 'food-donation' || tabParam === 'donations') return 'relief';
    if (tabParam === 'overpass') return 'overpass';
    if (tabParam === 'all') return 'all';
    return 'disaster';
  });

  useEffect(() => {
    if (tabParam === 'relief' || tabParam === 'food-donation' || tabParam === 'donations') {
      setActiveTab('relief');
    } else if (tabParam === 'overpass') {
      setActiveTab('overpass');
    } else if (tabParam === 'all') {
      setActiveTab('all');
    } else if (tabParam === 'disaster') {
      setActiveTab('disaster');
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const [overpassCategory, setOverpassCategory] = useState(null);

  const handleSelectHospital = () => {
    setOverpassCategory('Hospital');
    handleTabChange('overpass');
  };

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

        {/* Unified Platform Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121620] border border-gray-800 backdrop-blur-md overflow-x-auto custom-scrollbar scrollbar-none shadow-lg">
          <button
            onClick={() => handleTabChange('disaster')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'disaster'
                ? 'bg-red-600 !text-white forced-white shadow-lg shadow-red-600/30 font-black'
                : '!text-gray-300 hover:!text-white font-bold'
            }`}
          >
            <Radio size={14} className={activeTab === 'disaster' ? 'animate-pulse text-white' : ''} />
            <span className={activeTab === 'disaster' ? '!text-white forced-white' : ''}>Disaster Alerts</span>
          </button>

          <button
            onClick={() => handleTabChange('relief')}
            className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'relief'
                ? 'bg-rose-600 !text-white forced-white shadow-lg shadow-rose-600/30 font-black'
                : '!text-gray-300 hover:!text-white font-bold'
            }`}
          >
            <Heart size={14} />
            <span className={activeTab === 'relief' ? '!text-white forced-white' : ''}>Food Relief & NGO Donations</span>
          </button>

          <button
            onClick={() => handleTabChange('overpass')}
            className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'overpass'
                ? 'bg-blue-600 !text-white forced-white shadow-lg shadow-blue-600/30 font-black'
                : '!text-gray-300 hover:!text-white font-bold'
            }`}
          >
            <Compass size={14} />
            <span className={activeTab === 'overpass' ? '!text-white forced-white' : ''}>Emergency Services (10km)</span>
          </button>

          <button
            onClick={() => handleTabChange('all')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 !text-white forced-white shadow-lg font-black'
                : '!text-gray-300 hover:!text-white font-bold'
            }`}
          >
            <Layers size={14} />
            <span className={activeTab === 'all' ? '!text-white forced-white' : ''}>Full Overview</span>
          </button>
        </div>

        {/* ── 2. GDACS LIVE MONTIORING SECTION ──────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'disaster' || activeTab === 'gdacs') && (
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
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  Live Interactive Disaster Map ({alerts.length} Locations)
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 dark:text-gray-400">
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
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Live Disaster Alerts Feed ({alerts.length})
                </h2>
                {selectedCategory !== 'All' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
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
                <div className="rounded-3xl bg-[#11151e] border border-gray-800 p-8 text-center space-y-4 shadow-md text-white">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      No live disaster alerts available at the moment.
                    </h3>
                    <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                      Unable to retrieve active disaster warnings from GDACS feed.
                    </p>
                  </div>
                  <button
                    onClick={refresh}
                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer hover:bg-red-500 transition-colors"
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
              onSelectReliefCamp={() => handleTabChange('relief')}
              onSelectHospital={handleSelectHospital}
            />
          </div>
        )}

        {/* ── 3. FOOD RELIEF & NGO DONATIONS SECTION ──────────────────────── */}
        {(activeTab === 'all' || activeTab === 'relief') && (
          <div className="pt-4 border-t border-gray-200 dark:border-[#30363d] animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pl-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Heart size={18} className="text-rose-500" />
                Food Relief & NGO Donation Network
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Surplus Food & Relief Dispatch
              </span>
            </div>

            <FoodReliefNetwork isEmbedded={true} />
          </div>
        )}

        {/* ── 4. OPENSTREETMAP OVERPASS NEARBY SERVICES SECTION ──────────── */}
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

            <OverpassEmergencySection activeGdacsAlert={alerts[0]} initialCategory={overpassCategory} />
          </div>
        )}
      </div>

      {/* GDACS Live Disaster Detail Modal View */}
      {selectedAlertModal && (
        <GdacsAlertDetailModal
          alert={selectedAlertModal}
          onClose={() => setSelectedAlertModal(null)}
          onSelectHospital={handleSelectHospital}
          onSelectReliefCamp={() => handleTabChange('relief')}
        />
      )}
    </div>
  );
}
