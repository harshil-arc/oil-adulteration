/**
 * GdacsAiSummaryCard.jsx
 * Dynamic AI Summary Card for GDACS Live Disaster Feed
 */

import React from 'react';
import { Sparkles, AlertOctagon, Compass, ShieldCheck } from 'lucide-react';

export default function GdacsAiSummaryCard({ aiSummary }) {
  if (!aiSummary) return null;

  const { breakdown = [], highestRiskRegion, recommendedAction } = aiSummary;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2c1d4d] via-[#161828] to-[#1e1335] border border-purple-500/30 p-5 text-white shadow-xl backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-sm">
            <Sparkles size={18} className="animate-spin-slow" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-200">
            AI AUTOMATED SITUATION SUMMARY
          </span>
        </div>
        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 shadow-sm">
          LIVE ANALYSIS
        </span>
      </div>

      <div className="space-y-2.5 text-xs md:text-sm leading-relaxed pt-1">
        {/* Current Situation Line */}
        <div className="flex items-start gap-2 text-gray-200">
          <AlertOctagon size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-300">Current Situation: </span>
            <span className="font-extrabold text-white">
              {breakdown.length > 0 ? breakdown.join(' • ') : 'Monitoring active alerts'}
            </span>
          </div>
        </div>

        {/* Highest Risk Region */}
        <div className="flex items-center gap-2 text-gray-200">
          <Compass size={16} className="text-red-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-300">Highest Risk Region: </span>
            <span className="font-black text-white bg-red-600 px-2.5 py-0.5 rounded-lg text-xs shadow-md">
              {highestRiskRegion}
            </span>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="flex items-start gap-2 text-gray-200">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-300">Recommended Action: </span>
            <span className="text-emerald-300 font-semibold leading-relaxed">
              {recommendedAction}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
