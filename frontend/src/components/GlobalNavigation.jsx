import { 
  X, Home, ScanLine, Clock, MapIcon, Users,
  BookOpen, FileText, User, Settings, Info,
  LogOut, LayoutDashboard, Zap, Apple, Heart, Dumbbell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function GlobalNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMenuOpen, setMenuOpen, logout, profile } = useApp();
  
  const role = profile?.role || 'citizen';

  const menuItems = [
    { id: 'home', label: 'Dashboard', desc: 'System Overview & Analytics', icon: Home, path: '/home', roles: ['citizen', 'vendor', 'inspector', 'laboratory', 'ngo', 'senior_officer', 'admin'] },
    { id: 'scan', label: 'Oil Analysis', desc: 'Real-time Adulteration Check', icon: ScanLine, path: '/scan', roles: ['citizen', 'inspector', 'admin'] },
    { id: 'hotspots', label: 'Safety Hotspots', desc: 'Interactive Adulteration Map', icon: MapIcon, path: '/hotspots', roles: ['citizen', 'inspector', 'senior_officer', 'admin'] },
    { id: 'community', label: 'Safety Intelligence', desc: 'Complaints, Recalls & Labs', icon: Users, path: '/community', roles: ['citizen', 'vendor', 'inspector', 'laboratory', 'ngo', 'senior_officer', 'admin'] },
    { id: 'disaster', label: 'Disaster & Emergency', desc: 'Live GDACS Alerts & Emergency', icon: Zap, path: '/disaster?tab=disaster', roles: ['citizen', 'ngo', 'volunteer', 'inspector', 'senior_officer', 'admin'] },
    { id: 'relief', label: 'Food Relief & Donations', desc: 'Surplus Food & NGO Logistics', icon: Heart, path: '/disaster?tab=relief', roles: ['citizen', 'ngo', 'volunteer', 'admin'] },
    { id: 'nutrition', label: 'AI Meal Planner', desc: 'Smart Meal Planner & Recipes', icon: Apple, path: '/nutrition', roles: ['citizen', 'admin'] },
    { id: 'fitness', label: 'AI Fitness Coach', desc: 'Adaptive Workouts & Burn Engine', icon: Dumbbell, path: '/fitness', roles: ['citizen', 'admin'] },
    { id: 'learning', label: 'Learning Center', desc: 'Documentation & Guides', icon: BookOpen, path: '/learning', roles: ['citizen', 'vendor', 'inspector', 'admin'] },
    { id: 'reports', label: 'System Reports', desc: 'Regulatory Logs & Analytics', icon: FileText, path: '/reports', roles: ['inspector', 'senior_officer', 'admin'] },
    { id: 'profile', label: 'Profile Settings', desc: 'Identity & Accreditation', icon: User, path: '/profile', roles: ['citizen', 'vendor', 'inspector', 'laboratory', 'ngo', 'senior_officer', 'admin'] },
    { id: 'about', label: 'About System', desc: 'Software Version & Compliance', icon: Info, path: '/about', roles: ['citizen', 'vendor', 'inspector', 'laboratory', 'ngo', 'senior_officer', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  if (!isMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setMenuOpen(false)}
      />

      {/* Side Drawer */}
      <div className={`relative w-[80%] max-w-sm bg-[var(--glass-bg)] border-r border-[var(--border-color)] backdrop-blur-2xl h-full shadow-2xl flex flex-col transform transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-8 flex items-center justify-between border-b border-[var(--border-color)]">
           <div className="flex items-center gap-3">
              <img src="/food360-logo.jpg" alt="SpectraTrust Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg border border-[#d4af37]/30" />
              <div>
                 <h2 className="text-xs font-black theme-text uppercase tracking-widest leading-none">SpectraTrust Portal</h2>
                 <p className="text-[8px] text-[#d4af37] font-bold uppercase tracking-widest mt-1">Role: {role.replace('_', ' ')}</p>
              </div>
           </div>
           <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:theme-text transition-colors">
              <X size={18} />
           </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
           <div className="grid gap-2">
              {filteredMenuItems.map((item) => {
                 const isActive = location.pathname === item.path;
                 return (
                    <button
                       key={item.id}
                       onClick={() => {
                          navigate(item.path);
                          setMenuOpen(false);
                       }}
                       className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-[#d4af37]/10 border border-[#d4af37]/25 shadow-sm' : 'hover:bg-[var(--hover-bg)] border border-transparent'}`}
                    >
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#d4af37] text-black' : 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-muted)] group-hover:theme-text'}`}>
                          <item.icon size={22} />
                       </div>
                       <div className="text-left">
                          <p className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-[#d4af37] font-extrabold' : 'theme-text'}`}>
                             {item.label}
                          </p>
                          <p className="text-[9px] text-[var(--text-muted)] font-medium leading-none mt-1">
                             {item.desc}
                          </p>
                       </div>
                    </button>
                 );
              })}
           </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[var(--border-color)] flex flex-col gap-4">
           <button 
             onClick={() => {
                logout();
                setMenuOpen(false);
                navigate('/login');
             }} 
             className="flex items-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors"
           >
              <LogOut size={16} /> Sign Out System
           </button>
           <p className="text-[8px] text-[var(--text-muted)] font-bold text-center uppercase tracking-widest">
              SpectraTrust Framework v2.0
           </p>
        </div>
      </div>
    </div>
  );
}
