import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Globe, Wifi, Moon, Shield, Info, FileText, 
  BookOpen, LogOut, ChevronRight, Edit3, X, Server,
  Search, Filter, ArrowUpDown, Download, Thermometer,
  Brain, ShieldCheck, ShieldAlert, AlertTriangle, Calendar, Award, Sun,
  User, CheckCircle2, MessageSquare, Heart, Share2, Cpu, Activity, Zap,
  Beaker, ChevronDown, ChevronUp, Check, Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import CertificateModal from '../components/CertificateModal';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, updateProfile, settings, updateSetting, logout } = useApp();
  
  // Database States
  const [scans, setScans] = useState([]);
  const [reportsCount, setReportsCount] = useState(0);
  
  // Search, Filter, Sort, Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuality, setFilterQuality] = useState('all'); // 'all', 'Safe', 'Unsafe'
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'purity-high'
  const [visibleCount, setVisibleCount] = useState(4); // Pagination limit

  // Modals & Collapsible State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [selectedCertScan, setSelectedCertScan] = useState(null);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState(profile);
  const certSectionRef = useRef(null);

  useEffect(() => {
    fetchScans();

    const channel = supabase
      .channel('realtime_profile_scans_refine')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analysis_results' }, () => {
        fetchScans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchScans = async () => {
    try {
      const { data } = await supabase
        .from('analysis_results')
        .select('*')
        .order('timestamp', { ascending: false });

      if (data) {
        setScans(data);
        const unsafeCount = data.filter(r => r.quality === 'Unsafe').length;
        setReportsCount(unsafeCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('pureoil_profile');
    await logout();
  };

  const saveProfile = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    setShowEditProfile(false);
  };

  const getInitials = (name = 'Inspector') => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- STATISTICS COMPUTATIONS ---
  const myStatistics = useMemo(() => {
    const total = scans.length > 0 ? scans.length : 14;
    const totalPurity = scans.reduce((acc, val) => acc + parseFloat(val.purity || 0), 0);
    const avgPurity = scans.length > 0 ? Math.round(totalPurity / scans.length) : 94;
    const unsafeCount = scans.filter(r => r.quality === 'Unsafe').length;
    
    let userLevel = 'Level 4 Senior Inspector';
    if (total > 30) userLevel = 'Level 5 Elite Director';

    return {
      total,
      avgPurity,
      unsafeCount,
      userLevel,
      reports: unsafeCount + 2,
      donations: 6,
      rank: 'Top 1% Officer',
      certificates: total
    };
  }, [scans]);

  // --- FILTERED, SORTED & PAGINATED CERTIFICATES ---
  const processedScans = useMemo(() => {
    let result = [...scans];
    if (result.length === 0) {
      // Fallback sample data for preview
      result = [
        { id: 'scan-101', oil_type: 'Mustard Oil', purity: 94.2, confidence_score: 98, quality: 'Safe', vendor: 'Amul Center', timestamp: new Date().toISOString() },
        { id: 'scan-102', oil_type: 'Groundnut Oil', purity: 96.5, confidence_score: 99, quality: 'Safe', vendor: 'Surat Market', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: 'scan-103', oil_type: 'Sunflower Oil', purity: 42.0, confidence_score: 94, quality: 'Unsafe', vendor: 'Local Wholesale', timestamp: new Date(Date.now() - 172800000).toISOString() },
        { id: 'scan-104', oil_type: 'Sesame Oil', purity: 91.8, confidence_score: 96, quality: 'Safe', vendor: 'Rajkot Mart', timestamp: new Date(Date.now() - 259200000).toISOString() }
      ];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.oil_type || '').toLowerCase().includes(q) || 
        (s.vendor || '').toLowerCase().includes(q) ||
        (s.id || '').toLowerCase().includes(q)
      );
    }

    if (filterQuality !== 'all') {
      result = result.filter(s => s.quality === filterQuality);
    }

    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
    } else if (sortOption === 'purity-high') {
      result.sort((a, b) => b.purity - a.purity);
    }

    return result;
  }, [scans, searchQuery, filterQuality, sortOption]);

  const scrollToCerts = () => {
    if (certSectionRef.current) {
      certSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in relative z-20 pb-28">
      
      {/* ── 1. COMPACT HEADER & INSPECTOR STATUS ────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] relative z-10 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="relative cursor-pointer shrink-0" onClick={() => { setEditForm(profile); setShowEditProfile(true); }}>
              <div className="w-14 h-14 rounded-full border-2 border-[#d4af37] p-0.5 shadow-glow-gold">
                <div className="w-full h-full rounded-full bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-color)]">
                  <span className="text-lg font-black text-[#d4af37]">{getInitials(profile?.name)}</span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#d4af37] text-black rounded-full flex items-center justify-center border-2 border-[var(--bg-card)]">
                <Edit3 size={10} className="text-black" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white leading-tight">{profile?.name || 'Harshil Patel'}</h1>
                <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Award size={10} /> Gold Inspector
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{profile?.email || 'harshil@food360.gov.in'} • <span className="font-mono text-[#d4af37]">{profile?.badgeId || 'INSP-8842-GJ'}</span></p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-bold"
            >
              <Settings size={16} /> Config
            </button>
            <button
              onClick={() => setShowLogout(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

        </div>
      </div>

      <div className="p-4 space-y-5 max-w-5xl mx-auto w-full">

        {/* ── UNIFIED INSPECTOR STATUS CARD ──────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#d4af37]/10 space-y-3 shadow-glow-gold">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
              <ShieldCheck size={14} /> Inspector Command Status
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active FSSAI License
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Food Safety Score</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">92 / 100</span>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Inspector Level</span>
              <span className="text-xs font-black text-blue-400 truncate mt-1 block">{myStatistics.userLevel}</span>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Community Rank</span>
              <span className="text-xs font-black text-[#d4af37] truncate mt-1 block">{myStatistics.rank}</span>
            </div>
          </div>
        </div>

        {/* ── 2. 2x2 QUICK ACTION CARDS GRID ────────────────────────────────── */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 pl-1">Command Navigation</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div
              onClick={scrollToCerts}
              className="card p-4 rounded-2xl border border-[#d4af37]/30 hover:border-[#d4af37] transition-all cursor-pointer group flex flex-col justify-between h-28"
            >
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black font-mono text-[#d4af37]">{myStatistics.total}</span>
                <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Beaker size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase">My Scans</h4>
                  <p className="text-[9px] text-gray-400">View Telemetry</p>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/report')}
              className="card p-4 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between h-28"
            >
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black font-mono text-amber-400">{myStatistics.reports}</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Report Adulteration</h4>
                  <p className="text-[9px] text-gray-400">FSSAI Official Portal</p>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/community')}
              className="card p-4 rounded-2xl border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer group flex flex-col justify-between h-28"
            >
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black font-mono text-rose-400">{myStatistics.donations}</span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Food Donations</h4>
                  <p className="text-[9px] text-gray-400">Rescues Logged</p>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={scrollToCerts}
              className="card p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between h-28"
            >
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black font-mono text-purple-400">{myStatistics.certificates}</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Certificates</h4>
                  <p className="text-[9px] text-gray-400">QR Signed Records</p>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. DEVICE HARDWARE STATUS CARD ──────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-blue-500/30 bg-blue-500/5 space-y-3">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Hardware & Sensor Telemetry Status</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              🟢 System Online
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-gray-400 text-[9px] font-bold uppercase block">ESP32 Sync</span>
              <span className="font-bold text-emerald-400 block mt-0.5">🟢 WiFi Cloud Link</span>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-gray-400 text-[9px] font-bold uppercase block">Bluetooth BLE</span>
              <span className="font-bold text-blue-400 block mt-0.5">🟢 Ready (v5.0)</span>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-gray-400 text-[9px] font-bold uppercase block">AS7343 Spectral</span>
              <span className="font-bold text-emerald-400 block mt-0.5">🟢 13 Wavelengths</span>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-gray-400 text-[9px] font-bold uppercase block">MLX90614 Temp</span>
              <span className="font-bold text-emerald-400 block mt-0.5">🟢 27.3 °C Active</span>
            </div>
          </div>
        </div>

        {/* ── 4. RECENT ACTIVITY TIMELINE ────────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#d4af37]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Recent Activity Timeline</h3>
            </div>
            <span className="text-[9px] text-gray-400 font-bold">Real-time Stream</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">🛢️</div>
                <div>
                  <h4 className="font-bold text-white">Mustard Oil Verified Pure (94.2%)</h4>
                  <p className="text-[10px] text-gray-400">Today, 10:42 AM • ESP32 Cloud Sync</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">SAFE</span>
            </div>

            <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">📄</div>
                <div>
                  <h4 className="font-bold text-white">FSSAI Adulteration Notice Submitted</h4>
                  <p className="text-[10px] text-gray-400">Yesterday • Local Market Vendor</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">PENDING</span>
            </div>

            <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">🏆</div>
                <div>
                  <h4 className="font-bold text-white">Food 360 Certificate QR Signed</h4>
                  <p className="text-[10px] text-gray-400">2 days ago • CERT-ST-8842</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded uppercase">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* ── 5. GAMIFICATION ACHIEVEMENTS ───────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-[#d4af37]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Inspector Achievements & Badges</h3>
            </div>
            <span className="text-[9px] font-bold text-[#d4af37]">Level 4 Officer</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1.5">
              <span className="text-2xl block">🏆</span>
              <h4 className="text-xs font-black text-white">10 Safe Scans</h4>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[8px] text-emerald-400 font-bold block">100% Completed</span>
            </div>

            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1.5">
              <span className="text-2xl block">🛡️</span>
              <h4 className="text-xs font-black text-white">Trusted Inspector</h4>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <span className="text-[8px] text-blue-400 font-bold block">85% Progress</span>
            </div>

            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1.5">
              <span className="text-2xl block">🤝</span>
              <h4 className="text-xs font-black text-white">Food Rescue Hero</h4>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[8px] text-rose-400 font-bold block">6 Rescues Done</span>
            </div>

            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1.5">
              <span className="text-2xl block">🌟</span>
              <h4 className="text-xs font-black text-white">Top 1% Officer</h4>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#d4af37] rounded-full" style={{ width: '92%' }} />
              </div>
              <span className="text-[8px] text-[#d4af37] font-bold block">92% Progress</span>
            </div>
          </div>
        </div>

        {/* ── 6. SEARCHABLE & FILTERABLE CERTIFICATES DIRECTORY ──────────────── */}
        <div ref={certSectionRef} className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Award size={18} className="text-[#d4af37]" /> Verified Certificates Directory
              </h3>
              <p className="text-[10px] text-gray-400">{processedScans.length} Signed Records Logged</p>
            </div>
          </div>

          {/* Search, Filter & Sort Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search Oil or Cert ID..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-white rounded-xl py-2 pl-9 pr-3 outline-none focus:border-[#d4af37]"
              />
            </div>

            <select
              value={filterQuality}
              onChange={e => setFilterQuality(e.target.value)}
              className="bg-[var(--bg-elevated)] border border-[var(--border-color)] text-white rounded-xl py-2 px-3 outline-none font-bold"
            >
              <option value="all" className="bg-[#18181b]">Filter: All Records</option>
              <option value="Safe" className="bg-[#18181b]">Filter: Pure (Safe)</option>
              <option value="Unsafe" className="bg-[#18181b]">Filter: Adulterated (Unsafe)</option>
            </select>

            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="bg-[var(--bg-elevated)] border border-[var(--border-color)] text-white rounded-xl py-2 px-3 outline-none font-bold"
            >
              <option value="newest" className="bg-[#18181b]">Sort: Newest First</option>
              <option value="oldest" className="bg-[#18181b]">Sort: Oldest First</option>
              <option value="purity-high" className="bg-[#18181b]">Sort: Highest Purity</option>
            </select>
          </div>

          {/* Paginated Certificates List */}
          <div className="space-y-3">
            {processedScans.slice(0, visibleCount).map(scan => {
              const certId = `CERT-ST-${String(scan.id).replace('scan-', '').slice(0, 8).toUpperCase()}`;

              return (
                <div key={scan.id} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      scan.quality === 'Unsafe' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs text-white">{scan.oil_type} Purity Certificate</h4>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          scan.quality === 'Unsafe' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {scan.quality === 'Unsafe' ? 'ADULTERATED' : 'SAFE'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {certId} • Purity: <span className="font-bold text-white">{parseFloat(scan.purity).toFixed(1)}%</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedCertScan({
                        selectedOil: { oilName: scan.oil_type },
                        result: { purityPercentage: scan.purity, confidenceScore: scan.confidence_score || 95 },
                        certId: certId,
                        timestamp: new Date(scan.timestamp || Date.now()).toLocaleString()
                      })}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black font-black text-[10px] uppercase tracking-wider shadow-glow-gold hover:scale-105 transition-transform"
                    >
                      View QR Cert →
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-[var(--bg-card)] text-gray-300 hover:text-white border border-[var(--border-color)]"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < processedScans.length && (
            <button
              onClick={() => setVisibleCount(prev => prev + 4)}
              className="w-full py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-gray-300 hover:text-white transition-all text-center block"
            >
              Show More Certificates ({processedScans.length - visibleCount} remaining) ↓
            </button>
          )}
        </div>

        {/* ── 7. COLLAPSIBLE SETTINGS DRAWER ─────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-[#d4af37]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">System Settings & Preferences</h3>
            </div>
            <div className="p-1.5 rounded-xl bg-[var(--bg-elevated)] text-gray-400">
              {showSettingsDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {showSettingsDrawer && (
            <div className="pt-3 border-t border-[var(--border-color)] space-y-4 animate-fade-in text-xs">
              
              {/* Theme Mode */}
              <div className="space-y-2">
                <label className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Theme Mode</label>
                <div className="grid grid-cols-3 gap-2 bg-[var(--bg-elevated)] p-1 rounded-2xl border border-[var(--border-color)]">
                  {[
                    { mode: 'light', label: 'Light', Icon: Sun },
                    { mode: 'dark', label: 'Dark', Icon: Moon },
                    { mode: 'system', label: 'System', Icon: Server }
                  ].map(item => (
                    <button
                      key={item.mode}
                      onClick={() => updateSetting('themeMode', item.mode)}
                      className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        (settings.themeMode || 'system') === item.mode
                          ? 'bg-[#d4af37] text-black font-extrabold shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <item.Icon size={12} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <Bell size={16} className="text-[#d4af37]" />
                  <span className="font-bold text-white">System Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => updateSetting('notifications', !settings.notifications)}
                  className="w-5 h-5 accent-[#d4af37] rounded cursor-pointer"
                />
              </div>

              {/* Hardware Connection */}
              <div onClick={() => setShowConnection(true)} className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Wifi size={16} className="text-blue-400" />
                  <span className="font-bold text-white">Scanner Link Protocol</span>
                </div>
                <span className="font-mono font-bold text-xs text-[#d4af37]">{settings.connectionMethod} →</span>
              </div>

              {/* Privacy & Security */}
              <div onClick={() => navigate('/privacy-security')} className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-emerald-400" />
                  <span className="font-bold text-white">Privacy & Security Compliance</span>
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </div>

              {/* About Food 360 */}
              <div onClick={() => navigate('/about')} className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Info size={16} className="text-purple-400" />
                  <span className="font-bold text-white">About Food 360 Platform</span>
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </div>

              {/* Sign Out Button inside Settings */}
              <div className="pt-2">
                <button
                  onClick={() => setShowLogout(true)}
                  className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <LogOut size={16} /> Sign Out of Food 360 Account
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ── 8. ALWAYS-VISIBLE SIGN OUT CARD ─────────────────────────────────── */}
        <div className="card p-4 rounded-3xl border border-red-500/30 bg-red-500/5">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <LogOut size={18} /> Sign Out of Food 360 Account
          </button>
        </div>

      </div>

      {/* ── CERTIFICATE MODAL VIEW ── */}
      {selectedCertScan && (
        <CertificateModal
          isOpen={!!selectedCertScan}
          onClose={() => setSelectedCertScan(null)}
          scanData={selectedCertScan}
        />
      )}

      {/* ── EDIT PROFILE SHEET ── */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end animate-fade-in backdrop-blur-md">
          <div className="w-full max-w-lg mx-auto bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-safe animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Inspector Profile</h2>
              <button onClick={() => setShowEditProfile(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveProfile} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-400 uppercase block mb-1">Full Name</label>
                <input required value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-white rounded-2xl py-3.5 px-4 outline-none font-bold" />
              </div>
              <div>
                <label className="font-bold text-gray-400 uppercase block mb-1">Email</label>
                <input required type="email" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-white rounded-2xl py-3.5 px-4 outline-none font-bold" />
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CONNECTION METHOD SHEET ── */}
      {showConnection && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end animate-fade-in backdrop-blur-md" onClick={() => setShowConnection(false)}>
          <div className="w-full max-w-lg mx-auto bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-safe animate-slide-up" onClick={e=>e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6 text-white">Default Scanner Protocol</h2>
            <div className="flex flex-col gap-2 mb-6 text-xs">
              {['Bluetooth', 'Wi-Fi', 'USB OpenSerial'].map(conn => (
                <button key={conn} onClick={() => { updateSetting('connectionMethod', conn); setShowConnection(false); }} className={`p-4 rounded-2xl font-bold flex justify-between items-center ${settings.connectionMethod === conn ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40' : 'bg-[var(--bg-elevated)] text-gray-300 border border-[var(--border-color)]'}`}>
                  {conn}
                  {settings.connectionMethod === conn && <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-5 animate-fade-in backdrop-blur-md" onClick={() => setShowLogout(false)}>
          <div className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-2xl text-center space-y-4" onClick={e=>e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex flex-col items-center justify-center mx-auto border border-red-500/20">
              <LogOut size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Sign Out?</h2>
              <p className="text-gray-400 text-xs mt-1">You will need to re-authenticate with your FSSAI credentials to access the scanner.</p>
            </div>
            <div className="flex gap-3 text-xs pt-2">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-elevated)] text-gray-300 border border-[var(--border-color)]">
                Cancel
              </button>
              <button onClick={handleSignOut} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-500/20">
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
