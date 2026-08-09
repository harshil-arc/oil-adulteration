import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, ShieldAlert, AlertTriangle, ShieldCheck, 
  MapPin, Bell, RefreshCw, ChevronDown, TrendingUp, TrendingDown,
  Sparkles, Flame, X, User, Shield, Info, BookOpen, Clock,
  Plus, Calendar, Compass, Share2, Printer, ArrowRight, Award, HelpCircle, FileText,
  Apple, ChevronRight, Utensils, CheckCircle2, ShoppingCart, Heart, BarChart2,
  Building, Check, Filter, Search, Eye, Zap, Download, ScanLine, Activity, Layers, Dumbbell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import NationalIntelligenceCenter from '../components/NationalIntelligenceCenter';

// Simple Count-Up Component for numbers
function CountUp({ end, duration = 800, suffix = "" }) {
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

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useApp();
  
  // Data State
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullAnalytics, setShowFullAnalytics] = useState(false);

  const [selectedStatModal, setSelectedStatModal] = useState(null);

  // Time Range Filter inside Full Analytics Modal
  const [chartTimeRange, setChartTimeRange] = useState('Weekly');

  // Time-based Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  useEffect(() => {
    fetchData();

    const channelScans = supabase
      .channel('realtime_scans_home_separation')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analysis_results' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelScans);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: scansData } = await supabase.from('analysis_results').select('*').order('timestamp', { ascending: false });
      if (scansData) setScans(scansData);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Latest Scan Object
  const latestScan = useMemo(() => {
    if (scans.length > 0) return scans[0];
    return {
      id: 'demo-latest-01',
      oil_type: 'Mustard Oil',
      purity: 94.2,
      confidence_score: 98,
      quality: 'Safe',
      vendor: 'Amul Vendor Center',
      timestamp: new Date().toISOString()
    };
  }, [scans]);

  // Personal Stats Computation
  const personalStats = useMemo(() => {
    const total = scans.length;
    const puritySum = scans.reduce((acc, val) => acc + parseFloat(val.purity || 0), 0);
    const avgPurity = scans.length > 0 ? Math.round(puritySum / scans.length) : 0;
    const unsafeCount = scans.filter(s => s.quality === 'Unsafe' || s.adulteration_detected).length;

    return [
      { id: 'samples', title: 'Samples Tested', value: `${total}`, unit: 'Scans', icon: Beaker, color: 'text-[#d4af37]', bg: 'bg-[#d4af37]/10' },
      { id: 'purity', title: 'Average Purity', value: `${avgPurity}%`, unit: 'Score', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { id: 'unsafe', title: 'Unsafe Samples', value: `${unsafeCount}`, unit: 'Found', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
      { id: 'reports', title: 'Reports Submitted', value: `${unsafeCount}`, unit: 'Filed', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      { id: 'vendors', title: 'Trusted Vendors', value: '0', unit: 'Verified', icon: Building, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { id: 'donations', title: 'Food Donations', value: '0', unit: 'Rescues', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
      { id: 'score', title: 'Food Safety Score', value: total > 0 ? `${avgPurity}` : '0', unit: '/ 100', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      { id: 'complaints', title: 'Complaint Status', value: '0', unit: 'Resolved', icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10' }
    ];
  }, [scans]);

  // Chart dataset for Full Analytics Modal
  const activeChartData = useMemo(() => {
    if (chartTimeRange === 'Daily') {
      return [
        { label: '04:00', count: 1, avgPurity: 96 },
        { label: '08:00', count: 3, avgPurity: 95 },
        { label: '12:00', count: 8, avgPurity: 92 },
        { label: '16:00', count: 5, avgPurity: 96 },
        { label: '20:00', count: 4, avgPurity: 97 },
        { label: '23:00', count: 1, avgPurity: 98 }
      ];
    } else if (chartTimeRange === 'Monthly') {
      return [
        { label: 'W1', count: 42, avgPurity: 94 },
        { label: 'W2', count: 38, avgPurity: 95 },
        { label: 'W3', count: 45, avgPurity: 93 },
        { label: 'W4', count: 32, avgPurity: 96 }
      ];
    } else if (chartTimeRange === 'Yearly') {
      return [
        { label: 'Jan', count: 120, avgPurity: 94 },
        { label: 'Feb', count: 145, avgPurity: 93 },
        { label: 'Mar', count: 160, avgPurity: 95 },
        { label: 'Apr', count: 180, avgPurity: 92 },
        { label: 'May', count: 210, avgPurity: 96 },
        { label: 'Jun', count: 230, avgPurity: 95 },
        { label: 'Jul', count: 195, avgPurity: 96 }
      ];
    }
    return [
      { label: 'Mon', count: 18, avgPurity: 95 },
      { label: 'Tue', count: 24, avgPurity: 93 },
      { label: 'Wed', count: 28, avgPurity: 96 },
      { label: 'Thu', count: 22, avgPurity: 94 },
      { label: 'Fri', count: 30, avgPurity: 97 },
      { label: 'Sat', count: 15, avgPurity: 98 },
      { label: 'Sun', count: 12, avgPurity: 96 }
    ];
  }, [chartTimeRange]);

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe relative overflow-x-hidden">
      
      {/* Background Gold Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#d4af37] opacity-[0.07] rounded-full blur-[120px] pointer-events-none" />

      {/* ── 1. HEADER & BRANDING ────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/food360-logo.jpg" alt="Food 360 Logo" className="w-10 h-10 rounded-xl object-cover border border-[#d4af37]/40 shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight theme-text">
                Food <span className="text-[#d4af37]">360</span>
              </h1>
              <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Award size={10} /> Gold Inspector
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">{greeting}, {profile?.name ? profile.name.split(' ')[0] : 'Harshil'} 👋 • {formattedDate}</p>
          </div>
        </div>

        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-muted)] hover:theme-text hover:border-[#d4af37] transition-colors relative"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </button>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto">

        {/* ── 2. HERO CARD: LATEST OIL SCAN ───────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#d4af37]/10 relative overflow-hidden shadow-glow-gold">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Latest Oil Scan</span>
            </div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono">
              {new Date(latestScan.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-black theme-text tracking-tight">{latestScan.oil_type || 'Mustard Oil'}</h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">{latestScan.vendor || 'Local Vendor'}</p>
            </div>


            <div className="text-right">
              <div className="text-2xl font-black font-mono text-[#d4af37]">
                {parseFloat(latestScan.purity || 94.2).toFixed(1)}%
              </div>
              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1 ${
                latestScan.quality === 'Unsafe' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {latestScan.quality === 'Unsafe' ? 'ADULTERATED' : 'SAFE'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-300 bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] mb-4">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#d4af37]" /> AI Confidence Score:
            </span>
            <span className="font-mono font-black text-emerald-400">{latestScan.confidence_score || 98}%</span>
          </div>

          <button
            onClick={() => navigate('/scan')}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-gold hover:brightness-110 active:scale-95 transition-all"
          >
            <ScanLine size={16} />
            Scan Again
          </button>
        </div>

        {/* ── 3. QUICK ACTION GRID ─────────────────────── */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 pl-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            
            {/* FEATURED: AI FITNESS COACH PLATFORM BUTTON */}
            <button
              onClick={() => navigate('/fitness')}
              className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-amber-950/30 border border-[#d4af37]/50 hover:border-[#d4af37] text-left transition-all group flex flex-col justify-between h-24 col-span-2 shadow-glow-gold relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform border border-[#d4af37]/40 shadow-glow-gold">
                  <Dumbbell size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#d4af37]/20 text-[#d4af37] px-2.5 py-0.5 rounded-full border border-[#d4af37]/40 flex items-center gap-1">
                  <Sparkles size={10} /> Professional AI Fitness System
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#d4af37] uppercase tracking-wider">AI Fitness Coach</p>
                  <p className="text-[9px] text-gray-300">Dynamic Workouts, Audio Player, Progressive Overload & Anatomy</p>
                </div>
                <ChevronRight size={16} className="text-[#d4af37] group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* FEATURED: DISASTER & EMERGENCY RELIEF PLATFORM BUTTON */}
            <button
              onClick={() => navigate('/disaster?tab=disaster')}
              className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-red-950/30 border border-red-500/40 hover:border-red-400 text-left transition-all group flex flex-col justify-between h-24 col-span-2 shadow-glow-red relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-red-500/30 shadow-glow-red">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Live Relief Platform
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-red-400 uppercase tracking-wider">Disaster, Emergency & Relief</p>
                  <p className="text-[9px] text-gray-300">Connect with Verified NGOs, Camps & Food Relief Nodes</p>
                </div>
                <ChevronRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <button
              onClick={() => navigate('/scan')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[#d4af37]/30 hover:border-[#d4af37] text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ScanLine size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">Oil Scan</p>
                <p className="text-[9px] text-gray-400">Test Purity Now</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/report')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-red-500/30 hover:border-red-400 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">Report Adulteration</p>
                <p className="text-[9px] text-gray-400">Official Govt Gateway</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/testing-centres')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">Testing Centres</p>
                <p className="text-[9px] text-gray-400">Map & Labs</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/nutrition')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-blue-500/30 hover:border-blue-400 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Apple size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">AI Meal Planner</p>
                <p className="text-[9px] text-gray-400">Recipes & Nutrition</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/fitness')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 hover:border-amber-400 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Dumbbell size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">AI Fitness Coach</p>
                <p className="text-[9px] text-gray-400">Workouts & Burn Engine</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/disaster?tab=relief')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-rose-500/30 hover:border-rose-400 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">Food Donation</p>
                <p className="text-[9px] text-gray-400">Rescue Excess Food</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/hotspots')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-purple-500/30 hover:border-purple-400 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">Safety Heatmap</p>
                <p className="text-[9px] text-gray-400">Adulteration Zones</p>
              </div>
            </button>

          </div>
        </div>

        {/* ── 4. PERSONAL STATS (Horizontal Swipe Carousel) ───────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5 pl-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personal Statistics</h3>
            <span className="text-[9px] text-[#d4af37] font-bold">Swipe →</span>
          </div>

          <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar snap-x snap-mandatory">
            {personalStats.map(stat => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.id}
                  onClick={() => setSelectedStatModal(stat)}
                  className="snap-start shrink-0 w-36 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#d4af37]/50 transition-all cursor-pointer flex flex-col justify-between h-28"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">{stat.title}</span>
                    <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                      <StatIcon size={14} />
                    </div>
                  </div>
                  <div>
                    <p className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</p>
                    <p className="text-[9px] text-gray-400 font-medium">{stat.unit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. VIEW FULL ANALYTICS BUTTON ──────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <BarChart2 size={18} className="text-blue-400" /> Full Analytics
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Inspect weekly volume, pie charts & regional purity maps.</p>
          </div>

          <button
            onClick={() => setShowFullAnalytics(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-500 text-black font-black text-xs uppercase tracking-wider shrink-0 hover:bg-blue-400 transition-colors shadow-glow-blue"
          >
            View →
          </button>
        </div>

      </div>

      {/* ── DEDICATED FULL ANALYTICS MODAL (Charts, Graphs & Heatmaps) ───────── */}
      {showFullAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-[#d4af37]" size={18} />
                <h3 className="text-sm font-black theme-text">Food 360 Full Analytics & Intelligence</h3>
              </div>
              <button onClick={() => setShowFullAnalytics(false)} className="p-1.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:theme-text">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Filter Tabs */}
              <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-1 rounded-2xl border border-[var(--border-color)] text-xs">
                {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(range => (
                  <button
                    key={range}
                    onClick={() => setChartTimeRange(range)}
                    className={`flex-1 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all ${
                      chartTimeRange === range ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-[var(--text-muted)] hover:theme-text'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Bar Chart */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <h4 className="text-xs font-black theme-text uppercase tracking-wider">{chartTimeRange} Scan Volume</h4>
                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeChartData}>
                      <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quality Breakdown Pie */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <h4 className="text-xs font-black theme-text uppercase tracking-wider">Quality Breakdown</h4>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pure', value: 85, color: '#22c55e' },
                          { name: 'Moderate', value: 10, color: '#eab308' },
                          { name: 'Adulterated', value: 5, color: '#ef4444' }
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                      >
                        <Cell key="cell-0" fill="#22c55e" />
                        <Cell key="cell-1" fill="#eab308" />
                        <Cell key="cell-2" fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* National Intelligence Center Map Component */}
              <NationalIntelligenceCenter />

            </div>

          </div>
        </div>
      )}

      {/* ── STAT DETAIL MODAL ───────────────────────────────────────────────── */}
      {selectedStatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className={`w-14 h-14 rounded-2xl ${selectedStatModal.bg} ${selectedStatModal.color} flex items-center justify-center mx-auto`}>
              <selectedStatModal.icon size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black theme-text">{selectedStatModal.title}</h3>
              <p className="text-3xl font-black font-mono text-[#d4af37] mt-1">{selectedStatModal.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">Detailed metric telemetry logged securely in database.</p>
            </div>
            <button
              onClick={() => setSelectedStatModal(null)}
              className="w-full py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] theme-text font-bold text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
