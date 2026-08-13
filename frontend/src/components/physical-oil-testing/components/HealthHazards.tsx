import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  HeartCrack, 
  Activity, 
  CheckCircle2, 
  Info,
  ArrowRight,
  Sparkles,
  Scale
} from 'lucide-react';
import { ADULTERANT_HAZARDS } from '../data/adulterantHazards';

interface HealthHazardsProps {
  onSelectTest: (testId: string) => void;
}

export const HealthHazards: React.FC<HealthHazardsProps> = ({ onSelectTest }) => {
  const [selectedHazardId, setSelectedHazardId] = useState<string>('metanil_yellow');

  const currentHazard = ADULTERANT_HAZARDS.find((h) => h.id === selectedHazardId) || ADULTERANT_HAZARDS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Toxicology & Public Health</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Dangerous Adulterants & Health Risks
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Why routine kitchen testing matters: understanding the chemical toxins, banned synthetic dyes, and carcinogenic petroleum fractions secretly blended into cooking oils.
        </p>
      </div>

      {/* Hazard Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {ADULTERANT_HAZARDS.map((hazard) => {
          const isSelected = hazard.id === selectedHazardId;
          return (
            <button
              key={hazard.id}
              onClick={() => setSelectedHazardId(hazard.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <AlertTriangle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-rose-600'}`} />
                <span className={`text-[9px] font-mono uppercase font-bold ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                  Toxin
                </span>
              </div>
              <span className="text-xs font-black line-clamp-1">{hazard.name.split('(')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Hazard Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Toxicology & Health Impacts (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Chemical Profile</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">{currentHazard.name}</h2>
              <p className="text-xs font-mono text-slate-500 font-semibold mt-1">{currentHazard.chemicalFormulaOrNature}</p>
            </div>

            {/* Found In */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Commonly Found In:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentHazard.commonlyFoundIn.map((item, idx) => (
                  <span key={idx} className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-white text-amber-900 border border-slate-200 shadow-2xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Long Term Health Impacts */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <HeartCrack className="w-4 h-4 text-rose-600" />
                Severe Long-Term Health Impacts
              </span>
              <div className="space-y-2">
                {currentHazard.healthImpacts.map((impact, idx) => (
                  <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed font-medium">{impact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms of Poisoning */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                Recognizable Symptoms of Acute/Sub-acute Exposure
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentHazard.symptomsOfToxicity.map((symptom, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span className="font-medium">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Detection & FSSAI Standards (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Detection Method */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Zero-Device Kitchen Detection</span>
            <h3 className="text-base font-black text-slate-900">How to Spot This at Home</h3>

            <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {currentHazard.quickDetectionMethod}
            </p>

            <button
              onClick={() => {
                if (currentHazard.id === 'metanil_yellow') onSelectTest('yellow_mustard_dye_test');
                else if (currentHazard.id === 'argemone_oil') onSelectTest('argemone_nitric_test');
                else if (currentHazard.id === 'liquid_paraffin') onSelectTest('freezing_test');
                else if (currentHazard.id === 'spent_frying_oil') onSelectTest('heating_test');
                else onSelectTest('palm_touch_friction_test');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Launch Test for {currentHazard.name.split('(')[0]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Legal & FSSAI Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Legal Regulatory Status</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {currentHazard.legalStatus}
            </p>
          </div>

          {/* Golden Rule Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 font-bold" />
              <span className="text-xs font-bold text-emerald-800 uppercase">Consumer Safety Shield</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">
              Never buy loose, unbranded cooking oils from open drums. Always look for AGMARK certification, FSSAI license numbers, and batch testing seals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
