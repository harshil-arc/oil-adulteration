import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ArrowLeft, Building, Search, MapPin, Navigation, Phone, 
  Clock, ShieldCheck, X, FileText, Info, Award, AlertCircle, CheckCircle2,
  ExternalLink, Layers
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { 
  REAL_PAN_INDIA_LABORATORIES, 
  ALL_INDIAN_STATES, 
  calculateDistanceKm, 
  getNearestFallbackLabs,
  getDirectionsUrl
} from '../services/realTestingCentresService';
import SampleGuideModal from '../components/SampleGuideModal';

delete L.Icon.Default.prototype._getIconUrl;

// ── Custom Leaflet Map Markers for Laboratories ──────────────────────────────
const createLabIcon = (color, emoji) => new L.DivIcon({
  className: 'custom-lab-marker',
  html: `<div style="
    background: ${color};
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    color: #ffffff;
    font-size: 16px;
  ">${emoji}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const govtMarkerIcon = createLabIcon('linear-gradient(135deg, #2563eb, #1d4ed8)', '🏛️');
const fssaiMarkerIcon = createLabIcon('linear-gradient(135deg, #16a34a, #15803d)', '🟢');
const pvtMarkerIcon = createLabIcon('linear-gradient(135deg, #9333ea, #7e22ce)', '🔬');

// Component to dynamically fit map bounds to all visible markers across India
function FitMapBounds({ labs, userCoords }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate Leaflet canvas size to handle tab switching cleanly
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (labs && labs.length > 0) {
        const bounds = L.latLngBounds(labs.map(l => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } else if (userCoords?.lat && userCoords?.lng) {
        map.setView([userCoords.lat, userCoords.lng], 6);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [labs, userCoords, map]);

  return null;
}

export default function TestingCentres() {
  const navigate = useNavigate();

  // ── User Location GPS State ────────────────────────────────────────────────
  const [userCoords, setUserCoords] = useState({ lat: 20.5937, lng: 78.9629 }); // Default India Center
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── Search & Filter State ──────────────────────────────────────────────────
  // Default to 'All' so that GIS map shows ALL laboratories nationwide on load
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [pincodeQuery, setPincodeQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Govt', 'Private', 'Oil', 'Milk', 'Water', 'Pickup', 'Nearest'
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // ── Modals State ───────────────────────────────────────────────────────────
  const [selectedLabDetail, setSelectedLabDetail] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingLab, setBookingLab] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Auto-detect user GPS on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.log('GPS Default to India:', err)
      );
    }
  }, []);

  const handleLocateMe = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsLoading(false);
          setActiveFilter('Nearest');
        },
        () => setGpsLoading(false)
      );
    } else {
      setGpsLoading(false);
    }
  };

  // ── FILTERED REAL LABORATORIES LIST ──────────────────────────────────────────
  const filteredLabs = useMemo(() => {
    let list = REAL_PAN_INDIA_LABORATORIES.map(lab => ({
      ...lab,
      distance: calculateDistanceKm(userCoords.lat, userCoords.lng, lab.lat, lab.lng)
    }));

    // Filter by State
    if (selectedState && selectedState !== 'All') {
      list = list.filter(l => l.state.toLowerCase() === selectedState.toLowerCase());
    }

    // Filter by City
    if (selectedCity && selectedCity !== 'All') {
      list = list.filter(l => l.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Filter by PIN Code
    if (pincodeQuery.trim()) {
      list = list.filter(l => l.pinCode.includes(pincodeQuery.trim()));
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => 
        l.name.toLowerCase().includes(q) || 
        l.city.toLowerCase().includes(q) || 
        l.address.toLowerCase().includes(q) ||
        l.services.some(s => s.toLowerCase().includes(q))
      );
    }

    // Category Filter Chips
    if (activeFilter === 'Govt') {
      list = list.filter(l => l.type === 'Government');
    } else if (activeFilter === 'Private') {
      list = list.filter(l => l.type === 'Private');
    } else if (activeFilter === 'Oil') {
      list = list.filter(l => l.services.includes('Oil Testing'));
    } else if (activeFilter === 'Milk') {
      list = list.filter(l => l.services.includes('Milk Testing'));
    } else if (activeFilter === 'Water') {
      list = list.filter(l => l.services.includes('Water Testing'));
    } else if (activeFilter === 'Pickup') {
      list = list.filter(l => l.homeSamplePickup);
    } else if (activeFilter === 'Nearest') {
      list.sort((a, b) => a.distance - b.distance);
    }

    return list;
  }, [selectedState, selectedCity, pincodeQuery, searchQuery, activeFilter, userCoords]);

  // Radius Fallback for Empty State
  const fallbackLabs = useMemo(() => {
    if (filteredLabs.length === 0) {
      return getNearestFallbackLabs(userCoords.lat, userCoords.lng, 100);
    }
    return [];
  }, [filteredLabs, userCoords]);

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-28">
      
      {/* ── TOP HEADER ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/home')} 
              className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">ACCREDITED DIRECTORY</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">✔ {REAL_PAN_INDIA_LABORATORIES.length} Verified FSSAI & NABL Labs</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <Building className="text-[#d4af37]" size={22} /> Food Testing Laboratories
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 text-xs font-black flex items-center gap-1.5 hover:bg-[#d4af37]/20 shadow-sm"
            >
              <FileText size={15} /> Sample Guide
            </button>
            <button 
              onClick={handleLocateMe}
              disabled={gpsLoading}
              className="px-3.5 py-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500/20"
            >
              <Navigation size={15} className={gpsLoading ? "animate-spin" : ""} /> Locate Me
            </button>
          </div>
        </div>
      </div>

      {/* ── LOCATION SELECTOR BAR (PAN-INDIA STATE, DISTRICT, CITY, PINCODE) ───── */}
      <div className="px-5 pt-5 max-w-5xl mx-auto w-full space-y-4">
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4 shadow-lg">
          
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
              <MapPin size={15} /> Filter Location (All Indian States & UTs)
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold">
              Showing {filteredLabs.length} of {REAL_PAN_INDIA_LABORATORIES.length} Accredited Labs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-bold">
            
            {/* State Selector */}
            <div>
              <label className="text-[var(--text-muted)] block mb-1 text-[10px] uppercase font-bold">State / Territory</label>
              <select
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value);
                  setSelectedCity('All');
                }}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-[var(--text-primary)] outline-none font-bold"
              >
                <option value="All" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All India (Nationwide)</option>
                {Object.keys(ALL_INDIAN_STATES).map(st => (
                  <option key={st} value={st} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{st}</option>
                ))}
              </select>
            </div>

            {/* City Selector */}
            <div>
              <label className="text-[var(--text-muted)] block mb-1 text-[10px] uppercase font-bold">District / City</label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-[var(--text-primary)] outline-none font-bold"
              >
                <option value="All" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All Cities</option>
                {(ALL_INDIAN_STATES[selectedState] || []).map(c => (
                  <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{c}</option>
                ))}
              </select>
            </div>

            {/* PIN Code Search */}
            <div>
              <label className="text-[var(--text-muted)] block mb-1 text-[10px] uppercase font-bold">PIN Code</label>
              <input
                type="text"
                placeholder="e.g. 380009..."
                value={pincodeQuery}
                onChange={e => setPincodeQuery(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-[var(--text-primary)] outline-none font-mono font-bold"
              />
            </div>

            {/* Lab Name Search */}
            <div>
              <label className="text-[var(--text-muted)] block mb-1 text-[10px] uppercase font-bold">Search Lab or Test</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                <input
                  type="text"
                  placeholder="e.g. FDL, Oil, Milk..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 pl-9 rounded-xl text-[var(--text-primary)] outline-none font-bold"
                />
              </div>
            </div>

          </div>

          {/* Category Filter Chips & View Mode Toggle */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-[var(--border-color)]">
            
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              {[
                { id: 'All', label: 'All Labs' },
                { id: 'Govt', label: '🏛️ Government' },
                { id: 'Private', label: '🔬 NABL Private' },
                { id: 'Oil', label: '🛢️ Oil Testing' },
                { id: 'Milk', label: '🥛 Milk Testing' },
                { id: 'Water', label: '💧 Water Testing' },
                { id: 'Pickup', label: '🚚 Home Pickup' },
                { id: 'Nearest', label: '📍 Nearest First' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] transition-all ${
                    activeFilter === f.id 
                      ? 'bg-[#d4af37] text-black font-black border-[#d4af37] shadow-sm' 
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#d4af37] text-black font-black' : 'text-[var(--text-muted)]'}`}
              >
                📋 List View
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'map' ? 'bg-[#d4af37] text-black font-black' : 'text-[var(--text-muted)]'}`}
              >
                🗺️ GIS Map ({filteredLabs.length})
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT: LIST OR MAP VIEW ────────────────────────────────────── */}
      <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
        
        {/* ── MAP VIEW ────────────────────────────────────────────────────────── */}
        {viewMode === 'map' && (
          <div className="card p-4 rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center mb-3 px-1 text-xs font-bold text-[#d4af37]">
              <span>🗺️ Interactive GIS Map showing {filteredLabs.length} laboratories</span>
              {selectedState !== 'All' && (
                <button 
                  onClick={() => { setSelectedState('All'); setSelectedCity('All'); }} 
                  className="text-[10px] text-blue-500 hover:underline"
                >
                  Show All Nationwide Labs
                </button>
              )}
            </div>

            <div className="h-[520px] w-full rounded-2xl overflow-hidden z-10 border border-[var(--border-color)]">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <FitMapBounds labs={filteredLabs} userCoords={userCoords} />
                <TileLayer 
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredLabs.map(lab => (
                  <Marker 
                    key={lab.id} 
                    position={[lab.lat, lab.lng]}
                    icon={lab.type === 'Government' ? govtMarkerIcon : (lab.isFssaiApproved ? fssaiMarkerIcon : pvtMarkerIcon)}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="p-2 min-w-[260px] text-xs space-y-2 font-sans">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">{lab.fssaiBadge}</span>
                          <span className="text-emerald-700 font-bold text-[10px]">★ {lab.rating}</span>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm leading-snug">{lab.name}</h4>
                          <p className="text-[11px] text-slate-600 mt-1 leading-tight">{lab.address}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 bg-slate-100 p-2 rounded-lg">
                          <span>📍 Distance: <strong>{lab.distance} km</strong></span>
                          <span className="text-blue-700 font-mono">{lab.testCost}</span>
                        </div>
                        <a 
                          href={getDirectionsUrl(lab, userCoords)}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full text-center py-2 bg-[#d4af37] text-black font-black rounded-xl text-[11px] uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
                        >
                          🚗 Navigate to Laboratory →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* ── LIST VIEW & EMPTY STATE RADIUS FALLBACK ─────────────────────────── */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            
            {/* EMPTY STATE RADIUS FALLBACK ENGINE */}
            {filteredLabs.length === 0 && (
              <div className="card p-8 rounded-3xl border border-amber-500/40 bg-amber-500/10 text-center space-y-4 shadow-xl">
                <AlertCircle size={40} className="text-amber-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">No accredited food testing laboratory found matching filters.</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Showing nearest FSSAI & NABL accredited laboratories within <span className="text-emerald-600 dark:text-emerald-400 font-bold">100 km radius</span>:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
                  {fallbackLabs.map(lab => (
                    <div key={lab.id} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">Nearest Alternative ({lab.distance} km)</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">★ {lab.rating}</span>
                      </div>
                      <h4 className="font-black text-[var(--text-primary)] text-sm leading-snug">{lab.name}</h4>
                      <p className="text-[11px] text-[var(--text-muted)] leading-tight">{lab.address}</p>
                      <a 
                        href={getDirectionsUrl(lab, userCoords)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 bg-[#d4af37] text-black font-black rounded-xl text-xs uppercase tracking-wider block text-center shadow-sm"
                      >
                        🚗 Navigate ({lab.distance} km) →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REAL LABORATORY CARDS GRID (NO IMAGES - CLEAN ALIGNED UI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLabs.map(lab => (
                <div 
                  key={lab.id} 
                  className="card p-5 rounded-3xl border border-[var(--border-color)] hover:border-[#d4af37]/60 transition-all space-y-4 shadow-md flex flex-col justify-between"
                >
                  
                  <div className="space-y-3">
                    
                    {/* Header Badges & Category Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        lab.type === 'Government' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                      }`}>
                        {lab.type === 'Government' ? '🏛️ Government Lab' : '🔬 NABL Private Lab'}
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        ★ {lab.rating} ({lab.reviewsCount})
                      </span>
                    </div>

                    {/* Lab Name & Address */}
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base font-black text-[var(--text-primary)] leading-snug">{lab.name}</h3>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0 whitespace-nowrap bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          📍 {lab.distance} km
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-2 flex items-start gap-1.5 leading-relaxed">
                        <MapPin size={14} className="shrink-0 text-amber-500 mt-0.5" /> 
                        <span>{lab.address}</span>
                      </p>
                    </div>

                    {/* Accreditations Row */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      {lab.isFssaiApproved && (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={11} /> FSSAI Recognized
                        </span>
                      )}
                      {lab.nablAccredited && (
                        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Award size={11} /> NABL ISO/IEC 17025
                        </span>
                      )}
                      {lab.homeSamplePickup && (
                        <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                          🚚 Home Pickup
                        </span>
                      )}
                    </div>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1 text-[10px] text-[var(--text-secondary)] pt-1">
                      {lab.services.map(s => (
                        <span key={s} className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-lg border border-[var(--border-color)] font-medium">
                          • {s}
                        </span>
                      ))}
                    </div>

                    {/* Info Bar */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                      <div>
                        <span className="text-[var(--text-muted)] block text-[9px] uppercase font-sans">Processing Time</span>
                        <span className="font-bold text-[var(--text-primary)]">{lab.avgProcessingTime}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block text-[9px] uppercase font-sans">Est. Testing Fee</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{lab.testCost}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
                    <button 
                      onClick={() => setSelectedLabDetail(lab)}
                      className="btn-secondary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Info size={14} /> Full Details
                    </button>

                    <a 
                      href={getDirectionsUrl(lab, userCoords)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary flex-1 py-2.5 text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-sm text-center"
                    >
                      <Navigation size={14} /> Navigate →
                    </a>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* ── LABORATORY DETAILS MODAL (CLEAN & ALIGNED WITHOUT IMAGES) ───────────── */}
      {selectedLabDetail && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md animate-fade-in">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-xl w-full space-y-5 my-auto max-h-[90vh] overflow-y-auto text-xs shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider block">{selectedLabDetail.fssaiBadge}</span>
                <h3 className="text-lg font-black text-[var(--text-primary)] mt-0.5 leading-snug">{selectedLabDetail.name}</h3>
              </div>
              <button onClick={() => setSelectedLabDetail(null)} className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>

            <p className="text-[var(--text-secondary)] text-xs leading-relaxed bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)]">
              {selectedLabDetail.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
                <span className="text-[var(--text-muted)] font-bold block text-[10px] uppercase">Full Address</span>
                <p className="text-[var(--text-primary)] font-bold">{selectedLabDetail.address}</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
                <span className="text-[var(--text-muted)] font-bold block text-[10px] uppercase">Working Hours & Phone</span>
                <p className="text-[var(--text-primary)] font-bold">{selectedLabDetail.workingHours}</p>
                <p className="text-amber-600 dark:text-amber-400 font-mono font-bold">{selectedLabDetail.phone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-black text-[#d4af37] text-xs uppercase tracking-wider block">Analytical Equipment Installed</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedLabDetail.equipmentAvailable.map(eq => (
                  <span key={eq} className="bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-2.5 py-1 rounded-xl text-[11px] font-bold">
                    ⚙️ {eq}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-1">
              <span className="font-bold text-[10px] uppercase tracking-wider block">Sample Submission Protocol</span>
              <p>{selectedLabDetail.sampleGuidelines}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => {
                  setBookingLab(selectedLabDetail);
                  setSelectedLabDetail(null);
                  setIsBookingOpen(true);
                }} 
                className="btn-secondary flex-1 py-3 text-xs font-bold"
              >
                📅 Schedule Visit
              </button>

              <a 
                href={getDirectionsUrl(selectedLabDetail, userCoords)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex-1 py-3 text-xs font-black uppercase text-center flex items-center justify-center gap-1.5"
              >
                <Navigation size={15} /> Navigate →
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ── BOOK SAMPLE VISIT MODAL ───────────────────────────────────────────── */}
      {isBookingOpen && bookingLab && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md animate-fade-in">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-md w-full space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase">Appointment Request</span>
                <h3 className="text-base font-black text-[var(--text-primary)] leading-snug mt-0.5">{bookingLab.name}</h3>
              </div>
              <button onClick={() => setIsBookingOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('✅ Visit Scheduled! Laboratory team will call you to confirm sample pickup.'); setIsBookingOpen(false); }} className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">Your Full Name</label>
                <input type="text" required placeholder="e.g. Harshil Patel" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-[var(--text-primary)] outline-none font-bold" />
              </div>

              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">Mobile Number</label>
                <input type="tel" required placeholder="+91 98765 43210" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-[var(--text-primary)] outline-none font-bold font-mono" />
              </div>

              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">Sample Type</label>
                <select className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-[var(--text-primary)] outline-none font-bold">
                  <option value="Mustard Oil" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Mustard / Edible Oil</option>
                  <option value="Ghee" className="bg-[var(--bg-card)] text-[var(--text-color)]">Desi Ghee / Butter</option>
                  <option value="Milk" className="bg-[var(--bg-card)] text-[var(--text-color)]">Fresh Milk / Dairy</option>
                  <option value="Spices" className="bg-[var(--bg-card)] text-[var(--text-color)]">Spices / Turmeric / Chilli</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-muted)] font-bold block mb-1">Preferred Date</label>
                <input type="date" required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-[var(--text-primary)] outline-none font-bold" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsBookingOpen(false)} className="btn-secondary flex-1 py-3 text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-3 text-xs font-black uppercase">
                  Confirm Visit →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SAMPLE SUBMISSION GUIDE MODAL ────────────────────────────────────── */}
      <SampleGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

    </div>
  );
}
