import { 
  X, Home, ScanLine, Clock, MapIcon, 
  BookOpen, FileText, User, Settings, Info,
  LogOut, LayoutDashboard, Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function GlobalNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMenuOpen, setMenuOpen, logout } = useApp();

  const menuItems = [
    { id: 'home', label: 'Dashboard', desc: 'System Overview & Predictions', icon: Home, path: '/home' },
    { id: 'scan', label: 'Oil Analysis', desc: 'Real-time Adulteration Check', icon: ScanLine, path: '/scan' },
    { id: 'analytics', label: 'Efficiency Insights', desc: 'Waste & Preparation Ledgers', icon: Clock, path: '/history' },
    { id: 'ngo', label: 'Donations', desc: 'NGO Redistribution Hub', icon: MapIcon, path: '/ngo-dashboard' },
    { id: 'map', label: 'Kitchen Map', desc: 'Asset & Event Visualization', icon: Zap, path: '/map' },
    { id: 'learning', label: 'Learning Center', desc: 'Documentation & Guides', icon: BookOpen, path: '/learning' },
    { id: 'reports', label: 'System Reports', desc: 'Logs & Formal Analytics', icon: FileText, path: '/reports' },
    { id: 'profile', label: 'Profile Settings', desc: 'Inspector Identity & Config', icon: User, path: '/profile' },
    { id: 'about', label: 'About System', desc: 'Software Version & Compliance', icon: Info, path: '/about' },
  ];

  if (!isMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setMenuOpen(false)}
      />

      {/* Side Drawer */}
      <div className={`relative w-[80%] max-w-sm bg-white/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col transform transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-8 flex items-center justify-between border-b border-gray-100">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                 <LayoutDashboard size={20} className="text-black" />
              </div>
              <div>
                 <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Food Quality & Management AI</h2>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Universal Control</p>
              </div>
           </div>
           <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
              <X size={18} />
           </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
           <div className="grid gap-2">
              {menuItems.map((item) => {
                 const isActive = location.pathname === item.path;
                 return (
                    <button
                       key={item.id}
                       onClick={() => {
                          navigate(item.path);
                          setMenuOpen(false);
                       }}
                       className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-amber-50 border border-amber-100 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-amber-400 text-black' : 'bg-white shadow-sm text-gray-400 group-hover:text-gray-900'}`}>
                          <item.icon size={22} />
                       </div>
                       <div className="text-left">
                          <p className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                             {item.label}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium leading-none mt-1">
                             {item.desc}
                          </p>
                       </div>
                    </button>
                 );
              })}
           </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 flex flex-col gap-4">
           <button 
             onClick={() => {
                logout();
                setMenuOpen(false);
                navigate('/login');
             }} 
             className="flex items-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-red-50 transition-colors"
           >
              <LogOut size={16} /> Sign Out System
           </button>
           <p className="text-[8px] text-gray-300 font-bold text-center uppercase tracking-widest">
              v1.4.0 • Build 2024.18.04
           </p>
        </div>
      </div>
    </div>
  );
}
