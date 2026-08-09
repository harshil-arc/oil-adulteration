import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Wifi, Moon, Shield, Info, LogOut, Edit3, X, Server,
  Award, Sun, ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, updateProfile, settings, updateSetting, logout } = useApp();

  // Modals & Collapsible State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState(profile);

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
                <h1 className="text-lg font-black text-[var(--text-primary)] leading-tight">{profile?.name || 'Harshil Patel'}</h1>
                <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Award size={10} /> Gold Inspector
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{profile?.email || 'harshil@food360.gov.in'} • <span className="font-mono text-[#d4af37]">{profile?.badgeId || 'INSP-8842-GJ'}</span></p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 text-xs font-bold"
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
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active FSSAI License
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">Food Safety Score</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">92 / 100</span>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">Inspector Level</span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 truncate mt-1 block">Level 4 Senior Inspector</span>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">Community Rank</span>
              <span className="text-xs font-black text-[#d4af37] truncate mt-1 block">Top 1% Officer</span>
            </div>
          </div>
        </div>

        {/* ── SYSTEM SETTINGS & PREFERENCES ─────────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-[#d4af37]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">System Settings & Preferences</h3>
            </div>
            <div className="p-1.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              {showSettingsDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {showSettingsDrawer && (
            <div className="pt-3 border-t border-[var(--border-color)] space-y-4 animate-fade-in text-xs">
              
              {/* Theme Mode */}
              <div className="space-y-2">
                <label className="text-[var(--text-muted)] font-bold block uppercase tracking-wider text-[10px]">Theme Mode</label>
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
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
                  <span className="font-bold text-[var(--text-primary)]">System Notifications</span>
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
                  <Wifi size={16} className="text-blue-500" />
                  <span className="font-bold text-[var(--text-primary)]">Scanner Link Protocol</span>
                </div>
                <span className="font-mono font-bold text-xs text-[#d4af37]">{settings.connectionMethod} →</span>
              </div>

              {/* Privacy & Security */}
              <div onClick={() => navigate('/privacy-security')} className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-emerald-500" />
                  <span className="font-bold text-[var(--text-primary)]">Privacy & Security Compliance</span>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)]" />
              </div>

              {/* About Food 360 */}
              <div onClick={() => navigate('/about')} className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Info size={16} className="text-purple-500" />
                  <span className="font-bold text-[var(--text-primary)]">About Food 360 Platform</span>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)]" />
              </div>

              {/* Sign Out Button inside Settings */}
              <div className="pt-2">
                <button
                  onClick={() => setShowLogout(true)}
                  className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <LogOut size={16} /> Sign Out of Food 360 Account
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ── ALWAYS-VISIBLE SIGN OUT CARD ─────────────────────────────────── */}
        <div className="card p-4 rounded-3xl border border-red-500/30 bg-red-500/5">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <LogOut size={18} /> Sign Out of Food 360 Account
          </button>
        </div>

      </div>

      {/* ── EDIT PROFILE SHEET ── */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end animate-fade-in backdrop-blur-md">
          <div className="w-full max-w-lg mx-auto bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-safe animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Inspector Profile</h2>
              <button onClick={() => setShowEditProfile(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveProfile} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] uppercase block mb-1">Full Name</label>
                <input required value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3.5 px-4 outline-none font-bold" />
              </div>
              <div>
                <label className="font-bold text-[var(--text-muted)] uppercase block mb-1">Email</label>
                <input required type="email" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl py-3.5 px-4 outline-none font-bold" />
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
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)]">Default Scanner Protocol</h2>
            <div className="flex flex-col gap-2 mb-6 text-xs">
              {['Bluetooth', 'Wi-Fi', 'USB OpenSerial'].map(conn => (
                <button key={conn} onClick={() => { updateSetting('connectionMethod', conn); setShowConnection(false); }} className={`p-4 rounded-2xl font-bold flex justify-between items-center ${settings.connectionMethod === conn ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>
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
              <h2 className="text-xl font-black text-[var(--text-primary)]">Sign Out?</h2>
              <p className="text-[var(--text-muted)] text-xs mt-1">You will need to re-authenticate with your FSSAI credentials to access the scanner.</p>
            </div>
            <div className="flex gap-3 text-xs pt-2">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)]">
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
