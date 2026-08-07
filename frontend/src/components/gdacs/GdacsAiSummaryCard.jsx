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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 p-5 text-white shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sparkles size={16} className="animate-spin-slow" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-300">
            AI Automated Situation Summary
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Live Analysis
        </span>
      </div>

      <div className="space-y-2 text-xs md:text-sm leading-relaxed">
        {/* Current Situation Line */}
        <div className="flex items-start gap-2 text-gray-200">
          <AlertOctagon size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Current Situation: </span>
            <span className="text-gray-300">
              {breakdown.length > 0 ? breakdown.join(' • ') : 'Monitoring active alerts'}
            </span>
          </div>
        </div>

        {/* Highest Risk Region */}
        <div className="flex items-start gap-2 text-gray-200">
          <Compass size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Highest Risk Region: </span>
            <span className="font-extrabold text-red-300 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
              {highestRiskRegion}
            </span>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="flex items-start gap-2 text-gray-200">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Recommended Action: </span>
            <span className="text-emerald-200 font-medium">
              {recommendedAction}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
