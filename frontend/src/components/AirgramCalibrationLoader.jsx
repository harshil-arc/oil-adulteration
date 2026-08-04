import React from 'react';
import { Sparkles, Cpu, ShieldCheck, Activity } from 'lucide-react';

export default function AirgramCalibrationLoader({ oilName = 'Mustard Oil', progress = 0, statusText = 'Calibrating...' }) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#07090e] theme-text select-none overflow-hidden animate-fade-in">
      
      {/* ── Background Airgram Ambient Glow Orbs ───────────────────────────── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#d4af37]/30 via-[#f5c842]/20 to-cyan-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-500/20 via-[#d4af37]/20 to-indigo-500/20 rounded-full blur-[90px] animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />

      {/* ── Main Airgram Glassmorphic Container ─────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm px-6 py-8 mx-4 flex flex-col items-center text-center bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        {/* Airgram Liquid Pulsing Scanner Rings */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          
          {/* Outer Breathing Glowing Ring */}
          <div 
            className="absolute inset-0 rounded-full border border-[#d4af37]/40 animate-ping opacity-25" 
            style={{ animationDuration: '2.5s' }}
          />

          {/* Counter-rotating Gradient Laser Ring */}
          <div 
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#f5c842] border-r-cyan-400 border-b-emerald-400 animate-spin"
            style={{ animationDuration: '3s' }}
          />

          {/* Secondary Spinning Ring */}
          <div 
            className="absolute inset-5 rounded-full border border-dashed border-[#d4af37]/60 animate-spin"
            style={{ animationDuration: '6s', animationDirection: 'reverse' }}
          />

          {/* Central Airgram Glowing Fluid Orb */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f5c842] to-amber-300 p-0.5 shadow-[0_0_35px_rgba(212,175,55,0.6)] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-[#0b0e14] rounded-full flex flex-col items-center justify-center relative">
              
              {/* Internal Liquid Fill Wave Animation */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#d4af37]/80 to-[#f5c842]/40 transition-all duration-300 ease-out"
                style={{ height: `${progress}%` }}
              />
              
              {/* Percentage Counter */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                  {Math.round(progress)}<span className="text-xs font-bold text-[#d4af37]">%</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Activity size={9} className="animate-pulse" /> Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Status Header & Subtitle ───────────────────────────────────── */}
        <h2 className="text-lg font-black text-white tracking-tight mb-1 flex items-center gap-2">
          <Sparkles size={18} className="text-[#f5c842] animate-bounce" />
          Calibrating {oilName}
        </h2>
        <p className="text-xs text-gray-400 font-medium h-8 flex items-center justify-center px-2 text-center">
          {statusText}
        </p>

        {/* ── 13-Channel Equalizer Spectral Waveform Bar ──────────────────── */}
        <div className="w-full my-5 px-3 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-end justify-between gap-1 h-14">
          {[40, 65, 30, 85, 50, 95, 70, 45, 90, 60, 35, 80, 55].map((h, i) => (
            <div key={i} className="flex-1 bg-white/10 rounded-full overflow-hidden h-full flex items-end">
              <div 
                className="w-full bg-gradient-to-t from-[#d4af37] to-cyan-400 rounded-full transition-all duration-300"
                style={{ 
                  height: `${Math.min(100, Math.max(15, (progress / 100) * h + Math.sin(i + progress) * 15))}%`,
                  opacity: progress > (i * 7) ? 1 : 0.2
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Progress Bar ────────────────────────────────────────────────── */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4 relative">
          <div 
            className="h-full bg-gradient-to-r from-[#f5c842] via-[#d4af37] to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(212,175,55,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Bottom Micro Badges ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between w-full text-[10px] text-gray-400 font-mono pt-1 border-t border-white/10">
          <span className="flex items-center gap-1 text-gray-300">
            <Cpu size={12} className="text-[#d4af37]" /> AS7343 13-Ch
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck size={12} /> ExtraTrees ML
          </span>
        </div>
      </div>
    </div>
  );
}
