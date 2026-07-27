import { useState } from 'react';
import { Award, Sparkles, CheckCircle2, Flame, Star, ThumbsUp, Activity } from 'lucide-react';
import { saveWorkoutLog, calculateUserGamification, getMealPlannerSyncRecommendation } from '../../services/aiFitnessEngine';

export default function PostWorkoutFeedbackModal({ isOpen, onClose, workoutSummary, onCompletedAll }) {
  const [difficulty, setDifficulty] = useState('Moderate');
  const [soreness, setSoreness] = useState(3);
  const [energy, setEnergy] = useState(4);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !workoutSummary) return null;

  const handleSubmit = () => {
    const logEntry = {
      ...workoutSummary,
      difficulty,
      soreness,
      energy,
      xpEarned: 150,
      timestamp: new Date().toISOString()
    };
    saveWorkoutLog(logEntry);
    setSubmitted(true);
  };

  const mealSync = getMealPlannerSyncRecommendation(workoutSummary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Celebration Header */}
        <div className="p-6 bg-gradient-to-r from-[#d4af37]/20 via-[var(--bg-elevated)] to-[#d4af37]/10 border-b border-[var(--border-color)] text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center mx-auto shadow-glow-gold text-3xl animate-bounce">
            🏆
          </div>
          <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest block">Workout Completed!</span>
          <h2 className="text-2xl font-black text-white">{workoutSummary.workoutPlan?.title || 'Session Finished'}</h2>
          <p className="text-xs text-gray-400">Torched {workoutSummary.estCalories} kcal in {workoutSummary.durationMin} minutes</p>
        </div>

        {submitted ? (
          /* SUBMITTED SUCCESS & REWARDS DISPLAY */
          <div className="p-6 space-y-5 text-center text-xs animate-fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <span className="text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider block">XP & Level Reward Unlocked!</span>
              <p className="text-2xl font-black text-white">+150 XP Earned</p>
              <p className="text-gray-300">Your AI Fitness Coach has recorded your feedback and dynamically adjusted next week's intensity.</p>
            </div>

            {/* Post-Workout Meal Recommendation Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[#d4af37]/30 text-left space-y-2">
              <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block">🥗 Synchronized Meal Recommendation</span>
              <p className="text-white font-bold">{mealSync.tip}</p>
              <div className="flex justify-between items-center pt-1 border-t border-[var(--border-color)] text-[11px]">
                <span className="text-gray-400">Target Protein: <b className="text-emerald-400">{mealSync.targetProteinGrams}g</b></span>
                <span className="text-gray-400">Hydration: <b className="text-blue-400">{mealSync.hydrationMl} ml</b></span>
              </div>
            </div>

            <button
              onClick={() => {
                onCompletedAll();
                onClose();
              }}
              className="btn-primary w-full py-3.5 text-xs font-black shadow-glow-gold"
            >
              Return to AI Fitness Dashboard →
            </button>
          </div>
        ) : (
          /* SURVEY FORM */
          <div className="p-6 space-y-5 text-xs">
            <div>
              <h4 className="font-black text-white text-sm">How was today's session difficulty?</h4>
              <p className="text-gray-400 text-[10px]">Helps the AI progressive overload engine fine-tune your reps & rest times.</p>
            </div>

            {/* Difficulty Selector */}
            <div className="grid grid-cols-4 gap-2">
              {['Easy', 'Moderate', 'Hard', 'Brutal'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl border text-center font-bold text-[11px] transition-all ${
                    difficulty === d
                      ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-glow-gold'
                      : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Soreness Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400 font-bold">Muscle Soreness Level</span>
                <span className="text-[#d4af37] font-black">{soreness} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={soreness}
                onChange={e => setSoreness(Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>

            {/* Energy Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400 font-bold">Post-Workout Energy Level</span>
                <span className="text-emerald-400 font-black">{energy} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={energy}
                onChange={e => setEnergy(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="btn-primary w-full py-3.5 text-xs font-black shadow-glow-gold flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Submit Feedback & Collect XP
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
