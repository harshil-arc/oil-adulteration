import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Heart, Plus, Users, Award, ShieldCheck, MapPin, 
  Phone, Clock, ArrowRight, Check, Sparkles, Coffee,
  FileText, ShieldAlert, AlertTriangle, AlertCircle, Search, 
  Map, PhoneCall, Share2, Compass, Bell, Settings, Filter, ArrowUpDown, ChevronRight, X,
  FileSpreadsheet, ClipboardCheck, Video, HelpCircle, Navigation, Copy, Truck, QrCode,
  Droplets, Zap, Shield, Gift, Target, Thermometer, User, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;

const greenNgoIcon = new L.DivIcon({
  className: 'custom-ngo-green',
  html: `<div style="background-color: #22c55e; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px #22c55e;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18]
});

const redEmergencyIcon = new L.DivIcon({
  className: 'custom-emergency-red',
  html: `<div style="background-color: #ef4444; width: 22px; height: 22px; display: block; left: -11px; top: -11px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 12px #ef4444;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22]
});

const blueSearchIcon = new L.DivIcon({
  className: 'custom-blue-search',
  html: `<div style="background-color: #3b82f6; width: 22px; height: 22px; display: block; left: -11px; top: -11px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 12px #3b82f6;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22]
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

// Count up animation
function CountUp({ end, duration = 800 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
}

export default function Community() {
  const navigate = useNavigate();
  const { profile } = useApp();

  // Primary layouts
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'complaints', 'vendors', 'labs', 'alerts'
  
  // Custom Overlays for Upgraded Modules
  const [showDonationHub, setShowDonationHub] = useState(false);
  const [showEmergencyHub, setShowEmergencyHub] = useState(false);

  // Sub-tabs for Donation Hub: 'donate', 'dashboard', 'volunteer', 'ngo', 'route'
  const [donationTab, setDonationTab] = useState('donate');

  // Database / State items
  const [complaints, setComplaints] = useState([]);
  const [labs, setLabs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  // Donation flow form state (Step 1)
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState('Cooked Meal');
  const [vegNonVeg, setVegNonVeg] = useState('Veg');
  const [foodQty, setFoodQty] = useState('15 kg');
  const [mealsCount, setMealsCount] = useState(30);
  const [expiryHours, setExpiryHours] = useState(6);
  const [packaging, setPackaging] = useState('Disposable Containers');
  const [pickupAddr, setPickupAddr] = useState('Sardar Patel Ring Road, Ahmedabad');
  const [donorType, setDonorType] = useState('Restaurant'); // Restaurant, Household, etc.
  const [submittingDonation, setSubmittingDonation] = useState(false);

  // AI Verification (Step 2)
  const [aiScore, setAiScore] = useState(null);
  
  // AI Matching recommendations (Step 3)
  const [matchedNgos, setMatchedNgos] = useState([]);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  
  // Volunteer & Tracking states (Step 4 & 5)
  const [activeTracking, setActiveTracking] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);

  // Emergency States
  const [activeEmergencies, setActiveEmergencies] = useState([
    { id: 'em-1', title: 'Flood Relief Dispatch', location: 'Surat District, Gujarat', mealsNeeded: 500, timeLimit: '2 hours', severity: 'Critical', desc: 'Sardar river overflowing. Need immediate dry rations and cooked food packets at Relief Camp 4.' },
    { id: 'em-2', title: 'Heatwave Emergency Center', location: 'Ahmedabad Old City', mealsNeeded: 200, timeLimit: '4 hours', severity: 'High', desc: 'Providing cooling kits, hydration solutions, and fresh buttermilk to daily wage workers.' }
  ]);
  const [emergencyDonationForm, setEmergencyDonationForm] = useState({
    item: 'Cooked Packets',
    qty: '100 packets',
    donorName: 'Main Street Grill',
    phone: '+91 99882 11223'
  });

  // Map Coordinates for Emergencies & Labs
  const [mapCenter, setMapCenter] = useState([23.0225, 72.5714]); // Ahmedabad default
  const [mapZoom, setMapZoom] = useState(12);

  // Seeding initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    // Seeding mock labs
    setLabs([
      { id: "lab-1", name: "Gujarat Food & Drug Laboratory (FDA)", address: "Sector-10A, Gandhinagar, Gujarat 382010", phone: "+91 79 2325 3482", email: "contact@gujfda.gov.in", website: "fda.gujarat.gov.in", working_hours: "09:00 AM - 06:00 PM", available_tests: ["Purity", "Chemical Adulteration", "Heavy Metals"], rating: 4.8, isFssai: true, isGovt: true, lat: 23.2201, lng: 72.6468 },
      { id: "lab-2", name: "FSSAI National Food Laboratory (NFL)", address: "Sector 14, Ghaziabad, Uttar Pradesh 201002", phone: "+91 120 270 2165", email: "director.nflgzb@fssai.gov.in", website: "fssai.gov.in", working_hours: "09:30 AM - 05:30 PM", available_tests: ["Full Spectral Purity", "Toxicity Check"], rating: 4.9, isFssai: true, isGovt: true, lat: 28.6738, lng: 77.4402 }
    ]);

    // Seeding mock alerts
    setAlerts([
      { id: "alert-1", product_name: "Kacchi Ghani Mustard Oil", brand_name: "Brand X Foods", category: "Product Recall", reason: "Excessive foreign fats (argemone oil presence) detected via spectral signature scan.", issued_by: "FSSAI Central Command", issue_date: "2026-06-28", affected_states: ["Gujarat", "Maharashtra"], severity: "Critical", recommended_action: "Avoid Consumption & Return Product", ref_num: "FSSAI-REC-2026-042" }
    ]);

    // Seeding mock vendors
    setVendors([
      { id: "vendor-1", shop_name: "Krishna Grocery Hub", address: "Sola Road, Ahmedabad", owner: "Krishna Patel", average_purity: 94.2, reports_submitted: 18, isTrusted: true },
      { id: "vendor-2", shop_name: "Devendra Provisions", address: "Vastrapur, Ahmedabad", owner: "Devendra Shah", average_purity: 86.5, reports_submitted: 4, isTrusted: false }
    ]);

    // Retrieve local donations history
    const savedDonations = localStorage.getItem('spectra_donations_history');
    if (savedDonations) {
      setComplaints(JSON.parse(savedDonations));
    } else {
      const seedHistory = [
        { id: 'don-1', food_type: 'Veg Biryani', meals_count: 50, recipient: 'Asha Old Age Home', status: 'Completed', timestamp: new Date(Date.now() - 172800000).toISOString() },
        { id: 'don-2', food_type: 'Roti & Dal Combo', meals_count: 80, recipient: 'Surat Relief Camp 4', status: 'Completed', timestamp: new Date(Date.now() - 86400000).toISOString() }
      ];
      setComplaints(seedHistory);
      localStorage.setItem('spectra_donations_history', JSON.stringify(seedHistory));
    }
  };

  // Step 2: Simulate AI Verification Analysis
  const runAiVerification = () => {
    if (!foodName) return alert('Please enter food name.');
    setSubmittingDonation(true);
    
    setTimeout(() => {
      setAiScore({
        quality: 94,
        freshness: 96,
        handling: 'Keep refrigerated, transport within 1.5 hours',
        window: '4.5 Hours Safe Window'
      });

      // Seeding matched NGOs (Step 3)
      setMatchedNgos([
        { id: 'ngo-1', name: 'Goonj Food Bank Center', match: 98, distance: '2.4 km', capacity: 'High Availability', time: '12 mins' },
        { id: 'ngo-2', name: 'Robin Hood Army Hub', match: 91, distance: '3.8 km', capacity: 'Moderate', time: '18 mins' },
        { id: 'ngo-3', name: 'Asha Shelter Home', match: 87, distance: '5.1 km', capacity: 'High Availability', time: '22 mins' }
      ]);
      setSubmittingDonation(false);
    }, 1200);
  };

  // Step 4 & 5: Complete Assignment & Tracking
  const handleAssignDonation = () => {
    if (!selectedNgoId) return alert('Please select a recommended organization.');
    const selectedOrg = matchedNgos.find(n => n.id === selectedNgoId)?.name || 'Goonj Food Bank Center';

    const newDonation = {
      id: 'don-' + Math.floor(Math.random() * 9999),
      food_type: foodName,
      meals_count: mealsCount,
      recipient: selectedOrg,
      status: 'NGO Accepted',
      timestamp: new Date().toISOString()
    };

    // Update local list
    const updated = [newDonation, ...complaints];
    setComplaints(updated);
    localStorage.setItem('spectra_donations_history', JSON.stringify(updated));

    // Setup active tracking state
    setActiveTracking({
      ...newDonation,
      volunteer: 'Rohan Sharma',
      vehicle: 'Electric Two-Wheeler',
      arrival: '14 minutes',
      status: 'Volunteer En Route'
    });

    // Reset Form
    setFoodName('');
    setAiScore(null);
    setMatchedNgos([]);
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-16">
      
      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-2xl font-black tracking-tight theme-text">Community Hub</h1>
          <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Consumer Protection & Donation Rescue</p>
        </div>
      </div>

      {/* Primary Community Page view layout */}
      {!showDonationHub && !showEmergencyHub && (
        <div className="px-5 pt-6 flex flex-col gap-6">

          {/* ============================================================
             🍱 SECTION B: FOOD DONATION NETWORK CARDS
             ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Surplus Food Donation */}
            <div className="card p-6 border-2 border-brand-500 bg-brand-500/[0.02] shadow-sm rounded-[2rem] relative overflow-hidden flex flex-col gap-3">
              <div className="absolute top-0 right-0 p-5 text-brand-500/10 pointer-events-none">
                <Coffee size={56} />
              </div>
              <h3 className="text-sm font-black theme-text uppercase tracking-widest flex items-center gap-1.5">
                <span>🍱 Donate Surplus Food</span>
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold">Reduce food waste by connecting surplus meals with verified NGOs.</p>
              
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => { setShowDonationHub(true); setDonationTab('donate'); }}
                  className="flex-1 py-3 bg-brand-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl shadow active:scale-95"
                >
                  Donate Now
                </button>
                <button 
                  onClick={() => { setShowDonationHub(true); setDonationTab('dashboard'); }}
                  className="px-3.5 py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[9px] rounded-xl"
                >
                  CSR Dashboard
                </button>
              </div>
            </div>

            {/* Card 2: Emergency Response */}
            <div className="card p-6 border-2 border-red-500 bg-red-500/[0.02] shadow-sm rounded-[2rem] relative overflow-hidden flex flex-col gap-3">
              <div className="absolute top-0 right-0 p-5 text-red-500/10 pointer-events-none">
                <ShieldAlert size={56} />
              </div>
              <h3 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>🚨 Emergency Response</span>
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold">Help disaster relief camps and communities in emergency distress.</p>
              
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setShowEmergencyHub(true)}
                  className="flex-1 py-3 bg-red-500 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow active:scale-95"
                >
                  Active Relief Campaigns
                </button>
              </div>
            </div>

          </div>

          {/* ============================================================
             👤 SECTION A: CONSUMER PROTECTION PORTAL PANELS
             ============================================================ */}
          <div className="flex bg-[var(--bg-elevated)] border border-[var(--border-color)] p-1 rounded-xl">
            {['dashboard', 'complaints', 'vendors', 'labs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab ? 'bg-brand-500 text-black font-extrabold shadow-sm' : 'text-[var(--text-secondary)] hover:theme-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub-tab view contents */}
          {activeTab === 'dashboard' && (
            <div className="card p-5 text-center border-dashed border-[var(--border-color)] bg-[var(--bg-card)]">
               <p className="text-xs text-[var(--text-muted)] font-bold uppercase mb-2">SpectraTrust Alliance Center</p>
               <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                 Toggle panels above to lodge adulteration complaints, search certified laboratory test terminals, or view vendor safety compliance averages.
               </p>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="card p-5 border border-[var(--border-color)] flex flex-col gap-4">
              <h3 className="text-[10px] font-black theme-text uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-2">Lodge Suspected Adulteration Complaint</h3>
              <form onSubmit={e=>{ e.preventDefault(); alert('Complaint successfully filed with FSSAI district registrar.'); }} className="flex flex-col gap-3.5 text-xs font-semibold">
                <div>
                  <label className="field-label">Product Brand Name</label>
                  <input type="text" required placeholder="e.g. Pure Mustard Oil" className="field-input" />
                </div>
                <div>
                  <label className="field-label">Vendor Name & Address</label>
                  <input type="text" required placeholder="e.g. Dev Provision Store, Surat" className="field-input" />
                </div>
                <div>
                  <label className="field-label">Complaint Description</label>
                  <textarea rows={3} required placeholder="State observations (adulteration, weird texture, smell)..." className="field-input py-2" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-red-500 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow">
                  File FSSAI Complaint
                </button>
              </form>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="flex flex-col gap-3">
              {vendors.map(ven => (
                <div key={ven.id} className="card p-4.5 border border-[var(--border-color)] flex justify-between items-center rounded-2xl">
                  <div>
                    <h4 className="font-bold text-xs theme-text">{ven.shop_name}</h4>
                    <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">{ven.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-green-500 font-mono">{ven.average_purity}% Purity</p>
                    <span className="text-[7px] text-[var(--text-muted)] font-bold uppercase tracking-wider block mt-1">
                      {ven.isTrusted ? '★ Trusted Vendor' : 'Under Observation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="flex flex-col gap-3">
              {labs.map(lab => (
                <div key={lab.id} className="card p-4.5 border border-[var(--border-color)] flex flex-col gap-2 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs theme-text">{lab.name}</h4>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">{lab.address}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">FSSAI Certified</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ============================================================
         🍱 SURPLUS FOOD DONATION HUB OVERLAY
         ============================================================ */}
      {showDonationHub && (
        <div className="px-5 pt-6 flex flex-col gap-6 animate-fade-in relative z-20">
          
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
            <h2 className="text-sm font-black theme-text uppercase tracking-widest">Surplus Food Rescue</h2>
            <button onClick={() => setShowDonationHub(false)} className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)]">
              <X size={16} />
            </button>
          </div>

          {/* Donation Hub Sub-tabs */}
          <div className="flex bg-[var(--bg-elevated)] border border-[var(--border-color)] p-1 rounded-xl overflow-x-auto custom-scrollbar">
            {[
              { id: 'donate', label: 'New Donation' },
              { id: 'dashboard', label: 'CSR Metrics' },
              { id: 'history', label: 'History & QR' },
              { id: 'ngo', label: 'NGO / Vol' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setDonationTab(item.id)}
                className={`py-2 px-3 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                  donationTab === item.id ? 'bg-brand-500 text-black font-extrabold' : 'text-[var(--text-secondary)] hover:theme-text'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sub-tab view: New Donation Form & AI matching wizard */}
          {donationTab === 'donate' && (
            <div className="flex flex-col gap-5">
              
              {!aiScore ? (
                <div className="card p-5 border border-[var(--border-color)] flex flex-col gap-4">
                  <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-widest border-b border-[var(--border-color)] pb-2">Donation Setup</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div>
                      <label className="field-label">Food Name</label>
                      <input type="text" placeholder="e.g. Mixed Fried Rice" value={foodName} onChange={e=>setFoodName(e.target.value)} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">Category</label>
                      <select value={foodCategory} onChange={e=>setFoodCategory(e.target.value)} className="field-input">
                        <option value="Cooked Meal">Cooked Meal</option>
                        <option value="Dry Rations">Dry Rations</option>
                        <option value="Baked Goods">Baked Goods</option>
                        <option value="Produce">Produce</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div>
                      <label className="field-label">Veg / Non-Veg</label>
                      <select value={vegNonVeg} onChange={e=>setVegNonVeg(e.target.value)} className="field-input">
                        <option value="Veg">Vegetarian</option>
                        <option value="Non-Veg">Non-Vegetarian</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Meals Count Estimate</label>
                      <input type="number" value={mealsCount} onChange={e=>setMealsCount(parseInt(e.target.value))} className="field-input" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div>
                      <label className="field-label">Expiry Estimate (Hours)</label>
                      <input type="number" value={expiryHours} onChange={e=>setExpiryHours(parseInt(e.target.value))} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">Packaging Type</label>
                      <input type="text" value={packaging} onChange={e=>setPackaging(e.target.value)} className="field-input" />
                    </div>
                  </div>

                  <button 
                    onClick={runAiVerification}
                    disabled={submittingDonation}
                    className="w-full py-4 bg-brand-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    {submittingDonation ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>AI Freshness Verification</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  
                  {/* AI verification scores display */}
                  <div className="card p-5 border border-green-500/20 bg-green-500/[0.01] flex flex-col gap-3">
                    <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-green-500/10 pb-2">AI Verification Results</h3>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mb-0.5">Quality Index</p>
                        <p className="text-xl font-black text-green-500 font-mono">{aiScore.quality}%</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mb-0.5">Freshness Index</p>
                        <p className="text-xl font-black text-green-500 font-mono">{aiScore.freshness}%</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-2 border-t border-green-500/10 pt-2 font-medium">
                      <strong>Handling instructions:</strong> {aiScore.handling}
                    </p>
                  </div>

                  {/* AI matching engine results */}
                  <div className="card p-5 border border-[var(--border-color)]">
                    <h3 className="text-[10px] font-black theme-text uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-3">AI NGO Matching Recommendations</h3>
                    
                    <div className="flex flex-col gap-2.5 mb-4">
                      {matchedNgos.map(ngo => (
                        <div 
                          key={ngo.id}
                          onClick={() => setSelectedNgoId(ngo.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedNgoId === ngo.id ? 'border-brand-500 bg-brand-500/5' : 'border-[var(--border-color)] bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <div>
                            <h4 className="font-bold text-xs theme-text">{ngo.name}</h4>
                            <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-1">Dist: {ngo.distance} • Capacity: {ngo.capacity}</p>
                          </div>
                          <span className="text-xs font-black text-brand-500 font-mono">{ngo.match}% Match</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleAssignDonation}
                      className="w-full py-4 bg-brand-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl shadow"
                    >
                      Assign Selected Organization
                    </button>
                  </div>

                </div>
              )}

              {/* Active tracking panel */}
              {activeTracking && (
                <div className="card p-5 border border-brand-500/20 bg-brand-500/[0.005] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                    <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Active Courier Pickup</h3>
                    <span className="text-[8px] font-black text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{activeTracking.status}</span>
                  </div>

                  <div className="text-xs font-semibold leading-relaxed">
                    <p><strong>Volunteer Driver:</strong> {activeTracking.volunteer}</p>
                    <p><strong>Vehicle Mode:</strong> {activeTracking.vehicle}</p>
                    <p><strong>ETA to Pickup:</strong> {activeTracking.arrival}</p>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setShowQrCode(true)}
                      className="flex-1 py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <QrCode size={14} /> Scan Tracking QR
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Sub-tab view: CSR Impact Analytics Dashboard */}
          {donationTab === 'dashboard' && (
            <div className="flex flex-col gap-5">
              
              <div className="grid grid-cols-2 gap-3.5 text-center text-xs font-semibold">
                <div className="card p-4 border border-[var(--border-color)] h-24 flex flex-col justify-between">
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Meals Donated</span>
                  <h3 className="text-xl font-black theme-text font-mono">1,480</h3>
                  <span className="text-[6px] text-green-500 font-bold uppercase tracking-wider">This Month</span>
                </div>
                <div className="card p-4 border border-[var(--border-color)] h-24 flex flex-col justify-between">
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Food Waste Saved</span>
                  <h3 className="text-xl font-black theme-text font-mono">420 kg</h3>
                  <span className="text-[6px] text-green-500 font-bold uppercase tracking-wider">This Month</span>
                </div>
                <div className="card p-4 border border-[var(--border-color)] h-24 flex flex-col justify-between">
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">CO₂ Saved</span>
                  <h3 className="text-xl font-black text-green-500 font-mono">1,120 kg</h3>
                  <span className="text-[6px] text-green-500 font-bold uppercase tracking-wider">Carbon credits</span>
                </div>
                <div className="card p-4 border border-[var(--border-color)] h-24 flex flex-col justify-between">
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Estimated Savings</span>
                  <h3 className="text-xl font-black text-brand-500 font-mono">₹14,500</h3>
                  <span className="text-[6px] text-brand-500 font-bold uppercase tracking-wider">Efficiency gain</span>
                </div>
              </div>

              {/* Corporate CSR Contribution Badge */}
              <div className="card p-5 border border-green-500/20 bg-green-500/[0.01] flex items-center justify-between">
                <div>
                  <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider block mb-1">Corporate Partner Tier</span>
                  <h3 className="text-lg font-black text-green-500 uppercase">Gold CSR Contributor</h3>
                  <span className="text-[8px] text-[var(--text-muted)] font-semibold mt-1 block">SpectraTrust certified partner rating: 4.8★</span>
                </div>
                <Award size={36} className="text-green-500/30" />
              </div>

            </div>
          )}

          {/* Sub-tab view: Donation History & QR Code list */}
          {donationTab === 'history' && (
            <div className="flex flex-col gap-3">
              {complaints.map(don => {
                const qrVal = `DON-ST-${don.id.toUpperCase()}`;
                return (
                  <div key={don.id} className="card p-4 border border-[var(--border-color)] flex justify-between items-center rounded-2xl">
                    <div>
                      <h4 className="font-bold text-xs theme-text">{don.food_type}</h4>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">Recipient: {don.recipient} • Status: {don.status}</p>
                    </div>
                    <button 
                      onClick={() => { setShowQrCode(true); }}
                      className="p-2 text-brand-500 bg-brand-500/10 border border-brand-500/20 rounded-xl"
                    >
                      <QrCode size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-tab view: NGO & Volunteer dashboard controls */}
          {donationTab === 'ngo' && (
            <div className="flex flex-col gap-4">
              
              <div className="card p-5 border border-[var(--border-color)]">
                <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-3">NGO Console</h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-center">
                    <p className="text-[7px] text-[var(--text-muted)] font-black uppercase">Pending rescues</p>
                    <p className="text-base font-black theme-text mt-1">3 orders</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-center">
                    <p className="text-[7px] text-[var(--text-muted)] font-black uppercase">Active Capacity</p>
                    <p className="text-base font-black text-green-500 mt-1">78% free</p>
                  </div>
                </div>
              </div>

              <div className="card p-5 border border-[var(--border-color)]">
                <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-3">Volunteer Performance Points</h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-center">
                    <p className="text-[7px] text-[var(--text-muted)] font-black uppercase">Hours contributed</p>
                    <p className="text-base font-black theme-text mt-1">34 hrs</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-center">
                    <p className="text-[7px] text-[var(--text-muted)] font-black uppercase">Reward Points</p>
                    <p className="text-base font-black text-brand-500 mt-1">420 pts</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ============================================================
         🚨 EMERGENCY FOOD RESPONSE SYSTEM OVERLAY
         ============================================================ */}
      {showEmergencyHub && (
        <div className="px-5 pt-6 flex flex-col gap-6 animate-fade-in relative z-20">
          
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
            <h2 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={16} />
              <span>Emergency Response Control</span>
            </h2>
            <button onClick={() => setShowEmergencyHub(false)} className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)]">
              <X size={16} />
            </button>
          </div>

          {/* Active emergencies notice alert banner */}
          <div className="card border border-red-500/20 bg-red-500/5 p-4 flex gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-1">State Level Alert Active</p>
              <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                Emergency flood relief operations active in Surat. Food safety and hydration packets prioritized.
              </p>
            </div>
          </div>

          {/* Active Campaigns list */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1 pl-1">Active Relief Requests</span>
            
            {activeEmergencies.map(em => (
              <div key={em.id} className="card p-5 border border-[var(--border-color)] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs theme-text">{em.title}</h4>
                    <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">{em.location}</p>
                  </div>
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                    Needs {em.mealsNeeded} packets
                  </span>
                </div>
                
                <p className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)] leading-relaxed font-semibold">
                  {em.desc}
                </p>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => {
                      alert(`Thank you! Offer registered: 100 packets of food for Surat Flood dispatch.`);
                      setShowEmergencyHub(false);
                    }}
                    className="flex-1 py-3 bg-red-500 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow"
                  >
                    Offer emergency donation
                  </button>
                  <button 
                    onClick={() => alert('Guidelines: Keep food dry, package tightly in leakproof plastics, and label Veg/Non-Veg clearly.')}
                    className="px-3.5 py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[9px] rounded-xl"
                  >
                    Guidelines
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency interactive map view */}
          <div>
            <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-3 pl-1 block">Disaster Relief Live Map</span>
            <div className="h-64 w-full relative border border-[var(--border-color)] rounded-3xl overflow-hidden z-0">
              <MapContainer
                center={[23.0225, 72.5714]}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer
                  url={document.documentElement.classList.contains('dark')
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  }
                  attribution='&copy; CartoDB'
                />
                
                {/* Red Emergency markers */}
                <Marker position={[23.0315, 72.5801]} icon={redEmergencyIcon}>
                  <Popup>
                    <div className="text-xs text-black font-semibold">
                      <p className="font-bold">Ahmedabad Relief Camp 2</p>
                      <p>Demand: 200 water packets</p>
                    </div>
                  </Popup>
                </Marker>
                
                <Marker position={[23.0185, 72.5620]} icon={redEmergencyIcon}>
                  <Popup>
                    <div className="text-xs text-black font-semibold">
                      <p className="font-bold">Vastrapur Distribution Center</p>
                      <p>Demand: 150 dry ration packs</p>
                    </div>
                  </Popup>
                </Marker>

              </MapContainer>
            </div>
          </div>

        </div>
      )}

      {/* --- QR CODE DIALOG TRACKING POPUP --- */}
      {showQrCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[400] flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowQrCode(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
              <QrCode size={28} />
            </div>
            <h3 className="theme-text font-black text-lg mb-2">Tracking QR Code</h3>
            <p className="text-[var(--text-secondary)] text-xs mb-6">Scan to verify pickup, transport logs, and final NGO distribution receipt.</p>
            
            {/* Simulated QR Code box */}
            <div className="w-40 h-40 bg-white border-2 border-gray-200 rounded-2xl mx-auto mb-6 p-4 flex items-center justify-center">
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center font-mono text-[8px] text-black">
                <QrCode size={48} className="text-black mb-2" />
                <span>TRACK-ST-9942</span>
              </div>
            </div>

            <button onClick={() => setShowQrCode(false)} className="w-full py-3 bg-[var(--bg-elevated)] theme-text border border-[var(--border-color)] rounded-xl font-bold">
              Close Tracking View
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
