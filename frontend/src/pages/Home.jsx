import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Zap, AlertTriangle, CheckCircle, Droplets,
  HeartHandshake, TrendingDown, Sparkles, CalendarDays,
  Users, MapPin, Utensils, Plus, X, ChevronDown, Activity,
  Siren, Wifi, WifiOff, Info, Shield, Phone, Navigation,
  Bell, LayoutDashboard, Search, RotateCcw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useOffline } from '../context/OfflineContext';
import axios from 'axios';
import { STATES_LIST, getCities, getRegionalFoods } from '../data/indiaRegions';
import AiChatbot from '../components/AiChatbot';
import NotificationsCenter from '../components/NotificationsCenter';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
const mapIcon = new L.DivIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="background-color: #eab308; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const API = 'http://localhost:5000/api';

const EVENT_TYPES = ['Wedding', 'Corporate', 'Festival', 'Party', 'NGO Camp', 'College Event', 'Other'];
const WEATHER_OPTIONS = ['Clear', 'Cloudy', 'Rainy', 'Hot'];

// Nearby NGOs - in production fetch from DB based on location
const NEARBY_NGOS = [
  { id: 'n1', name: 'Roti Bank India', distance: '2.4 km', urgency: 'high', contact: '+91 98765 43210', lat: 19.0760, lng: 72.8777 },
  { id: 'n2', name: 'Feeding India', distance: '3.8 km', urgency: 'medium', contact: '+91 87654 32109', lat: 19.0860, lng: 72.8877 },
  { id: 'n3', name: 'No Food Waste NGO', distance: '5.1 km', urgency: 'low', contact: '+91 76543 21098', lat: 19.0660, lng: 72.8677 },
];

const DEFAULT_FORM = {
  eventName: '',
  type: 'Wedding',
  guestCount: '',
  state: '',
  city: '',
  eventDate: '',
  weather: 'Clear',
  foodItems: [],
  foodInput: '',
};

