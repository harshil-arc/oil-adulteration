import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Heart, Plus, Users, Award, ShieldCheck, MapPin, 
  Phone, Clock, ArrowRight, Check, Sparkles, Coffee,
  FileText, ShieldAlert, AlertTriangle, AlertCircle, Search, 
  Map, PhoneCall, Share2, Compass, Bell, Settings, Filter, ChevronRight, X,
  ClipboardCheck, Navigation, Truck, QrCode, Zap, Shield, Gift, Target,
  RefreshCw, CheckCircle2, FileSpreadsheet, ExternalLink, Building
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import DonationWizardModal from '../components/DonationWizardModal';
import NgoRequestModal from '../components/NgoRequestModal';
import CsrReportModal from '../components/CsrReportModal';
import { getEmergencyRequests, getNgos, seedDemoCommunityData } from '../services/foodRedistributionService';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;

const ngoGreenIcon = new L.DivIcon({
  className: 'custom-ngo-green',
  html: `<div style="background-color: #22c55e; width: 20px; height: 20px; display: block; left: -10px; top: -10px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px #22c55e;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20]
});

const emergencyRedIcon = new L.DivIcon({
  className: 'custom-emergency-red',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; display: block; left: -12px; top: -12px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 14px #ef4444;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24]
});

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function Community() {
  const navigate = useNavigate();
  const { profile } = useApp();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'ngos', 'volunteers', 'guidelines', 'map'
  
  // Modals
  const [wizardOpen, setWizardOpen] = useState(false);
  const [ngoRequestOpen, setNgoRequestOpen] = useState(false);
  const [csrReportOpen, setCsrReportOpen] = useState(false);

  // Data
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [ngosList, setNgosList] = useState([]);
  const [volunteersList, setVolunteersList] = useState([
    { name: 'Rohan Sharma', city: 'Mumbai', vehicle: 'Electric EV Scooter', radius: '8 km', rating: 4.9, completed: 42, phone: '+91 98200 88990' },
    { name: 'Priya Verma', city: 'Bengaluru', vehicle: 'Delivery Van', radius: '15 km', rating: 5.0, completed: 88, phone: '+91 98450 77112' },
    { name: 'Amitabh Sen', city: 'Delhi', vehicle: 'Motorcycle', radius: '10 km', rating: 4.8, completed: 31, phone: '+91 98110 33445' }
  ]);

  // Leaflet Map settings
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]);
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    const requests = getEmergencyRequests();
    const ngos = getNgos();
    setEmergencyRequests(requests);
    setNgosList(ngos);
  }, []);

  const handleNewEmergencyRequest = (newReq) => {
    const updated = [newReq, ...emergencyRequests];
    setEmergencyRequests(updated);
    setNgoRequestOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-24">
      
      {/* ── TOP HEADER & EMERGENCY METRICS BAR ── */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">FOOD 360 EMERGENCY NETWORK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Food Redistribution & Relief Platform</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setWizardOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs uppercase tracking-wider shadow-glow-green hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <Heart size={16} /> Offer Emergency Donation
            </button>

            <button
              onClick={() => setNgoRequestOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Building size={15} /> Request Emergency Food
            </button>

            <button
              onClick={() => setCsrReportOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-bold hover:bg-[#d4af37]/20 transition-all flex items-center gap-1.5"
            >
              <Award size={15} /> CSR Report
            </button>
          </div>
        </div>

        {/* 6 REAL-TIME EMERGENCY METRICS COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 max-w-5xl mx-auto text-center text-xs">
          <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
            <span className="text-[9px] text-gray-400 font-bold uppercase block">Active Requests</span>
            <span className="font-mono font-black text-red-400 text-lg">14</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
            <span className="text-[9px] text-gray-400 font-bold uppercase block">Meals Needed</span>
            <span className="font-mono font-black text-amber-400 text-lg">1,280</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
            <span className="text-[9px] text-gray-400 font-bold uppercase block">Meals Fulfilled</span>
            <span className="font-mono font-black text-emerald-400 text-lg">1,140</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
            <span className="text-[9px] text-gray-400 font-bold uppercase block">Active Volunteers</span>
            <span className="font-mono font-black text-blue-400 text-lg">120</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
            <span className="text-[9px] text-gray-400 font-bold uppercase block">People Fed</span>
            <span className="font-mono font-black text-purple-400 text-lg">12,400</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
            <span className="text-[9px] text-gray-400 font-bold uppercase block">CO₂ Saved (kg)</span>
            <span className="font-mono font-black text-[#d4af37] text-lg">4,920</span>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="px-5 pt-4 max-w-5xl mx-auto w-full">
        <div className="bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] grid grid-cols-2 sm:grid-cols-5 gap-1 text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'feed' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            🚨 Emergency Feed
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'ngos' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            🏢 Accredited NGOs
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'volunteers' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            🚲 Volunteers
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'guidelines' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            📋 Safety Guidelines
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'map' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            🗺️ Relief Map
          </button>
        </div>
      </div>

      {/* ── TAB 1: EMERGENCY REQUESTS LIVE FEED ── */}
      {activeTab === 'feed' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" /> Live Emergency Food Requirements
              </h2>
              <p className="text-xs text-gray-400">Verified requirements broadcasted by disaster teams & accredited NGOs</p>
            </div>
          </div>

          <div className="space-y-4">
            {emergencyRequests.map((req) => (
              <div
                key={req.id}
                className="card p-5 rounded-3xl border border-[var(--border-color)] hover:border-[#d4af37] transition-all space-y-3 relative overflow-hidden"
              >
                {/* Source & Urgency Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${req.sourceBadgeColor}`}>
                      {req.sourceType}
                    </span>
                    {req.isDemo && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gray-800 text-amber-400 border border-amber-500/30">
                        Demo Data (Hackathon)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Clock size={13} className="text-amber-400" /> Safe for another {req.requiredBeforeHours}h
                    </span>
                    <span className={`text-xs font-black px-3 py-1 rounded-xl ${req.priorityColor}`}>
                      {req.urgency}
                    </span>
                  </div>
                </div>

                {/* Request Header */}
                <div>
                  <h3 className="text-lg font-black text-white">{req.title}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">{req.orgName} • {req.city}, {req.district}</p>
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)]">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">Meals Needed</span>
                    <span className="font-mono font-black text-amber-400 text-base">{req.mealsNeeded} Meals</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">Beneficiaries</span>
                    <span className="font-mono font-black text-white text-base">{req.beneficiaries} People</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-gray-400 font-bold block">Required Food Type</span>
                    <span className="font-bold text-gray-300">{req.foodTypeRequired}</span>
                  </div>
                </div>

                {/* Address & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin size={15} className="text-[#d4af37] shrink-0" />
                    <span>{req.address}</span>
                  </div>

                  <button
                    onClick={() => setWizardOpen(true)}
                    className="btn-primary py-2.5 px-5 text-xs font-black self-stretch sm:self-auto flex items-center justify-center gap-1.5 shadow-glow-gold"
                  >
                    <Heart size={14} /> Fulfill Requirement Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: ACCREDITED NGOS DIRECTORY ── */}
      {activeTab === 'ngos' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building size={20} className="text-[#d4af37]" /> Accredited Relief NGOs Directory
            </h2>
            <p className="text-xs text-gray-400">FSSAI-verified food rescue organizations with active cold-chain capacity</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ngosList.map((ngo) => (
              <div key={ngo.id} className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      ✓ {ngo.verificationBadge}
                    </span>
                    <h3 className="text-base font-black text-white mt-1">{ngo.name}</h3>
                  </div>
                  <span className="text-xs font-black text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-1 rounded-xl">
                    ⭐ {ngo.responseRating} / 5.0
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block">Meals Served</span>
                    <span className="font-mono font-black text-white">{ngo.mealsDistributed.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block">Volunteers</span>
                    <span className="font-mono font-black text-blue-400">{ngo.activeVolunteers} Active</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block">Capacity</span>
                    <span className="font-mono font-black text-emerald-400">{ngo.capacityMeals} Meals</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-gray-400">Operating: {ngo.operatingCities.join(', ')}</span>
                  <a href={`tel:${ngo.contactPhone}`} className="text-[#d4af37] font-bold flex items-center gap-1">
                    <Phone size={13} /> {ngo.contactPhone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: VOLUNTEER NETWORK ── */}
      {activeTab === 'volunteers' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck size={20} className="text-blue-400" /> Active Volunteer Delivery Network
              </h2>
              <p className="text-xs text-gray-400">Registered logistics volunteers conducting food pickup and cold transport</p>
            </div>

            <button
              onClick={() => alert('Volunteer Registration Portal Opened!')}
              className="btn-primary py-2 px-4 text-xs font-black"
            >
              + Register as Volunteer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {volunteersList.map((vol, idx) => (
              <div key={idx} className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-white">{vol.name}</h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    ⭐ {vol.rating}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-300">
                  <p>Vehicle: <span className="font-bold text-white">{vol.vehicle}</span></p>
                  <p>Operating Radius: <span className="font-bold text-[#d4af37]">{vol.radius}</span> ({vol.city})</p>
                  <p>Deliveries Completed: <span className="font-bold text-emerald-400">{vol.completed} Pickups</span></p>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] flex justify-between items-center text-xs">
                  <span className="text-gray-400">{vol.phone}</span>
                  <span className="text-emerald-400 font-bold">● Available Now</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: SAFETY GUIDELINES ── */}
      {activeTab === 'guidelines' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" /> Food Safety & Redistribution Guidelines
            </h2>
            <p className="text-xs text-gray-400">Mandatory FSSAI & Food 360 food hygiene and transport standards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Accepted Food */}
            <div className="card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5">
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Acceptable Food Items
              </h3>
              <ul className="text-xs text-gray-300 space-y-1.5 leading-relaxed">
                <li>• Freshly cooked meals prepared within 4–6 hours</li>
                <li>• Sealed, unopened commercial packaged food</li>
                <li>• Fresh fruits, vegetables, and whole grains</li>
                <li>• Clean bottled drinking water</li>
                <li>• Pasteurized dairy products (within safe window)</li>
              </ul>
            </div>

            {/* Unacceptable Food */}
            <div className="card p-5 rounded-3xl border border-red-500/30 bg-red-500/5 space-y-2.5">
              <h3 className="text-sm font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <X size={16} /> Unacceptable / Prohibited Items
              </h3>
              <ul className="text-xs text-gray-300 space-y-1.5 leading-relaxed">
                <li>• Food showing signs of spoilage, sour odor, or mold</li>
                <li>• Expired packaged items or torn packaging</li>
                <li>• Cooked food exposed to heat for more than 6 hours</li>
                <li>• Unsealed liquids prone to leakage or contamination</li>
                <li>• Alcohol or non-food items</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: RELIEF MAP ── */}
      {activeTab === 'map' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Map size={20} className="text-[#d4af37]" /> Interactive Emergency Relief Map
            </h2>
            <p className="text-xs text-gray-400">Live geographic coordinates of emergency requirements & NGO relief centers</p>
          </div>

          <div className="card p-2 rounded-3xl border border-[var(--border-color)] overflow-hidden h-96">
            <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full rounded-2xl">
              <ChangeMapView center={mapCenter} zoom={mapZoom} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {ngosList.map(ngo => (
                <Marker key={ngo.id} position={[ngo.lat, ngo.lng]} icon={ngoGreenIcon}>
                  <Popup>
                    <div className="text-xs p-1">
                      <h4 className="font-bold text-black">{ngo.name}</h4>
                      <p className="text-[10px] text-gray-600">{ngo.operatingCities.join(', ')}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {emergencyRequests.map(req => (
                <Marker key={req.id} position={[19.0760 + (Math.random() - 0.5) * 0.04, 72.8777 + (Math.random() - 0.5) * 0.04]} icon={emergencyRedIcon}>
                  <Popup>
                    <div className="text-xs p-1">
                      <h4 className="font-bold text-red-600">{req.title}</h4>
                      <p className="text-[10px] text-gray-600">Meals Needed: {req.mealsNeeded}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <DonationWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onDonationComplete={(data) => {
          setWizardOpen(false);
          alert(`Donation ${data.trackingId} created successfully! Assigned to ${data.ngoName}`);
        }}
      />

      <NgoRequestModal
        isOpen={ngoRequestOpen}
        onClose={() => setNgoRequestOpen(false)}
        onRequestSubmitted={handleNewEmergencyRequest}
      />

      <CsrReportModal
        isOpen={csrReportOpen}
        onClose={() => setCsrReportOpen(false)}
      />

    </div>
  );
}
