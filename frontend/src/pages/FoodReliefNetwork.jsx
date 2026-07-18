import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Truck, Users, ShieldAlert, Award, MapPin, 
  QrCode, RefreshCw, BarChart2, CheckCircle2, ChevronRight, HelpCircle, 
  Map, Activity, ShoppingBag, Landmark, Building, Globe, Zap, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FoodReliefNetwork() {
  const navigate = useNavigate();
  const { profile } = useApp();
  const currentRole = profile?.role || 'citizen';

  // Interactive Simulation state
  const [activeTab, setActiveTab] = useState('marketplace'); // 'requests', 'marketplace', 'missions', 'quick_modules'
  const [missionSim, setMissionSim] = useState(null); // Simulated active mission details
  const [simStep, setSimStep] = useState(0); // 0: unaccepted, 1: accepted, 2: pickup scanned, 3: completed
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationForm, setDonationForm] = useState({
    foodType: 'Cooked Curry & Rice',
    mealsCount: '100',
    address: 'Vyas Banquet Hall, Ahmedabad',
    expiryHours: '4'
  });

  const [emergencyRequests, setEmergencyRequests] = useState([
    {
      id: 'req-1',
      title: 'Disaster Relief - Flood Sector 7G',
      mealsNeeded: 1200,
      priority: 'CRITICAL',
      location: 'Eastern Corridor, Block A',
      remainingHours: '2h 15m'
    },
    {
      id: 'req-2',
      title: 'Slum Feeding Program - Kalupur',
      mealsNeeded: 350,
      priority: 'HIGH',
      location: 'Community Kitchen C',
      remainingHours: '5h 30m'
    }
  ]);

  const [donations, setDonations] = useState([
    {
      id: 'don-1',
      donor: 'Royal Plaza Banquets',
      foodType: 'Veg Biryani (Surplus)',
      mealsCount: 200,
      expiry: '3 hours',
      status: 'available'
    },
    {
      id: 'don-2',
      donor: 'Green Leaf Kitchen',
      foodType: 'Fresh Roti & Dal',
      mealsCount: 150,
      expiry: '4 hours',
      status: 'available'
    }
  ]);

  const handleStartMission = (req) => {
    setMissionSim(req);
    setSimStep(1); // Mission accepted
    setActiveTab('missions');
  };

  const handlePickup = () => {
    setSimStep(2); // QR Code scanned at site
  };

  const handleDeliver = () => {
    setSimStep(3); // Mission completed
  };

  const handleCreateDonation = (e) => {
    e.preventDefault();
    const newDon = {
      id: `don-${Date.now()}`,
      donor: profile?.name || 'Authorized Donor',
      foodType: donationForm.foodType,
      mealsCount: parseInt(donationForm.mealsCount || 0),
      expiry: `${donationForm.expiryHours} hours`,
      status: 'available'
    };
    setDonations([newDon, ...donations]);
    setShowDonationForm(false);
    alert('Donation Listing Published to Marketplace!');
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-24 relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500 opacity-5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Heart className="text-emerald-400 fill-emerald-500/20" size={24} />
            <div>
              <h1 className="text-xl font-black text-white">Relief<span className="text-[#d4af37]">Command</span></h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">SpectraTrust Relief Module</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/community')}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-400 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all"
          >
            ← Back to Food Safety
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-5 pt-8 max-w-5xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex flex-col gap-3 text-left">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] uppercase tracking-widest self-start">
            Active Humanitarian Portal
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Food Relief Network <br/>
            <span className="text-[#d4af37]">Bridging the Hunger Gap</span>
          </h2>
          <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
            A high-precision logistics ecosystem connecting surplus resources to vulnerable communities in real-time. Secure, transparent, and rapidly mobilized.
          </p>

          {/* Primary Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
            <button 
              onClick={() => setShowDonationForm(true)}
              className="py-3 rounded-2xl bg-[#d4af37] hover:bg-[#c39e2d] text-black font-black text-[10px] uppercase tracking-widest transition-transform flex items-center justify-center gap-1.5 shadow-glow"
            >
              <ShoppingBag size={14} /> Donate Food
            </button>
            <button 
              onClick={() => alert("Redirecting to FSSAI local relief coordination panel...")}
              className="py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[#d4af37]/30 text-white font-black text-[10px] uppercase tracking-widest transition-transform flex items-center justify-center gap-1.5"
            >
              <ShieldAlert size={14} className="text-red-400" /> Request Relief
            </button>
            <button 
              onClick={() => { setActiveTab('requests'); }}
              className="py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-emerald-400/30 text-white font-black text-[10px] uppercase tracking-widest transition-transform flex items-center justify-center gap-1.5"
            >
              <Truck size={14} className="text-emerald-400" /> Volunteer
            </button>
            <button 
              onClick={() => navigate('/testing-centres')}
              className="py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-blue-400/30 text-white font-black text-[10px] uppercase tracking-widest transition-transform flex items-center justify-center gap-1.5"
            >
              <MapPin size={14} className="text-blue-400" /> Find Shelter
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="px-5 pt-6 max-w-5xl mx-auto w-full text-left">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] mb-3">Relief Dashboard Analytics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl space-y-1">
            <span className="text-[8px] text-gray-400 font-bold block uppercase">Verified NGOs</span>
            <span className="font-mono font-black text-emerald-400 text-lg">148</span>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl space-y-1">
            <span className="text-[8px] text-gray-400 font-bold block uppercase">Emergency Requests</span>
            <span className="font-mono font-black text-red-400 text-lg">12</span>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl space-y-1">
            <span className="text-[8px] text-gray-400 font-bold block uppercase">Meals Delivered</span>
            <span className="font-mono font-black text-amber-400 text-lg">1.2M</span>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl space-y-1">
            <span className="text-[8px] text-gray-400 font-bold block uppercase">People Helped</span>
            <span className="font-mono font-black text-teal-400 text-lg">84,901</span>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl space-y-1">
            <span className="text-[8px] text-gray-400 font-bold block uppercase">Food Inventory</span>
            <span className="font-mono font-black text-[#d4af37] text-lg">45 Tons</span>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl space-y-1">
            <span className="text-[8px] text-gray-400 font-bold block uppercase">Active Missions</span>
            <span className="font-mono font-black text-purple-400 text-lg">24</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-6 max-w-5xl mx-auto w-full">
        <div className="bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-color)] grid grid-cols-4 gap-1 text-xs font-bold text-center">
          <button onClick={() => setActiveTab('marketplace')} className={`py-2 rounded-xl transition-all ${activeTab === 'marketplace' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🛍️ Surplus Offers
          </button>
          <button onClick={() => setActiveTab('requests')} className={`py-2 rounded-xl transition-all ${activeTab === 'requests' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🚨 Emergency Board
          </button>
          <button onClick={() => setActiveTab('missions')} className={`py-2 rounded-xl transition-all ${activeTab === 'missions' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🚚 Active Missions
          </button>
          <button onClick={() => setActiveTab('quick_modules')} className={`py-2 rounded-xl transition-all ${activeTab === 'quick_modules' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🎛️ Quick Modules
          </button>
        </div>
      </div>

      {/* Tab Contents: Surplus Offers */}
      {activeTab === 'marketplace' && (
        <div className="px-5 pt-4 max-w-5xl mx-auto w-full space-y-3 text-left">
          {donations.map(don => (
            <div key={don.id} className="card p-4 rounded-3xl border border-[var(--border-color)] flex justify-between items-center gap-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold uppercase tracking-wider">
                  Surplus Food Available
                </span>
                <h4 className="text-sm font-black text-white mt-1.5">{don.foodType}</h4>
                <p className="text-xs text-gray-400 mt-0.5">Donor: {don.donor} | Expiry: {don.expiry}</p>
              </div>
              <button 
                onClick={() => handleStartMission(don)} 
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-bold uppercase tracking-wider"
              >
                Claim Delivery
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents: Emergency Board */}
      {activeTab === 'requests' && (
        <div className="px-5 pt-4 max-w-5xl mx-auto w-full space-y-3 text-left">
          {emergencyRequests.map(req => (
            <div key={req.id} className="card p-4 rounded-3xl border border-[var(--border-color)] flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex gap-1.5 items-center">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-bold uppercase tracking-wider">
                    {req.priority}
                  </span>
                  <span className="text-[10px] text-gray-500">{req.remainingHours} remaining</span>
                </div>
                <h4 className="text-sm font-black text-white mt-1.5">{req.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">Target Location: {req.location} | Requirement: {req.mealsNeeded} Meals</p>
              </div>
              <button 
                onClick={() => handleStartMission(req)} 
                className="px-3.5 py-2 rounded-xl bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-wider self-start sm:self-center"
              >
                Dispatch Response
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents: Active Missions Simulator */}
      {activeTab === 'missions' && (
        <div className="px-5 pt-4 max-w-5xl mx-auto w-full space-y-4 text-left">
          {!missionSim ? (
            <div className="card p-6 rounded-3xl border border-[var(--border-color)] text-center text-gray-400 space-y-2">
              <Truck size={32} className="mx-auto text-gray-500" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">No Active Logistical Missions</h4>
              <p className="text-[10px] leading-relaxed max-w-xs mx-auto text-center">
                Select an emergency requirement or surplus offer from the tabs to claim and verify delivery logistics.
              </p>
            </div>
          ) : (
            <div className="card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Active Logistics Verification Command</h4>
                  <span className="text-[9px] text-emerald-400 font-semibold">{missionSim.title || missionSim.foodType}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase">
                  Step {simStep} of 3
                </span>
              </div>

              {/* Progress Timeline UI */}
              <div className="grid grid-cols-3 gap-2 text-center text-[9px] uppercase tracking-wider font-black">
                <div className={`p-2 rounded-xl border ${simStep >= 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-500 border-transparent'}`}>
                  1. Accepted
                </div>
                <div className={`p-2 rounded-xl border ${simStep >= 2 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-500 border-transparent'}`}>
                  2. QR Scanned (GPS)
                </div>
                <div className={`p-2 rounded-xl border ${simStep >= 3 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-500 border-transparent'}`}>
                  3. Completed
                </div>
              </div>

              {/* Step workspace */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-center space-y-3">
                {simStep === 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-300">Volunteer is in transit to pickup location. GPS geofence confirms coordinates match.</p>
                    <button 
                      onClick={handlePickup} 
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 mx-auto"
                    >
                      <QrCode size={14} /> Scan Donor Site QR Code
                    </button>
                  </div>
                )}

                {simStep === 2 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-300">Food package collected. Volunteer arrived at relief center. Verify handover.</p>
                    <button 
                      onClick={handleDeliver} 
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 mx-auto"
                    >
                      <QrCode size={14} /> Scan Destination QR Code
                    </button>
                  </div>
                )}

                {simStep === 3 && (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 size={24} />
                    </div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">Mission Complete!</h5>
                    <p className="text-[10px] text-gray-400">Database updated. Meals added to verified delivery count statistics ledger.</p>
                    <button 
                      onClick={() => setMissionSim(null)} 
                      className="text-[10px] text-[#d4af37] font-semibold underline mt-1 mx-auto block"
                    >
                      Reset Simulator
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Quick Modules Grid */}
      {activeTab === 'quick_modules' && (
        <div className="px-5 pt-4 max-w-5xl mx-auto w-full text-left">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Emergency Requests', icon: ShieldAlert, count: '12' },
              { label: 'Donation Marketplace', icon: ShoppingBag, count: '18' },
              { label: 'Volunteer Missions', icon: Truck, count: '4 active' },
              { label: 'Relief Map', icon: Map, count: 'Live' },
              { label: 'Community Kitchens', icon: Landmark, count: '8 active' },
              { label: 'Nearby Shelters', icon: MapPin, count: '15 verified' },
              { label: 'CSR Partnerships', icon: Building, count: '6 corporate' },
              { label: 'Food Banks', icon: Landmark, count: '4 notified' },
              { label: 'NGO Directory', icon: Globe, count: '148' },
              { label: 'Success Stories', icon: Award, count: 'Read logs' }
            ].map(mod => (
              <div key={mod.label} className="card p-3 rounded-2xl border border-[var(--border-color)] hover:border-[#d4af37]/20 transition-all flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[#d4af37]">
                  <mod.icon size={18} />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider">{mod.label}</h4>
                  <span className="text-[9px] text-gray-400">{mod.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DONATION DIALOG MODAL */}
      {showDonationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center text-left">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Publish Surplus Food Donation</h4>
              <button onClick={() => setShowDonationForm(false)} className="p-1 rounded text-gray-400 hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleCreateDonation} className="p-6 space-y-4 text-left">
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Surplus Food details *</label>
                <input 
                  type="text" required value={donationForm.foodType} 
                  onChange={e => setDonationForm(prev => ({ ...prev, foodType: e.target.value }))}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Meals quantity *</label>
                  <input 
                    type="number" required value={donationForm.mealsCount} 
                    onChange={e => setDonationForm(prev => ({ ...prev, mealsCount: e.target.value }))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Expiry (hours) *</label>
                  <input 
                    type="number" required value={donationForm.expiryHours} 
                    onChange={e => setDonationForm(prev => ({ ...prev, expiryHours: e.target.value }))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Pickup Address *</label>
                <input 
                  type="text" required value={donationForm.address} 
                  onChange={e => setDonationForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" 
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest shadow-glow">
                Submit Listing
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
