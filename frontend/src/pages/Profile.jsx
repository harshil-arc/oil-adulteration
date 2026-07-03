import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Globe, Wifi, Moon, Shield, Info, FileText, 
  BookOpen, LogOut, ChevronRight, Edit3, X, Server,
  Search, Filter, ArrowUpDown, Download, Thermometer,
  Brain, ShieldCheck, ShieldAlert, AlertTriangle, Calendar, Award, Sun,
  User, CheckCircle2, MessageSquare, Heart, Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, updateProfile, settings, updateSetting, logout } = useApp();
  
  // Database States
  const [scans, setScans] = useState([]);
  const [reportsCount, setReportsCount] = useState(0);
  
  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuality, setFilterQuality] = useState('all'); // 'all', 'Safe', 'Moderate', 'Unsafe'
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'purity-high', 'purity-low'
  
  // Modals & Bottom Sheets state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    fetchScans();

    // Subscribe to Supabase real-time updates
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
      const { data, error } = await supabase
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
    const total = scans.length;
    const totalPurity = scans.reduce((acc, val) => acc + parseFloat(val.purity || 0), 0);
    const avgPurity = total > 0 ? Math.round(totalPurity / total) : 91;
    const unsafeCount = scans.filter(r => r.quality === 'Unsafe').length;
    
    // Tier Level
    let userLevel = 'Level 3 Lead';
    if (total > 30) userLevel = 'Level 5 Elite Director';
    else if (total > 15) userLevel = 'Level 4 Senior';

    // Contributions
    const reports = unsafeCount + 2;
    const donations = 5;
    const reviews = 8;
    const rank = total > 20 ? 'Top 1% Officer' : 'Top 5% Inspector';

    return {
      total,
      avgPurity,
      unsafeCount,
      userLevel,
      reports,
      donations,
      reviews,
      rank,
      certificates: 4
    };
  }, [scans]);

  // --- FILTERED & SORTED SCANS ---
  const processedScans = useMemo(() => {
    let result = [...scans];

    // Search Query
    if (searchQuery.trim() !== '') {
      result = result.filter(s => 
        (s.oil_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.vendor || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by quality
    if (filterQuality !== 'all') {
      result = result.filter(s => s.quality === filterQuality);
    }

    // Sort options
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.created_at).getTime();
      const timeB = new Date(b.timestamp || b.created_at).getTime();
      
      if (sortOption === 'newest') return timeB - timeA;
      if (sortOption === 'oldest') return timeA - timeB;
      if (sortOption === 'purity-high') return (b.purity || 0) - (a.purity || 0);
      if (sortOption === 'purity-low') return (a.purity || 0) - (b.purity || 0);
      return 0;
    });

    return result;
  }, [scans, searchQuery, filterQuality, sortOption]);

  const getTierIcon = (quality) => {
    if (quality === 'Unsafe') return <ShieldAlert size={16} className="text-red-500" />;
    if (quality === 'Moderate') return <AlertTriangle size={16} className="text-amber-500" />;
    return <ShieldCheck size={16} className="text-green-500" />;
  };

  const getTierBadge = (quality) => {
    if (quality === 'Unsafe') return 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (quality === 'Moderate') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    return 'bg-green-500/10 text-green-500 border border-green-500/20';
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in relative z-20 pb-10 transition-colors">
       {/* Background Glow */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 opacity-[0.03] rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3" />

       {/* Header */}
       <div className="px-5 pt-8 pb-4 relative z-10 flex justify-between items-center">
         <div>
           <h1 className="text-2xl font-black tracking-tight theme-text">Profile</h1>
           <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Inspector Command Portal</p>
         </div>
       </div>

       <div className="flex-1 px-5 flex flex-col gap-6 relative z-10">
          
          {/* Avatar Area */}
          <div className="flex items-center gap-4">
             <div className="relative cursor-pointer" onClick={() => { setEditForm(profile); setShowEditProfile(true); }}>
                <div className="w-20 h-20 rounded-full border-2 border-brand-500 p-1 shadow-[0_0_15px_rgba(88,166,255,0.2)]">
                   <div className="w-full h-full rounded-full bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border-color)]">
                      <span className="text-2xl font-bold text-brand-500">{getInitials(profile.name)}</span>
                   </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-500 text-black rounded-full flex items-center justify-center border-2 border-[var(--bg-page)]">
                   <Edit3 size={12} className="text-black" />
                </div>
             </div>
             <div>
                <h2 className="text-xl font-bold leading-tight theme-text">{profile.name}</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-2">{profile.email}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-black uppercase tracking-widest bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded border border-brand-500/20">
                     {profile.badgeId}
                   </span>
                </div>
             </div>
          </div>

          {/* User Levels and Rank Metrics */}
          <div className="grid grid-cols-2 gap-3.5">
             <div className="card p-4 border border-[var(--border-color)] flex flex-col justify-between h-20">
                <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest">User Level</span>
                <p className="text-xs font-black text-blue-500 uppercase">{myStatistics.userLevel}</p>
             </div>
             <div className="card p-4 border border-[var(--border-color)] flex flex-col justify-between h-20">
                <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest">Community Rank</span>
                <p className="text-xs font-black text-green-500 uppercase">{myStatistics.rank}</p>
             </div>
          </div>

          {/* Settings Section */}
          <div>
             <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">Settings</h3>
             <div className="card p-0 flex flex-col divide-y divide-[var(--border-color)] shadow-sm">
                
                {/* Global Theme Selector */}
                <div className="flex flex-col gap-2.5 p-4 bg-[var(--bg-card)]">
                   <div className="flex items-center gap-3">
                      <Moon size={18} className="text-brand-500" />
                      <span className="text-sm font-semibold theme-text">Theme Mode</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-color)]">
                      {[
                        { mode: 'light', label: 'Light', Icon: Sun },
                        { mode: 'dark', label: 'Dark', Icon: Moon },
                        { mode: 'system', label: 'System', Icon: Server }
                      ].map(item => (
                         <button
                            key={item.mode}
                            onClick={() => updateSetting('themeMode', item.mode)}
                            className={`py-2 px-1 text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all ${
                               (settings.themeMode || 'system') === item.mode
                                  ? 'bg-brand-500 text-black font-extrabold shadow-sm'
                                  : 'text-[var(--text-secondary)] hover:text-brand-500'
                            }`}
                         >
                            <item.Icon size={10} />
                            <span>{item.label}</span>
                         </button>
                      ))}
                   </div>
                </div>

                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-[var(--bg-card)]">
                   <div className="flex items-center gap-3">
                      <Bell size={18} className="text-brand-500" />
                      <span className="text-sm font-medium theme-text">{t('profile.notifications')}</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.notifications} onChange={() => updateSetting('notifications', !settings.notifications)} />
                      <div className={`w-11 h-6 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.notifications ? 'bg-brand-500 dark:bg-brand-500' : ''}`}></div>
                   </label>
                </div>

                {/* Connection Method */}
                <div onClick={() => setShowConnection(true)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--hover-bg)] transition-colors bg-[var(--bg-card)]">
                   <div className="flex items-center gap-3">
                      <Wifi size={18} className="text-brand-500" />
                      <span className="text-sm font-medium theme-text">{t('profile.hw_connection')}</span>
                   </div>
                   <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <span className="text-xs uppercase font-bold tracking-widest">{settings.connectionMethod}</span>
                      <ChevronRight size={16} />
                   </div>
                </div>

                {/* About Food 360 */}
                <div onClick={() => navigate('/about')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--hover-bg)] transition-colors bg-[var(--bg-card)]">
                   <div className="flex items-center gap-3">
                      <Info size={18} className="text-brand-500" />
                      <span className="text-sm font-medium theme-text">About Food 360</span>
                   </div>
                   <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </div>

                {/* Privacy Policy */}
                <div onClick={() => navigate('/privacy-security')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--hover-bg)] transition-colors bg-[var(--bg-card)]">
                   <div className="flex items-center gap-3">
                      <Shield size={18} className="text-brand-500" />
                      <span className="text-sm font-medium theme-text">Privacy Policy</span>
                   </div>
                   <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </div>
             </div>
          </div>

          {/* My Statistics Section */}
          <div>
             <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">My Statistics</h3>
             <div className="card p-5 flex flex-col gap-4 shadow-sm">
                
                <div className="grid grid-cols-2 gap-4 border-b border-[var(--border-color)] pb-4 text-xs font-semibold">
                   <div>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1">Scans Completed</p>
                      <p className="theme-text font-black text-lg font-mono">{myStatistics.total}</p>
                   </div>
                   <div>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1">Community Contributions</p>
                      <p className="theme-text font-black text-lg font-mono">{myStatistics.total + 10}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-[var(--border-color)] pb-4 text-xs font-semibold">
                   <div>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1">Reports Submitted</p>
                      <p className="theme-text font-black text-lg font-mono">{myStatistics.reports}</p>
                   </div>
                   <div>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1">Food Donations</p>
                      <p className="theme-text font-black text-lg font-mono">{myStatistics.donations}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                   <div>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1">Trusted Reviews</p>
                      <p className="theme-text font-black text-lg font-mono">{myStatistics.reviews}</p>
                   </div>
                   <div>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1">Certificates Earned</p>
                      <p className="theme-text font-black text-lg font-mono">{myStatistics.certificates}</p>
                   </div>
                </div>

             </div>
          </div>

          {/* My Certificates Section */}
          <div>
             <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">My Certificates</h3>
             <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                {scans.length === 0 ? (
                  <div className="card p-5 text-center">
                     <p className="text-xs text-[var(--text-muted)] font-bold uppercase">No Certificates Earned Yet</p>
                  </div>
                ) : (
                  scans.map(scan => {
                     const certId = `CERT-ST-${String(scan.id).replace('scan-', '').slice(0, 8).toUpperCase()}`;
                     const timestamp = scan.timestamp || scan.created_at;
                     const parsedDate = timestamp ? new Date(timestamp) : null;
                     return (
                        <div key={scan.id} className="card p-3.5 border border-[var(--border-color)] flex items-center justify-between rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs shrink-0">
                                 <Award size={18} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-xs theme-text">{scan.oil_type} Purity Record</h4>
                                 <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">
                                    ID: {certId} • Purity: {scan.purity}%
                                 </p>
                              </div>
                           </div>
                           <div className="flex gap-2 shrink-0">
                              <button 
                                 onClick={() => navigate(`/scan/${scan.id}`)}
                                 className="px-2.5 py-1.5 bg-brand-500 text-black font-bold uppercase text-[8px] rounded-lg tracking-wider"
                              >
                                 Open
                              </button>
                              <button 
                                 onClick={() => {
                                    if (navigator.share) {
                                       navigator.share({ title: 'Certificate', text: `Certificate ${certId} showing ${scan.purity}% purity.` });
                                    } else {
                                       alert(`Shared Certificate details for ID: ${certId}`);
                                    }
                                 }}
                                 className="p-1.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg"
                              >
                                 <Share2 size={10} />
                              </button>
                           </div>
                        </div>
                     );
                  })
                )}
             </div>
          </div>

          {/* My Scan History Section */}
          <div>
             <div className="flex items-center justify-between mb-3 pl-1">
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">My Scan History</h3>
                <span className="text-[9px] font-bold text-brand-500 font-mono">{processedScans.length} Results</span>
             </div>

             {/* Search, Filter & Sort Controls */}
             <div className="flex flex-col gap-2 mb-3">
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      <Search size={14} />
                   </div>
                   <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      type="text"
                      placeholder="Search scans by oil or vendor..."
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-brand-500 text-xs theme-text rounded-xl py-2.5 pl-9 pr-4 outline-none transition-all placeholder-gray-500"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                   <div className="relative">
                      <select 
                         value={filterQuality} 
                         onChange={e => setFilterQuality(e.target.value)}
                         className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] theme-text rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider outline-none appearance-none"
                      >
                         <option value="all">Filter: All Scans</option>
                         <option value="Safe">Filter: Safe (Pure)</option>
                         <option value="Moderate">Filter: Moderate</option>
                         <option value="Unsafe">Filter: Unsafe</option>
                      </select>
                      <Filter size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                   </div>

                   <div className="relative">
                      <select 
                         value={sortOption} 
                         onChange={e => setSortOption(e.target.value)}
                         className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] theme-text rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider outline-none appearance-none"
                      >
                         <option value="newest">Sort: Newest First</option>
                         <option value="oldest">Sort: Oldest First</option>
                         <option value="purity-high">Sort: Purity (High)</option>
                         <option value="purity-low">Sort: Purity (Low)</option>
                      </select>
                      <ArrowUpDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                   </div>
                </div>
             </div>

             {/* Scans List */}
             <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {processedScans.length === 0 ? (
                  <div className="p-8 text-center card">
                     <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">No matching scan history found</p>
                  </div>
                ) : (
                  processedScans.map(scan => {
                     const timestamp = scan.timestamp || scan.created_at;
                     const parsedDate = timestamp ? new Date(timestamp) : null;
                     const temp = scan.sensor_snapshot?.temperature || scan.temperature || 25;
                     const conf = scan.confidence_score || scan.confidence || 94;

                     return (
                        <div 
                           key={scan.id}
                           onClick={() => navigate(`/scan/${scan.id}`)}
                           className="card p-3.5 hover:border-brand-500/30 transition-colors cursor-pointer flex flex-col gap-2.5 relative group"
                        >
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                 {getTierIcon(scan.quality)}
                                 <div>
                                    <h4 className="font-bold text-xs theme-text">{scan.oil_type}</h4>
                                    <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-wider mt-0.5">{scan.vendor || 'Unknown Vendor'}</p>
                                 </div>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getTierBadge(scan.quality)}`}>
                                 {scan.quality === 'Safe' ? 'PURE' : scan.quality === 'Unsafe' ? 'ADULTERATED' : 'MODERATE'}
                              </span>
                           </div>

                           <div className="grid grid-cols-4 gap-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2 text-center">
                              <div>
                                 <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Purity</p>
                                 <p className={`text-xs font-black font-mono ${scan.quality === 'Unsafe' ? 'text-red-500' : 'text-green-500'}`}>{parseFloat(scan.purity || 0).toFixed(1)}%</p>
                              </div>
                              <div className="border-l border-[var(--border-color)]">
                                 <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Temp</p>
                                 <p className="text-xs font-black theme-text font-mono flex items-center justify-center gap-0.5">
                                    <Thermometer size={8} className="text-amber-500" />
                                    {parseFloat(temp).toFixed(0)}°C
                                 </p>
                              </div>
                              <div className="border-l border-[var(--border-color)]">
                                 <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Confidence</p>
                                 <p className="text-xs font-black text-brand-500 font-mono flex items-center justify-center gap-0.5">
                                    <Brain size={8} className="text-brand-500" />
                                    {conf}%
                                 </p>
                              </div>
                              <div className="border-l border-[var(--border-color)]">
                                 <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Time</p>
                                 <p className="text-[8px] font-bold text-[var(--text-muted)] mt-1 truncate">
                                    {parsedDate ? parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     );
                  })
                )}
             </div>
          </div>

       </div>

       {/* Edit Profile Sheet */}
       {showEditProfile && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-end animate-fade-in backdrop-blur-sm">
            <div className="w-full bg-[var(--bg-page)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-safe animate-slide-up">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold theme-text">Edit Profile</h2>
                 <button onClick={() => setShowEditProfile(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)]">
                   <X size={20} />
                 </button>
               </div>
               
               <form onSubmit={saveProfile} className="flex flex-col gap-4">
                 <div>
                   <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 mb-1 block">Full Name</label>
                   <input required value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] theme-text focus:border-brand-500 rounded-2xl py-3.5 px-4 outline-none text-sm" />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 mb-1 block">Email</label>
                   <input required type="email" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] theme-text focus:border-brand-500 rounded-2xl py-3.5 px-4 outline-none text-sm" />
                 </div>
                 <button type="submit" className="w-full bg-brand-500 text-black font-bold uppercase tracking-widest py-4 rounded-2xl shadow-[0_4px_20px_rgba(88,166,255,0.3)] hover:brightness-110 active:scale-95 transition-all">
                   Save Changes
                 </button>
               </form>
            </div>
         </div>
       )}

       {/* Connection Method Sheet */}
       {showConnection && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-end animate-fade-in backdrop-blur-sm" onClick={() => setShowConnection(false)}>
            <div className="w-full bg-[var(--bg-page)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-safe animate-slide-up" onClick={e=>e.stopPropagation()}>
               <h2 className="text-xl font-bold mb-6 theme-text">Default Scanner Link</h2>
               <div className="flex flex-col gap-2 mb-6">
                 {['Bluetooth', 'Wi-Fi', 'USB OpenSerial'].map(conn => (
                   <button key={conn} onClick={() => { updateSetting('connectionMethod', conn); setShowConnection(false); }} className={`p-4 rounded-2xl font-bold flex justify-between items-center ${settings.connectionMethod === conn ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30' : 'bg-[var(--bg-elevated)] theme-text border border-[var(--border-color)]'}`}>
                     {conn}
                     {settings.connectionMethod === conn && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                   </button>
                 ))}
               </div>
            </div>
         </div>
       )}

       {/* Logout Modal */}
       {showLogout && (
          <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-5 animate-fade-in backdrop-blur-md" onClick={() => setShowLogout(false)}>
             <div className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-2xl animate-slide-up text-center" onClick={e=>e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex flex-col items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <LogOut size={24} />
                </div>
                <h2 className="text-xl font-black mb-2 theme-text">Sign Out?</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-6">You will need to re-authenticate with your FSSAI credentials to access the scanner.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-elevated)] theme-text border border-[var(--border-color)]">
                    Cancel
                  </button>
                  <button onClick={handleSignOut} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(239,68,68,0.3)]">
                    Yes, Sign Out
                  </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
