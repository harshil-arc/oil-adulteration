import React from 'react';
import { Droplet, HeartHandshake, Compass, Scale, Flame, Calculator, Printer, Sparkles } from 'lucide-react';

export const Header = ({
  activeTab,
  setActiveTab,
  onPrintReport,
  hasRecommendations = false
}) => {
  return (
    <header className="bg-white border-b border-amber-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('recommender')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Droplet className="w-6 h-6 fill-amber-100" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-serif whitespace-nowrap">
                  OilWise
                </h1>
                <span className="px-2 py-0.5 text-[9px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Health Recommender
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-tight max-w-[240px] sm:max-w-none truncate sm:whitespace-normal">
                Science-backed Edible Oil Guidance & Daily Quantity Advisor
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center flex-nowrap space-x-1 sm:space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs sm:text-sm font-medium w-full md:w-auto">
            <button
              onClick={() => setActiveTab('recommender')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'recommender'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>Health Recommender</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Oil Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Compare Oils</span>
            </button>

            <button
              onClick={() => setActiveTab('smokepoint')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'smokepoint'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Smoke Points</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4 text-purple-600" />
              <span>Intake Calculator</span>
            </button>
          </nav>

          {/* Action Button */}
          {hasRecommendations && onPrintReport && (
            <button
              onClick={onPrintReport}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
