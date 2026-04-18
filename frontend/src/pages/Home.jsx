import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Zap, AlertTriangle, CheckCircle, Droplets,
  HeartHandshake, TrendingDown, Sparkles, CalendarDays,
  Users, MapPin, Utensils, Plus, X, ChevronDown, Activity,
  Siren, Wifi, WifiOff, Info, Shield, Phone, Navigation,
  Bell, LayoutDashboard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useOffline } from '../context/OfflineContext';
import axios from 'axios';
import { STATES_LIST, getCities, getRegionalFoods } from '../data/indiaRegions';

const API = 'http://localhost:5000/api';

const EVENT_TYPES = ['Wedding', 'Corporate', 'Festival', 'Party', 'NGO Camp', 'College Event', 'Other'];
const WEATHER_OPTIONS = ['Clear', 'Cloudy', 'Rainy', 'Hot'];

// Nearby NGOs - in production fetch from DB based on location
const NEARBY_NGOS = [
  { id: 'n1', name: 'Roti Bank India', distance: '2.4 km', urgency: 'high', contact: '+91 98765 43210' },
  { id: 'n2', name: 'Feeding India', distance: '3.8 km', urgency: 'medium', contact: '+91 87654 32109' },
  { id: 'n3', name: 'No Food Waste NGO', distance: '5.1 km', urgency: 'low', contact: '+91 76543 21098' },
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
  const { deviceStatus } = useApp();
  const { isOnline, pendingSync } = useOffline();

  const [readings, setReadings] = useState([]);
  const [disaster, setDisaster] = useState({ active: false });
  const [form, setForm] = useState(DEFAULT_FORM);
  const [prediction, setPrediction] = useState(null);
  const [loadingPred, setLoadingPred] = useState(false);
  const [showForm, setShowForm] = useState(true);

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
      if (data?.data) setPrediction(data.data);
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
    }
    setLoadingPred(false);
    setShowForm(false);
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

  return (
    <div className="flex flex-col theme-bg min-h-screen pb-24 transition-colors duration-300">

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

      {/* ── HEADER ── */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 z-30 bg-[#f5f5f5]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
             <LayoutDashboard size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-[14px] font-black theme-text tracking-tighter uppercase leading-none">
              AI FOOD QUALITY & WASTE
            </h1>
            <p className="theme-text-muted text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Kitchen Intelligence System</p>
          </div>
        </div>
        <div className="relative">
          <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center relative">
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
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Est. Savings</p>
                  <p className="text-2xl font-black">$1.2k</p>
                </div>
              </div>
              
              <button onClick={handlePredict} disabled={loadingPred}
                className="bg-[#eab308] hover:bg-[#ca8a04] active:scale-95 transition-all text-black px-4 py-3 rounded-2xl flex items-center gap-2 font-black text-[11px] shadow-lg shadow-yellow-500/20">
                {loadingPred ? 'Processing...' : 'Predict Food Demand'}
                <Sparkles size={14} />
              </button>
            </div>
          </div>
          
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -mr-32 -mt-32" />
        </div>

        {/* ── STATUS INDICATORS ── */}
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-[24px] p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-2xl flex items-center justify-center">
                <Droplets size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Oil Integrity</p>
                <p className="text-sm font-black text-gray-900">{oilSafe ? 'Optimal Range' : 'Degraded (Action Required)'}</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
              {oilSafe ? '68%' : '24%'}
            </span>
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

          <div className="bg-white rounded-[24px] p-5 flex items-center justify-between shadow-sm" onClick={() => navigate('/history')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-2xl flex items-center justify-center">
                <CalendarDays size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next Forecast</p>
                <p className="text-sm font-black text-gray-900">In 2h 15m</p>
              </div>
            </div>
            <Plus size={16} className="text-gray-300" />
          </div>
        </div>

        {/* ── EVENT CONFIGURATION ── */}
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

            {/* State & City (Preserved as requested) */}
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

            {/* Regional Suggestions (Styled) */}
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

            {/* Date, Weather, Food Menu (Condensed) */}
            <div className="mt-2 flex flex-col gap-4">
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Food Menu</p>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add dishes..." value={form.foodInput}
                      onChange={e => setForm(f => ({ ...f, foodInput: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addFoodItem(form.foodInput)}
                      className="flex-1 bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none" />
                    <button onClick={() => addFoodItem(form.foodInput)} className="w-14 bg-amber-400 text-black rounded-2xl flex items-center justify-center font-black"><Plus size={20} /></button>
                  </div>
                  {form.foodItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.foodItems.map(item => (
                        <span key={item} className="flex items-center gap-2 text-[10px] font-bold bg-white text-gray-700 shadow-sm border border-gray-100 px-4 py-2 rounded-xl">
                          {item} <button onClick={() => removeFoodItem(item)}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* ── PREDICTION RESULT ── */}
        {prediction && (
          <div className="theme-card border theme-border rounded-[20px] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit size={14} className="text-blue-500" />
                <span className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.12em]">AI Prediction Result</span>
              </div>
              <button onClick={() => { setPrediction(null); setShowForm(true); }} className="text-[9px] theme-text-muted underline">Edit</button>
            </div>
            {form.eventName && <p className="text-xs font-semibold theme-text-secondary">📋 {form.eventName} · {form.type} · {Number(form.guestCount).toLocaleString()} guests{form.city ? ` · ${form.city}, ${form.state}` : ''}</p>}

            <div className="theme-elevated border theme-border rounded-[16px] p-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] theme-text-muted uppercase tracking-widest font-bold mb-1">Total Food Required</p>
                <div className="flex items-end gap-2">
                  <span className="text-[48px] font-black leading-none theme-text">{prediction.predicted_food_kg}</span>
                  <span className="text-sm font-bold theme-text-secondary mb-1">kg</span>
                </div>
                <p className="text-[10px] theme-text-muted mt-1">Confidence: <span className="font-bold theme-text">{prediction.confidence}%</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] theme-text-muted uppercase tracking-widest font-bold mb-1">Waste Risk</p>
                <span className={`text-sm font-black px-3 py-1.5 rounded-xl border ${riskBorder} ${riskColor}`}>{riskLabel}</span>
                <p className="text-[10px] theme-text-muted mt-1">{prediction.waste_risk_score}/100</p>
              </div>
            </div>

            <div className="bg-[#d4af37]/10 border border-[#d4af37]/25 rounded-[14px] p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={12} className="text-[#d4af37]" />
                <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest">AI Recommendation</span>
              </div>
              <p className="text-xs theme-text leading-relaxed">{prediction.ai_recommendation}</p>
            </div>

            {/* Pipeline */}
            <div>
              <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest mb-3">Food Flow Pipeline</p>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-5 right-5 top-[18px] h-px theme-elevated" />
                {[
                  { icon: <BrainCircuit size={12} />, label: 'Forecast' },
                  { icon: <Utensils size={12} />, label: 'Prepare', warn: prediction.waste_risk_score > 40 },
                  { icon: <Users size={12} />, label: 'Serve' },
                  { icon: <TrendingDown size={12} />, label: 'Leftover' },
                  { icon: <HeartHandshake size={12} />, label: 'Donate' },
                ].map(({ icon, label, warn }) => (
                  <div key={label} className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-9 h-9 rounded-full border flex items-center justify-center theme-card ${warn ? 'border-orange-500/40 text-orange-500' : 'theme-border theme-text-muted'}`}>{icon}</div>
                    <span className={`text-[7px] font-black uppercase tracking-widest ${warn ? 'text-orange-500' : 'theme-text-muted'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── OIL LIFECYCLE MONITORING ── */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Droplets size={18} className="text-amber-600" />
             </div>
             <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Oil Lifecycle Monitoring</h3>
          </div>

          <div className="flex flex-col gap-6">
            {/* Level bar */}
            <div>
              <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">
                <span>TIME/LEVEL (Est.)</span>
                <span>NEXT CHANGE: 2 DAYS</span>
              </div>
              <div className="h-2 w-full bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full bg-amber-900/60 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Stats Table */}
            <div className="flex flex-col gap-1">
               <div className="bg-[#f5f5f5] p-4 rounded-xl flex justify-between items-center transition-all hover:bg-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-500">Temperature</span>
                  <span className="text-xs font-black text-gray-900">{readings.length > 0 ? `${readings[0].temperature || readings[0].temp_c}°C` : '175°C'}</span>
               </div>
               <div className="bg-[#f5f5f5] p-4 rounded-xl flex justify-between items-center transition-all hover:bg-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-500">Polarity Index</span>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${oilSafe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {readings.length > 0 ? readings[0].quality : 'Safe'}
                  </span>
               </div>
            </div>

            <button onClick={() => navigate('/scan')}
              className="w-full py-4 bg-[#525252] hover:bg-[#404040] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-[0.98]">
              Start Oil Analysis
            </button>
          </div>
        </div>

        {/* ── EFFICIENCY LEDGER ── */}
        <div className="bg-[#ececec] rounded-[32px] p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Efficiency Ledger</h3>
            <LayoutDashboard size={14} className="text-gray-400" />
          </div>

          <div className="flex flex-col gap-3">
             <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col gap-2 relative overflow-hidden">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Prepared Inventory (kg)</p>
                <div className="flex items-end gap-2">
                  <input type="number" value={totalPrepared} onChange={e => setTotalPrepared(e.target.value)}
                    placeholder="0" className="text-4xl font-black text-gray-900 border-none outline-none p-0 w-32" />
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-200">
                  <LayoutDashboard size={14} />
                </div>
             </div>

             <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col gap-2 relative overflow-hidden">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Leftover Dal (kg)</p>
                <div className="flex items-end gap-2">
                  <input type="number" value={leftoverInput} onChange={e => setLeftoverInput(e.target.value)}
                    placeholder="0" className="text-4xl font-black text-gray-900 border-none outline-none p-0 w-32" />
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                </div>
             </div>

             <button onClick={handleSurplusCalculate}
                className="w-full py-4 bg-white text-gray-900 shadow-sm rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                <LayoutDashboard size={14} /> Calculate Waste
             </button>
          </div>

          {/* Ledger Result */}
          {surplusResult && (
            <div className="bg-white/50 rounded-2xl p-6 border border-white/20">
               <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Efficiency Score</p>
                    <p className="text-3xl font-black text-gray-900">{100 - parseFloat(surplusResult.wastePct)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Redistributable</p>
                    <p className="text-xl font-black text-amber-600">~{surplusResult.mealsWasted} Meals</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* ── ACTIVE NGO PARTNERS ── */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#f5f5f5] rounded-2xl flex items-center justify-center">
                <Users size={20} className="text-gray-400" />
             </div>
             <div>
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1.5">Active NGO Partners</h3>
                <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
                   FoodGlobal and Local Harvest are currently available for surplus pickup within 45 minutes.
                </p>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             {NEARBY_NGOS.slice(0, 2).map((ngo, i) => (
                <div key={ngo.id} className="flex items-center justify-between p-1">
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-md uppercase tracking-widest">Available</span>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{ngo.distance} Away</span>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* ── EFFICIENCY INSIGHT ── */}
        <div className="bg-[#1a1a1a] rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl mb-6">
          <div className="relative z-10 flex items-start gap-6">
             <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
                <Zap size={20} className="text-black" />
             </div>
             <div className="flex flex-col gap-3">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Efficiency Insight</h3>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                   Reducing salad production by 12% for weddings with >450 guests could save $450/event.
                </p>
                <button className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                   Apply Optimization <Plus size={12} />
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Sub-components ── */
function StatusChip({ label, value, good, bad }) {
  const color = bad ? 'text-red-500' : good ? 'text-green-500' : 'theme-text-secondary';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] theme-text-muted uppercase font-bold tracking-widest">{label}</span>
      <span className={`text-[10px] font-black ${color}`}>{value}</span>
    </div>
  );
}

function InsightRow({ icon, text, highlight }) {
  return (
    <li className={`flex gap-3 items-start p-3 rounded-xl border ${highlight ? 'theme-elevated theme-border' : 'border-transparent'}`}>
      <div className="mt-0.5 shrink-0 theme-elevated p-1.5 rounded-lg border theme-border">{icon}</div>
      <span className={`text-xs leading-relaxed font-medium ${highlight ? 'theme-text' : 'theme-text-secondary'}`}>{text}</span>
    </li>
  );
}
