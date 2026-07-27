import { useState } from 'react';
import { X, Dumbbell, ShieldAlert, CheckCircle2, Flame, RefreshCw, Zap, Activity, Info, Heart, ArrowRight } from 'lucide-react';

export default function ExerciseDetailModal({ isOpen, onClose, exercise }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'technique', 'alternatives'

  if (!isOpen || !exercise) return null;

  const alt = exercise.alternatives || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Dumbbell size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-[#d4af37] tracking-wider block">AI Exercise Inspector & Anatomy Guide</span>
              <h3 className="text-base font-black text-white">{exercise.name}</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Hero HD Visual Canvas */}
        <div className="w-full h-52 bg-gradient-to-br from-gray-900 via-black to-[#d4af37]/15 border-b border-[var(--border-color)] flex flex-col items-center justify-center relative p-4">
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-gray-300 border border-white/10 flex items-center gap-1">
              <Flame size={12} className="text-amber-400" /> ~{exercise.caloriesPerMin * 10 || 80} kcal / 10m
            </span>
            <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-full text-[10px] font-bold">
              {exercise.difficulty} Level
            </span>
          </div>

          {/* Animated Graphic Display */}
          <div className="w-24 h-24 rounded-3xl bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center text-4xl shadow-glow-gold animate-bounce">
            🏋️‍♂️
          </div>

          <div className="flex gap-4 text-[10px] text-gray-300 font-mono mt-3">
            <span>Tempo: <b className="text-white">{exercise.tempo || '2-1-1-0'}</b></span>
            <span>TUT: <b className="text-[#d4af37]">{exercise.tutSec || 45}s</b></span>
            <span>Discipline: <b className="text-emerald-400">{exercise.discipline || 'General'}</b></span>
          </div>
        </div>

        {/* Internal Tabs */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs font-black">
          {['overview', 'technique', 'alternatives'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* TAB 1: OVERVIEW & ANATOMY */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <span className="font-extrabold text-white block uppercase tracking-wider text-[10px]">Target Anatomy Breakdown</span>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-xl font-bold text-[10px]">
                    Primary: {exercise.primaryMuscle}
                  </span>
                  {exercise.secondaryMuscles?.map(m => (
                    <span key={m} className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-xl text-[10px]">
                      Secondary: {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Equipment Needed</span>
                  <p className="font-black text-white text-xs">{exercise.equipment}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Category</span>
                  <p className="font-black text-[#d4af37] text-xs">{exercise.category}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECHNIQUE & FORM */}
          {activeTab === 'technique' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <h4 className="font-black text-white uppercase tracking-wider text-xs">Step-by-Step Execution Guide</h4>
                <div className="space-y-2">
                  {exercise.instructions?.map((step, i) => (
                    <div key={i} className="flex gap-3 bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                      <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span className="text-gray-300 leading-relaxed text-[11px]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/30 space-y-1.5">
                  <h5 className="font-bold text-amber-400 uppercase text-[10px]">Common Mistakes to Avoid</h5>
                  <ul className="space-y-1 text-gray-300 text-[11px]">
                    {exercise.commonMistakes?.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/30 space-y-1.5">
                  <h5 className="font-bold text-purple-400 uppercase text-[10px]">Breathing & Safety Guide</h5>
                  <p className="text-gray-300 text-[11px]"><b>Breathing:</b> {exercise.breathingGuide}</p>
                  <p className="text-gray-400 text-[10px] pt-1"><b>Safety:</b> {exercise.safetyTips}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SMART ALTERNATIVES */}
          {activeTab === 'alternatives' && (
            <div className="space-y-3 animate-fade-in">
              <span className="text-gray-400 font-bold block">Smart AI Exercise Replacements</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[9px] font-bold text-amber-400 uppercase">🏠 Home Alternative</span>
                  <p className="font-black text-white text-xs">{alt.home || 'Bodyweight Push-Ups'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[9px] font-bold text-blue-400 uppercase">🏋️‍♂️ Gym Alternative</span>
                  <p className="font-black text-white text-xs">{alt.gym || 'Barbell Bench Press'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase">🌱 Beginner Version</span>
                  <p className="font-black text-white text-xs">{alt.beginner || 'Knee Push-Ups'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase">⚡ Advanced Version</span>
                  <p className="font-black text-white text-xs">{alt.advanced || 'Weighted Dips'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-end">
          <button onClick={onClose} className="btn-primary py-2.5 px-6 font-black text-xs shadow-glow-gold">
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
