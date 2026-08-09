import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Wifi, Moon, Shield, Info, LogOut, Edit3, X, Server,
  Sun, ChevronRight, Settings, Camera, CheckCircle,
  Phone, MapPin, Calendar, FileText, Download, Smartphone, Package, CheckCircle2, Sparkles,
  Scan, AlertTriangle, BarChart3, Upload,
  ChevronDown, ChevronUp, Target, Mail, User, Check, History as HistoryIcon, Beaker, ShieldCheck
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

const AVATAR_COLORS = [
  '#0052ff', '#d4af37', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'
];

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-black text-[var(--text-primary)] font-mono leading-none">{value ?? '—'}</p>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">{label}</p>
        {sub && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Achievement Badge ─────────────────────────────────────────────────────────
function AchievementBadge({ emoji, title, desc, earned }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${earned ? 'bg-[#0052ff]/10 border-[#0052ff]/40' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] opacity-50'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${earned ? 'bg-[#0052ff]/20' : 'bg-[var(--bg-card)]'}`}>
        {emoji}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-black leading-tight ${earned ? 'text-[#0052ff]' : 'text-[var(--text-muted)]'}`}>{title}</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
      </div>
      {earned && <CheckCircle size={16} className="text-[#0052ff] shrink-0 ml-auto" />}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, updateProfile, settings, updateSetting, logout, user } = useApp();

  // UI state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Capture PWA install prompt if available
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDownloadApk = () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            console.log('User accepted PWA installation');
          }
          setDeferredPrompt(null);
        });
      } catch (_) {}
    }

    // Trigger direct file download of food360.apk
    const link = document.createElement('a');
    link.href = '/food360.apk';
    link.download = 'food360.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessToast('✓ Food 360 APK download started! Check your downloads.');
    setTimeout(() => setSuccessToast(''), 4500);
  };
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    state: profile?.state || 'Gujarat',
  });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);


  // Scan History items for profile history card
  const [scanHistory, setScanHistory] = useState([]);

  // Sync editForm whenever profile changes
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        state: profile.state || 'Gujarat',
      });
    }
  }, [profile]);

  // Activity stats
  const [stats, setStats] = useState({ scans: null, detected: null, reports: null, accuracy: null });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch live stats and scan history from Supabase
  useEffect(() => {
    const fetchStatsAndHistory = async () => {
      try {
        const [{ count: scans }, { data: results }, { count: reports }] = await Promise.all([
          supabase.from('analysis_results').select('*', { count: 'exact', head: true }),
          supabase.from('analysis_results').select('*').order('timestamp', { ascending: false }),
          supabase.from('violation_reports').select('*', { count: 'exact', head: true })
        ]);

        if (results) {
          setScanHistory(results.slice(0, 5));
        }

        const detected = results?.filter(r => r.adulteration_detected || r.quality === 'Unsafe')?.length ?? 0;
        const avgConf = results?.length
          ? Math.round(results.reduce((s, r) => s + (r.confidence_score || 0), 0) / results.length)
          : null;

        setStats({ scans: scans ?? 0, detected, reports: reports ?? 0, accuracy: avgConf });
      } catch {
        setStats({ scans: 0, detected: 0, reports: 0, accuracy: null });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStatsAndHistory();
  }, []);

  const getInitials = (name = 'User') =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const memberSinceFormatted = () => {
    if (!profile?.memberSince) return 'Recently';
    try {
      return new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } catch { return profile.memberSince; }
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      state: profile?.state || 'Gujarat',
    });
    setShowEditModal(true);
  };

  const handleSaveDetails = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(editForm);
      setSuccessToast('Profile updated successfully!');
      setShowEditModal(false);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const localUrl = URL.createObjectURL(file);
      await updateProfile({ avatarUrl: localUrl });

      if (user) {
        const ext = file.name.split('.').pop();
        const path = `avatars/${user.id}.${ext}`;
        const { error } = await supabase.storage.from('profiles').upload(path, file, { upsert: true });
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
          await updateProfile({ avatarUrl: publicUrl });
        }
      }
      setSuccessToast('Avatar updated!');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.warn('Avatar upload failed:', err);
    }
    setShowAvatarPicker(false);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('pureoil_profile');
    await logout();
  };

  const achievements = [
    { emoji: '🥇', title: 'First Scan', desc: 'Completed your first oil test', earned: (stats.scans ?? 0) >= 1 },
    { emoji: '🔟', title: '10 Scans', desc: 'Reached 10 total oil tests', earned: (stats.scans ?? 0) >= 10 },
    { emoji: '💯', title: 'Century Milestone', desc: 'Completed 100+ tests', earned: (stats.scans ?? 0) >= 100 },
    { emoji: '🚨', title: 'First Detection', desc: 'Identified adulterated sample', earned: (stats.detected ?? 0) >= 1 },
    { emoji: '📋', title: 'Report Filed', desc: 'Submitted an issue report', earned: (stats.reports ?? 0) >= 1 },
    { emoji: '⭐', title: 'Power User', desc: '100+ tests milestone', earned: (stats.scans ?? 0) >= 100 },
  ];

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in relative z-20 pb-28">

      {/* ── SUCCESS TOAST BANNER ────────────────────────────────────────────── */}
      {successToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs animate-bounce">
          <Check size={16} /> {successToast}
        </div>
      )}

      {/* ── USER HEADER SECTION (WITH MAIN EDIT BUTTON AT TOP RIGHT) ─────────────── */}
      <div className="relative px-5 pt-8 pb-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden">
        {/* Background gradient orb */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: profile?.avatarColor || '#0052ff' }} />

        <div className="max-w-2xl mx-auto">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-2xl border-2 overflow-hidden cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
                style={{ borderColor: profile?.avatarColor || '#0052ff' }}
                onClick={() => setShowAvatarPicker(true)}
              >
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ background: `${profile?.avatarColor || '#0052ff'}22`, color: profile?.avatarColor || '#0052ff' }}>
                    {getInitials(profile?.name)}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] flex items-center justify-center shadow-md hover:text-[var(--text-primary)] transition-all"
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Name & email */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-[var(--text-primary)] leading-tight truncate">{profile?.name || 'User Profile'}</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium truncate">{profile?.email || 'user@food360.app'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-bold flex items-center gap-1">
                  <User size={10} /> Active Account
                </span>
              </div>
            </div>

            {/* MAIN EDIT PROFILE BUTTON (ONLY MAIN ONE AT TOP RIGHT) */}
            <button
              onClick={handleOpenEdit}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-[#0052ff] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          </div>

          {/* User info chips */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1.5">
              <Calendar size={10} className="text-blue-400" />Member since {memberSinceFormatted()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">

        {/* ── ACTIVITY STATS ────────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-2">
            <BarChart3 size={12} /> Activity Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Scan} label="Total Scans" value={statsLoading ? '…' : stats.scans} color="bg-[#0052ff]/20 text-[#0052ff]" />
            <StatCard icon={AlertTriangle} label="Adulterations" value={statsLoading ? '…' : stats.detected} color="bg-red-500/20 text-red-400" />
            <StatCard icon={FileText} label="Reports Filed" value={statsLoading ? '…' : stats.reports} color="bg-emerald-500/20 text-emerald-400" />
            <StatCard icon={Target} label="Avg Confidence" value={statsLoading ? '…' : stats.accuracy != null ? `${stats.accuracy}%` : 'N/A'} color="bg-purple-500/20 text-purple-400" />
          </div>
        </div>

        {/* ── DOWNLOAD APP (APK) CARD ────────────────────────────────────────── */}

        <div className="card p-5 rounded-3xl border-2 border-[#d4af37]/60 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#d4af37]/15 relative overflow-hidden shadow-glow-gold space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 shadow-md">
                <Smartphone size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-[var(--text-primary)] leading-tight">Download Food 360 App</h2>
                  <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    APK v1.0.0
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">Install native Android application package on your mobile device</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
              <Package size={12} className="text-[#d4af37]" /> Size: 189 KB
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
              <Smartphone size={12} className="text-emerald-400" /> Android 5.0+
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
              <CheckCircle2 size={12} className="text-blue-400" /> Direct Installer
            </span>
          </div>

          <button
            onClick={handleDownloadApk}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-glow-gold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Download size={18} strokeWidth={2.5} />
            Download APK File (food360.apk)
          </button>

          <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-2">
            <button
              onClick={() => setShowInstallGuide(s => !s)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-1.5 text-[11px] text-[#d4af37] font-black uppercase tracking-wider">
                <Sparkles size={13} /> How to Install APK on your Android Phone
              </span>
              {showInstallGuide ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
            </button>

            {showInstallGuide && (
              <div className="pt-2.5 border-t border-[var(--border-color)] space-y-2.5 text-[11px] text-[var(--text-secondary)] animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Tap <strong>Download APK File</strong> button above to save <code className="text-[#d4af37] bg-[var(--bg-card)] px-1 py-0.5 rounded border border-[var(--border-color)]">food360.apk</code>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Open your phone's notification shade or <strong>Downloads</strong> manager and tap <code className="text-[#d4af37] bg-[var(--bg-card)] px-1 py-0.5 rounded border border-[var(--border-color)]">food360.apk</code>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>If prompted by Android, enable <strong>"Allow installation from unknown sources"</strong> in your browser settings.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <p>Tap <strong>Install</strong>. When finished, open <strong>Food 360</strong> directly from your home screen!</p>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* ── PERSONAL DETAILS CARD ─────────────────────────────────────────── */}
        <div className="card p-4 rounded-3xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
              <User size={12} /> Account Information
            </p>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User size={15} className="text-[#0052ff]" />
                <span className="text-xs text-[var(--text-muted)] font-bold">Full Name</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{profile?.name || 'Not set'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#0052ff]" />
                <span className="text-xs text-[var(--text-muted)] font-bold">Email Address</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{profile?.email || 'Not set'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#0052ff]" />
                <span className="text-xs text-[var(--text-muted)] font-bold">Phone Number</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{profile?.phone || 'Not set'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin size={15} className="text-[#0052ff]" />
                <span className="text-xs text-[var(--text-muted)] font-bold">State / Region</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{profile?.state || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* ── SCAN HISTORY CARD / SECTION ───────────────────────────────────── */}
        <div className="card p-4 rounded-3xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <HistoryIcon size={16} className="text-[#0052ff]" />
              <p className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">Scan History & Saved Results</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-bold text-[#0052ff] hover:underline flex items-center gap-1"
            >
              View All ({stats.scans ?? 0}) →
            </button>
          </div>

          {scanHistory.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <Beaker size={28} className="mx-auto text-[var(--text-muted)] opacity-50" />
              <p className="text-xs text-[var(--text-muted)] font-medium">No saved scan results yet.</p>
              <button
                onClick={() => navigate('/scan')}
                className="py-2 px-4 rounded-xl bg-[#0052ff] text-white text-xs font-bold hover:bg-blue-600 transition-all inline-block mt-2"
              >
                Perform First Oil Scan
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {scanHistory.map(scan => (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/scan/${scan.id}`)}
                  className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[#0052ff]/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      scan.quality === 'Unsafe' || scan.adulteration_detected ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      <Beaker size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{scan.oil_type || 'Mustard Oil'}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {scan.vendor || 'Local Vendor'} • {new Date(scan.timestamp || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-[var(--text-primary)]">{parseFloat(scan.purity || 94).toFixed(1)}%</span>
                    <span className={`block text-[8px] font-black uppercase ${
                      scan.quality === 'Unsafe' || scan.adulteration_detected ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {scan.quality === 'Unsafe' || scan.adulteration_detected ? 'ADULTERATED' : 'SAFE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MILESTONES & ACHIEVEMENTS ─────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-2">
            <CheckCircle size={12} /> Milestones & Achievements
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {achievements.map((a, i) => <AchievementBadge key={i} {...a} />)}
          </div>
        </div>

        {/* ── PREFERENCES & SETTINGS ────────────────────────────────────────── */}
        <div className="card p-4 rounded-3xl border border-[var(--border-color)]">
          <button className="w-full flex items-center justify-between text-left" onClick={() => setShowSettings(s => !s)}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
              <Settings size={12} /> Preferences & Settings
            </p>
            {showSettings ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
          </button>

          {showSettings && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {/* Theme */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] block mb-2">Theme Mode</label>
                <div className="grid grid-cols-3 gap-2 bg-[var(--bg-elevated)] p-1 rounded-2xl border border-[var(--border-color)]">
                  {[{ mode: 'light', label: 'Light', Icon: Sun }, { mode: 'dark', label: 'Dark', Icon: Moon }, { mode: 'system', label: 'System', Icon: Server }].map(item => (
                    <button key={item.mode} onClick={() => updateSetting('themeMode', item.mode)}
                      className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all ${(settings.themeMode || 'system') === item.mode ? 'bg-[#0052ff] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                    ><item.Icon size={11} />{item.label}</button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <Bell size={15} className="text-[#0052ff]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                </div>
                <input type="checkbox" checked={settings.notifications} onChange={() => updateSetting('notifications', !settings.notifications)} className="w-5 h-5 accent-[#0052ff] rounded cursor-pointer" />
              </div>

              {/* Scanner Link */}
              <div className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)] cursor-pointer" onClick={() => {}}>
                <div className="flex items-center gap-2.5">
                  <Wifi size={15} className="text-blue-500" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Scanner Protocol</span>
                </div>
                <span className="font-mono font-bold text-xs text-[#0052ff]">{settings.connectionMethod}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── QUICK LINKS ───────────────────────────────────────────────────── */}
        <div className="card p-0 rounded-3xl border border-[var(--border-color)] overflow-hidden divide-y divide-[var(--border-color)]">
          {[
            { icon: Shield, label: 'Privacy & Security', sub: 'Manage your data & PIN lock', color: 'text-emerald-500', path: '/privacy-security' },
            { icon: Info, label: 'About Food 360', sub: 'App details & licenses', color: 'text-purple-400', path: '/about' },
          ].map(({ icon: Icon, label, sub, color, path }) => (
            <button key={path} onClick={() => navigate(path)} className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-elevated)] transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center ${color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{sub}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)]" />
            </button>
          ))}
        </div>

        {/* ── DANGER ZONE ───────────────────────────────────────────────────── */}
        <div className="card p-4 rounded-3xl border border-red-500/20 bg-red-500/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={12} /> Account Actions
          </p>
          <button
            onClick={() => setShowLogout(true)}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <LogOut size={16} /> Sign Out of Food 360
          </button>
        </div>

      </div>

      {/* ── EDIT PROFILE MODAL / SHEET ───────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-end sm:items-center justify-center animate-fade-in backdrop-blur-md p-0 sm:p-4" onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-2xl animate-slide-up space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#0052ff]" />
                <h2 className="text-lg font-black text-[var(--text-primary)]">Edit Profile</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] uppercase block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 outline-none font-bold focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] uppercase block mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 outline-none font-bold focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] uppercase block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 outline-none font-bold focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] uppercase block mb-1">State / Region</label>
                <select
                  value={editForm.state}
                  onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3 px-4 outline-none font-bold focus:border-[#0052ff]"
                >
                  {STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-2xl bg-[#0052ff] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AVATAR PICKER SHEET ───────────────────────────────────────────────── */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-end animate-fade-in backdrop-blur-md" onClick={() => setShowAvatarPicker(false)}>
          <div className="w-full max-w-lg mx-auto bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-safe animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-black text-[var(--text-primary)]">Change Avatar</h2>
              <button onClick={() => setShowAvatarPicker(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)]"><X size={18} /></button>
            </div>

            {/* Upload from device */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl mb-4 hover:border-[#0052ff] transition-colors"
            >
              <Upload size={18} className="text-[#0052ff]" />
              <div className="text-left">
                <p className="text-sm font-bold text-[var(--text-primary)]">Upload Photo</p>
                <p className="text-[10px] text-[var(--text-muted)]">JPG, PNG • Max 5 MB</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

            {/* Colour picker */}
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-2">Or choose avatar accent color</p>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { updateProfile({ avatarColor: c, avatarUrl: null }); setShowAvatarPicker(false); }}
                  className="w-10 h-10 rounded-xl border-2 transition-all hover:scale-110"
                  style={{ background: c, borderColor: profile?.avatarColor === c ? 'white' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRM ───────────────────────────────────────────────────── */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-5 animate-fade-in backdrop-blur-md" onClick={() => setShowLogout(false)}>
          <div className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-2xl text-center space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex flex-col items-center justify-center mx-auto border border-red-500/20">
              <LogOut size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)]">Sign Out?</h2>
              <p className="text-[var(--text-muted)] text-xs mt-1">You will need to sign back in to access your account.</p>
            </div>
            <div className="flex gap-3 text-xs pt-2">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)]">Cancel</button>
              <button onClick={handleSignOut} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-500/20">Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
