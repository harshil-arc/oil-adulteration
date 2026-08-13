import React from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, Droplet, Flame, 
  RotateCw, Sparkles, Scale, Info, ArrowRight, ShieldCheck, HeartPulse
} from 'lucide-react';

export const RecommendationResults = ({
  recommendation,
  aiResult,
  profile,
  onModifyProfile,
  onCompareOils
}) => {
  const { recommendedOils, avoidOils, dailyOilTargetMl, dailyOilTargetTsp, monthlyHouseholdLiters, rotationSuggestion } = recommendation;

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Quantity Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personalized Lipid & Oil Plan</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
              Recommended Edible Oil Consumption Profile
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Calculated for <span className="font-semibold text-slate-800">{profile.selectedConditions.length} Health Conditions</span> & <span className="font-semibold text-slate-800">{profile.householdMembers} Household Members</span>
            </p>
          </div>

          <button
            onClick={onModifyProfile}
            className="self-start md:self-center px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* Quantity Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Droplet className="w-5 h-5 fill-amber-100" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                Daily Per Person Target
              </span>
              <div className="text-lg font-bold text-amber-950 font-serif">
                {dailyOilTargetTsp} teaspoons <span className="text-xs font-sans font-normal text-amber-800">({dailyOilTargetMl} ml)</span>
              </div>
              <p className="text-[10px] text-amber-700/90 mt-0.5">
                Maximum total fat limit per day for cooking
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Monthly Household Quota
              </span>
              <div className="text-lg font-bold text-emerald-950 font-serif">
                {monthlyHouseholdLiters} Liters / Month
              </div>
              <p className="text-[10px] text-emerald-700/90 mt-0.5">
                For {profile.householdMembers} person(s) in household
              </p>
            </div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block">
                Rotation Frequency
              </span>
              <div className="text-base font-bold text-purple-950 font-serif">
                Every 6 to 8 Weeks
              </div>
              <p className="text-[10px] text-purple-700/90 mt-0.5">
                Prevents single fatty acid saturation
              </p>
            </div>
          </div>

        </div>
      </div>



      {/* Recommended Oils Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              Oils You SHOULD Consume
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by nutritional compatibility with your health profile
            </p>
          </div>
          
          <button
            onClick={() => onCompareOils(recommendedOils.map(r => r.oil.id).slice(0, 3))}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare Recommended</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedOils.map(({ oil, reasons, recommendedQuantity, bestMethods }) => (
            <div
              key={oil.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-emerald-300 transition-all space-y-3 relative overflow-hidden"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-slate-900 font-serif">
                      {oil.name}
                    </h4>
                    {oil.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                        {oil.badge}
                      </span>
                    )}
                  </div>
                  {oil.hindiName && (
                    <span className="text-xs text-slate-500 font-medium">({oil.hindiName})</span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block">
                    Smoke Point: {oil.smokePointC}°C
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {oil.processingType}
                  </span>
                </div>
              </div>

              {/* Recommended Quantity */}
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Droplet className="w-4 h-4 text-emerald-600 fill-emerald-200" />
                  Recommended Limit:
                </span>
                <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {recommendedQuantity}
                </span>
              </div>

              {/* Reasons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Why this oil fits your profile:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fatty Acid Composition Bar */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                  <span className="text-emerald-700">MUFA: {oil.fattyAcidProfile.mufaPercent}%</span>
                  <span className="text-blue-700">PUFA: {oil.fattyAcidProfile.pufaPercent}%</span>
                  <span className="text-rose-700">SFA: {oil.fattyAcidProfile.sfaPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${oil.fattyAcidProfile.mufaPercent}%` }} className="bg-emerald-500 h-full" title="MUFA" />
                  <div style={{ width: `${oil.fattyAcidProfile.pufaPercent}%` }} className="bg-blue-500 h-full" title="PUFA" />
                  <div style={{ width: `${oil.fattyAcidProfile.sfaPercent}%` }} className="bg-rose-500 h-full" title="SFA" />
                </div>
              </div>

              {/* Cooking Methods Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {bestMethods.map((m, idx) => (
                  <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                    {m}
                  </span>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Oils to Avoid Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-rose-600" />
            Oils You SHOULD NOT Consume (or Strictly Limit)
          </h3>
          <p className="text-xs text-slate-500">
            These oils may aggravate your selected health conditions or cause inflammatory arterial stress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {avoidOils.map(({ oil, reasons, alternativeSwap }) => (
            <div
              key={oil.id}
              className="bg-white rounded-2xl border border-rose-200/80 shadow-xs p-5 hover:border-rose-400 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-serif">
                    {oil.name}
                  </h4>
                  {oil.hindiName && (
                    <span className="text-xs text-slate-500 font-medium">({oil.hindiName})</span>
                  )}
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                  Avoid / Strict Limit
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                  Scientific Health Risk:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong className="font-bold text-amber-950">Recommended Swap:</strong> {alternativeSwap}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oil Rotation Strategy Card */}
      <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-6 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-amber-500 text-white">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold font-serif text-amber-950">
              Recommended Oil Rotation Strategy
            </h4>
            <p className="text-xs text-amber-800">
              Nutritional consensus recommends rotating edible oils rather than using a single oil perpetually
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed pt-1">
          {rotationSuggestion.strategy}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Primary Cooking Oil (Months 1 & 2)</span>
            <span className="font-bold text-slate-900 text-sm font-serif">{rotationSuggestion.primary.name}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Secondary Rotation Oil (Months 3 & 4)</span>
            <span className="font-bold text-slate-900 text-sm font-serif">{rotationSuggestion.secondary.name}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
