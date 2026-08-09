import { Trophy, CheckCircle2, AlertTriangle, Activity, Award, Flame, X } from 'lucide-react';

export default function MotionReportModal({ isOpen, onClose, sessionReport }) {
  if (!isOpen || !sessionReport) return null;

  const {
    workoutTitle = 'AI Motion Workout',
    durationMinutes = 15,
    validReps = 12,
    incompleteReps = 1,
    avgFormScore = 93,
    bestExercise = 'Bodyweight Squat (96%)',
    needsImprovement = 'Push-ups (86%)'
  } = sessionReport;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-white font-sans animate-fade-in">
      <div className="bg-[#161b22] border border-purple-500/40 rounded-3xl max-w-lg w-full my-auto overflow-hidden shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Celebration Banner */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500 text-purple-400 flex items-center justify-center text-4xl mx-auto shadow-2xl">
            🏆
          </div>
          <h2 className="text-2xl font-black text-white">AI Motion Session Report 🎉</h2>
          <p className="text-xs text-gray-400">{workoutTitle} • {durationMinutes} mins active motion</p>
        </div>

        {/* Form Score Gauge Header */}
        <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 p-5 rounded-3xl border border-purple-500/30 text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">Average Biomechanical Form Score</span>
          <p className="text-4xl font-black text-white font-mono">{avgFormScore}%</p>
          <p className="text-xs text-emerald-400 font-bold">Form appears good! Excellent depth & joint alignment</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-1">
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Valid Reps</span>
              <CheckCircle2 size={16} />
            </div>
            <span className="text-2xl font-black text-white font-mono">{validReps}</span>
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-1">
            <div className="flex justify-between text-amber-400 font-bold">
              <span>Incomplete Reps</span>
              <AlertTriangle size={16} />
            </div>
            <span className="text-2xl font-black text-amber-300 font-mono">{incompleteReps}</span>
          </div>
        </div>

        {/* Biomechanical Breakdown List */}
        <div className="bg-gray-900 p-5 rounded-3xl border border-gray-800 space-y-3 text-xs">
          <h4 className="font-extrabold text-white uppercase text-[10px] tracking-wider">Exercise Biomechanics Breakdown</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-800/60 p-3 rounded-2xl border border-gray-700">
              <span className="text-gray-300">Best Form Exercise</span>
              <span className="font-bold text-emerald-400">{bestExercise}</span>
            </div>

            <div className="flex justify-between items-center bg-gray-800/60 p-3 rounded-2xl border border-gray-700">
              <span className="text-gray-300">Needs Form Tuning</span>
              <span className="font-bold text-amber-400">{needsImprovement}</span>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-wider hover:bg-purple-500 transition-all shadow-lg"
        >
          RETURN TO DASHBOARD →
        </button>

      </div>
    </div>
  );
}
