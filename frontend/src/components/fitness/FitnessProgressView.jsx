import { useMemo } from 'react';
import { Activity, Trophy, Calendar, CheckCircle2, Flame, Clock } from 'lucide-react';
import { loadWorkoutHistory } from '../../services/fitness/fitnessStorage';

export default function FitnessProgressView() {
  const history = useMemo(() => loadWorkoutHistory(), []);

  const totalWorkouts = history.length;
  const totalMinutes = history.reduce((acc, h) => acc + (h.durationMinutes || 30), 0);

  // Extract most trained muscle groups
  const muscleCounts = useMemo(() => {
    const counts = {};
    history.forEach(h => {
      (h.targetMuscles || []).forEach(m => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [history]);

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
          <div className="flex justify-between items-center text-emerald-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Completed Sessions</span>
            <CheckCircle2 size={18} />
          </div>
          <p className="text-3xl font-black text-white font-mono">{totalWorkouts} <span className="text-xs font-normal text-gray-400">Workouts</span></p>
          <p className="text-[10px] text-gray-400">Healthy consistency track</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-blue-500/30 bg-blue-500/5 space-y-1">
          <div className="flex justify-between items-center text-[#0052ff]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Time</span>
            <Clock size={18} />
          </div>
          <p className="text-3xl font-black text-white font-mono">{totalMinutes} <span className="text-xs font-normal text-gray-400">Minutes</span></p>
          <p className="text-[10px] text-gray-400">Total physical exercise time</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-1">
          <div className="flex justify-between items-center text-amber-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Activity Goal</span>
            <Trophy size={18} />
          </div>
          <p className="text-3xl font-black text-white font-mono">100% <span className="text-xs font-normal text-gray-400">Active</span></p>
          <p className="text-[10px] text-gray-400">Non-restrictive wellness focus</p>
        </div>
      </div>

      {/* Muscle Focus Distribution */}
      {muscleCounts.length > 0 && (
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Most Trained Target Areas</h3>
          <div className="space-y-3">
            {muscleCounts.map(([muscle, count]) => {
              const max = muscleCounts[0][1] || 1;
              const pct = Math.round((count / max) * 100);
              return (
                <div key={muscle} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span className="font-bold capitalize">{muscle}</span>
                    <span className="font-mono text-gray-400">{count} sessions</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0052ff] to-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Log */}
      <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Recent Activity Log</h3>

        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No completed workouts recorded yet. Start your first session from the home dashboard!
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#0052ff] font-bold block">{item.dateStr}</span>
                  <h4 className="font-extrabold text-white text-sm">{item.workoutTitle}</h4>
                  <p className="text-[11px] text-gray-400">
                    {item.exerciseNames?.length || 5} exercises • {item.durationMinutes} mins
                  </p>
                </div>

                <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-500/20">
                  Completed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
