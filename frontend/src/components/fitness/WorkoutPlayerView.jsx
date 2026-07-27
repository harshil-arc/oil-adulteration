import { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Flame, Clock, Award, ShieldAlert, ChevronUp, RefreshCw, Eye, Sparkles, Heart, Droplet
} from 'lucide-react';
import ExerciseDetailDrawer from './ExerciseDetailDrawer';

export default function WorkoutPlayerView({ isOpen, onClose, workoutPlan, onWorkoutFinished }) {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [timerSec, setTimerSec] = useState(45);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [muscleView, setMuscleView] = useState('Front'); // 'Front' or 'Back'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveCalories, setLiveCalories] = useState(0);

  // Rotating Live Technique Coaching Tips
  const coachingTips = [
    'Keep your back straight & core tightly braced.',
    'Breathe in while lowering; exhale while pushing.',
    'Maintain steady controlled tempo without rushing.',
    'Keep your chest high and shoulders pinned down.'
  ];
  const [tipIndex, setTipIndex] = useState(0);

  const exercises = workoutPlan?.exercises || [];
  const currentEx = exercises[currentExIdx] || exercises[0] || {};
  const totalSets = currentEx.sets || 3;
  const isLastExercise = currentExIdx === exercises.length - 1;
  const isLastSet = currentSet === totalSets;

  // Web Speech API Voice Coach
  const speakCue = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  };

  // Reset when player opens
  useEffect(() => {
    if (isOpen) {
      setCurrentExIdx(0);
      setCurrentSet(1);
      setIsResting(false);
      setIsRunning(true);
      setTimerSec(45);
      setElapsedSeconds(0);
      setLiveCalories(0);
      speakCue(`Starting ${workoutPlan?.title || 'Workout Session'}. Get ready for ${exercises[0]?.name || 'first exercise'}`);
    } else {
      setIsRunning(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  // Main Timer Effect
  useEffect(() => {
    let interval = null;
    if (isOpen && isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        setLiveCalories(prev => prev + 0.15);

        // Rotate tips every 10s
        if (elapsedSeconds % 10 === 0) {
          setTipIndex(prev => (prev + 1) % coachingTips.length);
        }

        setTimerSec(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          if (prev === 4) speakCue('3, 2, 1');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isRunning, isResting, currentExIdx, currentSet, elapsedSeconds]);

  const handleTimerComplete = () => {
    if (isResting) {
      // Rest complete -> Resume exercise
      setIsResting(false);
      setTimerSec(45);
      speakCue(`Rest complete. Set ${currentSet} of ${currentEx.name}. Begin!`);
    } else {
      // Set complete -> Rest transition
      if (isLastSet) {
        if (isLastExercise) {
          // Workout finished
          setIsRunning(false);
          speakCue('Workout Session completed! Sensational performance!');
          onWorkoutFinished({
            workoutPlan,
            completedSets: exercises.reduce((acc, e) => acc + e.sets, 0),
            durationMin: Math.max(1, Math.round(elapsedSeconds / 60)),
            estCalories: Math.round(liveCalories + 50),
            timestamp: new Date().toLocaleDateString()
          });
        } else {
          // Next exercise
          setCurrentExIdx(prev => prev + 1);
          setCurrentSet(1);
          setIsResting(true);
          setTimerSec(currentEx.restSec || 30);
          speakCue(`Great job! Rest for ${currentEx.restSec || 30} seconds. Next up: ${exercises[currentExIdx + 1]?.name}`);
        }
      } else {
        // Next set
        setCurrentSet(prev => prev + 1);
        setIsResting(true);
        setTimerSec(currentEx.restSec || 30);
        speakCue(`Set completed. Rest for ${currentEx.restSec || 30} seconds.`);
      }
    }
  };

  const handlePrevious = () => {
    if (currentExIdx > 0) {
      setCurrentExIdx(prev => prev - 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimerSec(45);
    }
  };

  const handleSkip = () => {
    handleTimerComplete();
  };

  const handleAddRest = () => {
    setTimerSec(prev => prev + 15);
  };

  if (!isOpen || !workoutPlan || exercises.length === 0) return null;

  const totalWorkoutSets = exercises.reduce((acc, e) => acc + e.sets, 0);
  const completedWorkoutSets = exercises.slice(0, currentExIdx).reduce((acc, e) => acc + e.sets, 0) + (currentSet - 1);
  const overallProgressPct = Math.round((completedWorkoutSets / totalWorkoutSets) * 100);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1117] text-white flex flex-col justify-between overflow-hidden animate-fade-in font-sans">
      
      {/* ── 1. HERO TOP BAR ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 bg-[#161b22]/90 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-20">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
              Exercise {currentExIdx + 1} of {exercises.length}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              Overall: {overallProgressPct}%
            </span>
          </div>
          <h2 className="text-base font-black text-white">{workoutPlan.title}</h2>
        </div>

        {/* Live Metrics Header Right */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-gray-800">
              <Clock size={14} className="text-[#d4af37]" />
              <span className="font-bold">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-gray-800">
              <Flame size={14} className="text-amber-400" />
              <span className="font-bold">{Math.round(liveCalories)} kcal</span>
            </div>
          </div>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceEnabled ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button onClick={onClose} className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Overall Progress Line Bar */}
      <div className="w-full h-1.5 bg-gray-800 relative z-20">
        <div className="h-full bg-gradient-to-r from-[#f5c842] to-[#d4af37] transition-all duration-300" style={{ width: `${overallProgressPct}%` }} />
      </div>

      {/* ── 2. DEDICATED REST SCREEN VIEW ──────────────────────────────────── */}
      {isResting ? (
        <div className="flex-1 flex flex-col justify-between p-6 text-center space-y-6 animate-fade-in max-w-2xl mx-auto w-full my-auto">
          
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full inline-block">
              🧘 Active Rest & Recovery
            </span>
            <h2 className="text-2xl font-black text-white">Catch Your Breath</h2>
            <p className="text-xs text-gray-400">Hydrate and prepare for your next set!</p>
          </div>

          {/* Giant Circular Rest Timer */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="#1f2937" strokeWidth="12" fill="transparent" />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#10b981"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="502"
                strokeDashoffset={502 - (502 * (timerSec / (currentEx.restSec || 30)))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white font-mono">{timerSec}</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Seconds</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <button onClick={handleAddRest} className="px-5 py-3 rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 font-bold text-xs hover:text-white">
              +15s Rest
            </button>
            <button onClick={handleSkip} className="btn-primary px-7 py-3 text-xs font-black shadow-glow-gold">
              Skip Rest →
            </button>
          </div>

          {/* Next Preview Card */}
          <div className="p-4 rounded-3xl bg-[#161b22] border border-gray-800 text-left max-w-md mx-auto space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Up Next:</span>
            <h4 className="text-base font-black text-white">{exercises[currentExIdx]?.name}</h4>
            <p className="text-xs text-[#d4af37] font-bold">Target: {exercises[currentExIdx]?.defaultReps || '12 reps'} • Set {currentSet} of {totalSets}</p>
          </div>

        </div>
      ) : (
        /* ── 3. MAIN FULLSCREEN EXERCISE CANVAS VIEW ────────────────────────── */
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Top Exercise Details Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block">
                {currentEx.category} • {currentEx.difficulty}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentEx.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{currentEx.primaryMuscle} • {currentEx.equipment}</p>
            </div>

            <div className="text-right">
              <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-3.5 py-1.5 rounded-2xl text-xs font-mono font-black block">
                Set {currentSet} of {totalSets}
              </span>
              <span className="text-xs font-bold text-emerald-400 mt-1 block">Reps: {currentEx.defaultReps || '12'}</span>
            </div>
          </div>

          {/* 60-70% Height HD Movement Canvas */}
          <div className="w-full flex-1 min-h-[260px] sm:min-h-[340px] rounded-3xl bg-gradient-to-br from-gray-900 via-black to-[#d4af37]/20 border border-[#d4af37]/40 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
            
            {/* Front / Back View Selector */}
            <div className="absolute top-3 right-3 flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[10px]">
              {['Front', 'Back'].map(v => (
                <button
                  key={v}
                  onClick={() => setMuscleView(v)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    muscleView === v ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v} View
                </button>
              ))}
            </div>

            {/* Muscle Anatomy Badge */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-gray-300">
              Primary Target: <b className="text-[#d4af37]">{currentEx.primaryMuscle}</b> ({muscleView})
            </div>

            {/* HD Pose Avatar Graphic Display */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center text-6xl shadow-glow-gold animate-pulse">
              🏋️‍♂️
            </div>

            {/* Rotating Live Coaching Tip */}
            <div className="absolute bottom-3 px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-gray-800 text-[11px] text-gray-300 max-w-md text-center flex items-center gap-2">
              <Sparkles size={14} className="text-[#d4af37] shrink-0" />
              <span>{coachingTips[tipIndex]}</span>
            </div>
          </div>

          {/* Giant Circular Countdown Timer & Rep Counter */}
          <div className="flex justify-between items-center bg-[#161b22] p-4 rounded-3xl border border-gray-800">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Tempo & Volume</span>
              <p className="text-sm font-black text-white">{currentEx.tempo || '2-1-1-0'} Tempo • {currentEx.defaultReps || '12 Reps'}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-amber-500/10 border border-[#d4af37]/40 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-black text-white">{timerSec}s</span>
                <span className="text-[8px] text-[#d4af37] font-bold uppercase">Time</span>
              </div>
            </div>
          </div>

          {/* Swipe-Up Technique Drawer Launcher */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-elevated)] border border-gray-800 text-gray-300 text-xs font-bold flex items-center justify-center gap-2 hover:border-[#d4af37] transition-all"
          >
            <ChevronUp size={16} className="text-[#d4af37]" /> Swipe Up / Tap for Form & Technique Guide
          </button>

        </div>
      )}

      {/* ── 4. INTERACTIVE CONTROLS FOOTER ─────────────────────────────────── */}
      <div className="p-4 sm:p-6 bg-[#161b22] border-t border-gray-800 flex justify-between items-center z-20">
        <button
          onClick={handlePrevious}
          disabled={currentExIdx === 0}
          className="p-3 rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 disabled:opacity-30 hover:text-white transition-all"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`py-3.5 px-8 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl transition-all ${
            isRunning 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isRunning ? <><Pause size={18} /> Pause Session</> : <><Play size={18} /> Resume Session</>}
        </button>

        <button
          onClick={handleSkip}
          className="btn-primary py-3.5 px-6 font-black text-xs shadow-glow-gold flex items-center gap-2"
        >
          <span>Complete Reps</span>
          <SkipForward size={18} />
        </button>
      </div>

      {/* Swipe-Up Technique Drawer */}
      <ExerciseDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        exercise={currentEx}
      />

    </div>
  );
}
