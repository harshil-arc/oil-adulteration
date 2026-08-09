import { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, Play, Pause, SkipForward, CheckCircle2, X, Clock, Flame, 
  Sparkles, ShieldCheck, RefreshCw, Zap, Heart, Award, Droplet, Volume2
} from 'lucide-react';

export default function WorkoutPlayerModal({ isOpen, onClose, workoutPlan, onWorkoutFinished }) {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Timers
  const [exerciseTimerSec, setExerciseTimerSec] = useState(45);
  const [restTimerSec, setRestTimerSec] = useState(60);
  const [totalElapsedTimeSec, setTotalElapsedTimeSec] = useState(0);

  const timerRef = useRef(null);

  // Declare ALL Hooks before early return
  useEffect(() => {
    if (!isOpen || !workoutPlan || !isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const exercises = workoutPlan.exercises || ['Push-Ups', 'Bodyweight Squats', 'Plank Hold', 'Cool Down Stretch'];
    const totalExercises = exercises.length;

    timerRef.current = setInterval(() => {
      setTotalElapsedTimeSec(prev => prev + 1);

      if (isResting) {
        setRestTimerSec(prev => {
          if (prev <= 1) {
            setIsResting(false);
            setExerciseTimerSec(45);
            return 60;
          }
          return prev - 1;
        });
      } else {
        setExerciseTimerSec(prev => {
          if (prev <= 1) {
            if (currentSet < 3) {
              setCurrentSet(s => s + 1);
              setIsResting(true);
              setRestTimerSec(60);
            } else {
              if (currentExIdx < totalExercises - 1) {
                setCurrentExIdx(i => i + 1);
                setCurrentSet(1);
                setIsResting(true);
                setRestTimerSec(60);
              } else {
                setIsRunning(false);
              }
            }
            return 45;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, workoutPlan, isRunning, isResting, currentSet, currentExIdx]);

  if (!isOpen || !workoutPlan) return null;

  const exercises = workoutPlan.exercises || ['Push-Ups', 'Bodyweight Squats', 'Plank Hold', 'Cool Down Stretch'];
  const totalExercises = exercises.length;
  const currentExName = exercises[currentExIdx] || 'Bodyweight Exercise';
  const nextExName = exercises[currentExIdx + 1] || 'Session Completion';
  const progressPercent = Math.round(((currentExIdx + 1) / totalExercises) * 100);

  const handleSkip = () => {
    if (currentExIdx < totalExercises - 1) {
      setCurrentExIdx(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setExerciseTimerSec(45);
    } else {
      setIsRunning(false);
    }
  };

  const handleFinish = () => {
    setIsRunning(false);
    if (onWorkoutFinished) {
      onWorkoutFinished({
        title: workoutPlan.title,
        durationMin: Math.max(1, Math.round(totalElapsedTimeSec / 60)),
        estCalories: workoutPlan.estCalories || 210,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const formatSecs = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[88vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-[#d4af37]" size={20} />
            <div>
              <h3 className="text-sm font-black theme-text">{workoutPlan.title}</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">{workoutPlan.focus} • {workoutPlan.durationMin} Mins</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:theme-text">
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-2 shrink-0">
          <div className="bg-gradient-to-r from-emerald-500 via-[#d4af37] to-amber-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-center overflow-y-auto custom-scrollbar flex-1 pb-10">


          {/* Hero Exercise SVG Animation Box */}
          <div className="w-24 h-24 rounded-full bg-[#d4af37]/10 border-2 border-[#d4af37]/40 flex items-center justify-center mx-auto shadow-glow-gold">
            <Dumbbell size={42} className="text-[#d4af37] animate-pulse" />
          </div>

          {/* Rest vs Active Banner */}
          {isResting ? (
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 block">Smart Rest Period</span>
              <h2 className="text-5xl font-black text-amber-400 font-mono">{formatSecs(restTimerSec)}</h2>
              
              <div className="flex items-center justify-center gap-2 text-xs text-blue-400 font-bold pt-1">
                <Droplet size={14} /> Hydration Reminder: Drink 150ml water now
              </div>
              <p className="text-[11px] text-gray-400">Next Exercise: <span className="font-bold text-white">{nextExName}</span></p>
            </div>
          ) : (
            <div className="bg-[var(--bg-elevated)] p-6 rounded-3xl border border-[var(--border-color)] space-y-3 relative overflow-hidden">
              <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] block">Current Exercise {currentExIdx + 1} of {totalExercises}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{currentExName}</h2>
              
              <div className="flex items-center justify-center gap-3 text-xs font-bold pt-1">
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/30">
                  Set {currentSet} of 3
                </span>
                <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-xl border border-purple-500/30">
                  Target: 12-15 Reps
                </span>
              </div>

              {/* Main Timer Display */}
              <div className="pt-2">
                <span className="text-5xl font-black font-mono text-white">{formatSecs(exerciseTimerSec)}</span>
              </div>
            </div>
          )}

          {/* Overall Workout Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 block font-bold uppercase">Elapsed Time</span>
              <span className="font-mono font-black text-white text-base">{formatSecs(totalElapsedTimeSec)}</span>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 block font-bold uppercase">Est. Calories</span>
              <span className="font-mono font-black text-amber-400 text-base">{Math.round((totalElapsedTimeSec / 60) * 7.5)} kcal</span>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 block font-bold uppercase">Completed</span>
              <span className="font-mono font-black text-emerald-400 text-base">{progressPercent}%</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {!isRunning ? (
              <button
                onClick={() => setIsRunning(true)}
                className="w-14 h-14 rounded-full bg-[#d4af37] text-black flex items-center justify-center shadow-glow-gold hover:scale-110 transition-transform"
              >
                <Play size={24} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-glow-amber hover:scale-110 transition-transform"
              >
                <Pause size={24} />
              </button>
            )}

            <button
              onClick={handleSkip}
              className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] text-gray-300 hover:text-white border border-[var(--border-color)] flex items-center gap-1 text-xs font-bold"
            >
              <SkipForward size={16} /> Skip
            </button>

            <button
              onClick={handleFinish}
              className="px-5 py-3.5 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow-glow-green hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} /> Finish Workout
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
