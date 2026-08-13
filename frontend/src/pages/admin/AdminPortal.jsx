import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import NourishReliefApp from '../../nourish-relief/App.jsx';
import '../../nourish-relief/index.css';

// Leaflet map imports
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Lucide Icons
import {
  List, Map, Heart, User, LogOut, RefreshCw, Search,
  Database, Thermometer, ShieldAlert, ArrowRight, ShieldCheck,
  AlertTriangle, Calendar, Award, MapPin, X, ChevronRight,
  Activity, Sliders, Menu, X as CloseIcon, Filter, Layers, Info
} from 'lucide-react';

// Fix Leaflet marker icon asset issue
delete L.Icon.Default.prototype._getIconUrl;

// Custom Marker Icons (mirroring Hotspots.jsx but customized for admin)
const adminMarkerIcon = (status) => {
  let hex = '#22c55e'; // Safe (Green)
  let isPulsing = false;

  if (status === 'adulterated' || status === 'Unsafe') {
    hex = '#ef4444'; // Red
    isPulsing = true;
  } else if (status === 'moderate' || status === 'Moderate') {
    hex = '#f97316'; // Orange
  }

  return new L.DivIcon({
    className: isPulsing ? 'admin-pulsing-marker-wrapper' : 'admin-marker-wrapper',
    html: isPulsing ? `
      <div style="position: relative;">
        <div style="background-color: ${hex}; width: 20px; height: 20px; display: block; left: -10px; top: -10px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px ${hex}; z-index: 2;"></div>
        <div class="pulse-ring" style="position: absolute; top: -20px; left: -20px; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.35); pointer-events: none; z-index: 1;"></div>
      </div>
    ` : `
      <div style="background-color: ${hex}; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 8px ${hex}80;"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function AdminPortal() {
  const navigate = useNavigate();
  const { logout, profile } = useApp();

  // Tab State: 'scans', 'heatmap', 'nourish', 'profile'
  const [activeTab, setActiveTab] = useState('scans');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Recent Scans State
  const [scans, setScans] = useState([]);
  const [scansLoading, setScansLoading] = useState(true);
  const [scansError, setScansError] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [scansSearch, setScansSearch] = useState('');
  const [scansFilterType, setScansFilterType] = useState('all');

  // Heatmap State
  const [mapCenter, setMapCenter] = useState([23.0225, 72.5714]); // Ahmedabad Default
  const [mapZoom, setMapZoom] = useState(11);
  const [heatmapStyle, setHeatmapStyle] = useState('standard');
  const [selectedMapScan, setSelectedMapScan] = useState(null);

  // Fetch Scans with Realtime Subscriptions
  const fetchScans = async () => {
    try {
      setScansLoading(true);
      setScansError(null);
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setScans(data || []);
      if (data && data.length > 0 && !selectedScan) {
        setSelectedScan(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch scans:', err);
      setScansError('Could not load scan records. Please check database connection.');
    } finally {
      setScansLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();

    // Subscribe to real-time updates on analysis results
    const channel = supabase
      .channel('admin_realtime_scans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analysis_results' }, (payload) => {
        console.log('[Realtime Scan Update]', payload);
        if (payload.eventType === 'INSERT') {
          setScans((prev) => [payload.new, ...prev]);
          // Auto-select new scan if desired
          setSelectedScan(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          setScans((prev) => prev.map(s => s.id === payload.new.id ? payload.new : s));
          setSelectedScan(current => current?.id === payload.new.id ? payload.new : current);
        } else if (payload.eventType === 'DELETE') {
          setScans((prev) => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    // Inject CSS for map markers pulse animation
    const styleId = 'admin-leaflet-pulsing-marker-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(0.35); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .pulse-ring {
          animation: pulse 1.5s infinite ease-out;
          border-radius: 50%;
          border: 2.5px solid #ef4444;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter Scans
  const filteredScans = useMemo(() => {
    return scans.filter(scan => {
      const matchesSearch =
        (scan.oil_type || '').toLowerCase().includes(scansSearch.toLowerCase()) ||
        (scan.id || '').toLowerCase().includes(scansSearch.toLowerCase()) ||
        (scan.quality || '').toLowerCase().includes(scansSearch.toLowerCase());
      
      const matchesType =
        scansFilterType === 'all' ||
        (scansFilterType === 'pure' && (scan.quality === 'Safe' || scan.quality === 'pure')) ||
        (scansFilterType === 'moderate' && (scan.quality === 'Moderate' || scan.quality === 'moderate')) ||
        (scansFilterType === 'unsafe' && (scan.quality === 'Unsafe' || scan.quality === 'heavy'));

      return matchesSearch && matchesType;
    });
  }, [scans, scansSearch, scansFilterType]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDistrictName = (item) => {
    if (item.vendor) return item.vendor;
    const lat = parseFloat(item.latitude || 23.02);
    if (lat > 28.5) return 'Delhi District';
    if (lat < 19.1) return 'Mumbai South';
    return 'Ahmedabad Municipal Command';
  };

  const getPurityTier = (scan) => {
    const q = scan.quality || 'Safe';
    if (q === 'Safe' || q === 'pure') return { label: 'PURE', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
    if (q === 'Moderate' || q === 'moderate') return { label: 'MODERATE', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    return { label: 'ADULTERATED', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  };

  // Nav Items
  const navItems = [
    { id: 'scans', label: 'Recent Scans', icon: List },
    { id: 'heatmap', label: 'Heatmap', icon: Map },
    { id: 'nourish', label: 'NourishRelief', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] font-sans flex flex-col md:flex-row antialiased">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f172a] border-r border-[#1e293b] p-6 shrink-0 relative">
        <div className="flex items-center space-x-3 mb-10 pb-4 border-b border-[#1e293b]/60">
          <img src="/food360-logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl border border-amber-500/30 shadow-md object-cover" />
          <div>
            <h2 className="text-md font-black tracking-tight text-white flex items-center">
              food360 <span className="text-amber-500 text-[10px] ml-1 bg-amber-500/10 px-1.5 py-0.5 rounded font-black border border-amber-500/20">ADMIN</span>
            </h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Control Terminal</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 space-y-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedMapScan(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-bold scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-[#1e293b]/50'
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Logout */}
        <div className="pt-6 border-t border-[#1e293b]/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:text-white hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between bg-[#0f172a] border-b border-[#1e293b] px-5 py-4 z-40">
        <div className="flex items-center space-x-3">
          <img src="/food360-logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <h2 className="text-sm font-black text-white uppercase tracking-tight">food360 Admin</h2>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isMobileMenuOpen ? <CloseIcon size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#090d16] pt-20 px-5 flex flex-col space-y-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
                setSelectedMapScan(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-bold uppercase transition-all ${
                activeTab === item.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 bg-[#0f172a] border border-[#1e293b]'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col overflow-y-auto px-6 py-6 md:py-8 max-w-full">
        
        {/* TAB 1: RECENT SCANS */}
        {activeTab === 'scans' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Recent Oil-Purity Scans</h1>
                <p className="text-xs text-slate-500 mt-1">Real-time telemetry and spectral analysis of user-submitted scans.</p>
              </div>
              <button
                onClick={fetchScans}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0f172a] border border-[#1e293b] hover:bg-[#1e293b] hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors shadow-sm self-start sm:self-center"
              >
                <RefreshCw size={14} className={scansLoading ? 'animate-spin' : ''} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search scans by oil type, status, ID..."
                  value={scansSearch}
                  onChange={(e) => setScansSearch(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#1e293b] focus:border-amber-500 rounded-xl py-3 pl-11 pr-4 outline-none text-xs theme-text transition-colors text-[#e2e8f0]"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                {['all', 'pure', 'moderate', 'unsafe'].map(type => (
                  <button
                    key={type}
                    onClick={() => setScansFilterType(type)}
                    className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                      scansFilterType === type
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-glow-gold'
                        : 'bg-[#0f172a] text-slate-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {scansLoading && scans.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin mb-4" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Accessing scan logs...</p>
              </div>
            ) : scansError ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
                <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert size={26} />
                </div>
                <h3 className="font-bold text-md text-white mb-2">Sync Connection Lost</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{scansError}</p>
                <button onClick={fetchScans} className="btn-primary py-2.5 px-6 text-xs uppercase font-black">Retry Fetch</button>
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-[#1e293b] rounded-3xl bg-[#0f172a]/30">
                <div className="w-12 h-12 bg-[#0f172a] rounded-xl border border-[#1e293b] flex items-center justify-center mb-4">
                  <Database size={20} className="text-amber-500" />
                </div>
                <h3 className="font-bold text-sm text-white mb-1">No Scans Found</h3>
                <p className="text-xs text-slate-500">No telemetry matches your current filter options.</p>
              </div>
            ) : (
              /* Two-Column split screen dashboard */
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[30rem]">
                
                {/* List Panel */}
                <div className="lg:col-span-5 flex flex-col gap-3 max-h-[35rem] overflow-y-auto pr-1">
                  {filteredScans.map(scan => {
                    const isSelected = selectedScan?.id === scan.id;
                    const tier = getPurityTier(scan);
                    const timestamp = scan.timestamp || scan.created_at;

                    return (
                      <div
                        key={scan.id}
                        onClick={() => setSelectedScan(scan)}
                        className={`p-4 bg-[#0f172a] border rounded-2xl cursor-pointer hover:border-amber-500/40 hover:scale-[1.01] transition-all flex flex-col gap-3 relative ${
                          isSelected ? 'border-amber-500 shadow-lg shadow-amber-500/5' : 'border-[#1e293b]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">{scan.oil_type || 'Unspecified Oil'}</h4>
                          </div>
                          <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border ${tier.color}`}>
                            {tier.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <div>
                            <span className="font-bold">Loc:</span> {getDistrictName(scan)}
                          </div>
                          <div className="font-mono text-gray-500 text-[10px]">
                            {timestamp ? new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#1e293b]/60">
                          <span className="text-[10px] text-slate-500 font-semibold font-mono truncate max-w-[120px]">ID: {scan.id}</span>
                          <span className="text-xs font-black text-white font-mono">{scan.purity ? `${Number(scan.purity).toFixed(1)}%` : '--'} <span className="text-[8px] text-slate-500">Purity</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Details Panel */}
                <div className="lg:col-span-7 bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 flex flex-col gap-6 max-h-[35rem] overflow-y-auto">
                  {selectedScan ? (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between pb-4 border-b border-[#1e293b]/60">
                        <div>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">Detailed Analysis Log</span>
                          <h2 className="text-lg font-black text-white tracking-tight">{selectedScan.oil_type || 'Unknown Edible Oil'}</h2>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">SCAN ID</span>
                          <span className="font-mono font-bold text-xs text-white">{selectedScan.id}</span>
                        </div>
                      </div>

                      {/* Stats Tiers */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-[#090d16] border border-[#1e293b] rounded-2xl p-4 text-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Purity Level</span>
                          <span className="text-2xl font-black text-white font-mono">{selectedScan.purity ? `${Number(selectedScan.purity).toFixed(1)}%` : '—'}</span>
                        </div>
                        <div className="bg-[#090d16] border border-[#1e293b] rounded-2xl p-4 text-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Adulteration</span>
                          <span className="text-2xl font-black text-rose-500 font-mono">{selectedScan.adulteration ? `${Number(selectedScan.adulteration).toFixed(1)}%` : '—'}</span>
                        </div>
                        <div className="bg-[#090d16] border border-[#1e293b] rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status Recommendation</span>
                          <span className={`inline-block text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full border mt-1.5 ${getPurityTier(selectedScan).color}`}>
                            {getPurityTier(selectedScan).label}
                          </span>
                        </div>
                      </div>

                      {/* Map Location */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin size={14} className="text-amber-500" />
                          <span>Location Diagnostics</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-xs bg-[#090d16] border border-[#1e293b] rounded-2xl p-4">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">District / Center</span>
                            <span className="font-semibold text-slate-200">{getDistrictName(selectedScan)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">GPS Coordinates</span>
                            <span className="font-semibold text-slate-200 font-mono">
                              {selectedScan.latitude && selectedScan.longitude
                                ? `${parseFloat(selectedScan.latitude).toFixed(4)}°, ${parseFloat(selectedScan.longitude).toFixed(4)}°`
                                : 'Anonymized/No GPS'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sensor Readings Grid */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Activity size={14} className="text-amber-500" />
                          <span>Sensor Telemetry Readings</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {selectedScan.sensor_snapshot ? (
                            Object.entries(selectedScan.sensor_snapshot).map(([key, val]) => (
                              <div key={key} className="bg-[#090d16]/70 border border-[#1e293b] rounded-xl p-3 text-left">
                                <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold truncate">{key.replace('_', ' ')}</span>
                                <span className="text-sm font-extrabold text-white font-mono">{typeof val === 'number' ? val.toFixed(2) : String(val)}</span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-4 bg-[#090d16]/70 border border-[#1e293b] rounded-xl p-4 text-center text-xs text-slate-500">
                              No raw sensor readings packet found. Only processed results stored.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Diagnostics Health Advice */}
                      {selectedScan.health_advisory && (
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-xs leading-relaxed text-slate-300">
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-1">Clinical Health Advisory</span>
                          "{selectedScan.health_advisory}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-500">
                      <Info size={26} className="mb-2 text-slate-600" />
                      <p className="text-xs font-bold uppercase tracking-wider">Select a scan record to inspect full telemetry</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HEATMAP */}
        {activeTab === 'heatmap' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">System Adulteration Heatmap</h1>
                <p className="text-xs text-slate-500 mt-1">Geospatial distribution of pure, moderate, and critical oil purity events.</p>
              </div>
              <div className="flex items-center bg-[#0f172a] border border-[#1e293b] p-1 rounded-xl">
                <button
                  onClick={() => setHeatmapStyle('standard')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                    heatmapStyle === 'standard' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark Grid
                </button>
                <button
                  onClick={() => setHeatmapStyle('satellite')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                    heatmapStyle === 'satellite' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 h-[32rem] rounded-3xl overflow-hidden border border-[#1e293b] shadow-2xl relative z-0">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="w-full h-full"
                  zoomControl={true}
                >
                  <TileLayer
                    url={heatmapStyle === 'satellite'
                      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    }
                    attribution='&copy; ESRI / CartoDB'
                  />
                  <ChangeMapView center={mapCenter} zoom={mapZoom} />

                  {/* Render markers for scans */}
                  {scans.filter(s => s.latitude && s.longitude).map(scan => (
                    <Marker
                      key={`marker-${scan.id}`}
                      position={[parseFloat(scan.latitude), parseFloat(scan.longitude)]}
                      icon={adminMarkerIcon(scan.quality)}
                      eventHandlers={{
                        click: () => {
                          setSelectedMapScan(scan);
                          setMapCenter([parseFloat(scan.latitude), parseFloat(scan.longitude)]);
                          setMapZoom(13);
                        }
                      }}
                    />
                  ))}

                  {/* Heat circles overlay */}
                  {scans.filter(s => s.latitude && s.longitude && s.quality === 'Unsafe').map(scan => (
                    <Circle
                      key={`circle-unsafe-${scan.id}`}
                      center={[parseFloat(scan.latitude), parseFloat(scan.longitude)]}
                      radius={1200}
                      pathOptions={{
                        fillColor: '#ef4444',
                        fillOpacity: 0.15,
                        stroke: false
                      }}
                    />
                  ))}
                </MapContainer>
              </div>

              {/* Side Info Panel */}
              <div className="lg:col-span-4 bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 flex flex-col justify-between max-h-[32rem] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Live Heat Diagnostics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#090d16] border border-[#1e293b] p-4 rounded-2xl text-center">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-0.5">Critical Hotspots</span>
                        <span className="text-xl font-mono font-black text-rose-500">
                          {scans.filter(s => s.quality === 'Unsafe' || s.quality === 'heavy').length}
                        </span>
                      </div>
                      <div className="bg-[#090d16] border border-[#1e293b] p-4 rounded-2xl text-center">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-0.5">Pure Centers</span>
                        <span className="text-xl font-mono font-black text-green-500">
                          {scans.filter(s => s.quality === 'Safe' || s.quality === 'pure').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedMapScan ? (
                    <div className="bg-[#090d16] border border-[#1e293b] p-4 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">{selectedMapScan.oil_type}</h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${getPurityTier(selectedMapScan).color}`}>
                          {getPurityTier(selectedMapScan).label}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400 font-medium">
                          <span className="font-black text-white block text-[10px] uppercase mb-0.5">District / Center</span>
                          {getDistrictName(selectedMapScan)}
                        </p>
                        <p className="text-slate-400 font-medium">
                          <span className="font-black text-white block text-[10px] uppercase mb-0.5">Reported Purity</span>
                          <span className="font-mono font-extrabold text-slate-200">{selectedMapScan.purity ? `${selectedMapScan.purity}%` : '—'}</span>
                        </p>
                        <p className="text-slate-400 font-medium">
                          <span className="font-black text-white block text-[10px] uppercase mb-0.5">Diagnostic Timestamp</span>
                          <span className="font-mono font-semibold text-slate-200">
                            {selectedMapScan.timestamp ? new Date(selectedMapScan.timestamp).toLocaleString() : '—'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedScan(selectedMapScan);
                          setActiveTab('scans');
                        }}
                        className="w-full btn-primary text-[10px] uppercase font-black tracking-wider py-2.5 text-center mt-2"
                      >
                        Inspect Telemetry &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#090d16]/50 border border-[#1e293b] p-6 rounded-2xl text-center text-xs text-slate-500 flex flex-col items-center justify-center py-10">
                      <MapPin size={22} className="text-slate-600 mb-2" />
                      <span>Select any map marker to see diagnostic summary.</span>
                    </div>
                  )}
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-[11px] text-slate-400 leading-relaxed mt-4">
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block mb-0.5">Instruction Tip</span>
                  Click on map markers to lock coordinates and inspect raw details of oil scans instantly.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOURISHRELIEF */}
        {activeTab === 'nourish' && (
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Embed standalone NourishRelief in Admin Role */}
            <div className="flex-1 bg-slate-50 rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4 text-slate-900">
              <NourishReliefApp forcedRole="admin" />
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="flex-1 flex flex-col gap-6 max-w-xl">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Profile</h1>
              <p className="text-xs text-slate-500 mt-1">Credentials and identity parameters of the active account session.</p>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center border-2 border-[#1e293b] shadow-lg shadow-amber-500/10 shrink-0">
                  <User size={30} className="text-black font-extrabold" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">{profile?.name || 'Administrator'}</h3>
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-0.5">Control Staff</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#1e293b]/60">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Staff Email</span>
                    <span className="font-semibold text-slate-200">{profile?.email || 'admin@pureoil.gov.in'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">System Role</span>
                    <span className="font-semibold text-slate-200 capitalize">{profile?.role || 'admin'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">State Node</span>
                    <span className="font-semibold text-slate-200">{profile?.state || 'Gujarat'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Verification Clearance</span>
                    <span className="font-black text-green-500 uppercase flex items-center gap-1">
                      <ShieldCheck size={14} />
                      <span>Level 3 (Command)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#1e293b]/60 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                >
                  <LogOut size={14} />
                  <span>Terminate Session</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
