import { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, CheckCircle2, RefreshCw, Trophy, Flame, Clock } from 'lucide-react';
import { getExerciseSteps, capitalize } from '../../services/fitness/exerciseService';
import { getReplacementExercise } from '../../services/fitness/recommendationEngine';
import { recordCompletedWorkout } from '../../services/fitness/fitnessStorage';

export default function WorkoutSessionView({ isOpen, onClose, workout, allExercises, preferences, onWorkoutComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exerciseList, setExerciseList] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isOpen && workout && workout.exercises) {
      setExerciseList([...workout.exercises]);
      setCurrentIdx(0);
      setIsFinished(false);
      setElapsedSeconds(0);
    }
  }, [isOpen, workout]);

  // Workout Duration Timer
  useEffect(() => {
    let interval = null;
    if (isOpen && !isFinished) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isFinished]);

  if (!isOpen || !workout || exerciseList.length === 0) return null;

  const currentEx = exerciseList[currentIdx] || exerciseList[0];
  const progressPct = Math.round(((currentIdx + 1) / exerciseList.length) * 100);
  const steps = getExerciseSteps(currentEx, preferences?.language || 'en');

  const handleNext = () => {
    if (currentIdx < exerciseList.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      handleCompleteWorkout();
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleReplaceCurrent = () => {
    const existingIds = exerciseList.map(e => e.id);
    const replacement = getReplacementExercise(currentEx, allExercises, existingIds, preferences);
    if (replacement) {
      const updated = [...exerciseList];
      updated[currentIdx] = replacement;
      setExerciseList(updated);
    } else {
      alert('No compatible replacement exercise found in dataset.');
    }
  };

  const handleCompleteWorkout = () => {
    setIsFinished(true);
    const completedRecord = {
      workoutTitle: workout.title || 'Full Body Session',
      exerciseIds: exerciseList.map(e => e.id),
      exerciseNames: exerciseList.map(e => e.name),
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      targetMuscles: Array.from(new Set(exerciseList.map(e => e.target)))
    };

    recordCompletedWorkout(completedRecord);
    if (onWorkoutComplete) onWorkoutComplete(completedRecord);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1117] text-white flex flex-col justify-between overflow-hidden animate-fade-in font-sans">
      
      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 bg-[#161b22]/90 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-20">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-widest bg-[#0052ff]/10 px-2.5 py-0.5 rounded-full border border-[#0052ff]/30">
            Exercise {currentIdx + 1} of {exerciseList.length}
          </span>
          <h2 className="text-base font-black text-white">{workout.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-gray-800 text-xs font-mono">
            <Clock size={14} className="text-[#0052ff]" />
            <span className="font-bold">{formatTime(elapsedSeconds)}</span>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-gray-800 relative z-20">
        <div className="h-full bg-gradient-to-r from-[#0052ff] to-blue-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* ── FINISHED SUMMARY VIEW ─────────────────────────────────────────── */}
      {isFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in max-w-md mx-auto my-auto">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-5xl shadow-2xl">
            🏆
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">Workout Complete! 🎉</h1>
            <p className="text-xs text-gray-400">Great job completing your activity session today!</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full text-xs">
            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center space-y-1">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Exercises Completed</span>
              <span className="text-2xl font-black text-white font-mono">{exerciseList.length}</span>
            </div>

            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center space-y-1">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Time Active</span>
              <span className="text-2xl font-black text-[#0052ff] font-mono">{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:bg-emerald-600 transition-all"
          >
            DONE & BACK TO DASHBOARD
          </button>
        </div>
      ) : (
        /* ── ACTIVE EXERCISE PLAYER VIEW ─────────────────────────────────── */
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full">
          
          {/* Header Exercise Name */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-wider block">
                {capitalize(currentEx.body_part)} • {capitalize(currentEx.equipment)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{capitalize(currentEx.name)}</h1>
              <p className="text-xs text-gray-400 mt-0.5">Target: <b className="text-amber-400">{capitalize(currentEx.target)}</b></p>
            </div>

            <button
              onClick={handleReplaceCurrent}
              className="py-1.5 px-3 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 text-xs font-bold hover:text-white flex items-center gap-1"
            >
              <RefreshCw size={13} /> Replace
            </button>
          </div>

          {/* Large GIF Visual Display */}
          <div className="w-full flex-1 min-h-[260px] sm:min-h-[320px] rounded-3xl bg-black border border-gray-800 flex items-center justify-center relative shadow-2xl overflow-hidden p-2">
            {currentEx.gifUrl ? (
              <img
                src={currentEx.gifUrl}
                alt={currentEx.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = currentEx.imageUrl || 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-2gPfomN.jpg';
                }}
              />
            ) : (
              <img
                src={currentEx.imageUrl || 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-2gPfomN.jpg'}
                alt={currentEx.name}
                className="w-full h-full object-contain"
              />
            )}

            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-gray-400 border border-gray-800">
              {currentEx.attribution || '© Gym visual'}
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
            <span className="font-extrabold text-white uppercase text-[10px] tracking-wider block">Instructions</span>
            <div className="space-y-1.5 text-gray-300">
              {steps.slice(0, 3).map((st, i) => (
                <p key={i} className="leading-relaxed text-[11px]">• {st}</p>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── FOOTER CONTROLS ──────────────────────────────────────────────── */}
      {!isFinished && (
        <div className="p-4 sm:p-6 bg-[#161b22] border-t border-gray-800 flex justify-between items-center z-20 max-w-3xl mx-auto w-full">
          <button
            onClick={handlePrevious}
            disabled={currentIdx === 0}
            className="p-3.5 rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 disabled:opacity-30 hover:text-white transition-all flex items-center gap-2 font-bold text-xs"
          >
            <SkipBack size={18} /> Previous
          </button>

          <button
            onClick={handleNext}
            className="py-3.5 px-8 rounded-2xl bg-[#0052ff] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all"
          >
            <span>{currentIdx < exerciseList.length - 1 ? 'Complete Exercise' : 'Finish Workout 🎉'}</span>
            <SkipForward size={18} />
          </button>
        </div>
      )}

    </div>
  );
}
