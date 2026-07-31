import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  AlertTriangle, ShieldAlert, ShieldCheck, Heart, MapPin, Search, 
  Filter, Phone, Navigation, Clock, Calendar, CheckCircle2, ChevronRight, 
  Truck, Building, Users, Activity, Sparkles, RefreshCw, Flame, X, 
  Compass, ArrowRight, LifeBuoy, FileText, Info, Award, Utensils, Package
} from 'lucide-react';
import { 
  EMERGENCY_CATEGORIES, 
  ACTIVE_EMERGENCIES, 
  VERIFIED_NGOS, 
  RELIEF_CAMPS, 
  COMMUNITY_KITCHENS, 
  GOVT_COLLECTION_CENTERS 
} from '../data/ngoDisasterDataset';
import { 
  fetchActiveEmergencies, 
  fetchNgosForEmergency, 
  fetchReliefCampsForEmergency, 
  fetchCommunityKitchensForEmergency, 
  fetchGovtCollectionCentersForEmergency, 
  getSmartAiRecommendation 
} from '../services/reliefCoordinationService';
import DonationWizardModal from '../components/DonationWizardModal';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Marker Icons for 6 Node Types
const createReliefMarkerIcon = (type) => {
  let color = '#ef4444'; // Red Disaster
  let symbol = '⚠️';

  if (type === 'NGO') {
    color = '#22c55e'; // Green Verified NGO
    symbol = '🏢';
  } else if (type === 'Relief Camp') {
    color = '#3b82f6'; // Blue Relief Camp
    symbol = '⛺';
  } else if (type === 'Community Kitchen') {
    color = '#f97316'; // Orange Community Kitchen
    symbol = '🍲';
  } else if (type === 'Government Collection Center') {
    color = '#a855f7'; // Purple Govt Center
    symbol = '🏛️';
  } else if (type === 'Medical Camp') {
    color = '#eab308'; // Yellow Medical Camp
    symbol = '⚕️';
  }

  return new L.DivIcon({
    className: 'custom-relief-marker',
    html: `<div style="
      background: ${color};
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      left: -14px;
      top: -28px;
      position: relative;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2.5px solid #ffffff;
      box-shadow: 0 0 14px ${color}80;
    ">
      <span style="transform: rotate(45deg); font-size: 12px;">${symbol}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
};

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 9, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function FoodReliefNetwork() {
  const navigate = useNavigate();

  // State Management
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState(ACTIVE_EMERGENCIES[0]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [donationWizardOpen, setDonationWizardOpen] = useState(false);
  const [donationTarget, setDonationTarget] = useState(null);

  // Map state
  const [mapCenter, setMapCenter] = useState([26.1445, 91.7362]); // Assam center

  // Filtered active emergencies
  const emergencies = useMemo(() => {
    return fetchActiveEmergencies(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  // Data for currently selected emergency
  const activeNgos = useMemo(() => {
    return fetchNgosForEmergency(selectedEmergency?.id);
  }, [selectedEmergency]);

  const activeCamps = useMemo(() => {
    return fetchReliefCampsForEmergency(selectedEmergency?.id);
  }, [selectedEmergency]);

  const activeKitchens = useMemo(() => {
    return fetchCommunityKitchensForEmergency(selectedEmergency?.id);
  }, [selectedEmergency]);

  const activeGovtCenters = useMemo(() => {
    return fetchGovtCollectionCentersForEmergency(selectedEmergency?.id);
  }, [selectedEmergency]);

  // Smart AI Recommendation
  const aiRec = useMemo(() => {
    return getSmartAiRecommendation(mapCenter[0], mapCenter[1]);
  }, [mapCenter]);

  // Aggregate Map Markers for active emergency
  const mapNodes = useMemo(() => {
    const nodes = [];
    if (selectedEmergency) {
      nodes.push({
        id: selectedEmergency.id,
        name: selectedEmergency.title,
        type: 'Disaster Location',
        latitude: selectedEmergency.latitude,
        longitude: selectedEmergency.longitude,
        status: selectedEmergency.status,
        details: `${selectedEmergency.affectedPopulation.toLocaleString()} people affected`
      });
    }

    activeNgos.forEach(n => nodes.push({ ...n, type: 'NGO' }));
    activeCamps.forEach(c => nodes.push({ ...c, type: 'Relief Camp' }));
    activeKitchens.forEach(k => nodes.push({ ...k, type: 'Community Kitchen' }));
    activeGovtCenters.forEach(g => nodes.push({ ...g, type: 'Government Collection Center' }));

    return nodes;
  }, [selectedEmergency, activeNgos, activeCamps, activeKitchens, activeGovtCenters]);

  const handleSelectEmergency = (emg) => {
    setSelectedEmergency(emg);
    setMapCenter([emg.latitude, emg.longitude]);
    setSelectedNode(null);
  };

  const handleOpenDonationWizard = (target) => {
    setDonationTarget(target || selectedEmergency);
    setDonationWizardOpen(true);
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe relative overflow-x-hidden">
      
      {/* Glow backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500 opacity-[0.06] rounded-full blur-[140px] pointer-events-none" />

      {/* ── 1. HEADER & BRANDING ────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-glow-red">
            <LifeBuoy size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                Relief & <span className="text-red-400">Disaster</span> Platform
              </h1>
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> NDMA Sync
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Real-Time Humanitarian Coordination & Food Dispatch</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/community')}
          className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-400 hover:text-white transition-colors"
          title="Community Redistribution"
        >
          <Heart size={18} className="text-rose-400" />
        </button>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">

        {/* ── 2. SEARCH & EMERGENCY CATEGORY FILTER CHIPS ─────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emergency, flood, state or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-white p-3.5 pl-10 rounded-2xl focus:border-red-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Chips Scrollbar */}
          <div className="flex overflow-x-auto gap-2 pb-1 custom-scrollbar snap-x">
            {EMERGENCY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`snap-start shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-red-500 text-black font-black border-red-400 shadow-glow-red scale-[1.02]'
                    : 'bg-[var(--bg-card)] text-gray-300 border-[var(--border-color)] hover:border-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. SMART AI RELIEF RECOMMENDATION ──────────────────────────── */}
        {aiRec && (
          <div className="card p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-[var(--bg-card)] to-red-950/30 relative overflow-hidden shadow-glow-amber">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">Smart AI Relief Recommendation</h3>
              </div>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                Highest Urgency Match
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm font-black text-white">{aiRec.emergency.title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Nearest NGO: <strong className="text-amber-300">{aiRec.ngo.name}</strong> ({aiRec.distanceKm} km away • ~{aiRec.travelMinutes} mins)
                </p>
              </div>
            </div>

            <div className="bg-black/40 p-3 rounded-2xl border border-amber-500/20 mb-3 space-y-1">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Urgent Food & Supply Deficit:</p>
              <p className="text-xs font-bold text-red-300">{aiRec.urgencyText}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {aiRec.currentlyNeeded.map(item => (
                  <span key={item} className="text-[9px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-lg border border-red-500/30 font-mono">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenDonationWizard(aiRec.ngo)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-red-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
              <Heart size={16} /> Donate Now to Recommended Relief Node →
            </button>
          </div>
        )}

        {/* ── 4. ACTIVE EMERGENCIES CARDS ─────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" /> Active Verified Emergencies ({emergencies.length})
            </h3>
            <span className="text-[10px] text-gray-500">Tap to inspect details</span>
          </div>

          {emergencies.length === 0 ? (
            <div className="card p-8 rounded-3xl text-center text-gray-400 border border-[var(--border-color)]">
              <AlertTriangle size={32} className="mx-auto text-amber-400 mb-2" />
              <p className="text-xs font-bold">No active emergencies match the selected filter.</p>
            </div>
          ) : (
            emergencies.map(emg => {
              const isSelected = selectedEmergency?.id === emg.id;
              return (
                <div
                  key={emg.id}
                  onClick={() => handleSelectEmergency(emg)}
                  className={`card p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? 'border-red-500 bg-[var(--bg-card)] shadow-glow-red scale-[1.01]' 
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌊</span>
                        <h4 className="text-base font-black text-white leading-tight">{emg.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 font-mono">
                        📍 {emg.state} — {Array.isArray(emg.districts) ? emg.districts.slice(0, 2).join(', ') : (emg.districts || '')}
                      </p>
                    </div>

                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${
                      emg.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {emg.severity}
                    </span>
                  </div>

                  {/* Quick Stat Chips */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-[var(--bg-elevated)] p-2.5 rounded-2xl border border-[var(--border-color)] text-[10px] font-bold">
                    <div>
                      <p className="text-[7px] text-gray-400 uppercase tracking-widest">Affected</p>
                      <p className="text-xs font-black text-amber-400 font-mono">{(emg.affectedPopulation / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="border-l border-[var(--border-color)]">
                      <p className="text-[7px] text-gray-400 uppercase tracking-widest">Relief Camps</p>
                      <p className="text-xs font-black text-blue-400 font-mono">{emg.activeCampsCount}</p>
                    </div>
                    <div className="border-l border-[var(--border-color)]">
                      <p className="text-[7px] text-gray-400 uppercase tracking-widest">NGOs</p>
                      <p className="text-xs font-black text-emerald-400 font-mono">{emg.respondingNgosCount}</p>
                    </div>
                    <div className="border-l border-[var(--border-color)]">
                      <p className="text-[7px] text-gray-400 uppercase tracking-widest">Food Req.</p>
                      <p className="text-xs font-black text-red-400">{emg.foodRequirement}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
                    <span>Updated: <strong className="text-gray-300">15 mins ago</strong></span>
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      View Emergency Details <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── 5. LIVE RELIEF MAP WITH 6 COLOR-CODED MARKER TYPES ───────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Compass size={15} className="text-blue-400" /> Live Relief Map & Delivery Nodes
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Zoom & Tap Markers</span>
          </div>

          <div className="h-[320px] w-full rounded-3xl border border-[var(--border-color)] overflow-hidden relative shadow-2xl">
            <MapContainer
              center={mapCenter}
              zoom={9}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; ESRI / CartoDB'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <ChangeMapView center={mapCenter} />

              {mapNodes.map(node => (
                <Marker
                  key={`${node.type}-${node.id}`}
                  position={[parseFloat(node.latitude), parseFloat(node.longitude)]}
                  icon={createReliefMarkerIcon(node.type)}
                  eventHandlers={{
                    click: () => setSelectedNode(node)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 text-xs">
                      <strong className="text-white block">{node.name}</strong>
                      <span className="text-gray-400 text-[10px] font-mono">{node.type}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Marker Legend Bar */}
            <div className="absolute bottom-3 left-3 right-3 z-[400] bg-black/85 backdrop-blur-md p-2.5 rounded-2xl border border-gray-800 flex items-center justify-around text-[9px] font-bold text-gray-300">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Disaster</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> NGO</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Camp</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Kitchen</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Govt</span>
            </div>
          </div>
        </div>

        {/* ── 6. EMERGENCY DETAILS SCREEN / SECTION ──────────────────────── */}
        {selectedEmergency && (
          <div className="space-y-6 pt-2">
            
            {/* LIVE REQUIREMENT METERS */}
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Activity size={16} /> Live Requirement Meters & Deficit
                </h3>
                <span className="text-[10px] font-mono text-gray-400">Updated Real-Time</span>
              </div>

              {Object.entries(selectedEmergency.requirementMeters || {}).map(([key, meter]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-gray-200">{key} Needed</span>
                    <span className={`font-mono font-black ${meter.percent > 75 ? 'text-red-400' : 'text-amber-400'}`}>
                      {meter.percent}% Shortage ({meter.urgency})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        meter.percent > 75 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                      }`}
                      style={{ width: `${meter.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">{meter.status}</p>
                </div>
              ))}
            </div>

            {/* PRIORITY RELIEF ITEMS CARDS */}
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                  <Package size={16} /> Priority Needed Relief Supplies
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">Deliver to NGOs / Camps</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {selectedEmergency.priorityItems.map((item, i) => (
                  <div key={i} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-white leading-tight">{item.name}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                        item.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-mono">Unit: {item.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* VERIFIED RESPONDING NGOS SECTION */}
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Building size={16} /> Responding Verified NGOs ({activeNgos.length})
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Direct Donation Target
                </span>
              </div>

              <div className="space-y-3">
                {activeNgos.map(ngo => (
                  <div key={ngo.id} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img src={ngo.logo} alt={ngo.name} className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-white">{ngo.name}</h4>
                            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">📍 {ngo.address}</p>
                          <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Distance: ~{ngo.distanceKm} km away • {ngo.operatingStatus}</p>
                        </div>
                      </div>
                    </div>

                    {/* Accepted Categories Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ngo.acceptedCategories.map(cat => (
                        <span key={cat} className="text-[9px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/30 font-bold">
                          ✓ {cat}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`, '_blank')}
                        className="py-2.5 bg-gray-800 text-gray-300 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:text-white"
                      >
                        <Navigation size={12} className="rotate-45" /> Directions
                      </button>
                      <button
                        onClick={() => window.open(`tel:${ngo.contactNumber}`)}
                        className="py-2.5 bg-gray-800 text-gray-300 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:text-white"
                      >
                        <Phone size={12} /> Call
                      </button>
                      <button
                        onClick={() => handleOpenDonationWizard(ngo)}
                        className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-glow-teal hover:scale-105 transition-transform"
                      >
                        <Heart size={12} /> Donate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RELIEF CAMPS SECTION */}
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <Users size={16} /> Active Relief Camps ({activeCamps.length})
                </h3>
                <span className="text-[10px] text-blue-400 font-bold">Shelters & Food Points</span>
              </div>

              <div className="space-y-3">
                {activeCamps.map(camp => (
                  <div key={camp.id} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-white">{camp.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">Landmark: {camp.nearestLandmark}</p>
                      </div>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                        {camp.peopleSheltered} / {camp.capacity} Sheltered
                      </span>
                    </div>

                    {/* Meal Requirements Status */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[9px] bg-black/40 p-2 rounded-xl border border-gray-800 font-bold">
                      <div>
                        <span className="text-gray-400 block">Breakfast</span>
                        <span className={camp.mealsRequired.breakfast === 'Required' ? 'text-red-400' : 'text-emerald-400'}>{camp.mealsRequired.breakfast}</span>
                      </div>
                      <div className="border-x border-gray-800">
                        <span className="text-gray-400 block">Lunch</span>
                        <span className={camp.mealsRequired.lunch === 'Required' ? 'text-red-400' : 'text-emerald-400'}>{camp.mealsRequired.lunch}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Dinner</span>
                        <span className={camp.mealsRequired.dinner === 'Required' ? 'text-red-400' : 'text-emerald-400'}>{camp.mealsRequired.dinner}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenDonationWizard(camp)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-glow-blue flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                    >
                      <Heart size={14} /> Deliver Food / Supplies to Camp
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COMMUNITY KITCHENS & GOVT COLLECTION CENTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Community Kitchens */}
              <div className="card p-4 rounded-3xl border border-[var(--border-color)] space-y-3">
                <h4 className="text-xs font-black uppercase text-orange-400 flex items-center gap-2">
                  <Utensils size={15} /> Community Kitchens
                </h4>
                {activeKitchens.map(k => (
                  <div key={k.id} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] text-xs space-y-1">
                    <p className="font-bold text-white">{k.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Served Today: {k.mealsServedToday} meals</p>
                    <p className="text-[10px] text-orange-300 font-bold">Needed: {k.foodNeeded}</p>
                  </div>
                ))}
              </div>

              {/* Government Collection Centers */}
              <div className="card p-4 rounded-3xl border border-[var(--border-color)] space-y-3">
                <h4 className="text-xs font-black uppercase text-purple-400 flex items-center gap-2">
                  <Building size={15} /> Govt Collection Centers
                </h4>
                {activeGovtCenters.map(g => (
                  <div key={g.id} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] text-xs space-y-1">
                    <p className="font-bold text-white">{g.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Type: {g.centerType}</p>
                    <p className="text-[10px] text-purple-300 font-bold">Hours: {g.openingHours}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* LIVE EVENT TIMELINE */}
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <Clock size={16} className="text-amber-400" /> Live Disaster Event Timeline
              </h3>

              <div className="space-y-3 relative pl-4 border-l-2 border-amber-500/30">
                {selectedEmergency.timeline.map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-black" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{event.stage}</span>
                      <span className="text-[9px] font-mono text-gray-400">{event.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-0.5">{event.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 5-Step Interactive Donation Process Modal */}
      <DonationWizardModal
        isOpen={donationWizardOpen}
        onClose={() => setDonationWizardOpen(false)}
        targetItem={donationTarget}
        emergency={selectedEmergency}
      />

    </div>
  );
}
