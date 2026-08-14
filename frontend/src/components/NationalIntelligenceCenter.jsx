import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Building, Search, Filter, 
  MapPin, Clock, FileText, ChevronRight, Download, Share2, Award, 
  RefreshCw, CheckCircle2, AlertCircle, Sparkles, Compass, Layers, 
  Activity, Zap, Eye, Phone, ArrowUpRight, Globe, Lock, Unlock, X, BarChart2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;

const createDivIcon = (color, isPulsing = false) => {
  return new L.DivIcon({
    className: isPulsing ? 'custom-pulsing-marker-wrapper' : 'custom-marker-wrapper',
    html: isPulsing ? `
      <div style="position: relative;">
        <div style="background-color: ${color}; width: 20px; height: 20px; display: block; left: -10px; top: -10px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 12px ${color}; z-index: 2;"></div>
        <div class="pulse-ring" style="position: absolute; top: -22px; left: -22px; width: 44px; height: 44px; border-radius: 50%; background-color: ${color}40; pointer-events: none; z-index: 1;"></div>
      </div>
    ` : `
      <div style="background-color: ${color}; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 8px ${color}80;"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Master Multi-Layer National Data Set
const NATIONAL_GIS_LAYERS = [
  { id: 'hotspots', label: 'Adulteration Hotspots', color: '#ef4444', count: 18 },
  { id: 'vendors', label: 'Trusted Vendors', color: '#10b981', count: 48 },
  { id: 'unsafe', label: 'Unsafe Vendors', color: '#f97316', count: 12 },
  { id: 'labs', label: 'Testing Laboratories', color: '#3b82f6', count: 24 },
  { id: 'raids', label: 'Government Raids', color: '#8b5cf6', count: 6 },
  { id: 'complaints', label: 'Consumer Complaints', color: '#ec4899', count: 34 },
  { id: 'recalls', label: 'Product Recalls', color: '#dc2626', count: 5 },
  { id: 'ngos', label: 'Food Donation NGOs', color: '#14b8a6', count: 16 }
];

const NATIONAL_MAP_MARKERS = [
  { id: 'm-1', name: 'Shree Ji Oil Depot', type: 'unsafe', category: 'Unsafe Vendor', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0255, lng: 72.5874, purity: 68.4, oil: 'Mustard Oil', risk: 'Critical', reports: 14, source: 'community' },
  { id: 'm-2', name: 'Vrindavan Edible Mills', type: 'hotspots', category: 'Adulteration Hotspot', city: 'Surat', state: 'Gujarat', lat: 21.2035, lng: 72.8422, purity: 71.8, oil: 'Cottonseed Oil', risk: 'Critical', reports: 9, source: 'community' },
  { id: 'm-3', name: 'Mahalaxmi Enterprise', type: 'vendors', category: 'Trusted Vendor', city: 'Vadodara', state: 'Gujarat', lat: 22.3100, lng: 73.1700, purity: 96.2, oil: 'Sunflower Oil', risk: 'Low', reports: 0, source: 'public' },
  { id: 'm-4', name: 'Mumbai Central Wholesalers', type: 'unsafe', category: 'Unsafe Vendor', city: 'Mumbai', state: 'Maharashtra', lat: 18.9485, lng: 72.8345, purity: 65.0, oil: 'Mustard Oil', risk: 'Critical', reports: 22, source: 'community' },
  { id: 'm-5', name: 'Chandni Chowk Edible Hub', type: 'hotspots', category: 'Adulteration Hotspot', city: 'Delhi', state: 'Delhi', lat: 28.6505, lng: 77.2300, purity: 69.5, oil: 'Mustard Oil', risk: 'Critical', reports: 18, source: 'community' },
  { id: 'm-6', name: 'NABL Central Food Testing Lab', type: 'labs', category: 'Testing Laboratory', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0338, lng: 72.5250, purity: 100, oil: 'All Oils', risk: 'Safe', reports: 0, source: 'public' },
  { id: 'm-7', name: 'FSSAI Regional Inspection Raid', type: 'raids', category: 'Government Raid', city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, purity: 58.0, oil: 'Palm Oil', risk: 'High', reports: 12, source: 'public' },
  { id: 'm-8', name: 'Akshaya Patra Foundation NGO', type: 'ngos', category: 'Food NGO', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, purity: 99.0, oil: 'N/A', risk: 'Safe', reports: 0, source: 'public' }
];

const STATE_RANKINGS = [
  { state: 'Kerala', avgPurity: 96.4, trustedVendors: 84, unsafeVendors: 2, complaints: 14, labs: 12, riskScore: 'Low (12/100)', rank: 1 },
  { state: 'Tamil Nadu', avgPurity: 94.8, trustedVendors: 92, unsafeVendors: 4, complaints: 28, labs: 16, riskScore: 'Low (18/100)', rank: 2 },
  { state: 'Karnataka', avgPurity: 93.5, trustedVendors: 78, unsafeVendors: 6, complaints: 35, labs: 14, riskScore: 'Low (22/100)', rank: 3 },
  { state: 'Gujarat', avgPurity: 91.8, trustedVendors: 48, unsafeVendors: 12, complaints: 42, labs: 10, riskScore: 'Medium (38/100)', rank: 4 },
  { state: 'Maharashtra', avgPurity: 89.2, trustedVendors: 64, unsafeVendors: 18, complaints: 65, labs: 18, riskScore: 'High (52/100)', rank: 5 },
  { state: 'Delhi (NCR)', avgPurity: 86.5, trustedVendors: 35, unsafeVendors: 24, complaints: 88, labs: 8, riskScore: 'Critical (68/100)', rank: 6 }
];

const GOVERNMENT_RECALLS = [
  { id: 'rec-1', brand: 'Sunrise Mustard Oil', batch: 'SM-2026-08', reason: 'Argemone seed oil contamination (31.6%)', severity: 'CRITICAL', date: '2026-07-02', states: ['Gujarat', 'Rajasthan', 'Madhya Pradesh'] },
  { id: 'rec-2', brand: 'Golden Sun Sunflower Oil', batch: 'GS-8842', reason: 'Unrefined mineral oil blending', severity: 'HIGH', date: '2026-06-30', states: ['Maharashtra', 'Goa'] }
];

export default function NationalIntelligenceCenter() {
  const { t } = useTranslation();
  // Map Controls
  const [activeLayers, setActiveLayers] = useState(['hotspots', 'vendors', 'unsafe', 'labs', 'raids']);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('This Week');
  const [mapCenter, setMapCenter] = useState([22.9734, 78.6569]);
  const [mapZoom, setMapZoom] = useState(5);

  // Selected Detail Modals
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedDistrictModal, setSelectedDistrictModal] = useState(null);

  // Toggle Map Layer
  const toggleLayer = (layerId) => {
    if (activeLayers.includes(layerId)) {
      setActiveLayers(activeLayers.filter(l => l !== layerId));
    } else {
      setActiveLayers([...activeLayers, layerId]);
    }
  };

  // Filtered Map Markers based on Active Layers & Search
  const visibleMarkers = useMemo(() => {
    return NATIONAL_MAP_MARKERS.filter(marker => {
      const layerActive = activeLayers.includes(marker.type);
      if (!layerActive) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          marker.name.toLowerCase().includes(query) ||
          marker.city.toLowerCase().includes(query) ||
          marker.state.toLowerCase().includes(query) ||
          marker.oil.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeLayers, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. HERO COMMAND CENTER BANNER & LIVE STATUS */}
      {/* ========================================================================= */}
      <div className="card p-6 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#d4af37]/10 relative overflow-hidden shadow-glow-gold">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">24x7 Live Command Center</span>
              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-400">Updated 10 seconds ago</span>
            </div>

            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              🇮🇳 India Food Safety Intelligence Network (IFSIN)
            </h1>

            <p className="text-xs text-gray-300 mt-1">
              Live AI telemetry monitoring 28 States, 8 Union Territories, and 742 Districts across India.
            </p>

            {/* Public vs Community Data Architecture Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Globe size={14} />
                🌍 Public Govt Data (FSSAI / NABL Verified)
              </span>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Lock size={14} />
                🔒 Community Telemetry (Citizen Spectrometer Scans)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap md:flex-col gap-2">
            <button onClick={() => alert("National Intelligence PDF Report generated!")} className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2">
              <Download size={14} /> Export PDF Report
            </button>
            <button onClick={() => alert("Dashboard shared to clipboard!")} className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2">
              <Share2 size={14} /> Share Intelligence
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TODAY'S NATIONAL TELEMETRY GRID (8 METRICS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 rounded-2xl border border-[var(--border-color)] text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Oil Tests Today</p>
          <p className="text-2xl font-black text-white mt-1">1,248</p>
          <span className="text-[10px] text-emerald-400 font-semibold">⬆ +8% from yesterday</span>
        </div>

        <div className="card p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-center">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Unsafe Samples</p>
          <p className="text-2xl font-black text-red-400 mt-1">118</p>
          <span className="text-[10px] text-red-400 font-semibold">⚠️ 9.4% Adulteration Rate</span>
        </div>

        <div className="card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified Vendors</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">48</p>
          <span className="text-[10px] text-emerald-400 font-semibold">✓ 100% Passed Audits</span>
        </div>

        <div className="card p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Active Raids & Recalls</p>
          <p className="text-2xl font-black text-amber-400 mt-1">11</p>
          <span className="text-[10px] text-amber-400 font-semibold">🚨 FSSAI Enforcement</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MULTI-LAYER GIS COMMAND CENTER MAP */}
      {/* ========================================================================= */}
      <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Compass className="text-[#d4af37]" size={20} />
              Multi-Layer National GIS Intelligence Map
            </h2>
            <p className="text-xs text-gray-400">Toggle layers to visualize hotspots, raids, verified labs, and recall zones.</p>
          </div>

          {/* Global Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Search vendor, city, district, brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-white rounded-xl py-2.5 pl-9 pr-3 outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Multi-Layer Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {NATIONAL_GIS_LAYERS.map(layer => {
            const isSelected = activeLayers.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-gray-800 text-white border-white shadow-md'
                    : 'bg-[var(--bg-elevated)] text-gray-400 border-[var(--border-color)] opacity-60 hover:opacity-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layer.color }} />
                {layer.label} ({layer.count})
              </button>
            );
          })}
        </div>

        {/* GIS Leaflet Map Container */}
        <div className="h-[28rem] w-full border border-[var(--border-color)] rounded-2xl overflow-hidden relative z-0">
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="w-full h-full" zoomControl={false}>
            <TileLayer
              url={document.documentElement.classList.contains('dark')
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              }
              attribution='&copy; ESRI / CartoDB / FSSAI'
            />
            <ChangeMapView center={mapCenter} zoom={mapZoom} />

            {visibleMarkers.map(m => {
              const layerObj = NATIONAL_GIS_LAYERS.find(l => l.id === m.type);
              const color = layerObj ? layerObj.color : '#ef4444';
              const isPulsing = m.risk === 'Critical';

              return (
                <Marker key={m.id} position={[m.lat, m.lng]} icon={createDivIcon(color, isPulsing)}>
                  <Popup>
                    <div className="p-2 space-y-1 text-xs text-black">
                      <span className="font-bold uppercase tracking-wider text-[10px] bg-gray-200 px-1.5 py-0.5 rounded">{m.category}</span>
                      <h4 className="font-bold text-sm">{m.name}</h4>
                      <p>{m.city}, {m.state}</p>
                      <p>Oil: <strong>{m.oil}</strong> | Purity: <strong>{m.purity}%</strong></p>
                      <button onClick={() => setSelectedMarker(m)} className="mt-2 text-[10px] bg-black text-white px-3 py-1 rounded font-bold w-full">
                        Inspect Profile →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. AI EMERGING RISK PREDICTION & RECALL CENTER */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* AI Emerging Risk Prediction */}
        <div className="card p-5 rounded-3xl border border-[#d4af37]/40 space-y-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Sparkles className="text-[#d4af37]" size={18} />
            AI Predicted Emerging Hotspots
          </h3>
          
          <div className="space-y-3 text-xs">
            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">North Ahmedabad Market Zone</span>
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">91% Probability</span>
              </div>
              <p className="text-gray-300">Predictive surge in mustard oil adulteration based on 14 low-purity scans logged within 3km.</p>
            </div>

            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-red-400">East Delhi Wholesale Hub</span>
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">87% Probability</span>
              </div>
              <p className="text-gray-300">Synthetic dyes detected in 4 consecutive community spectrometer readings.</p>
            </div>
          </div>
        </div>

        {/* Government Recall Center */}
        <div className="card p-5 rounded-3xl border border-red-500/40 space-y-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <ShieldAlert className="text-red-400" size={18} />
            Government Food Recall Advisories
          </h3>

          <div className="space-y-3 text-xs">
            {GOVERNMENT_RECALLS.map(rec => (
              <div key={rec.id} className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">{rec.brand}</h4>
                  <span className="bg-red-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">{rec.severity}</span>
                </div>
                <p className="text-red-300 text-[11px] font-semibold">{rec.reason}</p>
                <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                  <span>Batch: {rec.batch}</span>
                  <span>States: {Array.isArray(rec.states) ? rec.states.join(', ') : (rec.states || 'Pan-India')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. STATE PERFORMANCE RANKING TABLE */}
      {/* ========================================================================= */}
      <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BarChart2 className="text-[#d4af37]" size={18} />
              Indian State Food Safety Rankings
            </h3>
            <p className="text-xs text-gray-400">Ranked by average purity, verified vendor density, and compliance index.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-gray-400 uppercase text-[10px]">
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3">Avg Purity</th>
                <th className="py-2 px-3">Trusted Vendors</th>
                <th className="py-2 px-3">Unsafe Vendors</th>
                <th className="py-2 px-3">Risk Index</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {STATE_RANKINGS.map(st => (
                <tr key={st.state} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-elevated)]">
                  <td className="py-3 px-3 font-bold text-[#d4af37]">#{st.rank}</td>
                  <td className="py-3 px-3 font-bold text-white">{st.state}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{st.avgPurity}%</td>
                  <td className="py-3 px-3 text-gray-300">{st.trustedVendors}</td>
                  <td className="py-3 px-3 text-red-400">{st.unsafeVendors}</td>
                  <td className="py-3 px-3 font-semibold text-gray-300">{st.riskScore}</td>
                  <td className="py-3 px-3">
                    <button 
                      onClick={() => setSelectedDistrictModal(st.state)} 
                      className="text-[11px] text-[#d4af37] font-bold hover:underline flex items-center gap-1"
                    >
                      Inspect <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VENDOR DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedMarker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] max-w-md w-full space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-white px-2 py-0.5 rounded">{selectedMarker.category}</span>
              <button onClick={() => setSelectedMarker(null)} className="p-2 rounded-xl text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <h3 className="text-lg font-black text-white">{selectedMarker.name}</h3>
            <p className="text-xs text-gray-400">{selectedMarker.city}, {selectedMarker.state}</p>
            <div className="grid grid-cols-2 gap-2 text-xs bg-[var(--bg-elevated)] p-3 rounded-2xl">
              <div><p className="text-gray-400">Purity Score</p><p className="font-bold text-emerald-400 text-lg">{selectedMarker.purity}%</p></div>
              <div><p className="text-gray-400">Oil Type</p><p className="font-bold text-white text-sm">{selectedMarker.oil}</p></div>
            </div>
            <button onClick={() => setSelectedMarker(null)} className="btn-primary w-full py-2.5 text-xs">Close Profile</button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE / DISTRICT INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedDistrictModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] max-w-lg w-full space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-black text-white">{selectedDistrictModal} Food Safety Intelligence</h3>
              <button onClick={() => setSelectedDistrictModal(null)} className="p-2 rounded-xl text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-300">Detailed compliance telemetry and food safety audit records for {selectedDistrictModal}.</p>
            <button onClick={() => setSelectedDistrictModal(null)} className="btn-primary w-full py-2.5 text-xs">Close Inspection</button>
          </div>
        </div>
      )}

    </div>
  );
}
