import { useState } from 'react';
import { ArrowLeft, Settings2, Play, RefreshCw, Menu } from 'lucide-react';
import LeapExerciseDetailModal from './LeapExerciseDetailModal';

export default function LeapDayPlanView({ isOpen, onClose, dayNumber = 1, onStartWorkout }) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  if (!isOpen) return null;

  const workoutData = {
    dayTitle: `DAY ${dayNumber}`,
    durationMin: 8,
    exerciseCount: 12,
    warmUp: [
      { id: 'wu-1', name: 'Jumping Jacks', duration: '00:30', category: 'Warm Up' },
      { id: 'wu-2', name: 'Butt Kicks', duration: '00:30', category: 'Warm Up' }
    ],
    training: [
      { id: 'tr-1', name: 'Squat Reach Ups', duration: '00:30', category: 'Training' },
      { id: 'tr-2', name: 'Push-Ups', duration: '00:30', category: 'Training' },
      { id: 'tr-3', name: 'Scissors', duration: '00:30', category: 'Training' },
      { id: 'tr-4', name: 'Hip Bridge & Leg Lift Left', duration: '00:30', category: 'Training' },
      { id: 'tr-5', name: 'Hip Bridge & Leg Lift Right', duration: '00:30', category: 'Training' },
      { id: 'tr-6', name: 'Slow Mountain Climber', duration: '00:30', category: 'Training' },
      { id: 'tr-7', name: 'Spiderman Plank', duration: '00:30', category: 'Training' }
    ],
    coolDown: [
      { id: 'cd-1', name: 'Cobra Stretch', duration: '00:30', category: 'Cool Down' },
      { id: 'cd-2', name: 'Pigeon Pose Left', duration: '00:30', category: 'Cool Down' },
      { id: 'cd-3', name: 'Pigeon Pose Right', duration: '00:30', category: 'Cool Down' }
    ]
  };

  const handleInspectExercise = (ex) => {
    setSelectedExercise(ex);
    setDetailModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 font-sans flex flex-col justify-between overflow-y-auto animate-fade-in">
      
      {/* Top Navigation */}
      <div className="px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-slate-100">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-800 hover:text-black font-bold">
          <ArrowLeft size={22} />
        </button>

        <span className="font-black text-slate-900 text-lg uppercase tracking-wider">{workoutData.dayTitle}</span>

        <button className="p-2 text-slate-700 hover:text-black">
          <Settings2 size={20} />
        </button>
      </div>

      {/* Main Day Overview Body */}
      <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-md mx-auto w-full">
        
        {/* Header Stats & Start Button */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span>⏱️ {workoutData.durationMin} mins</span>
            <span>🏋️‍♂️ {workoutData.exerciseCount} Exercises</span>
          </div>

          <button
            onClick={() => {
              if (onStartWorkout) onStartWorkout();
            }}
            className="w-full py-4 rounded-full bg-[#0052ff] text-white font-black text-base shadow-xl shadow-blue-500/30 hover:bg-blue-600 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Play size={20} fill="currentColor" /> Start
          </button>
        </div>

        {/* Exercises Section Header */}
        <div className="flex justify-between items-center pt-2">
          <h3 className="font-black text-slate-900 text-base">Exercises</h3>
          <button className="text-[#0052ff] font-bold text-xs hover:underline">Edit ›</button>
        </div>

        {/* ── 1. WARM UP SECTION ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <h4 className="font-black text-slate-900 text-sm tracking-wide">Warm Up</h4>
          <div className="space-y-2.5">
            {workoutData.warmUp.map(ex => (
              <div
                key={ex.id}
                onClick={() => handleInspectExercise(ex)}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Menu size={16} className="text-slate-400" />
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                    🏃‍♂️
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-sm group-hover:text-[#0052ff] transition-colors">{ex.name}</h5>
                    <span className="font-mono text-slate-500 text-xs font-bold">{ex.duration}</span>
                  </div>
                </div>

                <RefreshCw size={16} className="text-slate-400 group-hover:text-[#0052ff]" />
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. TRAINING SECTION ────────────────────────────────────────────── */}
        <div className="space-y-3 pt-2">
          <h4 className="font-black text-slate-900 text-sm tracking-wide">Training</h4>
          <div className="space-y-2.5">
            {workoutData.training.map(ex => (
              <div
                key={ex.id}
                onClick={() => handleInspectExercise(ex)}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Menu size={16} className="text-slate-400" />
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                    🏋️‍♂️
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-sm group-hover:text-[#0052ff] transition-colors">{ex.name}</h5>
                    <span className="font-mono text-slate-500 text-xs font-bold">{ex.duration}</span>
                  </div>
                </div>

                <RefreshCw size={16} className="text-slate-400 group-hover:text-[#0052ff]" />
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. COOL DOWN SECTION ───────────────────────────────────────────── */}
        <div className="space-y-3 pt-2">
          <h4 className="font-black text-slate-900 text-sm tracking-wide">Cool Down</h4>
          <div className="space-y-2.5">
            {workoutData.coolDown.map(ex => (
              <div
                key={ex.id}
                onClick={() => handleInspectExercise(ex)}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Menu size={16} className="text-slate-400" />
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                    🧘
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-sm group-hover:text-[#0052ff] transition-colors">{ex.name}</h5>
                    <span className="font-mono text-slate-500 text-xs font-bold">{ex.duration}</span>
                  </div>
                </div>

                <RefreshCw size={16} className="text-slate-400 group-hover:text-[#0052ff]" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      <LeapExerciseDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        exercise={selectedExercise}
      />

    </div>
  );
}
