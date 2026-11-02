import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, ShieldAlert, AlertTriangle, ShieldCheck, 
  MapPin, Bell, RefreshCw, ChevronDown, TrendingUp, TrendingDown,
  Sparkles, Flame, X, User, Shield, Info, BookOpen, Clock,
  Plus, Calendar, Compass, Share2, Printer, ArrowRight, Award, HelpCircle, FileText,
  Apple, ChevronRight, Utensils, CheckCircle2, ShoppingCart, Heart, BarChart2,
  Building, Check, Filter, Search, Eye, Zap, Download, ScanLine, Activity, Layers, Droplet, FlaskConical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  // Data State
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullAnalytics, setShowFullAnalytics] = useState(false);

  // Time Range Filter inside Full Analytics Modal (Default: 'Today' for real daily readings)
  const [chartTimeRange, setChartTimeRange] = useState('Today');

  // Time-based Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting_morning', 'Good Morning');
    if (hour < 18) return t('home.greeting_afternoon', 'Good Afternoon');
    return t('home.greeting_evening', 'Good Evening');
  }, [t]);

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
      
      let localScans = [];
      try {
        localScans = JSON.parse(localStorage.getItem('spectratrust_recent_scans') || '[]');
      } catch (_) {}

      const all = [...(scansData || []), ...localScans];
      // Exclude previous mock/demo dummy records
      const realOnly = all.filter(s => s && s.id !== 'demo-latest-01' && !String(s.id).startsWith('demo-') && s.oil_type !== 'demo');
      
      // Deduplicate by id or unique timestamp
      const map = new Map();
      realOnly.forEach(s => {
        const k = s.id || `${s.oil_type}_${s.timestamp || s.created_at}`;
        if (!map.has(k)) map.set(k, s);
      });

      const sorted = Array.from(map.values()).sort(
        (a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0)
      );

      setScans(sorted);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearPreviousReports = async () => {
    if (window.confirm("Clear previous cached reports and reset counts to fresh readings from today?")) {
      try {
        localStorage.removeItem('spectratrust_recent_scans');
        localStorage.removeItem('spectratrust_personal_stats');
      } catch (_) {}
      await fetchData();
    }
  };

  // Latest Scan Object (Real scans only; null if no scans yet)
  const latestScan = useMemo(() => {
    return scans.length > 0 ? scans[0] : null;
  }, [scans]);

  // Check if a date string is today
  const isToday = (ts) => {
    if (!ts) return false;
    const d = new Date(ts);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Today's real reading scans
  const todayScans = useMemo(() => {
    return scans.filter(s => isToday(s.timestamp || s.created_at));
  }, [scans]);

  const todayCount = todayScans.length;

  const todaySafeCount = useMemo(() => {
    return todayScans.filter(s => 
      (s.quality === 'Safe' || s.quality === 'pure' || parseFloat(s.purity || 0) >= 80) &&
      s.quality !== 'Unsafe' && !s.adulteration_detected
    ).length;
  }, [todayScans]);

  const todayUnsafeCount = useMemo(() => {
    return todayScans.filter(s => 
      s.quality === 'Unsafe' || s.quality === 'heavy' || parseFloat(s.purity || 0) < 50 || s.adulteration_detected
    ).length;
  }, [todayScans]);

  const todayModerateCount = Math.max(0, todayCount - todaySafeCount - todayUnsafeCount);

  const todayAvgPurity = useMemo(() => {
    if (todayCount === 0) return 0;
    const sum = todayScans.reduce((acc, s) => acc + parseFloat(s.purity || 0), 0);
    return Math.round(sum / todayCount);
  }, [todayScans, todayCount]);

  // Chart dataset for Full Analytics Modal based 100% on real data
  const activeChartData = useMemo(() => {
    if (chartTimeRange === 'Today' || chartTimeRange === 'Daily') {
      const slots = [
        { label: '00:00-04:00', startH: 0, endH: 4 },
        { label: '04:00-08:00', startH: 4, endH: 8 },
        { label: '08:00-12:00', startH: 8, endH: 12 },
        { label: '12:00-16:00', startH: 12, endH: 16 },
        { label: '16:00-20:00', startH: 16, endH: 20 },
        { label: '20:00-24:00', startH: 20, endH: 24 }
      ];

      return slots.map(slot => {
        const matching = todayScans.filter(s => {
          const d = new Date(s.timestamp || s.created_at);
          const h = d.getHours();
          return h >= slot.startH && h < slot.endH;
        });
        const count = matching.length;
        const avgPurity = count > 0 
          ? Math.round(matching.reduce((acc, m) => acc + parseFloat(m.purity || 0), 0) / count)
          : 0;
        return {
          label: slot.label,
          count,
          avgPurity
        };
      });
    } else if (chartTimeRange === 'Weekly') {
      const now = new Date();
      const currentDay = now.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return dayNames.map((name, i) => {
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + i);
        const dateStr = targetDate.toDateString();

        const matching = scans.filter(s => {
          const d = new Date(s.timestamp || s.created_at);
          return d.toDateString() === dateStr;
        });

        const count = matching.length;
        const avgPurity = count > 0
          ? Math.round(matching.reduce((acc, m) => acc + parseFloat(m.purity || 0), 0) / count)
          : 0;
        return {
          label: name,
          count,
          avgPurity
        };
      });
    } else if (chartTimeRange === 'Monthly') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const weekSlots = [
        { label: 'W1', startD: 1, endD: 7 },
        { label: 'W2', startD: 8, endD: 14 },
        { label: 'W3', startD: 15, endD: 21 },
        { label: 'W4', startD: 22, endD: 31 }
      ];

      return weekSlots.map(slot => {
        const matching = scans.filter(s => {
          const d = new Date(s.timestamp || s.created_at);
          return (
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth &&
            d.getDate() >= slot.startD &&
            d.getDate() <= slot.endD
          );
        });
        const count = matching.length;
        const avgPurity = count > 0
          ? Math.round(matching.reduce((acc, m) => acc + parseFloat(m.purity || 0), 0) / count)
          : 0;
        return {
          label: slot.label,
          count,
          avgPurity
        };
      });
    } else if (chartTimeRange === 'Yearly') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return monthNames.map((name, mIdx) => {
        const matching = scans.filter(s => {
          const d = new Date(s.timestamp || s.created_at);
          return d.getFullYear() === currentYear && d.getMonth() === mIdx;
        });
        const count = matching.length;
        const avgPurity = count > 0
          ? Math.round(matching.reduce((acc, m) => acc + parseFloat(m.purity || 0), 0) / count)
          : 0;
        return {
          label: name,
          count,
          avgPurity
        };
      });
    }
    return [];
  }, [chartTimeRange, todayScans, scans]);

  // Quality Breakdown Pie Chart based on real scan readings
  const activePieData = useMemo(() => {
    const dataset = (chartTimeRange === 'Today' || chartTimeRange === 'Daily') ? todayScans : scans;
    const pureCount = dataset.filter(s => 
      (s.quality === 'Safe' || s.quality === 'pure' || parseFloat(s.purity || 0) >= 80) &&
      s.quality !== 'Unsafe' && !s.adulteration_detected
    ).length;
    const moderateCount = dataset.filter(s => 
      (s.quality === 'Moderate' || s.quality === 'moderate' || (parseFloat(s.purity || 0) >= 50 && parseFloat(s.purity || 0) < 80))
    ).length;
    const unsafeCount = dataset.filter(s => 
      s.quality === 'Unsafe' || s.quality === 'heavy' || parseFloat(s.purity || 0) < 50 || s.adulteration_detected
    ).length;

    const items = [
      { name: 'Pure / Safe', value: pureCount, color: '#22c55e' },
      { name: 'Moderate', value: moderateCount, color: '#eab308' },
      { name: 'Adulterated', value: unsafeCount, color: '#ef4444' }
    ].filter(item => item.value > 0);

    return {
      items,
      total: pureCount + moderateCount + unsafeCount,
      pureCount,
      moderateCount,
      unsafeCount
    };
  }, [chartTimeRange, todayScans, scans]);

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe relative overflow-x-hidden">
      
      {/* Background Gold Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#d4af37] opacity-[0.07] rounded-full blur-[120px] pointer-events-none" />

      {/* ── 1. HEADER & BRANDING ────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/spectratrust-logo.jpg" alt="SpectraTrust Logo" className="w-10 h-10 rounded-xl object-cover border border-[#d4af37]/40 shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight theme-text">
                Spectra<span className="text-[#d4af37]">Trust</span>
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
              <span className={`w-2.5 h-2.5 rounded-full ${latestScan ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">{t('home.latest_scan', 'Latest Oil Scan')}</span>
            </div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono">
              {latestScan ? new Date(latestScan.timestamp || latestScan.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
            </span>
          </div>

          {latestScan ? (
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-black theme-text tracking-tight">{latestScan.oil_type || t('home.mustard_oil', 'Mustard Oil')}</h2>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">{latestScan.vendor || t('home.local_vendor', 'Local Market Vendor')}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#d4af37]">
                    {parseFloat(latestScan.purity || 0).toFixed(1)}%
                  </div>
                  <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1 ${
                    latestScan.quality === 'Unsafe' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {latestScan.quality === 'Unsafe' ? t('common.unsafe', 'ADULTERATED') : t('common.safe', 'SAFE')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300 bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] mb-4">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#d4af37]" /> {t('home.ai_confidence', 'AI Confidence Score:')}
                </span>
                <span className="font-mono font-black text-emerald-400">{latestScan.confidence_score || 95}%</span>
              </div>
            </>
          ) : (
            <div className="py-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto mb-2 border border-[#d4af37]/30">
                <Droplet size={22} />
              </div>
              <h2 className="text-base font-black theme-text">No Scans Recorded Yet Today</h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
                All fake reports cleared. Start a new optical scan or physical test to begin tracking live data.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/scan')}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-gold hover:brightness-110 active:scale-95 transition-all mt-1"
          >
            <ScanLine size={16} />
            {latestScan ? t('home.scan_again', 'Scan Again') : 'Start First Scan'}
          </button>
        </div>

        {/* ── 3. QUICK ACTION GRID ─────────────────────── */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 pl-1">{t('home.quick_actions', 'Quick Actions')}</h3>
          <div className="grid grid-cols-2 gap-3">
            
            {/* FEATURED: PHYSICAL OIL TESTING PLATFORM BUTTON */}
            <button
              onClick={() => navigate('/physical-oil-testing')}
              className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-amber-950/30 border border-[#d4af37]/50 hover:border-[#d4af37] text-left transition-all group flex flex-col justify-between h-24 col-span-2 shadow-glow-gold relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform border border-[#d4af37]/40 shadow-glow-gold">
                  <FlaskConical size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#d4af37]/20 text-[#d4af37] px-2.5 py-0.5 rounded-full border border-[#d4af37]/40 flex items-center gap-1">
                  <Sparkles size={10} /> {t('home.zero_device_lab', 'Zero-Device Kitchen Lab')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#d4af37] uppercase tracking-wider">{t('home.physical_testing', 'Physical Oil Testing')}</p>
                  <p className="text-[9px] text-gray-300">{t('home.physical_desc', 'Rapid Home Screening, Interactive Lab & FSSAI DART Protocols')}</p>
                </div>
                <ChevronRight size={16} className="text-[#d4af37] group-hover:translate-x-1 transition-transform" />
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
                <p className="text-xs font-black theme-text uppercase tracking-wider">{t('home.oil_scan', 'Oil Scan')}</p>
                <p className="text-[9px] text-gray-400">{t('home.test_purity', 'Test Purity Now')}</p>
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
                <p className="text-xs font-black theme-text uppercase tracking-wider">{t('home.report_adulteration', 'Report Adulteration')}</p>
                <p className="text-[9px] text-gray-400">{t('home.official_gateway', 'Official Govt Gateway')}</p>
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
                <p className="text-xs font-black theme-text uppercase tracking-wider">{t('home.testing_centres', 'Testing Centres')}</p>
                <p className="text-[9px] text-gray-400">{t('home.lab_locator', 'NABL Lab Locator')}</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/oilwise')}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-blue-500/30 hover:border-blue-400 text-left transition-all group flex flex-col justify-between h-24"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplet size={18} />
              </div>
              <div>
                <p className="text-xs font-black theme-text uppercase tracking-wider">OilWise Advisor</p>
                <p className="text-[9px] text-gray-400">Health Oil Recommender</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/food-donation')}
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

        {/* ── 4. FULL ANALYTICS ────────────────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={18} className="text-blue-400" /> Full Analytics
              </h3>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                {todayCount} Today
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Live reading counts, real-time volume graphs & quality distribution.
            </p>
          </div>

          <button
            onClick={() => setShowFullAnalytics(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-500 text-black font-black text-xs uppercase tracking-wider shrink-0 hover:bg-blue-400 transition-colors shadow-glow-blue flex items-center gap-1.5"
          >
            <span>View</span> <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* ── DEDICATED FULL ANALYTICS MODAL (Real Today Data & Dynamic Graphs) ───────── */}
      {showFullAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-[#d4af37]" size={18} />
                <div>
                  <h3 className="text-sm font-black theme-text">SpectraTrust Full Analytics & Live Intelligence</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">Computed dynamically from real scanner & physical test readings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClearPreviousReports}
                  title="Clear previous cached reports and reset counts"
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Reset Cache</span>
                </button>
                <button 
                  onClick={() => setShowFullAnalytics(false)} 
                  className="p-1.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:theme-text transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Real Today Metrics KPI Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Today's Real-Time Reading Summary</h4>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span className="text-[10px] font-bold uppercase">Today Scans</span>
                      <Activity size={14} className="text-[#d4af37]" />
                    </div>
                    <p className="text-2xl font-black font-mono theme-text">{todayCount}</p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Real samples logged</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span className="text-[10px] font-bold uppercase">Avg Purity</span>
                      <Sparkles size={14} className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black font-mono text-emerald-400">
                      {todayCount > 0 ? `${todayAvgPurity}%` : '--'}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Today's mean purity</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span className="text-[10px] font-bold uppercase">Safe Samples</span>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black font-mono text-emerald-400">{todaySafeCount}</p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Compliant batches</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span className="text-[10px] font-bold uppercase">Adulterated</span>
                      <ShieldAlert size={14} className="text-red-400" />
                    </div>
                    <p className="text-2xl font-black font-mono text-red-400">{todayUnsafeCount}</p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Flagged adulterated</p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-1 rounded-2xl border border-[var(--border-color)] text-xs">
                {['Today', 'Weekly', 'Monthly', 'Yearly'].map(range => (
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

              {/* Bar Chart (Real Scan Counts) */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black theme-text uppercase tracking-wider">{chartTimeRange} Scan Volume</h4>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Total: {activeChartData.reduce((acc, d) => acc + d.count, 0)} scans
                  </span>
                </div>
                
                {activeChartData.some(d => d.count > 0) ? (
                  <div className="h-48 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeChartData}>
                        <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }} 
                          formatter={(value, name) => [value, name === 'count' ? 'Scans' : name]}
                        />
                        <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4">
                    <Activity size={28} className="text-[#d4af37]/40 mb-2" />
                    <p className="text-xs font-bold theme-text">No real readings recorded yet for {chartTimeRange.toLowerCase()}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 max-w-sm">
                      Previous fake reports have been removed. Perform an oil scan or physical test to see live counts on this graph.
                    </p>
                  </div>
                )}
              </div>

              {/* Quality Breakdown Pie (Real Quality Distribution) */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black theme-text uppercase tracking-wider">Quality Distribution</h4>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {activePieData.total} sample{activePieData.total === 1 ? '' : 's'}
                  </span>
                </div>

                {activePieData.total > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
                    <div className="h-44 w-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activePieData.items}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                          >
                            {activePieData.items.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 text-xs font-medium w-full max-w-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-emerald-500/20">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Pure / Safe
                        </span>
                        <span className="font-mono font-bold text-emerald-400">{activePieData.pureCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-yellow-500/20">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> Moderate
                        </span>
                        <span className="font-mono font-bold text-yellow-400">{activePieData.moderateCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-red-500/20">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Adulterated
                        </span>
                        <span className="font-mono font-bold text-red-400">{activePieData.unsafeCount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 w-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs font-bold theme-text">No quality distribution data yet</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Real purity classifications will automatically render once new readings are completed today.
                    </p>
                  </div>
                )}
              </div>

              {/* Today's Live Reading Log */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-[#d4af37]" /> Today's Live Reading Log
                  </h4>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {todayScans.length} entry{todayScans.length === 1 ? '' : 'ies'}
                  </span>
                </div>

                {todayScans.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {todayScans.map((scan, idx) => {
                      const isSafe = scan.quality !== 'Unsafe' && !scan.adulteration_detected && parseFloat(scan.purity || 0) >= 60;
                      return (
                        <div 
                          key={scan.id || idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="font-black theme-text">{scan.oil_type || 'Oil Sample'}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {scan.vendor || 'Lab Test'} • {new Date(scan.timestamp || scan.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-sm text-[#d4af37]">
                              {parseFloat(scan.purity || 0).toFixed(1)}%
                            </span>
                            <div>
                              <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${
                                isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {isSafe ? 'SAFE' : 'ADULTERATED'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-[var(--text-muted)]">
                    <p className="text-xs font-semibold">No readings logged today yet.</p>
                    <p className="text-[10px] mt-0.5">Real scans performed today will be listed here automatically.</p>
                  </div>
                )}
              </div>

              {/* National Intelligence Center Map Component */}
              <NationalIntelligenceCenter />

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