export default function Home() {
  const navigate = useNavigate();
  const { deviceStatus, setMenuOpen } = useApp();
  const { isOnline, pendingSync } = useOffline();

  const [readings, setReadings] = useState([]);
  const [disaster, setDisaster] = useState({ active: false });
  const [form, setForm] = useState(DEFAULT_FORM);
  const [prediction, setPrediction] = useState(null);
  const [loadingPred, setLoadingPred] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Surplus input state
  const [totalPrepared, setTotalPrepared] = useState('');
  const [leftoverInput, setLeftoverInput] = useState('');
  const [surplusResult, setSurplusResult] = useState(null);

  const isOnlineSensor = deviceStatus === 'online';
  const oilSafe = readings.length === 0 || readings[0]?.quality !== 'Unsafe';

  // Regional food suggestions (computed from form state)
  const regionalSuggestions = getRegionalFoods(form.state, form.city, form.type);
  const cities = getCities(form.state);

  useEffect(() => {
    supabase.from('analysis_results').select('*').order('timestamp', { ascending: false }).limit(1)
      .then(({ data }) => { if (data) setReadings(data); });
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await axios.get(`${API}/platform/disaster/status`);
        if (data?.status) setDisaster(data.status);
      } catch (_) {}
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  // Sync Prediction to Ledger automatically
  useEffect(() => {
    if (prediction && prediction.predicted_food_kg) {
      setTotalPrepared(prediction.predicted_food_kg);
    }
  }, [prediction]);

  // Helpers
  const addFoodItem = (item) => {
    const trimmed = item.trim();
    if (!trimmed || form.foodItems.includes(trimmed)) return;
    setForm(f => ({ ...f, foodItems: [...f.foodItems, trimmed], foodInput: '' }));
  };

  const removeFoodItem = (item) => setForm(f => ({ ...f, foodItems: f.foodItems.filter(i => i !== item) }));

  const handleStateChange = (state) => setForm(f => ({ ...f, state, city: '', foodItems: [] }));

  const handlePredict = async () => {
    if (!form.guestCount || form.foodItems.length === 0) {
      alert('Please enter guest count and at least one food item.');
      return;
    }
    setLoadingPred(true);
    setPrediction(null);
    try {
      const { data } = await axios.post(`${API}/platform/predict`, {
        type: form.type.toLowerCase(),
        guest_count: Number(form.guestCount),
        food_menu: form.foodItems,
        weather_context: form.weather,
      });
      if (data?.data) {
        setPrediction(data.data);
        setTotalPrepared(data.data.predicted_food_kg);
      }
    } catch {
      const multipliers = { wedding: 0.8, corporate: 0.5, festival: 0.7, party: 0.6, 'ngo camp': 0.4, 'college event': 0.5, other: 0.55 };
      const base = multipliers[form.type.toLowerCase()] || 0.55;
      const wx = form.weather === 'Rainy' ? 1.1 : 1.0;
      const kg = (Number(form.guestCount) * base * wx * (1 + form.foodItems.length * 0.02)).toFixed(1);
      const risk = Math.min(100, Math.round((Number(form.guestCount) / 1000) * 20 + form.foodItems.length * 2));
      const conf = Math.max(55, 95 - Number(form.guestCount) / 500 - form.foodItems.length);
      setPrediction({
        predicted_food_kg: kg, waste_risk_score: risk,
        confidence: conf.toFixed(1),
        ai_recommendation: `Prepare ~${kg} kg for ${form.guestCount} guests. ${risk > 40 ? 'Consider staggered cooking to reduce waste.' : 'Preparation level looks optimal.'}`,
      });
      setTotalPrepared(kg);
    }
    setLoadingPred(false);
  };

  const handleSurplusCalculate = () => {
    const prep = parseFloat(totalPrepared);
    const left = parseFloat(leftoverInput);
    if (!prep || !left || prep <= 0 || left < 0 || left > prep) {
      alert('Please enter valid prepared and leftover quantities.');
      return;
    }
    const consumed = prep - left;
    const wastePct = ((left / prep) * 100).toFixed(1);
    const mealsWasted = Math.round(left * 2.5);
    setSurplusResult({ prep, left, consumed, wastePct, mealsWasted });
  };

  const riskLabel = !prediction ? null : prediction.waste_risk_score > 60 ? 'HIGH' : prediction.waste_risk_score > 35 ? 'MEDIUM' : 'LOW';
  const riskColor = riskLabel === 'HIGH' ? 'text-red-500' : riskLabel === 'MEDIUM' ? 'text-orange-500' : 'text-green-500';
  const riskBorder = riskLabel === 'HIGH' ? 'border-red-500/30 bg-red-500/10' : riskLabel === 'MEDIUM' ? 'border-orange-500/30 bg-orange-500/10' : 'border-green-500/30 bg-green-500/10';

  const formIsComplete = form.eventName && form.guestCount && form.state && form.city && form.eventDate && form.foodItems.length > 0;

  return (
    <div className="flex flex-col theme-bg min-h-screen pb-24 transition-colors duration-300">
      
      {showAiChat && <AiChatbot onClose={() => setShowAiChat(false)} />}
      {showNotifications && <NotificationsCenter onClose={() => setShowNotifications(false)} />}

      {/* ── DISASTER BANNER ── */}
      {disaster.active && (
        <div className="bg-red-600 text-white px-5 py-4 flex items-start gap-3">
          <Siren size={18} className="shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="font-black text-sm">⚠ Emergency — {disaster.zone}</p>
            <p className="text-xs text-red-100 mt-0.5">Food demand spike expected. Activate redistribution.</p>
          </div>
          <button onClick={() => navigate('/ngo-dashboard')} className="bg-white text-red-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-full shrink-0">Donate →</button>
        </div>
      )}

      <div className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 z-30 bg-[#f5f5f5]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all"
          >
             <LayoutDashboard size={20} className="text-black" />
          </button>
          <div>
            <h1 className="text-[14px] font-black theme-text tracking-tighter uppercase leading-none">
              Food Quality \u0026 Management AI
            </h1>
            <p className="theme-text-muted text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Kitchen Intelligence System</p>
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          {/* ASK AI BUTTON - Now active */}
          <button 
            onClick={() => setShowAiChat(true)}
            className="bg-[#1a1a1a] text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm hover:scale-95 transition-all text-[#d4af37]">
            <Sparkles size={12} className="text-[#d4af37]" /> Ask AI
          </button>
          <button 
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center relative hover:bg-gray-50 active:scale-90 transition-all"
          >
            <Bell size={18} className="text-gray-400" />
            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-6 pt-2">

        {/* ── HERO: SMART DEMAND FORECASTING ── */}
        <div className="bg-[#1a1a1a] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-px bg-amber-400" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Predictive Engine</span>
            </div>
            
            <h2 className="text-4xl font-black mb-4 leading-[1.1] tracking-tight">
              Smart Demand<br />Forecasting
            </h2>
            
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[280px] mb-8">
              Utilize high-precision neural networks to calculate ingredients required for upcoming events based on historical patterns and guest profiles.
            </p>
            
            <div className="flex items-end justify-between gap-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Confidence Score</p>
                  <p className="text-2xl font-black">{prediction ? `${prediction.confidence}%` : '94.2%'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Waste Risk</p>
                  <p className={`text-2xl font-black ${prediction && riskLabel === 'HIGH' ? 'text-red-400' : prediction && riskLabel === 'MEDIUM' ? 'text-orange-400' : 'text-white'}`}>{prediction ? riskLabel : 'LOW'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -mr-32 -mt-32" />
        </div>

        {/* ── STATUS INDICATORS ── */}
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-[24px] p-5 flex items-center justify-between shadow-sm border border-gray-50">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${readings.length > 0 ? 'bg-[#f5f5f5]' : 'bg-red-50'}`}>
                <Droplets size={20} className={readings.length > 0 ? "text-gray-400" : "text-red-400"} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Oil Integrity</p>
                {readings.length > 0 ? (
                  <p className="text-sm font-black text-gray-900">{oilSafe ? 'Optimal Range' : 'Degraded (Action Required)'}</p>
                ) : (
                  <p className="text-sm font-black text-red-600">Pending Calibration</p>
                )}
              </div>
            </div>
            {readings.length > 0 ? (
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${oilSafe ? 'text-amber-500 bg-amber-50' : 'text-red-500 bg-red-50'}`}>
                {readings[0].quality === 'Safe' ? '92%' : '24%'}
              </span>
            ) : (
              <button 
                onClick={() => navigate('/scan')}
                className="text-[9px] font-black bg-red-500 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm active:scale-95"
              >
                Scan Now
              </button>
            )}
          </div>

          <div className="bg-white rounded-[24px] p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-2xl flex items-center justify-center">
                <Zap size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">IoT Sensors</p>
                <p className="text-sm font-black text-gray-900">{isOnlineSensor ? '14 Active Nodes' : 'Waiting for Device'}</p>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isOnlineSensor ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          </div>

          {/* Replaced Next Forecast with embedded Map Card */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 bg-white flex justify-between items-center border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex justify-center items-center">
                  <MapPin size={14} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Nearby NGOs Map</h3>
                  <p className="text-[9px] text-gray-500 mt-0.5">{form.city ? form.city : 'Select city to view local NGOs'}</p>
                </div>
              </div>
              <button onClick={() => navigate('/map')} className="text-amber-500 text-[10px] font-black uppercase px-3 py-1.5 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all">
                Full Map
              </button>
            </div>
            <div className="h-40 bg-gray-100 relative pointer-events-none">
                <MapContainer center={[19.0760, 72.8777]} zoom={11} className="w-full h-full" zoomControl={false} dragging={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  {NEARBY_NGOS.map(ngo => (
                    <Marker key={ngo.id} position={[ngo.lat, ngo.lng]} icon={mapIcon} />
                  ))}
                </MapContainer>
                {/* Gradient overlay so it looks pristine */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent z-[400]" />
            </div>
          </div>
        </div>

        {/* ── EVENT CONFIGURATION ── */}
        {showForm && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#ececec] rounded-[32px] p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Event Configuration</h3>
                <LayoutDashboard size={14} className="text-gray-400" />
              </div>

              <div className="flex flex-col gap-4">
                {/* Event Designation */}
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Event Designation</p>
                  <input type="text" placeholder="e.g. Grand Ballroom Wedding"
                    value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 ring-yellow-400 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Event Type */}
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Event Type</p>
                    <div className="relative">
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm appearance-none outline-none">
                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  {/* Guest Count */}
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Guest Count</p>
                    <input type="number" placeholder="450"
                      value={form.guestCount} onChange={e => setForm(f => ({ ...f, guestCount: e.target.value }))}
                      className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 ring-yellow-400 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Event Date */}
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Event Date</p>
                    <input type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                      className="w-full bg-white border-none rounded-2xl px-5 py-3 text-[12px] text-gray-600 font-bold shadow-sm outline-none" />
                  </div>
                  {/* Weather */}
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Weather Context</p>
                    <div className="relative">
                      <select value={form.weather} onChange={e => setForm(f => ({ ...f, weather: e.target.value }))}
                        className="w-full bg-white border-none rounded-2xl px-5 py-3 text-[12px] text-gray-600 font-bold shadow-sm appearance-none outline-none">
                        {WEATHER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* State & City */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">State</p>
                    <div className="relative">
                      <select value={form.state} onChange={e => handleStateChange(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[10px] font-bold shadow-sm appearance-none outline-none">
                        <option value="">Select State</option>
                        {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  {form.state && (
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">City</p>
                      <div className="relative">
                        <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                          className="w-full bg-white border-none rounded-2xl px-5 py-4 text-[10px] font-bold shadow-sm appearance-none outline-none">
                          <option value="">Select City</option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Regional Suggestions */}
                {form.state && regionalSuggestions.length > 0 && (
                  <div className="bg-white/50 rounded-2xl p-3 border border-gray-200">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Sparkles size={10} className="text-amber-500" /> Suggested for {form.city || form.state}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {regionalSuggestions.map(item => (
                        <button key={item} onClick={() => addFoodItem(item)}
                          disabled={form.foodItems.includes(item)}
                          className={`text-[9px] font-bold px-3 py-1.5 rounded-xl transition-all ${form.foodItems.includes(item) ? 'bg-amber-100 text-amber-600' : 'bg-white text-gray-600 shadow-sm border border-gray-100'}`}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current State Toggle */}
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Current State</p>
                  <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-sm">
                    <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#ececec] text-gray-600">
                      Planning
                    </button>
                    <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl text-gray-400 hover:text-gray-600">
                      Active
                    </button>
                  </div>
                </div>

                {/* Date, Weather, Food Menu */}
                <div className="mt-2 flex flex-col gap-4">
                  <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Food Menu</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Add dishes..." value={form.foodInput}
                          onChange={e => setForm(f => ({ ...f, foodInput: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addFoodItem(form.foodInput)}
                          className="flex-1 bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none" />
                        <button onClick={() => addFoodItem(form.foodInput)} className="w-14 bg-amber-400 text-black rounded-2xl flex items-center justify-center font-black hover:bg-amber-500 transition-colors"><Plus size={20} /></button>
                      </div>
                      {form.foodItems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {form.foodItems.map(item => (
                            <span key={item} className="flex items-center gap-2 text-[10px] font-bold bg-white text-gray-700 shadow-sm border border-gray-100 px-4 py-2 rounded-xl">
                              {item} <button onClick={() => removeFoodItem(item)} className="hover:text-red-500 rounded-full bg-gray-100 p-0.5"><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* PREDICT DEMAND BUTTON */}
            <div className="animate-slide-up mt-2">
              <button 
                onClick={handlePredict} 
                disabled={!formIsComplete || loadingPred}
                className={`w-full active:scale-95 transition-all text-black px-4 py-5 rounded-3xl flex items-center justify-center gap-2 font-black text-[14px] shadow-lg uppercase tracking-widest ${
                  !formIsComplete || loadingPred 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#eab308] hover:bg-[#ca8a04] shadow-yellow-500/20'
                }`}>
                {loadingPred ? 'Processing Prediction...' : 'Calculate Necessary Food Production'}
                <Sparkles size={18} />
              </button>
              {!formIsComplete && (
                <p className="text-center text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-widest">
                  Complete all fields (Name, Type, Guests, Date, Location, Food Items) to enable prediction
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── PREDICTION RESULT ── */}
        {prediction && (
          <div className="theme-card border theme-border rounded-[32px] p-8 flex flex-col gap-6 shadow-xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <BrainCircuit size={18} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">Prediction Result</h3>
                  <p className="text-[9px] text-gray-500 mt-0.5">{form.eventName} · {form.type}</p>
                </div>
              </div>
              <button onClick={() => { setPrediction(null); setShowForm(true); }} className="text-gray-400 bg-gray-100 dark:bg-[#1a1a1a] p-2 rounded-xl hover:text-gray-900 transition-colors"><RotateCcw size={14} /></button>
            </div>

            <div className="theme-elevated border theme-border rounded-[24px] p-6 flex flex-col gap-6">
              <div className="flex items-end justify-between border-b theme-border pb-6">
                <div>
                  <p className="text-[10px] theme-text-muted uppercase tracking-widest font-bold mb-2">Target Production</p>
                  <div className="flex items-end gap-2">
                    <span className="text-[54px] font-black leading-none theme-text tracking-tighter">{prediction.predicted_food_kg}</span>
                    <span className="text-sm font-bold theme-text-secondary mb-2">kg</span>
                  </div>
                  <p className="text-[10px] theme-text-muted mt-2 flex items-center gap-1.5 flex-wrap">
                    <CheckCircle size={10} className="text-green-500" /> Confidence: <span className="font-bold theme-text">{prediction.confidence}%</span>
                    <span className="text-gray-300">|</span>
                    <Utensils size={10} className="text-amber-500" /> <span className="font-bold theme-text">{form.guestCount ? Math.round((prediction.predicted_food_kg * 1000) / form.guestCount) : 0}g</span> per plate
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between py-1">
                  <p className="text-[9px] theme-text-muted uppercase tracking-widest font-bold mb-2">Waste Risk</p>
                  <div className={`flex items-center justify-center px-4 py-2 rounded-xl border ${riskBorder} ${riskColor}`}>
                    <span className="text-sm font-black tracking-widest leading-none">{riskLabel} RISK</span>
                  </div>
                  <p className="text-[10px] theme-text-muted mt-3 font-bold">{prediction.waste_risk_score}/100 Index</p>
                </div>
              </div>

              <div className="bg-[#d4af37]/10 border border-[#d4af37]/25 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-[#d4af37]" />
                  <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">AI Action Plan</span>
                </div>
                <p className="text-sm theme-text font-medium leading-relaxed">{prediction.ai_recommendation}</p>
              </div>
            </div>

            {/* Pipeline visually improved */}
            <div className="mt-2">
              <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest mb-4">Event Flow</p>
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute left-6 right-6 top-[22px] h-0.5 theme-elevated" />
                {[
                  { icon: <BrainCircuit size={14} />, label: 'Forecast', active: true },
                  { icon: <Utensils size={14} />, label: 'Prepare', active: true },
                  { icon: <Users size={14} />, label: 'Serve', active: false },
                  { icon: <TrendingDown size={14} />, label: 'Measure', active: false },
                  { icon: <HeartHandshake size={14} />, label: 'Donate', active: false },
                ].map(({ icon, label, active }) => (
                  <div key={label} className="flex flex-col items-center gap-2 z-10 bg-transparent">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-110' : 'theme-card border theme-border text-gray-400'}`}>{icon}</div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'theme-text' : 'text-gray-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                <Activity size={10} /> Data auto-synced to efficiency ledger
              </p>
            </div>
          </div>
        )}

        {/* ── EFFICIENCY LEDGER ── */}
        <div className="bg-[#ececec] rounded-[32px] p-8 flex flex-col gap-6 border-t-[8px] border-amber-400">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Efficiency Ledger</h3>
              <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Post-Event Analysis</p>
            </div>
            <LayoutDashboard size={14} className="text-gray-400" />
          </div>

          <div className="flex flex-col gap-3">
             <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col gap-2 relative overflow-hidden border border-gray-100 focus-within:border-amber-400 transition-colors">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Target Production (kg)</p>
                <div className="flex items-end gap-2">
                  <input type="number" value={totalPrepared} onChange={e => setTotalPrepared(e.target.value)}
                    placeholder="0" className="text-4xl font-black text-gray-900 border-none outline-none p-0 w-full" />
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                  <Utensils size={14} />
                </div>
             </div>

             <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col gap-2 relative overflow-hidden border border-gray-100 focus-within:border-amber-400 transition-colors">
                {/* Dynamically labeling leftover food based on form selection */}
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  Actual Leftover ({form.foodItems.length > 0 ? form.foodItems.slice(0, 2).join(', ') : 'Food'}) (kg)
                </p>
                <div className="flex items-end gap-2">
                  <input type="number" value={leftoverInput} onChange={e => setLeftoverInput(e.target.value)}
                    placeholder="0" className="text-4xl font-black text-gray-900 border-none outline-none p-0 w-full" />
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                  <TrendingDown size={14} />
                </div>
             </div>

             <button onClick={handleSurplusCalculate}
                className="w-full py-4 mt-2 bg-[#1a1a1a] text-white shadow-xl hover:bg-black rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">
                <Activity size={14} className="text-amber-400" /> Calculate Efficiency
             </button>
          </div>

          {/* Ledger Result */}
          {surplusResult && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-fade-in mt-2 flex flex-col gap-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Efficiency Score</p>
                    <p className="text-3xl font-black text-gray-900">{100 - parseFloat(surplusResult.wastePct)}<span className="text-lg text-gray-400">%</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Waste Factor</p>
                    <p className="text-3xl font-black text-red-500">{surplusResult.wastePct}<span className="text-lg text-red-400/50">%</span></p>
                  </div>
               </div>

               <div className="h-px w-full bg-gray-100" />

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Consumed</p>
                     <p className="text-lg font-bold text-gray-900">{surplusResult.consumed} kg</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Redistributable</p>
                     <div className="flex items-center justify-end gap-1.5">
                       <HeartHandshake size={12} className="text-amber-500" />
                       <p className="text-lg font-black text-amber-600">~{surplusResult.mealsWasted} Meals</p>
                     </div>
                  </div>
               </div>

               {/* New Redirect Button to Donate */}
               {surplusResult.mealsWasted > 0 && (
                 <button onClick={() => navigate('/ngo-dashboard')}
                   className="w-full mt-2 py-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-100 active:scale-95 transition-all">
                   <Navigation size={14} /> Send to NGO Partner Network
                 </button>
               )}
            </div>
          )}
        </div>

        {/* ── ACTIVE NGO PARTNERS ── */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col gap-6 mb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Users size={20} className="text-amber-600" />
             </div>
             <div>
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1.5">Active NGO Partners</h3>
                <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
                   Available for rapid surplus pickup within 45 minutes in selected zones.
                </p>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             {NEARBY_NGOS.slice(0, 2).map((ngo, i) => (
                <div key={ngo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                   <div>
                     <p className="text-[11px] font-black text-gray-900">{ngo.name}</p>
                     <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{ngo.distance}</p>
                   </div>
                   <span className="text-[8px] font-black text-green-600 bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                      Available
                   </span>
                </div>
             ))}
          </div>
          <button onClick={() => navigate('/ngo-dashboard')} className="w-full text-center py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            View All Partners
          </button>
        </div>

      </div>
    </div>
  );
}
