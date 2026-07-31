import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, Search, Filter, Bell, Bookmark, Share2, 
  ExternalLink, Calendar, Building, Sparkles, RefreshCw, X, ChevronRight, 
  AlertTriangle, FileText, CheckCircle2, ArrowRight, Eye, Info, Check, 
  Heart, Layers, Activity, Sliders
} from 'lucide-react';
import { INTELLIGENCE_CATEGORIES } from '../data/foodSafetyIntelligenceData';
import { 
  fetchVerifiedAlerts, 
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

  // Pull-to-Refresh & Loading State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch filtered alerts
  const allAlerts = useMemo(() => {
    let list = fetchVerifiedAlerts({
      category: selectedCategory,
      searchQuery,
      stateFilter: selectedState,
      severityFilter: selectedSeverity
    });

    if (showBookmarksOnly) {
      list = list.filter(item => bookmarkedIds.includes(item.id));
    }

    return list;
  }, [selectedCategory, searchQuery, selectedState, selectedSeverity, showBookmarksOnly, bookmarkedIds]);

  // Featured Pinned Alert (Highest Severity / Featured flag)
  const featuredAlert = useMemo(() => {
    return allAlerts.find(a => a.isFeatured) || allAlerts.find(a => a.severity === 'Critical') || allAlerts[0];
  }, [allAlerts]);

  const handleToggleBookmark = (e, alertId) => {
    e.stopPropagation();
    const isBookmarked = toggleBookmark(alertId);
    setBookmarkedIds(getBookmarkedAlertIds());
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
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
              <h1 className="text-lg font-black tracking-tight text-white">
                Food Safety <span className="text-blue-400">Intelligence</span> Center
              </h1>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Sources
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Latest verified food safety alerts from official authorities</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-400 hover:text-white transition-colors ${isRefreshing ? 'animate-spin text-blue-400' : ''}`}
            title="Refresh Intelligence Feed"
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

      <div className="p-4 space-y-6 max-w-lg mx-auto">

        {/* ── 2. SEARCH BAR ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Product, Brand, Company, Oil, Milk, Ghee, Honey, State..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-white p-3.5 pl-10 pr-9 rounded-2xl focus:border-blue-500 outline-none transition-colors"
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
                    ? 'bg-blue-600 text-white font-black border-blue-400 shadow-glow-blue scale-[1.02]'
                    : 'bg-[var(--bg-card)] text-gray-300 border-[var(--border-color)] hover:border-gray-600'
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
          <div className="card p-5 rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/40 via-[var(--bg-card)] to-amber-950/30 relative overflow-hidden shadow-glow-red">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-red-400">🚨 FEATURED HIGH PRIORITY ALERT</h3>
              </div>
              <span className="text-[9px] bg-red-500/20 text-red-300 font-mono font-bold px-2 py-0.5 rounded-full border border-red-500/40">
                {featuredAlert.severity} Severity
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-base font-black text-white leading-snug">{featuredAlert.title}</h4>
              
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-300 font-mono">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-500/30">
                  Authority: {featuredAlert.authority}
                </span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  📍 {Array.isArray(featuredAlert.affectedStates) ? featuredAlert.affectedStates.join(', ') : (featuredAlert.affectedStates || 'Pan-India')}
                </span>
                <span className="text-gray-400">Published: {featuredAlert.publicationDate}</span>
              </div>

              <div className="bg-black/40 p-3 rounded-2xl border border-red-500/20 mt-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Reason for Notice:</p>
                <p className="text-xs text-red-200 font-medium leading-relaxed">{featuredAlert.reason}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAlert(featuredAlert)}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-red hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
              >
                Inspect Alert Details <ArrowRight size={14} />
              </button>
              <a
                href={featuredAlert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 bg-gray-800 text-gray-200 hover:text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1 border border-gray-700"
              >
                Official Notice <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* ── 4. ALERT CARDS LIST ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Activity size={15} className="text-blue-400" /> Verified Intelligence Feed ({allAlerts.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">100% Fact Checked</span>
          </div>

          {allAlerts.length === 0 ? (
            <div className="card p-8 rounded-3xl text-center text-gray-400 border border-[var(--border-color)] space-y-2">
              <ShieldCheck size={36} className="mx-auto text-blue-400 opacity-60" />
              <h4 className="text-sm font-bold text-white">No verified food safety alerts are available at the moment.</h4>
              <p className="text-xs text-gray-400">All regulatory feeds and official channels are up-to-date.</p>
            </div>
          ) : (
            allAlerts.map(item => {
              const isBookmarked = bookmarkedIds.includes(item.id);
              
              // Severity badge color styling
              let severityBadgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              if (item.severity === 'Critical') severityBadgeClass = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
              else if (item.severity === 'High') severityBadgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
              else if (item.severity === 'Medium') severityBadgeClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAlert(item)}
                  className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-500/50 transition-all cursor-pointer space-y-3 relative overflow-hidden group shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${severityBadgeClass}`}>
                        {item.severity}
                      </span>
                      <span className="text-[9px] bg-blue-500/15 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30">
                        {item.sourceBadge}
                      </span>
                      <span className="text-[9px] bg-[var(--bg-elevated)] text-gray-400 font-mono px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleBookmark(e, item.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isBookmarked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-[var(--bg-elevated)] text-gray-400 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                    >
                      <Bookmark size={14} className={isBookmarked ? 'fill-amber-400' : ''} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-mono flex items-center gap-2">
                      <span>🏛️ {item.authority}</span>
                      <span>•</span>
                      <span>📅 {item.publicationDate}</span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Affected States & Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-[10px]">
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
          <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[88vh] flex flex-col">
            
            {/* Header Image & Close */}
            <div className="relative h-44 w-full bg-gray-900 shrink-0">
              <img src={selectedAlert.thumbnailImage} alt={selectedAlert.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/60" />
              
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
                <h3 className="text-base font-black text-white leading-tight">{selectedAlert.title}</h3>
                <p className="text-[11px] text-gray-400 font-mono mt-1 flex items-center justify-between">
                  <span>Issued by: <strong className="text-blue-300">{selectedAlert.authority}</strong></span>
                  <span>Date: <strong>{selectedAlert.publicationDate}</strong></span>
                </p>
              </div>

              {/* Product Metadata Grid */}
              <div className="grid grid-cols-3 gap-2 text-center bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] text-[10px] font-bold">
                <div>
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Product</span>
                  <span className="text-white text-xs truncate block">{selectedAlert.productName}</span>
                </div>
                <div className="border-x border-[var(--border-color)]">
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Brand</span>
                  <span className="text-amber-400 text-xs truncate block">{selectedAlert.brand}</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Company</span>
                  <span className="text-blue-300 text-xs truncate block">{selectedAlert.company}</span>
                </div>
              </div>

              {/* Complete Summary & Reason */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Detailed Verified Summary</h4>
                <p className="text-xs text-gray-200 leading-relaxed bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)]">
                  {selectedAlert.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Official Non-Compliance Reason</h4>
                <p className="text-xs text-red-200 bg-red-950/30 p-3 rounded-2xl border border-red-500/30 leading-relaxed">
                  {selectedAlert.reason}
                </p>
              </div>

              {/* RECOMMENDED CONSUMER ACTION */}
              <div className="card p-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} /> Recommended Consumer Action
                </h4>
                <p className="text-xs text-amber-100 font-medium leading-relaxed">
                  {selectedAlert.recommendedAction}
                </p>
              </div>

              {/* Source Verification Badge */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 bg-black/40 p-2.5 rounded-xl border border-gray-800 font-mono">
                <span>Source: <strong className="text-white">{selectedAlert.sourceName}</strong></span>
                <span className="text-emerald-400 font-bold">✓ Officially Sourced</span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex gap-2 shrink-0">
              <a
                href={selectedAlert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-blue flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <ExternalLink size={14} /> Read Official Source
              </a>

              <button
                onClick={() => handleShareAlert(selectedAlert)}
                className="p-3 bg-gray-800 text-gray-300 hover:text-white rounded-2xl text-xs font-bold flex items-center justify-center border border-gray-700"
                title="Share Alert"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={(e) => handleToggleBookmark(e, selectedAlert.id)}
                className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center border ${
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
                <h3 className="text-sm font-black text-white">Alert Subscriptions</h3>
              </div>
              <button onClick={() => setNotifModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-300">
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
                  <span className="text-white">{item.label}</span>
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
