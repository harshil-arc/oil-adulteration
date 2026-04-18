import { useState, useEffect } from 'react';
import {
  Heart, PackageCheck, AlertTriangle, CheckCircle,
  MapPin, Clock, Truck, User, Phone, Star, Navigation
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// Simulated surplus + NGO data (normally from DB)
const MOCK_SURPLUS = [
  {
    id: 's1',
    event_name: 'Annual Corporate Dinner',
    food_quantity_kg: 35,
    location: 'Bandra Kurla Complex, Mumbai',
    expiry_time: new Date(Date.now() + 2 * 3600000).toISOString(),
    food_details: 'Paneer Butter Masala, Dal Makhani, Naan, Rice',
    status: 'available',
  },
  {
    id: 's2',
    event_name: 'Wedding Reception – Sharma Family',
    food_quantity_kg: 62,
    location: 'Connaught Place, Delhi',
    expiry_time: new Date(Date.now() + 3 * 3600000).toISOString(),
    food_details: 'Biryani, Butter Chicken, Kheer, Roti',
    status: 'available',
  },
];

const MOCK_NGOS = [
  { id: 'n1', name: 'Roti Bank India', distanceKm: 2.4, urgency: 'high', contact: '+91 98765 43210', rating: 4.9, deliveries: 142 },
  { id: 'n2', name: 'Feeding India', distanceKm: 3.8, urgency: 'medium', contact: '+91 87654 32109', rating: 4.7, deliveries: 98 },
  { id: 'n3', name: 'No Food Waste', distanceKm: 5.1, urgency: 'low', contact: '+91 76543 21098', rating: 4.5, deliveries: 67 },
];

const MOCK_VOLUNTEERS = [
  { id: 'v1', name: 'Arjun Mehta', distanceKm: 0.8, status: 'available', rating: 4.8 },
  { id: 'v2', name: 'Priya Sharma', distanceKm: 1.2, status: 'available', rating: 4.9 },
];

const RECENT_DONATIONS = [
  { id: 'd1', ngo: 'Roti Bank India', kg: 18, date: new Date(Date.now() - 86400000).toISOString(), status: 'delivered', volunteer: 'Arjun Mehta' },
  { id: 'd2', ngo: 'Feeding India', kg: 24, date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'delivered', volunteer: 'Priya Sharma' },
];

const urgencyColors = { high: 'text-red-500 bg-red-500/10 border-red-500/20', medium: 'text-orange-500 bg-orange-500/10 border-orange-500/20', low: 'text-green-500 bg-green-500/10 border-green-500/20' };
const statusColors = { delivered: 'text-green-500', in_transit: 'text-blue-500', scheduled: 'text-orange-400', pending: 'text-gray-400' };

export default function NgoDashboard() {
  const [surplus, setSurplus] = useState(MOCK_SURPLUS);
  const [selectedSurplus, setSelectedSurplus] = useState(null);
  const [donations, setDonations] = useState(RECENT_DONATIONS);
  const [assignedDonations, setAssignedDonations] = useState({});
  const [activeTab, setActiveTab] = useState('surplus');

  const getExpiryLabel = (isoTime) => {
    const minsLeft = Math.round((new Date(isoTime) - Date.now()) / 60000);
    if (minsLeft < 0) return 'Expired';
    if (minsLeft < 60) return `${minsLeft} min left`;
    return `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m left`;
  };

  const handleAssign = (surplusId, ngoId, volunteerId) => {
    setSurplus(prev => prev.map(s => s.id === surplusId ? { ...s, status: 'matched' } : s));
    setAssignedDonations(prev => ({ ...prev, [surplusId]: { ngoId, volunteerId, status: 'scheduled' } }));
    setSelectedSurplus(null);
  };

  return (
    <div className="flex flex-col theme-bg min-h-screen pb-24 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 border-b theme-border">
        <h1 className="text-[19px] font-black theme-text flex items-center gap-2">
          <Heart size={18} className="text-[#d4af37]" fill="currentColor" /> Redistribution Hub
        </h1>
        <p className="theme-text-muted text-[10px] uppercase tracking-[0.2em] mt-0.5">Smart NGO Matching · Volunteer Dispatch</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mt-4">
        {['surplus', 'history'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${activeTab === t ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'theme-elevated theme-border theme-text'}`}
          >
            {t === 'surplus' ? `Surplus (${surplus.filter(s => s.status === 'available').length})` : 'History'}
          </button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-4 mt-5">

        {/* ── SURPLUS TAB ── */}
        {activeTab === 'surplus' && (
          <>
            {surplus.filter(s => s.status === 'available').length === 0 ? (
              <div className="theme-card border theme-border rounded-[20px] p-10 flex flex-col items-center gap-3 opacity-70">
                <PackageCheck size={36} className="theme-text-muted" />
                <p className="text-sm theme-text-secondary font-medium">No surplus available right now</p>
              </div>
            ) : (
              surplus.filter(s => s.status === 'available').map(s => {
                const minsLeft = Math.round((new Date(s.expiry_time) - Date.now()) / 60000);
                const isUrgent = minsLeft < 120;
                return (
                  <div key={s.id} className={`theme-card rounded-[20px] p-5 border ${isUrgent ? 'border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.08)]' : 'theme-border'} transition-all`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isUrgent && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isUrgent ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-orange-500 bg-orange-500/10 border-orange-500/20'}`}>
                          {isUrgent ? '⚡ Urgent Pickup' : '📦 Available'}
                        </span>
                      </div>
                      <span className="text-[22px] font-black text-[#d4af37]">{s.food_quantity_kg} kg</span>
                    </div>

                    <h3 className="font-bold theme-text mb-1">{s.event_name}</h3>

                    <div className="flex flex-col gap-1.5 mb-4 mt-3">
                      <div className="flex items-center gap-2 text-xs theme-text-secondary">
                        <MapPin size={12} className="theme-text-muted shrink-0" /> {s.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs theme-text-secondary">
                        <Clock size={12} className="theme-text-muted shrink-0" />
                        <span className={isUrgent ? 'text-red-500 font-bold' : ''}>{getExpiryLabel(s.expiry_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs theme-text-secondary">
                        <span className="text-base">🍲</span> {s.food_details}
                      </div>
                    </div>

                    {/* NGO Smart Match preview */}
                    <div className="theme-elevated rounded-xl p-3 mb-4 border theme-border">
                      <p className="text-[9px] font-black theme-text-muted uppercase tracking-widest mb-2">🤖 Top NGO Match</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold theme-text">{MOCK_NGOS[0].name}</p>
                          <p className="text-[10px] theme-text-muted">{MOCK_NGOS[0].distanceKm} km away · ⭐ {MOCK_NGOS[0].rating}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${urgencyColors[MOCK_NGOS[0].urgency]}`}>
                          Need: {MOCK_NGOS[0].urgency}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssign(s.id, MOCK_NGOS[0].id, MOCK_VOLUNTEERS[0].id)}
                        className="flex-1 py-3.5 bg-[#d4af37] hover:bg-[#c4a030] text-black font-black text-[11px] uppercase tracking-widest rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.25)] active:scale-95 transition-all"
                      >
                        Send Donation
                      </button>
                      <button
                        onClick={() => setSelectedSurplus(selectedSurplus?.id === s.id ? null : s)}
                        className="flex-1 py-3.5 border theme-border theme-elevated theme-text font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all"
                      >
                        View All NGOs
                      </button>
                    </div>

                    {/* Expanded NGO list */}
                    {selectedSurplus?.id === s.id && (
                      <div className="mt-4 pt-4 border-t theme-border flex flex-col gap-3">
                        <p className="text-[10px] font-black theme-text-muted uppercase tracking-widest">Available NGOs · Ranked by Distance + Urgency</p>
                        {MOCK_NGOS.map((ngo, i) => (
                          <div key={ngo.id} className="theme-elevated rounded-xl p-3 border theme-border">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  {i === 0 && <span className="text-[8px] font-black text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded uppercase">Best Match</span>}
                                  <p className="text-xs font-bold theme-text">{ngo.name}</p>
                                </div>
                                <p className="text-[10px] theme-text-muted mt-0.5">{ngo.distanceKm} km · ⭐ {ngo.rating} · {ngo.deliveries} deliveries</p>
                              </div>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${urgencyColors[ngo.urgency]}`}>
                                {ngo.urgency.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAssign(s.id, ngo.id, MOCK_VOLUNTEERS[0].id)}
                                className="flex-1 py-2 bg-[#d4af37] text-black font-black text-[9px] uppercase tracking-widest rounded-lg active:scale-95 transition-all"
                              >
                                Assign
                              </button>
                              <a
                                href={`tel:${ngo.contact}`}
                                className="flex items-center justify-center gap-1 px-3 py-2 border theme-border rounded-lg text-[9px] font-bold theme-text"
                              >
                                <Phone size={10} /> Call
                              </a>
                            </div>
                          </div>
                        ))}

                        {/* Volunteer selection */}
                        <p className="text-[10px] font-black theme-text-muted uppercase tracking-widest mt-2">Available Volunteers</p>
                        {MOCK_VOLUNTEERS.map(v => (
                          <div key={v.id} className="flex items-center justify-between theme-elevated rounded-xl p-3 border theme-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full theme-card border theme-border flex items-center justify-center">
                                <User size={14} className="theme-text-muted" />
                              </div>
                              <div>
                                <p className="text-xs font-bold theme-text">{v.name}</p>
                                <p className="text-[9px] theme-text-muted">{v.distanceKm} km · ⭐ {v.rating}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 uppercase">
                              {v.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Matched/Claimed items */}
            {surplus.filter(s => s.status === 'matched').length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] font-black theme-text-muted uppercase tracking-widest mb-3 px-1">Recently Matched</p>
                {surplus.filter(s => s.status === 'matched').map(s => (
                  <div key={s.id} className="theme-card border theme-border rounded-[18px] p-4 flex items-center gap-3 mb-2 opacity-70">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold theme-text">{s.event_name}</p>
                      <p className="text-[10px] theme-text-muted">{s.food_quantity_kg} kg · NGO assigned</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck size={12} className="text-blue-500" />
                      <span className="text-[9px] text-blue-500 font-bold uppercase">Scheduled</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <>
            {/* Impact summary */}
            <div className="grid grid-cols-3 gap-3 mb-1">
              {[
                { label: 'Total Donated', value: `${donations.reduce((s, d) => s + d.kg, 0)} kg` },
                { label: 'Deliveries', value: donations.length },
                { label: 'Meals Saved', value: `~${donations.reduce((s, d) => s + Math.round(d.kg * 2.5), 0)}` },
              ].map(({ label, value }) => (
                <div key={label} className="theme-card border theme-border rounded-[16px] p-3">
                  <p className="text-[18px] font-black theme-text">{value}</p>
                  <p className="text-[8px] theme-text-muted uppercase tracking-widest mt-1 font-bold">{label}</p>
                </div>
              ))}
            </div>

            {donations.length === 0 ? (
              <div className="theme-card border theme-border rounded-[20px] p-10 flex flex-col items-center gap-3 opacity-70">
                <HeartHandshake size={36} className="theme-text-muted" />
                <p className="text-sm theme-text-secondary font-medium">No donation history yet</p>
              </div>
            ) : (
              donations.map(d => (
                <div key={d.id} className="theme-card border theme-border rounded-[18px] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm theme-text">{d.ngo}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${statusColors[d.status]}`}>
                      {d.status === 'delivered' ? '✓ ' : ''}{d.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] theme-text-secondary">
                      <PackageCheck size={11} className="theme-text-muted" /> {d.kg} kg donated
                    </div>
                    <div className="flex items-center gap-2 text-[11px] theme-text-secondary">
                      <Truck size={11} className="theme-text-muted" /> Volunteer: {d.volunteer}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] theme-text-secondary">
                      <Clock size={11} className="theme-text-muted" /> {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  );
}
