import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Sparkles, Apple } from 'lucide-react';
import FitnessDashboard from '../components/fitness/FitnessDashboard';

export default function FitnessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-white">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] text-gray-300 hover:text-white border border-[var(--border-color)] transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Dumbbell size={18} />
              </div>
              <div>
                <h1 className="text-base font-black text-white flex items-center gap-1.5">
                  AI Fitness Coach <Sparkles size={14} className="text-[#d4af37]" />
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Dynamic Adaptive Workout System</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/nutrition')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold hover:bg-blue-500/30 transition-all"
            >
              <Apple size={14} />
              <span>AI Meal Planner ➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Fitness Engine View */}
      <FitnessDashboard />
    </div>
  );
}
