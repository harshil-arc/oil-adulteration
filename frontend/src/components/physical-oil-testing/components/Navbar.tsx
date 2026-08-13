import React from 'react';
import { 
  FlaskConical, 
  BookOpen, 
  Layers, 
  Stethoscope, 
  AlertTriangle, 
  BookmarkCheck, 
  Printer, 
  Sparkles,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiModal: () => void;
  savedLogsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiModal,
  savedLogsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'lab', label: 'Interactive Lab', icon: FlaskConical, badge: 'Guided' },
    { id: 'directory', label: 'Home Tests', icon: BookOpen },
    { id: 'profiles', label: 'Oil Guides', icon: Layers },
    { id: 'diagnostics', label: 'Symptom Checker', icon: Stethoscope },
    { id: 'hazards', label: 'Toxins & Risks', icon: AlertTriangle },
    { id: 'journal', label: 'My Journal', icon: BookmarkCheck, count: savedLogsCount },
    { id: 'cheatsheet', label: 'Cheat Sheet', icon: Printer },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => { setActiveTab('lab'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-black text-lg tracking-tight text-slate-900">Pure<span className="text-amber-600">Oil</span></span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Kitchen Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block whitespace-nowrap">Zero-Device Physical Purity Testing</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-200 rounded whitespace-nowrap">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono whitespace-nowrap ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Button: AI Chemist */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="ai-consultant-header-btn"
              onClick={onOpenAiModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
              <span>Ask AI Chemist</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
