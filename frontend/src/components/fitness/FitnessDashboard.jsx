import { useState, useMemo } from 'react';
import { 
  Sparkles, Play, Dumbbell, Trophy, Flame, Calendar, Activity, 
  Settings, Award, Clock, Heart, ArrowUpRight, CheckCircle2, ChevronRight, Zap, RefreshCw, BarChart2, ShieldCheck
} from 'lucide-react';
import { 
  loadFitnessProfile, loadWorkoutLogs, generateDynamicAiWorkout, 
  generateWeeklyAiSplit, calculateUserGamification, getAchievementBadges, 
  getMealPlannerSyncRecommendation, classifyUserArchetype, calculateRecoveryScore 
} from '../../services/aiFitnessEngine';
import FitnessOnboardingModal from './FitnessOnboardingModal';
import WorkoutPlayerView from './WorkoutPlayerView';
import PostWorkoutFeedbackModal from './PostWorkoutFeedbackModal';
import ExerciseLibraryView from './ExerciseLibraryView';
import FitnessAnalyticsView from './FitnessAnalyticsView';
import FitnessChallengesView from './FitnessChallengesView';

export default function FitnessDashboard() {
  const [profile, setProfile] = useState(loadFitnessProfile());
  const [workoutLogs, setWorkoutLogs] = useState(loadWorkoutLogs());
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'schedule', 'library', 'analytics', 'challenges'
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Contextual AI Adjusters
  const [availableTime, setAvailableTime] = useState(profile.duration || 30);
  const [userMood, setUserMood] = useState('Motivated');

  // Modals state
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [lastFinishedSummary, setLastFinishedSummary] = useState(null);

  // Archetype & Recovery Score
  const archetype = useMemo(() => classifyUserArchetype(profile), [profile]);
  const recoveryScore = useMemo(() => calculateRecoveryScore(profile.sleepHours || 7, 2, workoutLogs.length), [profile, workoutLogs]);

  // Dynamic Workout Generation
  const todayWorkout = useMemo(() => {
    let adjustedDuration = availableTime;
    if (userMood === 'Tired') adjustedDuration = Math.min(20, availableTime);
    
    return generateDynamicAiWorkout({
      ...profile,
      duration: adjustedDuration
    });
  }, [profile, availableTime, userMood]);

  // 7-Day Split Generation
  const weeklySplit = useMemo(() => generateWeeklyAiSplit(profile), [profile]);

  // Gamification Metrics
  const gamification = useMemo(() => calculateUserGamification(workoutLogs), [workoutLogs]);
  const badges = useMemo(() => getAchievementBadges(gamification), [gamification]);

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
    <div className="px-4 sm:px-6 pt-6 max-w-6xl mx-auto w-full space-y-6 text-xs font-sans pb-16">
      
      {/* ── 1. HERO HEADER & ARCHETYPE BANNER ───────────────────────────────── */}
      <div className="card p-6 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#d4af37]/10 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase text-white px-3 py-1 rounded-full bg-gradient-to-r ${archetype.color} flex items-center gap-1 shadow-md`}>
                <span>{archetype.badge}</span> Archetype: {archetype.title}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                100% Dynamic Engine
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              AI Personal Trainer Dashboard
            </h1>
            <p className="text-gray-300 text-xs">
              Goal: <b className="text-white">{profile.goal}</b> • Setup: <b className="text-[#d4af37]">{profile.location} ({profile.equipment.join(', ')})</b>
            </p>
          </div>

          <button
            onClick={() => setOnboardingOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-[var(--bg-elevated)] border border-[#d4af37]/40 text-white font-bold hover:border-[#d4af37] flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            <Settings size={16} className="text-[#d4af37]" /> Recalibrate Assessment
          </button>
        </div>

        {/* AI Recovery Advice Banner */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-gray-800 text-[11px] text-gray-300 flex items-center gap-2">
          <Zap size={16} className="text-[#d4af37] shrink-0" />
          <span>{recoveryScore.aiAdvice}</span>
        </div>
      </div>

      {/* ── 2. GAMIFICATION & METRIC ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Recovery Score Card */}
        <div className={`card p-5 rounded-3xl border border-${recoveryScore.color}-500/30 bg-${recoveryScore.color}-500/10 space-y-1`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-gray-300">Recovery Readiness</span>
            <Activity size={16} className={`text-${recoveryScore.color}-400`} />
          </div>
          <p className="text-2xl font-black text-white font-mono">{recoveryScore.score}% <span className="text-xs text-gray-400 font-normal">Score</span></p>
          <p className="text-[10px] text-gray-400">{recoveryScore.status}</p>
        </div>

        {/* Level Card */}
        <div className="card p-5 rounded-3xl border border-amber-500/30 bg-amber-500/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-amber-400">Athlete Level</span>
            <Trophy size={16} className="text-amber-400" />
          </div>
          <p className="text-lg font-black text-white">{gamification.title}</p>
          
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-[#d4af37] transition-all" style={{ width: `${gamification.progressPct}%` }} />
          </div>
        </div>

        {/* Streak */}
        <div className="card p-5 rounded-3xl border border-red-500/30 bg-red-500/10 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-red-400">Streak</span>
            <Flame size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{gamification.streakDays} <span className="text-xs text-gray-400 font-normal">Active Days</span></p>
          <p className="text-[10px] text-gray-400">Coins: 💰 {gamification.totalCoins}</p>
        </div>

        {/* Calories */}
        <div className="card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400">Total Torched</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{gamification.totalCalories} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
          <p className="text-[10px] text-gray-400">{gamification.totalMins} mins total workout</p>
        </div>

      </div>

      {/* ── 3. MAIN NAVIGATION TABS ────────────────────────────────────────── */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto no-scrollbar gap-5 text-xs font-black">
        {[
          { id: 'today', label: 'Today\'s Session', icon: Play },
          { id: 'schedule', label: '7-Day Split', icon: Calendar },
          { id: 'library', label: 'Exercise Library', icon: Dumbbell },
          { id: 'analytics', label: 'Analytics & PRs', icon: BarChart2 },
          { id: 'challenges', label: 'Quests & Missions', icon: Trophy }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                isActive ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TODAY'S PRESCRIBED WORKOUT */}
      {activeTab === 'today' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/50 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#d4af37]/15 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest block mb-1">Prescribed AI Session</span>
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

            {/* Exercises Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Target Exercise Flow ({todayWorkout.exercises.length} Exercises)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {todayWorkout.exercises.map((ex, idx) => (
                  <div key={ex.id || idx} className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-black text-white text-xs">{ex.name}</h4>
                      <p className="text-[10px] text-gray-400">{ex.sets} Sets • {ex.defaultReps}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                      {ex.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-5 animate-fade-in">
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

          {weeklySplit[selectedDayIdx] && (
            <div className="card p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider block">{weeklySplit[selectedDayIdx].day} Plan</span>
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

      {/* TAB 3: LIBRARY */}
      {activeTab === 'library' && <ExerciseLibraryView />}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && <FitnessAnalyticsView profile={profile} workoutLogs={workoutLogs} />}

      {/* TAB 5: CHALLENGES */}
      {activeTab === 'challenges' && <FitnessChallengesView gamification={gamification} />}

      {/* Modals */}
      <FitnessOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        currentProfile={profile}
        onComplete={(newProf) => setProfile(newProf)}
      />

      <WorkoutPlayerView
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
