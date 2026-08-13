import React, { useState } from 'react';
import { 
  Layers, 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Info, 
  Sparkles,
  ChevronRight,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { OIL_PROFILES } from '../data/oilProfilesData';
import { OIL_TESTS } from '../data/oilTestsData';
import { OilProfile } from '../types';

interface OilEncyclopediaProps {
  onSelectTest: (testId: string) => void;
}

export const OilEncyclopedia: React.FC<OilEncyclopediaProps> = ({ onSelectTest }) => {
  const [selectedOilId, setSelectedOilId] = useState<string>('mustard_oil');

  const currentProfile: OilProfile = OIL_PROFILES.find((p) => p.id === selectedOilId) || OIL_PROFILES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Edible Oil Guides</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          Authenticity & Adulteration Hallmarks
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Detailed chemical and physical profiles of staple culinary oils, explaining natural color ranges, genuine pungent/nutty aromas, smoke points, and specific industrial adulteration threats.
        </p>
      </div>

      {/* Oil Navigation Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {OIL_PROFILES.map((profile) => {
          const isSelected = profile.id === selectedOilId;
          return (
            <button
              key={profile.id}
              onClick={() => setSelectedOilId(profile.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[10px] uppercase font-mono tracking-wider font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                {profile.hindiName?.split('(')[0] || 'Oil'}
              </span>
              <span className="text-xs font-black line-clamp-1 mt-1">
                {profile.name.split('(')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Selected Oil Profile Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Physical Characteristics & Purity Hallmarks (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">{currentProfile.hindiName}</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">{currentProfile.name}</h2>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pure Smoke Point</span>
                </div>
                <span className="text-sm font-black text-slate-900">{currentProfile.smokePointPure}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold mb-1">
                  <Droplets className="w-3.5 h-3.5 text-amber-600" />
                  <span>Natural Color & Appearance</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{currentProfile.commonColor}</span>
              </div>
            </div>

            {/* Consistency */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <strong className="text-slate-900">Natural Physical State:</strong> {currentProfile.naturalConsistency}
            </div>

            {/* Pure Hallmarks Checklist */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 font-bold" />
                Hallmarks of Genuine Purity
              </span>
              <div className="space-y-2">
                {currentProfile.pureHallmarks.map((hallmark, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{hallmark}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Natural Spoilage vs Adulteration Guide */}
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1.5 text-xs">
              <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                Natural Seasonal Behavior vs. Fraudulent Adulteration
              </span>
              <p className="text-slate-800 leading-relaxed font-normal">
                {currentProfile.spoilageVsAdulteration}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Known Adulterants & Direct Home Test Shortcuts (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Adulterants Threats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Threat Matrix</span>
              <h3 className="text-base font-black text-slate-900">Common Adulterants in this Oil</h3>
            </div>

            <div className="space-y-3">
              {currentProfile.primaryAdulterants.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-900">{item.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.severity === 'Severe / Fatal'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-tight">
                    <strong className="text-slate-900">Why Fraudsters Add It:</strong> {item.whyUsed}
                  </p>
                  <p className="text-[11px] text-rose-900 leading-tight font-medium">
                    <strong className="text-rose-800">Health Damage:</strong> {item.healthHazard}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Home Tests for this Oil */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Recommended Home Verification</span>
            <h3 className="text-sm font-black text-slate-900">Run Tests for {currentProfile.name.split('(')[0]}</h3>

            <div className="space-y-2">
              {currentProfile.bestTests.map((testId) => {
                const testObj = OIL_TESTS.find((t) => t.id === testId);
                if (!testObj) return null;
                return (
                  <button
                    key={testId}
                    id={`profile-test-btn-${testId}`}
                    onClick={() => onSelectTest(testId)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-900 transition-colors">
                        {testObj.title}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{testObj.estimatedDuration}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
