import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Globe, Wifi, Moon, Shield, Info, FileText, 
  BookOpen, LogOut, ChevronRight, Edit3, X, Server
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, updateProfile, settings, updateSetting, logout } = useApp();
  const [stats, setStats] = useState({ total: 0, safe: 0, unsafe: 0 });
  const [reportsCount, setReportsCount] = useState(0);
  
  // Modals & Bottom Sheets state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    supabase.from('analysis_results').select('*')
      .then(({data}) => {
        if (!data) return;
        const total = data.length;
        const unsafe = data.filter(r => r.quality === 'Unsafe');
        setStats({
          total,
          safe: total - unsafe.length,
          unsafe: unsafe.length
        });
        setReportsCount(unsafe.length);
      });
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('pureoil_profile');
    await logout();
  };

  const saveProfile = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    setShowEditProfile(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in relative z-20 pb-10 transition-colors">
       {/* Background Glow */}
       {settings.darkMode && <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623] opacity-10 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3" />}

       {/* Header */}
       <div className="px-5 pt-8 pb-4 relative z-10">
         <h1 className="text-2xl font-black tracking-tight theme-text">{t('profile.title')}</h1>
       </div>

       <div className="flex-1 px-5 flex flex-col gap-6 relative z-10">
          
          {/* Avatar Area */}
          <div className="flex items-center gap-4">
             <div className="relative cursor-pointer" onClick={() => { setEditForm(profile); setShowEditProfile(true); }}>
                <div className="w-20 h-20 rounded-full border-2 border-[#F5A623] p-1 shadow-[0_0_15px_rgba(245,166,35,0.3)]">
                   <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-page)] flex items-center justify-center border border-[var(--border-color)]">
                      <span className="text-2xl font-bold text-[#F5A623]">{getInitials(profile.name)}</span>
                   </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#F5A623] text-black rounded-full flex items-center justify-center border-2 border-[var(--bg-page)]">
                  <Edit3 size={12} />
                </div>
             </div>
             <div>
                <h2 className="text-xl font-bold leading-tight theme-text">{profile.name}</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-2">{profile.email}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold uppercase tracking-widest bg-[#F5A623]/10 text-[#F5A623] px-2 py-0.5 rounded border border-[#F5A623]/20">
                     {profile.badgeId}
                   </span>
                </div>
             </div>
          </div>

          {/* Stats Row */}
          <div className="card grid grid-cols-3 divide-x divide-[var(--border-color)] p-0 shadow-sm">
             <div className="flex flex-col items-center justify-center py-4">
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Total Scans</p>
                <p className="text-[#F5A623] font-black text-xl">{stats.total}</p>
             </div>
             <div className="flex flex-col items-center justify-center py-4">
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Safe</p>
                <p className="text-green-500 font-black text-xl">{stats.safe}</p>
             </div>
             <div className="flex flex-col items-center justify-center py-4">
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Unsafe</p>
                <p className="text-red-500 font-black text-xl">{stats.unsafe}</p>
             </div>
          </div>

          {/* My Reports Shortcut */}
          <div>
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-sm font-bold tracking-wider theme-text">My FSSAI Reports</h3>
               <button onClick={() => navigate('/reports')} className="text-[10px] uppercase font-bold text-[#F5A623] tracking-widest">View All</button>
            </div>
            
            <div onClick={() => navigate('/reports')} className="card p-4 flex items-center justify-between hover:border-[#F5A623]/50 cursor-pointer transition-colors shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center border border-[#F5A623]/20">
                     <FileText size={18} />
                  </div>
                  <div>
                     <p className="font-bold text-sm theme-text">Violation Reports</p>
                     <p className="text-xs text-[var(--text-secondary)]">{reportsCount} notices pending review</p>
                  </div>
               </div>
               <ChevronRight size={16} className="text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Account Settings */}
          <div>
             <h3 className="text-sm font-bold tracking-wider mb-3 theme-text">Settings</h3>
             <div className="card p-0 flex flex-col divide-y divide-[var(--border-color)] shadow-sm">
                
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-4">
                   <div className="flex items-center gap-3">
                      <Bell size={18} className="text-[#F5A623]" />
                      <span className="text-sm font-medium theme-text">{t('profile.notifications')}</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={settings.notifications} onChange={() => updateSetting('notifications', !settings.notifications)} />
                     <div className={`w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.notifications ? 'bg-[#F5A623]' : ''}`}></div>
                   </label>
                </div>

                {/* Language */}
                 <div onClick={() => setShowLanguage(true)} className="flex items-center justify-between p-4 cursor-pointer theme-hover transition-colors">
                    <div className="flex items-center gap-3">
                       <Globe size={18} className="text-[#F5A623]" />
                       <span className="text-sm font-medium theme-text">{t('profile.language')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                       <span className="text-xs uppercase font-bold tracking-widest">{settings.language === 'en' ? 'English' : 'Hindi'}</span>
                       <ChevronRight size={16} />
                    </div>
                 </div>

                {/* Connection Method */}
                 <div onClick={() => setShowConnection(true)} className="flex items-center justify-between p-4 cursor-pointer theme-hover transition-colors">
                    <div className="flex items-center gap-3">
                       <Wifi size={18} className="text-[#F5A623]" />
                       <span className="text-sm font-medium theme-text">{t('profile.hw_connection')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                       <span className="text-xs uppercase font-bold tracking-widest">{settings.connectionMethod}</span>
                       <ChevronRight size={16} />
                    </div>
                 </div>

                {/* Dark Mode Toggle */}
                 <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                       <Moon size={18} className="text-[#F5A623]" />
                       <span className="text-sm font-medium theme-text">{t('profile.dark_mode')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settings.darkMode} onChange={() => updateSetting('darkMode', !settings.darkMode)} />
                      <div className={`w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.darkMode ? 'bg-[#F5A623]' : ''}`}></div>
                    </label>
                 </div>

                {/* Navigation Links */}
                 {[
                   { icon: Shield, title: t('profile.privacy'), path: '/privacy' },
                   { icon: Info, title: t('profile.about'), path: '/about' },
                   { icon: BookOpen, title: t('profile.learning'), path: '/learning' },
                   { icon: Server, title: "Developer Tools", path: '/developer' },
                 ].map((item, idx) => (
                  <div key={idx} onClick={() => navigate(item.path)} className="flex items-center justify-between p-4 cursor-pointer theme-hover transition-colors">
                     <div className="flex items-center gap-3">
                        <item.icon size={18} className="text-[#F5A623]" />
                        <span className="text-sm font-medium theme-text">{item.title}</span>
                     </div>
                     <ChevronRight size={16} className="text-[var(--text-muted)]" />
                  </div>
                ))}

                {/* External Link */}
                <div onClick={() => window.open('https://fssai.gov.in', '_blank')} className="flex items-center justify-between p-4 cursor-pointer theme-hover transition-colors">
                   <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[#F5A623]" />
                      <span className="text-sm font-medium theme-text">FSSAI Guidelines</span>
                   </div>
                   <div className="w-1.5 h-1.5 bg-[#F5A623] rounded-full mr-1.5" />
                </div>
             </div>
          </div>

          {/* Sign Out Btn */}
          <button 
            onClick={() => setShowLogout(true)}
            className="mt-4 w-full py-4 flex items-center justify-center gap-2 border border-red-500 rounded-[20px] text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all bg-red-500/5 mb-8"
          >
              <LogOut size={18} />
              {t('profile.logout')}
           </button>
       </div>

       {/* --- MODALS & BOTTOM SHEETS --- */}

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
                   <input required value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] theme-text focus:border-[#F5A623] rounded-2xl py-3.5 px-4 outline-none text-sm" />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 mb-1 block">Email</label>
                   <input required type="email" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] theme-text focus:border-[#F5A623] rounded-2xl py-3.5 px-4 outline-none text-sm" />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 mb-1 block">Phone Number</label>
                   <input required value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] theme-text focus:border-[#F5A623] rounded-2xl py-3.5 px-4 outline-none text-sm" />
                 </div>
                 <div className="mb-2">
                   <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 mb-1 block">Badge ID</label>
                   <input required value={editForm.badgeId} onChange={e=>setEditForm({...editForm, badgeId: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] theme-text focus:border-[#F5A623] rounded-2xl py-3.5 px-4 outline-none text-sm" />
                 </div>
                 <button type="submit" className="w-full bg-[#F5A623] text-black font-bold uppercase tracking-widest py-4 rounded-2xl shadow-[0_4px_20px_rgba(245,166,35,0.3)] hover:brightness-110 active:scale-95 transition-all">
                   Save Changes
                 </button>
               </form>
            </div>
         </div>
       )}

       {/* Language Sheet */}
       {showLanguage && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-end animate-fade-in backdrop-blur-sm" onClick={() => setShowLanguage(false)}>
            <div className="w-full bg-[var(--bg-page)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-safe animate-slide-up" onClick={e=>e.stopPropagation()}>
               <h2 className="text-xl font-bold mb-6 theme-text">Select Language</h2>
                <div className="flex flex-col gap-2 mb-6">
                  {[
                    { label: 'English', code: 'en' },
                    { label: 'Hindi', code: 'hi' },
                    { label: 'Tamil', code: 'ta', disabled: true },
                    { label: 'Telugu', code: 'te', disabled: true },
                    { label: 'Marathi', code: 'mr', disabled: true }
                  ].map(lang => (
                    <button 
                      key={lang.code} 
                      disabled={lang.disabled}
                      onClick={() => { updateSetting('language', lang.code); setShowLanguage(false); }} 
                      className={`p-4 rounded-2xl font-bold flex justify-between items-center ${settings.language === lang.code ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30' : 'bg-[var(--bg-elevated)] theme-text border border-[var(--border-color)]'} ${lang.disabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {lang.label}
                        {lang.disabled && <span className="text-[8px] font-black bg-[var(--bg-elevated)] text-[var(--text-muted)] px-1.5 py-0.5 rounded uppercase tracking-widest">Coming Soon</span>}
                      </div>
                      {settings.language === lang.code && <div className="w-2 h-2 rounded-full bg-[#F5A623]" />}
                    </button>
                  ))}
                </div>
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
                   <button key={conn} onClick={() => { updateSetting('connectionMethod', conn); setShowConnection(false); }} className={`p-4 rounded-2xl font-bold flex justify-between items-center ${settings.connectionMethod === conn ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30' : 'bg-[var(--bg-elevated)] theme-text border border-[var(--border-color)]'}`}>
                     {conn}
                     {settings.connectionMethod === conn && <div className="w-2 h-2 rounded-full bg-[#F5A623]" />}
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
                 <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-elevated)] theme-text">
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
