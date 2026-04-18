import { Home, ScanLine, Map as MapIcon, Clock, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/home', label: 'DASHBOARD', Icon: Home },
  { path: '/scan', label: 'OIL SCAN', Icon: ScanLine },
  { path: '/history', label: 'ANALYTICS', Icon: Clock },
  { path: '/ngo-dashboard', label: 'DONATIONS', Icon: MapIcon },
  { path: '/profile', label: 'PROFILE', Icon: User }
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative theme-bg theme-text transition-colors duration-300">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24 animate-fade-in relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 bg-white shadow-2xl rounded-3xl border border-gray-100 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = path === '/scan' 
                ? location.pathname.startsWith('/scan') 
                : location.pathname === path;
                
            const shortLabel = label === 'DASHBOARD' ? 'HOME' : 
                             label === 'OIL SCAN' ? 'SCAN' : 
                             label === 'ANALYTICS' ? 'HISTORY' : 
                             label === 'DONATIONS' ? 'NGO' : 'PROFILE';

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#eab308] text-black shadow-lg shadow-yellow-500/20 scale-105' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[8px] font-black tracking-widest ${isActive ? 'text-black' : 'text-gray-400'}`}>
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
