import { useState, useEffect } from 'react';
import { X, SkipForward, SkipBack, RefreshCw, Clock, Play, Pause } from 'lucide-react';
import { getExerciseSteps, capitalize } from '../../services/fitness/exerciseService';
import { getReplacementExercise } from '../../services/fitness/recommendationEngine';
import { recordCompletedWorkout } from '../../services/fitness/fitnessStorage';

export default function WorkoutSessionView({ isOpen, onClose, workout, allExercises, preferences, onWorkoutComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exerciseList, setExerciseList] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isOpen && workout && workout.exercises) {
      setExerciseList([...workout.exercises]);
      setCurrentIdx(0);
      setIsFinished(false);
      setElapsedSeconds(0);
      setIsPaused(false);
    }
  }, [isOpen, workout]);

  // Workout Duration Timer
  useEffect(() => {
    let interval = null;
    if (isOpen && !isFinished && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isFinished, isPaused]);

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
    <div className="fixed inset-0 z-[150] bg-[#0d1117] text-[var(--text-primary)] flex flex-col overflow-hidden animate-fade-in font-sans">

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3.5 bg-[#161b22]/95 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-20">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-widest bg-[#0052ff]/10 px-2.5 py-0.5 rounded-full border border-[#0052ff]/30">
            Exercise {currentIdx + 1} of {exerciseList.length}
          </span>
          <h2 className="text-base font-black text-[var(--text-primary)]">{workout.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isPaused 
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 animate-pulse' 
              : 'bg-black/40 border-gray-800 text-[var(--text-primary)]'
          }`}>
            <Clock size={14} className={isPaused ? 'text-amber-500' : 'text-[#0052ff]'} />
            <span className="font-bold">{formatTime(elapsedSeconds)}</span>
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              className={`ml-1.5 p-1 rounded transition-colors ${
                isPaused 
                  ? 'hover:bg-amber-500/20 text-amber-400' 
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
              title={isPaused ? "Resume Workout" : "Pause Workout"}
            >
              {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
            </button>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="shrink-0 w-full h-1.5 bg-gray-800 relative z-20">
        <div className="h-full bg-gradient-to-r from-[#0052ff] to-blue-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* ── FINISHED SUMMARY VIEW ─────────────────────────────────────────── */}
      {isFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in max-w-md mx-auto my-auto overflow-y-auto">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-5xl shadow-2xl">
            🏆
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">Workout Complete! 🎉</h1>
            <p className="text-xs text-gray-400">Great job completing your activity session today!</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full text-xs">
            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center space-y-1">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Exercises Completed</span>
              <span className="text-2xl font-black text-[var(--text-primary)] font-mono">{exerciseList.length}</span>
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
            DONE &amp; BACK TO DASHBOARD
          </button>
        </div>
      ) : (
        /* ── ACTIVE EXERCISE PLAYER VIEW (SCROLLABLE CONTAINER) ───────────── */
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 max-w-3xl mx-auto w-full pb-44">

          {/* Header Exercise Name */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-wider block">
                {capitalize(currentEx.body_part)} • {capitalize(currentEx.equipment)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{capitalize(currentEx.name)}</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Target: <b className="text-amber-400">{capitalize(currentEx.target)}</b></p>
            </div>

            <button
              onClick={handleReplaceCurrent}
              className="py-1.5 px-3 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 text-xs font-bold hover:text-white flex items-center gap-1 shrink-0"
            >
              <RefreshCw size={13} /> Replace
            </button>
          </div>

          {/* Large GIF Visual Display */}
          <div className="w-full h-56 sm:h-72 rounded-3xl bg-black border border-gray-800 flex items-center justify-center relative shadow-2xl overflow-hidden p-2">
            {currentEx.gifUrl ? (
              <img
                src={currentEx.gifUrl}
                alt={currentEx.name}
                className={`w-full h-full object-contain transition-all duration-300 ${isPaused ? 'filter blur-sm opacity-40 scale-95' : ''}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = currentEx.imageUrl || 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-2gPfomN.jpg';
                }}
              />
            ) : (
              <img
                src={currentEx.imageUrl || 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-2gPfomN.jpg'}
                alt={currentEx.name}
                className={`w-full h-full object-contain transition-all duration-300 ${isPaused ? 'filter blur-sm opacity-40 scale-95' : ''}`}
              />
            )}

            {isPaused && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all z-30">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-16 h-16 rounded-full bg-[#0052ff] hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  title="Resume Session"
                >
                  <Play size={28} fill="currentColor" className="ml-1" />
                </button>
                <span className="text-white text-xs font-black uppercase tracking-widest mt-3 animate-pulse">Session Paused</span>
              </div>
            )}

            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-slate-300 border border-gray-800">
              {currentEx.attribution || '© Gym visual'}
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
            <span className="font-extrabold text-[var(--text-primary)] uppercase text-[10px] tracking-wider block">Instructions</span>
            <div className="space-y-1.5 text-[var(--text-secondary)]">
              {steps.slice(0, 3).map((st, i) => (
                <p key={i} className="leading-relaxed text-[11px]">• {st}</p>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── ALWAYS STICKY FOOTER CONTROLS — LIFTED UP FOR HIGH VISIBILITY ─────────────────────────────────── */}
      {!isFinished && (
        <div className="shrink-0 px-4 sm:px-6 pt-4 pb-8 sm:pb-10 bg-[#161b22]/98 backdrop-blur-xl border-t border-gray-800 z-[100] w-full fixed bottom-0 left-0 right-0 shadow-[0_-12px_35px_rgba(0,0,0,0.85)]">
          <div className="max-w-3xl mx-auto w-full flex justify-between items-center gap-3 mb-1 sm:mb-2">
            <button
              onClick={handlePrevious}
              disabled={currentIdx === 0}
              className="py-3 px-5 sm:px-6 rounded-2xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-100 disabled:opacity-30 hover:text-white transition-all flex items-center gap-2 font-bold text-xs sm:text-sm shrink-0 shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <SkipBack size={18} /> Previous
            </button>

            <button
              onClick={handleNext}
              className="py-3.5 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-[#0052ff] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-blue-600/30 hover:opacity-95 transition-all border border-blue-400/40 active:scale-95 cursor-pointer"
            >
              <span>{currentIdx < exerciseList.length - 1 ? 'Complete & Next →' : 'Finish Workout 🎉'}</span>
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
