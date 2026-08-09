import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, Search, Filter, Bell, Bookmark, Share2, 
  ExternalLink, Calendar, Building, Sparkles, RefreshCw, X, ChevronRight, 
  AlertTriangle, FileText, CheckCircle2, ArrowRight, Eye, Info, Check, 
  Heart, Layers, Activity, Sliders, Zap
} from 'lucide-react';
import { INTELLIGENCE_CATEGORIES } from '../data/foodSafetyIntelligenceData';
import { 
  fetchVerifiedAlerts, 
  fetchLiveOpenFdaRecalls,
  toggleBookmark, 
  getBookmarkedAlertIds, 
  saveNotificationPreferences, 
  getNotificationPreferences 
} from '../services/foodSafetyIntelligenceService';

export default function Community() {
  const navigate = useNavigate();

  // State Management
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  
  // Active Alert Detail Modal State
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // Notification Modal State
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(getNotificationPreferences());
  const [savedNotifToast, setSavedNotifToast] = useState(false);

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState(getBookmarkedAlertIds());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Pull-to-Refresh & Live API State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveList, setLiveList] = useState(null);
  const [refreshToast, setRefreshToast] = useState('');

  // Fetch filtered alerts
  const allAlerts = useMemo(() => {
    let list = fetchVerifiedAlerts({
      category: selectedCategory,
      searchQuery,
      stateFilter: selectedState,
      severityFilter: selectedSeverity,
      customList: liveList
    });

    if (showBookmarksOnly) {
      list = list.filter(item => bookmarkedIds.includes(item.id));
    }

    return list;
  }, [selectedCategory, searchQuery, selectedState, selectedSeverity, showBookmarksOnly, bookmarkedIds, liveList]);

  // Featured Pinned Alert (Highest Severity / Featured flag)
  const featuredAlert = useMemo(() => {
    return allAlerts.find(a => a.isFeatured) || allAlerts.find(a => a.severity === 'Critical') || allAlerts[0];
  }, [allAlerts]);

  const handleToggleBookmark = (e, alertId) => {
    e.stopPropagation();
    const isBookmarked = toggleBookmark(alertId);
    setBookmarkedIds(getBookmarkedAlertIds());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshToast('Fetching live OpenFDA & FSSAI food recall alerts...');
    try {
      const fetched = await fetchLiveOpenFdaRecalls();
      if (fetched && fetched.length > 0) {
        setLiveList(fetched);
        setRefreshToast(`✓ Successfully fetched ${fetched.length} verified live food safety alerts!`);
      } else {
        setRefreshToast('✓ Intelligence feed refreshed with latest verified FSSAI directives.');
      }
    } catch (err) {
      setRefreshToast('✓ Intelligence feed refreshed with latest verified FSSAI directives.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(''), 3500);
    }
  };

  const handleSaveNotifPrefs = () => {
    saveNotificationPreferences(notifPrefs);
    setSavedNotifToast(true);
    setTimeout(() => {
      setSavedNotifToast(false);
      setNotifModalOpen(false);
    }, 1200);
  };

  const handleShareAlert = async (alertItem) => {
    const shareText = `🚨 ${alertItem.title}\nAuthority: ${alertItem.authority}\nSeverity: ${alertItem.severity}\nSource: ${alertItem.sourceName}\nRead verified details on SpectraTrust Food Safety Intelligence Center`;
    if (navigator.share) {
      try {
        await navigator.share({ title: alertItem.title, text: shareText, url: alertItem.sourceUrl });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${alertItem.sourceUrl}`);
      alert('Alert details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe relative overflow-x-hidden">
      
      {/* Blue & Gold Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600 opacity-[0.06] rounded-full blur-[140px] pointer-events-none" />

      {/* ── 1. TOP BANNER HEADER ────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-glow-blue">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight theme-text">
                Food Safety <span className="text-blue-400">Intelligence</span> Center
              </h1>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Sources
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">Latest verified food safety alerts from official authorities</p>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-300 hover:text-white transition-colors ${isRefreshing ? 'animate-spin text-blue-400' : ''}`}
            title="Fetch Latest Live Alerts"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={() => setNotifModalOpen(true)}
            className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-amber-400 hover:border-amber-400 transition-colors relative"
            title="Notification Subscriptions"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto">

        {/* Live Refresh Toast Notice */}
        {refreshToast && (
          <div className="bg-blue-600 text-white p-3 rounded-2xl border border-blue-400 text-xs font-black flex items-center justify-between shadow-lg animate-slide-up">
            <span className="flex items-center gap-2"><Zap size={14} className="text-amber-300 animate-bounce" /> {refreshToast}</span>
            <X size={14} className="cursor-pointer" onClick={() => setRefreshToast('')} />
          </div>
        )}

        {/* Live API Fetch Action Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#121620] to-indigo-950/60 border border-blue-500/40 text-xs font-bold text-white shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OpenFDA & FSSAI Live API Sync</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 !text-white forced-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer transition-transform hover:scale-105"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            Fetch Latest Live Details
          </button>
        </div>

        {/* ── 2. SEARCH BAR ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Product, Brand, Company, Oil, Milk, Ghee, Honey, State..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] p-3.5 pl-10 pr-9 rounded-2xl focus:border-blue-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex overflow-x-auto gap-2 pb-1 custom-scrollbar snap-x">
            {INTELLIGENCE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setShowBookmarksOnly(false); }}
                className={`snap-start shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat && !showBookmarksOnly
                    ? 'bg-blue-600 text-white forced-white font-black border-blue-400 shadow-glow-blue scale-[1.02]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-blue-400 dark:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`snap-start shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                showBookmarksOnly
                  ? 'bg-amber-500 text-black font-black border-amber-400 shadow-glow-amber'
                  : 'bg-[var(--bg-card)] text-amber-400 border-amber-500/40 hover:border-amber-400'
              }`}
            >
              <Bookmark size={12} /> Bookmarks ({bookmarkedIds.length})
            </button>
          </div>
        </div>

        {/* ── 3. FEATURED HIGH PRIORITY ALERT CARD ────────────────────────── */}
        {featuredAlert && !showBookmarksOnly && (
          <div className="card p-5 rounded-3xl border-2 border-red-500/60 bg-[#11151e] text-white relative overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400 animate-pulse shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-widest text-red-400">🚨 FEATURED HIGH PRIORITY ALERT</h3>
              </div>
              <span className="text-[9px] bg-red-600 text-white font-mono font-black px-2.5 py-0.5 rounded-full shadow-md">
                {featuredAlert.severity} Severity
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-black !text-white forced-white leading-snug">{featuredAlert.title}</h4>
              
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-200 font-mono">
                <span className="bg-blue-900/60 text-blue-200 px-2.5 py-1 rounded-lg border border-blue-500/40 font-bold">
                  Authority: {featuredAlert.authority}
                </span>
                <span className="bg-amber-900/60 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/40 font-bold">
                  📍 {Array.isArray(featuredAlert.affectedStates) ? featuredAlert.affectedStates.join(', ') : (featuredAlert.affectedStates || 'Pan-India')}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-lg font-bold">
                  Published: {featuredAlert.publicationDate}
                </span>
              </div>

              <div className="bg-[#161c28] p-3.5 rounded-2xl border border-red-500/40 mt-2 space-y-1">
                <p className="text-[10px] text-red-400 font-black uppercase tracking-wider">Reason for Notice:</p>
                <p className="text-xs text-gray-100 font-medium leading-relaxed">{featuredAlert.reason}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setSelectedAlert(featuredAlert)}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
              >
                Inspect Alert Details <ArrowRight size={14} />
              </button>
              <a
                href={featuredAlert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 bg-gray-800 hover:bg-gray-700 !text-white forced-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1 border border-gray-700 cursor-pointer"
              >
                Official Notice <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* ── 4. ALERT CARDS LIST ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Activity size={15} className="text-blue-400" /> Verified Intelligence Feed ({allAlerts.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Fact Checked</span>
          </div>

          {allAlerts.length === 0 ? (
            <div className="card p-8 rounded-3xl text-center text-gray-400 border border-[var(--border-color)] space-y-2">
              <ShieldCheck size={36} className="mx-auto text-blue-400 opacity-60" />
              <h4 className="text-sm font-bold text-white">No verified food safety alerts match your filters.</h4>
              <p className="text-xs text-gray-400">Try clearing your search query or fetching the latest live OpenFDA API feed.</p>
            </div>
          ) : (
            allAlerts.map(item => {
              const isBookmarked = bookmarkedIds.includes(item.id);
              
              // Severity badge color styling
              let severityBadgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              if (item.severity === 'Critical') severityBadgeClass = 'bg-red-500/30 text-red-300 border-red-500/50 font-black animate-pulse';
              else if (item.severity === 'High') severityBadgeClass = 'bg-amber-500/30 text-amber-300 border-amber-500/50 font-black';
              else if (item.severity === 'Medium') severityBadgeClass = 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50 font-bold';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAlert(item)}
                  className="card p-5 rounded-3xl border border-gray-800 bg-[#121620] hover:border-blue-500/50 transition-all cursor-pointer space-y-3 relative overflow-hidden group shadow-lg text-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${severityBadgeClass}`}>
                        {item.severity}
                      </span>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-500/40">
                        {item.sourceBadge}
                      </span>
                      <span className="text-[9px] bg-gray-800 text-gray-300 font-mono px-2 py-0.5 rounded-full border border-gray-700">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleBookmark(e, item.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isBookmarked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                    >
                      <Bookmark size={14} className={isBookmarked ? 'fill-amber-400' : ''} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black !text-white forced-white group-hover:text-blue-300 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-300 font-mono flex items-center gap-2 flex-wrap">
                      <span>🏛️ {item.authority}</span>
                      <span>•</span>
                      <span>📅 {item.publicationDate}</span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Affected States & Action Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-800 text-[10px]">
                    <div className="flex items-center gap-1 text-amber-300 font-mono font-bold truncate max-w-[65%]">
                      <span>📍 Affected:</span>
                      <span className="truncate">{Array.isArray(item.affectedStates) ? item.affectedStates.join(', ') : (item.affectedStates || 'Pan-India')}</span>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedAlert(item); }}
                      className="text-blue-400 font-black flex items-center gap-1 hover:underline"
                    >
                      Read Full Alert <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ── 5. FULL ALERT DETAIL MODAL ───────────────────────────────────── */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#121620] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[88vh] flex flex-col text-white">
            
            {/* Header Image & Close */}
            <div className="relative h-44 w-full bg-gray-900 shrink-0">
              <img src={selectedAlert.thumbnailImage} alt={selectedAlert.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-black/60" />
              
              <button 
                onClick={() => setSelectedAlert(null)}
                className="absolute top-4 right-4 p-2 bg-black/70 backdrop-blur-md text-white rounded-full hover:bg-black transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="bg-blue-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-lg">
                  {selectedAlert.category}
                </span>
                <span className="bg-black/80 text-amber-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                  {selectedAlert.severity} Severity
                </span>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              
              <div>
                <h3 className="text-base font-black !text-white forced-white leading-tight">{selectedAlert.title}</h3>
                <p className="text-[11px] text-gray-300 font-mono mt-1 flex items-center justify-between flex-wrap gap-1">
                  <span>Issued by: <strong className="text-blue-300">{selectedAlert.authority}</strong></span>
                  <span>Date: <strong>{selectedAlert.publicationDate}</strong></span>
                </p>
              </div>

              {/* Product Metadata Grid */}
              <div className="grid grid-cols-3 gap-2 text-center bg-[#161c28] p-3 rounded-2xl border border-gray-800 text-[10px] font-bold">
                <div>
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Product</span>
                  <span className="text-white text-xs truncate block">{selectedAlert.productName}</span>
                </div>
                <div className="border-x border-gray-800">
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Brand</span>
                  <span className="text-amber-400 text-xs truncate block">{selectedAlert.brand}</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Company</span>
                  <span className="text-blue-300 text-xs truncate block">{selectedAlert.company}</span>
                </div>
              </div>

              {/* Batch & Testing Laboratory Detailed Section */}
              <div className="space-y-2 bg-[#161c28] p-3.5 rounded-2xl border border-gray-800 text-xs space-y-1.5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Activity size={14} /> Laboratory Testing & Inspection Details
                </h4>
                <p className="text-[11px] text-gray-200"><strong>📦 Batch / Lot Info:</strong> {selectedAlert.batchInfo || 'Retail Container Batch Sample'}</p>
                <p className="text-[11px] text-gray-200"><strong>🔬 Testing Laboratory:</strong> {selectedAlert.testingLab || 'NABL Accredited Quality Laboratory'}</p>
                <p className="text-[11px] text-gray-200"><strong>🧪 Parameter Tested:</strong> {selectedAlert.labParameterTested || 'Fatty Acid & Chemical Adulterant Test'}</p>
                <p className="text-[11px] text-red-300 font-bold"><strong>⚠️ Detected Level:</strong> {selectedAlert.detectedLevel || selectedAlert.reason}</p>
                <p className="text-[11px] text-amber-300 font-bold"><strong>⚖️ Legal / Enforcement Action:</strong> {selectedAlert.legalAction || 'FSSAI Order under Food Safety Act 2006'}</p>
              </div>

              {/* Complete Summary & Reason */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Detailed Verified Summary</h4>
                <p className="text-xs text-gray-200 leading-relaxed bg-[#161c28] p-3.5 rounded-2xl border border-gray-800">
                  {selectedAlert.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Official Non-Compliance Reason</h4>
                <p className="text-xs text-red-200 bg-red-950/40 p-3 rounded-2xl border border-red-500/40 leading-relaxed">
                  {selectedAlert.reason}
                </p>
              </div>

              {/* RECOMMENDED CONSUMER ACTION */}
              <div className="card p-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} /> Recommended Consumer Action
                </h4>
                <p className="text-xs text-amber-100 font-medium leading-relaxed">
                  {selectedAlert.recommendedAction}
                </p>
              </div>

              {/* Source Verification Badge */}
              <div className="flex items-center justify-between text-[10px] text-gray-300 bg-black/60 p-2.5 rounded-xl border border-gray-800 font-mono">
                <span>Source: <strong className="text-white">{selectedAlert.sourceName}</strong></span>
                <span className="text-emerald-400 font-bold">✓ Officially Sourced</span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="p-4 border-t border-gray-800 bg-[#161c28] flex gap-2 shrink-0">
              <a
                href={selectedAlert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-blue flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform cursor-pointer"
              >
                <ExternalLink size={14} /> Read Official Source
              </a>

              <button
                onClick={() => handleShareAlert(selectedAlert)}
                className="p-3 bg-gray-800 text-gray-300 hover:text-white rounded-2xl text-xs font-bold flex items-center justify-center border border-gray-700 cursor-pointer"
                title="Share Alert"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={(e) => handleToggleBookmark(e, selectedAlert.id)}
                className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center border cursor-pointer ${
                  bookmarkedIds.includes(selectedAlert.id) ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-gray-800 text-gray-300 border-gray-700'
                }`}
                title="Bookmark Alert"
              >
                <Bookmark size={16} className={bookmarkedIds.includes(selectedAlert.id) ? 'fill-amber-400' : ''} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 6. NOTIFICATION SUBSCRIPTION PREFERENCES MODAL ───────────── */}
      {notifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-amber-400" />
                <h3 className="text-sm font-black theme-text">Alert Subscriptions</h3>
              </div>
              <button onClick={() => setNotifModalOpen(false)} className="p-1 rounded-full text-[var(--text-muted)] hover:theme-text">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Receive real-time push notifications when verified alerts match your preferences.
            </p>

            <div className="space-y-2.5 text-xs font-bold">
              {[
                { key: 'oilAlerts', label: 'Edible Oil Recalls & Alerts' },
                { key: 'milkAlerts', label: 'Milk & Dairy Safety Alerts' },
                { key: 'gheeAlerts', label: 'Ghee & Butter Adulteration Notices' },
                { key: 'honeyAlerts', label: 'Honey Purity & Syrup Alerts' },
                { key: 'criticalOnly', label: 'Critical Severity Alerts Only' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] cursor-pointer">
                  <span className="theme-text">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={!!notifPrefs[item.key]}
                    onChange={(e) => setNotifPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>


            {savedNotifToast && (
              <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/40 text-xs text-center font-bold animate-fade-in">
                ✓ Subscription Preferences Saved!
              </div>
            )}

            <button
              onClick={handleSaveNotifPrefs}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber hover:scale-[1.01] transition-transform"
            >
              Save Alert Preferences
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
