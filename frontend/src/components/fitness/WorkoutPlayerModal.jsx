import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX, CheckCircle, Flame, Clock, Award, ShieldAlert } from 'lucide-react';

export default function WorkoutPlayerModal({ isOpen, onClose, workoutPlan, onWorkoutFinished }) {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [timerSec, setTimerSec] = useState(45);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const exercises = workoutPlan?.exercises || [];
  const currentEx = exercises[currentExIdx] || exercises[0] || {};
  const totalSets = currentEx.sets || 3;
  const isLastExercise = currentExIdx === exercises.length - 1;
  const isLastSet = currentSet === totalSets;

  // Web Speech API Voice Prompt Helper
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

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentExIdx(0);
      setCurrentSet(1);
      setIsResting(false);
      setIsRunning(true);
      setTimerSec(45);
      speakCue(`Starting ${workoutPlan?.title || 'Workout Session'}. Prepare for ${exercises[0]?.name || 'first exercise'}`);
    } else {
      setIsRunning(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  // Main Timer Tick Effect
  useEffect(() => {
    let interval = null;
    if (isOpen && isRunning) {
      interval = setInterval(() => {
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
  }, [isOpen, isRunning, isResting, currentExIdx, currentSet]);

  const handleTimerComplete = () => {
    if (isResting) {
      // Rest over -> Resume Next Set or Next Exercise
      setIsResting(false);
      setTimerSec(45);
      speakCue(`Rest over. Set ${currentSet} of ${currentEx.name}. Go!`);
    } else {
      // Set completed -> Trigger Rest or Next
      if (isLastSet) {
        if (isLastExercise) {
          // Workout finished!
          setIsRunning(false);
          speakCue('Workout Session completed! Outstanding work!');
          onWorkoutFinished({
            workoutPlan,
            completedSets: exercises.reduce((acc, e) => acc + e.sets, 0),
            durationMin: workoutPlan?.durationMin || 30,
            estCalories: workoutPlan?.estCalories || 220,
            timestamp: new Date().toLocaleDateString()
          });
        } else {
          // Advance to next exercise
          setCurrentExIdx(prev => prev + 1);
          setCurrentSet(1);
          setIsResting(true);
          setTimerSec(currentEx.restSec || 30);
          speakCue(`Great job! Rest for ${currentEx.restSec || 30} seconds. Next up: ${exercises[currentExIdx + 1]?.name}`);
        }
      } else {
        // Advance to next set
        setCurrentSet(prev => prev + 1);
        setIsResting(true);
        setTimerSec(currentEx.restSec || 30);
        speakCue(`Set completed. Rest for ${currentEx.restSec || 30} seconds.`);
      }
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
  const progressPct = Math.round((completedWorkoutSets / totalWorkoutSets) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Bar */}
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block">Interactive AI Workout Player</span>
            <h3 className="text-sm font-black text-white">{workoutPlan.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                voiceEnabled ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="text-[10px] font-bold">{voiceEnabled ? 'Voice ON' : 'Mute'}</span>
            </button>

            <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-800 relative">
          <div className="h-full bg-gradient-to-r from-[#f5c842] to-[#d4af37] transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Player Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1 flex flex-col justify-between">
          
          {/* REST MODE UI */}
          {isResting ? (
            <div className="py-8 text-center space-y-4 animate-fade-in my-auto">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full inline-block">
                🧘 Active Rest Period
              </span>

              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-20" />
                <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono">{timerSec}s</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Resting</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button onClick={handleAddRest} className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-bold hover:text-white">
                  +15s Extra Rest
                </button>
                <button onClick={handleSkip} className="btn-primary px-5 py-2 text-xs font-black shadow-glow-gold">
                  Skip Rest →
                </button>
              </div>

              {/* Next Preview */}
              {exercises[currentExIdx] && (
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-left max-w-md mx-auto">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Up Next:</span>
                  <h4 className="text-sm font-black text-white">{exercises[currentExIdx].name}</h4>
                  <p className="text-[11px] text-[#d4af37]">{exercises[currentExIdx].reps} • Set {currentSet} of {exercises[currentExIdx].sets}</p>
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE EXERCISE UI */
            <div className="space-y-5 animate-fade-in">
              {/* Exercise Header & Badges */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block">
                    Exercise {currentExIdx + 1} of {exercises.length}
                  </span>
                  <h2 className="text-2xl font-black text-white">{currentEx.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{currentEx.primaryMuscle} • {currentEx.equipment}</p>
                </div>

                <div className="text-right">
                  <span className="bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded-xl text-xs font-mono font-bold block">
                    Set {currentSet} / {totalSets}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1 block">{currentEx.reps}</span>
                </div>
              </div>

              {/* Visual Animated Canvas Display */}
              <div className="w-full h-48 rounded-3xl bg-gradient-to-br from-[var(--bg-elevated)] via-gray-900 to-[#d4af37]/10 border border-[#d4af37]/30 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-gray-300 border border-white/10 flex items-center gap-1">
                  <Flame size={12} className="text-amber-400" /> ~{currentEx.caloriesBurned || 15} kcal
                </div>

                {/* Animated Movement Visual Graphic */}
                <div className="w-24 h-24 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center animate-bounce shadow-glow-gold text-3xl">
                  🏋️‍♂️
                </div>

                <span className="text-[11px] font-bold text-gray-300 mt-3 animate-pulse">
                  {isRunning ? 'Keep Steady Form & Control' : 'Session Paused'}
                </span>
              </div>

              {/* Step Instruction Card */}
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Key Technique Instruction</span>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  {currentEx.instructions?.[0] || 'Perform controlled repetitions maintaining tension.'}
                </p>
              </div>

              {/* Timer Bar */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-gray-800">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#d4af37]" />
                  <span className="font-mono text-lg font-black text-white">{timerSec}s</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">Target Reps: {currentEx.reps}</span>
              </div>
            </div>
          )}

        </div>

        {/* Player Controls Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-between items-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`py-3 px-6 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
              isRunning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
          </button>

          <button
            onClick={handleSkip}
            className="btn-primary py-3 px-6 font-black text-xs shadow-glow-gold flex items-center gap-2"
          >
            <CheckCircle size={16} /> Set Done / Next <SkipForward size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
