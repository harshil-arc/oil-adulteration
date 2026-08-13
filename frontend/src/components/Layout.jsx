import { Home, ScanLine, Map as MapIcon, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalNavigation from './GlobalNavigation';

const navItems = [
  { path: '/home', label: 'DASHBOARD', Icon: Home },
  { path: '/scan', label: 'OIL TEST', Icon: ScanLine },
  { path: '/hotspots', label: 'HOTSPOTS', Icon: MapIcon },
  { path: '/community', label: 'COMMUNITY', Icon: Users },
  { path: '/profile', label: 'PROFILE', Icon: User }
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOilWise = location.pathname.startsWith('/oilwise');

  return (
    <div className={`min-h-screen flex flex-col w-full ${isOilWise ? 'max-w-6xl' : 'max-w-md'} mx-auto relative theme-bg theme-text transition-colors duration-300 overflow-x-hidden`}>
      <GlobalNavigation />
      {/* Page content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-24 animate-fade-in relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 bg-white shadow-2xl rounded-3xl border border-gray-100 px-1.5 py-2 dark:bg-[#161b22] dark:border-[#30363d] transition-colors">
        <div className="flex items-center justify-around gap-0.5">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = path === '/scan' 
                ? location.pathname.startsWith('/scan') 
                : location.pathname === path;
                
            const shortLabel = label === 'DASHBOARD' ? 'HOME' : 
                             label === 'OIL TEST' ? 'OIL TEST' : 
                             label === 'HOTSPOTS' ? 'HOTSPOTS' : 
                             label === 'COMMUNITY' ? 'COMMUNITY' : 'PROFILE';

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-all duration-300 min-w-0 ${
                  isActive 
                    ? 'bg-brand-500 text-black dark:text-black shadow-lg shadow-brand-500/20 scale-105' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                <span className={`text-[7px] font-black tracking-widest truncate w-full text-center ${isActive ? 'text-black font-extrabold' : 'text-gray-400 dark:text-gray-500'}`}>
                  {shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>

  );
}
