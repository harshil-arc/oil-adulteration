import { X, Dumbbell, ShieldAlert, CheckCircle2, Flame, RefreshCw, Zap, Info } from 'lucide-react';

export default function ExerciseDetailDrawer({ isOpen, onClose, exercise }) {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[var(--bg-card)] border-t border-[#d4af37]/40 rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-slide-up">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Info size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-[#d4af37] tracking-wider block">Technique & Technique Guide</span>
              <h3 className="text-base font-black text-white">{exercise.name}</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Target Muscle Anatomy */}
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

          {/* Form Instructions */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase tracking-wider text-xs">Step-by-Step Execution Guide</h4>
            <div className="space-y-2">
              {exercise.instructions?.map((step, i) => (
                <div key={i} className="flex gap-3 bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37] text-black font-black flex items-center justify-center shrink-0 text-xs">
                    {i + 1}
                  </span>
                  <span className="text-gray-300 leading-relaxed text-[11px]">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes & Safety */}
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

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-end">
          <button onClick={onClose} className="btn-primary py-2.5 px-6 font-black text-xs shadow-glow-gold">
            Return to Active Session →
          </button>
        </div>

      </div>
    </div>
  );
}
