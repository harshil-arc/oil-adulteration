import { useState, useMemo } from 'react';
import { 
  Sparkles, Play, Dumbbell, Trophy, Flame, Calendar, Activity, 
  Settings, Award, Clock, Heart, ArrowUpRight, CheckCircle2, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { 
  loadFitnessProfile, loadWorkoutLogs, generateDynamicAiWorkout, 
  generateWeeklyAiSplit, calculateUserGamification, getAchievementBadges, 
  getMealPlannerSyncRecommendation 
} from '../../services/aiFitnessEngine';
import FitnessOnboardingModal from './FitnessOnboardingModal';
import WorkoutPlayerModal from './WorkoutPlayerModal';
import PostWorkoutFeedbackModal from './PostWorkoutFeedbackModal';
import ExerciseLibraryView from './ExerciseLibraryView';

export default function FitnessDashboard() {
  const [profile, setProfile] = useState(loadFitnessProfile());
  const [workoutLogs, setWorkoutLogs] = useState(loadWorkoutLogs());
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule', 'library', 'analytics'
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Contextual AI Adjuster State
  const [availableTime, setAvailableTime] = useState(profile.duration || 30);
  const [userMood, setUserMood] = useState('Motivated'); // 'Motivated', 'Tired', 'Stressed', 'Energetic'
  const [sleepQuality, setSleepQuality] = useState('Good'); // 'Good', 'Poor', 'Great'

  // Modals state
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [lastFinishedSummary, setLastFinishedSummary] = useState(null);

  // Dynamic Workout Generation based on Profile + Context Adjusters
  const todayWorkout = useMemo(() => {
    let adjustedDuration = availableTime;
    if (userMood === 'Tired') adjustedDuration = Math.min(20, availableTime);
    
    return generateDynamicAiWorkout({
      ...profile,
      duration: adjustedDuration
    });
  }, [profile, availableTime, userMood]);

  // 7-Day Split Generation
  const weeklySplit = useMemo(() => {
    return generateWeeklyAiSplit(profile);
  }, [profile]);

  // Gamification Metrics
  const gamification = useMemo(() => {
    return calculateUserGamification(workoutLogs);
  }, [workoutLogs]);

  const badges = useMemo(() => {
    return getAchievementBadges(gamification);
  }, [gamification]);

  // Meal Sync
  const mealSync = useMemo(() => {
    return getMealPlannerSyncRecommendation(todayWorkout);
  }, [todayWorkout]);

  // Handlers
  const handleStartWorkout = (plan) => {
    setActiveWorkoutPlan(plan || todayWorkout);
    setPlayerOpen(true);
  };

  const handleWorkoutFinished = (summary) => {
    setPlayerOpen(false);
    setLastFinishedSummary(summary);
    setFeedbackOpen(true);
  };

  const handleFeedbackComplete = () => {
    setWorkoutLogs(loadWorkoutLogs());
  };

  return (
    <div className="px-4 sm:px-6 pt-6 max-w-6xl mx-auto w-full space-y-6 text-xs font-sans pb-12">
      
      {/* ── 1. HERO HEADER & ONBOARDING TRIGGER ───────────────────────────────── */}
      <div className="card p-6 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#d4af37]/10 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30 flex items-center gap-1">
                <Sparkles size={12} /> AI Fitness Coach Engine
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                100% Dynamic Plan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Hello, {profile.gender === 'Female' ? 'Athlete' : 'Champ'}! 👋
            </h1>
            <p className="text-gray-300 text-xs">
              Goal: <b className="text-white">{profile.goal}</b> • Setup: <b className="text-[#d4af37]">{profile.location} ({profile.equipment.join(', ')})</b>
            </p>
          </div>

          <button
            onClick={() => setOnboardingOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-[var(--bg-elevated)] border border-[#d4af37]/40 text-white font-bold hover:border-[#d4af37] flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            <Settings size={16} className="text-[#d4af37]" /> Recalibrate Profile
          </button>
        </div>

        {/* AI Rationale Banner */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-gray-800 text-[11px] text-gray-300 flex items-center gap-2">
          <Zap size={16} className="text-[#d4af37] shrink-0" />
          <span>{todayWorkout.aiRationale}</span>
        </div>
      </div>

      {/* ── 2. GAMIFICATION XP & LEVEL HEADER ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Level Card */}
        <div className="card p-5 rounded-3xl border border-amber-500/30 bg-amber-500/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-amber-400">Current Athlete Status</span>
            <Trophy size={16} className="text-amber-400" />
          </div>
          <p className="text-xl font-black text-white">Level {gamification.level} • {gamification.title}</p>
          
          {/* XP Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
              <span>{gamification.currentLevelXP} XP</span>
              <span>{gamification.nextLevelXP} XP</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-[#d4af37] transition-all" style={{ width: `${gamification.levelProgressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="card p-5 rounded-3xl border border-red-500/30 bg-red-500/10 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-red-400">Workout Streak</span>
            <Flame size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{gamification.streakDays} <span className="text-xs text-gray-400 font-normal">Days Active</span></p>
          <p className="text-[10px] text-gray-400">Keep it up to earn streak bonuses!</p>
        </div>

        {/* Calories Burned */}
        <div className="card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400">Total Torched</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{gamification.totalCaloriesBurned} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
          <p className="text-[10px] text-gray-400">{gamification.totalWorkoutMins} mins total workout time</p>
        </div>

        {/* Badges Preview */}
        <div className="card p-5 rounded-3xl border border-purple-500/30 bg-purple-500/10 space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-purple-400">Badges Unlocked</span>
          <div className="flex gap-2">
            {badges.map(b => (
              <span key={b.id} title={b.title} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${
                b.unlocked ? 'bg-purple-500/20 border-purple-400 text-white' : 'bg-gray-800 border-gray-700 opacity-40 grayscale'
              }`}>
                {b.icon}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── 3. TODAY'S PRESCRIBED WORKOUT CARD ───────────────────────────────── */}
      <div className="card p-6 rounded-3xl border border-[#d4af37]/50 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#d4af37]/15 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest block mb-1">Today's Prescribed AI Workout</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{todayWorkout.title}</h2>
            <p className="text-xs text-gray-400 mt-1">{todayWorkout.focus} • {todayWorkout.difficulty} Level</p>
          </div>

          <button
            onClick={() => handleStartWorkout(todayWorkout)}
            className="btn-primary py-3.5 px-6 font-black text-xs shadow-glow-gold flex items-center gap-2 shrink-0"
          >
            <Play size={18} /> Start Interactive Session →
          </button>
        </div>

        {/* Contextual AI Adjuster Controls */}
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">⚡ Quick AI Context Adjusters</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Time Available Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Time Available</span>
                <span className="text-[#d4af37] font-bold">{availableTime} mins</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="15"
                value={availableTime}
                onChange={e => setAvailableTime(Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>

            {/* Mood Selector */}
            <div className="space-y-1">
              <span className="text-gray-400 text-[11px] block">Current Mood</span>
              <div className="flex gap-1">
                {['Motivated', 'Tired', 'Energetic'].map(m => (
                  <button
                    key={m}
                    onClick={() => setUserMood(m)}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold ${
                      userMood === m ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-gray-800 text-gray-300 border-gray-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="space-y-1">
              <span className="text-gray-400 text-[11px] block">Last Night's Sleep</span>
              <div className="flex gap-1">
                {['Poor', 'Good', 'Great'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSleepQuality(s)}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold ${
                      sleepQuality === s ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-gray-800 text-gray-300 border-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Exercises Preview List */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Prescribed Exercise Flow ({todayWorkout.exercises.length} Exercises)</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {todayWorkout.exercises.map((ex, idx) => (
              <div key={ex.id || idx} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-black text-white text-xs">{ex.name}</h4>
                  <p className="text-[10px] text-gray-400">{ex.sets} Sets • {ex.reps}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                  {ex.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. TABS & DETAILED VIEWS ───────────────────────────────────────── */}
      <div className="flex border-b border-[var(--border-color)] gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'schedule' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Calendar size={16} /> 7-Day Weekly AI Split Schedule
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`pb-3 transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'library' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Dumbbell size={16} /> Searchable Exercise Library
        </button>
      </div>

      {/* SCHEDULE TAB CONTENT */}
      {activeTab === 'schedule' && (
        <div className="space-y-5 animate-fade-in">
          {/* Day Pills */}
          <div className="grid grid-cols-7 gap-1.5">
            {weeklySplit.map((item, idx) => (
              <button
                key={item.day}
                onClick={() => setSelectedDayIdx(idx)}
                className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                  selectedDayIdx === idx
                    ? 'bg-[#d4af37] text-black border-[#d4af37] font-black shadow-glow-gold'
                    : item.isRestDay
                      ? 'bg-gray-900 text-gray-500 border-gray-800'
                      : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold block">{item.day.slice(0, 3)}</span>
                <span className="text-xs font-black mt-0.5 block">{item.isRestDay ? 'Rest' : `${item.durationMin}m`}</span>
              </button>
            ))}
          </div>

          {/* Selected Day Details */}
          {weeklySplit[selectedDayIdx] && (
            <div className="card p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider block">
                    {weeklySplit[selectedDayIdx].day} Plan
                  </span>
                  <h3 className="text-xl font-black text-white">{weeklySplit[selectedDayIdx].title}</h3>
                </div>

                {!weeklySplit[selectedDayIdx].isRestDay && (
                  <button
                    onClick={() => handleStartWorkout(weeklySplit[selectedDayIdx].planDetails)}
                    className="btn-primary py-2.5 px-4 text-xs font-black shadow-glow-gold flex items-center gap-1.5"
                  >
                    <Play size={16} /> Start Session
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIBRARY TAB CONTENT */}
      {activeTab === 'library' && (
        <ExerciseLibraryView />
      )}

      {/* ── 5. NUTRITION & MEAL SYNC FOOTER CARD ───────────────────────────── */}
      <div className="card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Synchronized Meal Planner Integration</span>
            <h3 className="text-base font-black text-white">Post-Workout Macro Fueling Targets</h3>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl text-[10px] font-bold">
            Live Sync
          </span>
        </div>

        <p className="text-gray-300 text-xs">{mealSync.tip}</p>
      </div>

      {/* Modals */}
      <FitnessOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        currentProfile={profile}
        onComplete={(newProf) => setProfile(newProf)}
      />

      <WorkoutPlayerModal
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        workoutPlan={activeWorkoutPlan}
        onWorkoutFinished={handleWorkoutFinished}
      />

      <PostWorkoutFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        workoutSummary={lastFinishedSummary}
        onCompletedAll={handleFeedbackComplete}
      />

    </div>
  );
}
