import { Home, ScanLine, Map as MapIcon, Clock, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/home', label: 'HOME', Icon: Home },
  { path: '/scan', label: 'SCAN', Icon: ScanLine },
  { path: '/map', label: 'MAP', Icon: MapIcon },
  { path: '/history', label: 'HISTORY', Icon: Clock },
  { path: '/profile', label: 'PROFILE', Icon: User }
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto relative text-white">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24 animate-fade-in relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 glass border-t border-[rgba(212,175,55,0.1)] px-4 py-3 pb-safe">
        <div className="flex items-center justify-between px-2">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1.5 group relative"
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-[#d4af37] transform -translate-y-1' 
                    : 'text-gray-500 hover:text-[#d4af37]/60'
                }`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                  )}
                </div>
                <span className={`text-[9px] font-bold tracking-widest transition-colors ${isActive ? 'text-[#d4af37]' : 'text-gray-500'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
