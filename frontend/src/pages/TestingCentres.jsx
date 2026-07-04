import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ArrowLeft, Building, Search, MapPin, Navigation, Phone, Globe, 
  Mail, Clock, Star, ShieldCheck, Calendar, Filter, Share2, CheckCircle2, X, RefreshCw,
  Car, Footprints, ExternalLink, FileText, Info, Award, Check, Zap, AlertCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { 
  REAL_PAN_INDIA_LABORATORIES, 
  ALL_INDIAN_STATES, 
  calculateDistanceKm, 
  getNearestFallbackLabs 
} from '../services/realTestingCentresService';
import SampleGuideModal from '../components/SampleGuideModal';

delete L.Icon.Default.prototype._getIconUrl;

// ── Custom Leaflet Map Markers for Laboratories ONLY (NO Hotspots) ────────────
const createLabIcon = (color, emoji) => new L.DivIcon({
  className: 'custom-lab-marker',
  html: `<div style="
    background: ${color};
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 0 14px ${color}90;
    color: #ffffff;
    font-size: 15px;
  ">${emoji}</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const govtMarkerIcon = createLabIcon('linear-gradient(135deg, #2563eb, #1d4ed8)', '🏛️');
const fssaiMarkerIcon = createLabIcon('linear-gradient(135deg, #16a34a, #15803d)', '🟢');
const pvtMarkerIcon = createLabIcon('linear-gradient(135deg, #9333ea, #7e22ce)', '🔬');

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function TestingCentres() {
  const navigate = useNavigate();

  // ── User Location GPS State ────────────────────────────────────────────────
  const [userCoords, setUserCoords] = useState({ lat: 23.0225, lng: 72.5714 }); // Default Ahmedabad
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── Search & Filter State ──────────────────────────────────────────────────
  const [selectedState, setSelectedState] = useState('Gujarat');
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
        (err) => console.log('GPS Default to Ahmedabad:', err)
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

  // Radius Fallback for Empty State (25km / 50km / 100km)
  const fallbackLabs = useMemo(() => {
    if (filteredLabs.length === 0) {
      return getNearestFallbackLabs(userCoords.lat, userCoords.lng, 100);
    }
    return [];
  }, [filteredLabs, userCoords]);

  // Map Center calculation
  const mapCenter = useMemo(() => {
    if (filteredLabs.length > 0) {
      return [filteredLabs[0].lat, filteredLabs[0].lng];
    }
    return [userCoords.lat, userCoords.lng];
  }, [filteredLabs, userCoords]);

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-28">
      
      {/* ── TOP HEADER ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/home')} 
              className="p-2 rounded-xl bg-[var(--bg-elevated)] text-gray-400 hover:text-white border border-[var(--border-color)]"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">NATIONWIDE ACCREDITED DIRECTORY</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">✔ Official FSSAI & NABL</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
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
              className="px-3.5 py-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500/20"
            >
              <Navigation size={15} className={gpsLoading ? "animate-spin" : ""} /> Locate Me
            </button>
          </div>
        </div>
      </div>

      {/* ── LOCATION SELECTOR BAR (PAN-INDIA STATE, DISTRICT, CITY, PINCODE) ───── */}
      <div className="px-5 pt-5 max-w-5xl mx-auto w-full space-y-4">
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3 shadow-lg">
          
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
              <MapPin size={15} /> Select Location (All Indian States & UTs)
            </span>
            <span className="text-[10px] text-gray-400 font-mono font-bold">
              Showing {filteredLabs.length} Accredited Labs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-bold">
            
            {/* State Selector */}
            <div>
              <label className="text-gray-400 block mb-1 text-[10px] uppercase">State / Territory</label>
              <select
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value);
                  setSelectedCity('All');
                }}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-white outline-none font-bold"
              >
                <option value="All" className="bg-[#18181b]">All India (Nationwide)</option>
                {Object.keys(ALL_INDIAN_STATES).map(st => (
                  <option key={st} value={st} className="bg-[#18181b]">{st}</option>
                ))}
              </select>
            </div>

            {/* City Selector */}
            <div>
              <label className="text-gray-400 block mb-1 text-[10px] uppercase">District / City</label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-white outline-none font-bold"
              >
                <option value="All" className="bg-[#18181b]">All Cities</option>
                {(ALL_INDIAN_STATES[selectedState] || []).map(c => (
                  <option key={c} value={c} className="bg-[#18181b]">{c}</option>
                ))}
              </select>
            </div>

            {/* PIN Code Search */}
            <div>
              <label className="text-gray-400 block mb-1 text-[10px] uppercase">PIN Code</label>
              <input
                type="text"
                placeholder="e.g. 380009..."
                value={pincodeQuery}
                onChange={e => setPincodeQuery(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-white outline-none font-mono"
              />
            </div>

            {/* Lab Name Search */}
            <div>
              <label className="text-gray-400 block mb-1 text-[10px] uppercase">Search Lab or Test</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="e.g. FDL, Oil, Milk..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 pl-9 rounded-xl text-white outline-none"
                />
              </div>
            </div>

          </div>

          {/* Category Filter Chips & View Mode Toggle */}
          <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-[var(--border-color)]">
            
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
                      ? 'bg-[#d4af37] text-black font-black border-[#d4af37] shadow-glow-gold' 
                      : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)] hover:border-gray-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-bold">
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-3 py-1 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#d4af37] text-black font-black' : 'text-gray-400'}`}
              >
                📋 List
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                className={`px-3 py-1 rounded-lg transition-all ${viewMode === 'map' ? 'bg-[#d4af37] text-black font-black' : 'text-gray-400'}`}
              >
                🗺️ GIS Map
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
            <div className="h-[480px] w-full rounded-2xl overflow-hidden z-10">
              <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                <ChangeMapView center={mapCenter} zoom={11} />
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
                    <Popup>
                      <div className="p-1 max-w-[240px] text-xs space-y-2">
                        <img src={lab.photo} alt={lab.name} className="w-full h-24 object-cover rounded-lg" />
                        <div>
                          <span className="text-[9px] font-black text-amber-500 uppercase">{lab.fssaiBadge}</span>
                          <h4 className="font-black text-slate-900 text-sm leading-snug">{lab.name}</h4>
                          <p className="text-[10px] text-slate-600 mt-0.5">{lab.address}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                          <span>📍 {lab.distance} km away</span>
                          <span className="text-emerald-600">★ {lab.rating}</span>
                        </div>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full text-center py-1.5 bg-[#d4af37] text-black font-black rounded-lg text-[10px] uppercase"
                        >
                          🚗 Get Directions →
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
            
            {/* EMPTY STATE RADIUS FALLBACK ENGINE (25km / 50km / 100km) */}
            {filteredLabs.length === 0 && (
              <div className="card p-8 rounded-3xl border border-amber-500/40 bg-amber-500/10 text-center space-y-4 shadow-xl">
                <AlertCircle size={40} className="text-amber-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-black text-white">No accredited food testing laboratory was found in "{selectedCity !== 'All' ? selectedCity : selectedState}".</h3>
                  <p className="text-xs text-gray-300 mt-1">Showing nearest FSSAI & NABL accredited laboratories within <span className="text-emerald-400 font-bold">100 km radius</span>:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
                  {fallbackLabs.map(lab => (
                    <div key={lab.id} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                      <span className="text-[9px] font-black text-amber-400 uppercase">Nearest Alternative ({lab.distance} km away)</span>
                      <h4 className="font-black text-white text-sm">{lab.name}</h4>
                      <p className="text-[10px] text-gray-400">{lab.address}</p>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary py-2 text-center text-xs font-black uppercase block"
                      >
                        🚗 Get Directions ({lab.distance} km) →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REAL LABORATORY CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLabs.map(lab => (
                <div key={lab.id} className="card p-5 rounded-3xl border border-[var(--border-color)] hover:border-[#d4af37]/60 transition-all space-y-4 shadow-lg flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    {/* Header Photo & Badges */}
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden">
                      <img src={lab.photo} alt={lab.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Award size={10} /> {lab.fssaiBadge}
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-500 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full">
                        ★ {lab.rating} ({lab.reviewsCount})
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base font-black text-white leading-snug">{lab.name}</h3>
                        <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">📍 {lab.distance} km</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={12} className="shrink-0 text-amber-400" /> {lab.address}
                      </p>
                    </div>

                    {/* Accreditations Row */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      {lab.isFssaiApproved && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">✔ FSSAI Recognized</span>}
                      {lab.nablAccredited && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">✔ NABL ISO/IEC 17025</span>}
                      {lab.type === 'Government' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">🏛️ Govt Laboratory</span>}
                    </div>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1 text-[10px] text-gray-300">
                      {lab.services.map(s => (
                        <span key={s} className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
                          • {s}
                        </span>
                      ))}
                    </div>

                    {/* Info Bar */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400 bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                      <div>
                        <span className="text-gray-500 block">Processing Time</span>
                        <span className="font-bold text-white">{lab.avgProcessingTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Est. Testing Fee</span>
                        <span className="font-bold text-amber-400">{lab.testCost}</span>
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
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary flex-1 py-2.5 text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-glow-gold"
                    >
                      <Navigation size={14} /> Get Directions →
                    </a>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* ── LABORATORY DETAILS MODAL ─────────────────────────────────────────── */}
      {selectedLabDetail && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md animate-fade-in">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-2xl w-full space-y-5 my-auto max-h-[90vh] overflow-y-auto text-xs">
            
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider block">{selectedLabDetail.fssaiBadge}</span>
                <h3 className="text-xl font-black text-white mt-0.5">{selectedLabDetail.name}</h3>
              </div>
              <button onClick={() => setSelectedLabDetail(null)} className="p-2 rounded-xl text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="relative h-52 w-full rounded-2xl overflow-hidden">
              <img src={selectedLabDetail.photo} alt={selectedLabDetail.name} className="w-full h-full object-cover" />
            </div>

            <p className="text-gray-300 text-xs leading-relaxed">{selectedLabDetail.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Full Address</span>
                <p className="text-white font-bold">{selectedLabDetail.address}</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Working Hours & Phone</span>
                <p className="text-white font-bold">{selectedLabDetail.workingHours}</p>
                <p className="text-amber-400 font-mono font-bold">{selectedLabDetail.phone}</p>
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

            <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30 text-amber-300 space-y-1">
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
                📅 Schedule Sample Visit
              </button>

              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLabDetail.lat},${selectedLabDetail.lng}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex-1 py-3 text-xs font-black uppercase text-center flex items-center justify-center gap-1.5"
              >
                <Navigation size={15} /> Open Navigation →
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
                <h3 className="text-lg font-black text-white">{bookingLab.name}</h3>
              </div>
              <button onClick={() => setIsBookingOpen(false)} className="p-2 text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('✅ Visit Scheduled! Laboratory team will call you to confirm sample pickup.'); setIsBookingOpen(false); }} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Your Full Name</label>
                <input type="text" required placeholder="e.g. Harshil Patel" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-white outline-none font-bold" />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Mobile Number</label>
                <input type="tel" required placeholder="+91 98765 43210" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-white outline-none font-bold font-mono" />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Sample Type</label>
                <select className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-white outline-none font-bold">
                  <option value="Mustard Oil" className="bg-[#18181b]">Mustard / Edible Oil</option>
                  <option value="Ghee" className="bg-[#18181b]">Desi Ghee / Butter</option>
                  <option value="Milk" className="bg-[#18181b]">Fresh Milk / Dairy</option>
                  <option value="Spices" className="bg-[#18181b]">Spices / Turmeric / Chilli</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Preferred Date</label>
                <input type="date" required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl text-white outline-none font-bold" />
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
