/**
 * GdacsHeaderCard.jsx
 * Top Header Card for Disaster & Emergency Live Global Disaster Monitoring
 */

import React from 'react';
import { ShieldAlert, RefreshCw, Radio } from 'lucide-react';

export default function GdacsHeaderCard({ lastUpdated, loading, onRefresh }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1c26] via-[#12141d] to-[#1e1424] border border-red-500/30 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 text-white shrink-0">
            <ShieldAlert size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm">
                <Radio size={12} className="animate-ping text-red-500" />
                Live Feed Active
              </span>
              {lastUpdated && (
                <span className="text-[10px] text-gray-400 font-medium">
                  Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-black tracking-tight !text-white forced-white mt-1">
              Disaster, Emergency & Food Relief
            </h1>
            <p className="text-xs md:text-sm !text-gray-200 font-medium mt-1 leading-relaxed max-w-xl">
              Live Disaster Monitoring, Emergency Response & NGO Surplus Food Donation Network
            </p>
          </div>
        </div>

        {/* Refresh Action Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-end md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-xs font-bold !text-white forced-white transition-all shadow-md backdrop-blur-md disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : 'text-gray-300'} />
          <span className="!text-white forced-white">{loading ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>
    </div>
  );
}
