import { useState, useEffect, useMemo } from 'react';
import { 
  Play, Dumbbell, Calendar, Activity, Settings, Plus, 
  Sparkles, CheckCircle2, ChevronRight, RefreshCw, BarChart2, ShieldCheck, Search, Camera 
} from 'lucide-react';
import { loadExercises, filterExercises, capitalize } from '../../services/fitness/exerciseService';
import { 
  loadFitnessPreferences, saveFitnessPreferences, loadWorkoutPlan, 
  saveWorkoutPlan, loadWorkoutHistory, loadCustomWorkouts 
} from '../../services/fitness/fitnessStorage';
import { generateWeeklyPlan, selectCandidateExercises } from '../../services/fitness/recommendationEngine';
import FitnessSetupFlow from './FitnessSetupFlow';
import ExerciseLibraryView from './ExerciseLibraryView';
import ExerciseDetailModal from './ExerciseDetailModal';
import WorkoutSessionView from './WorkoutSessionView';
import CustomWorkoutBuilder from './CustomWorkoutBuilder';
import FitnessProgressView from './FitnessProgressView';
import ExerciseCard from './ExerciseCard';
import MotionCoachView from './motionCoach/MotionCoachView';

export default function FitnessDashboard() {
  const [allExercises, setAllExercises] = useState([]);
  const [loadingDataset, setLoadingDataset] = useState(true);
  
  // Storage state
  const [preferences, setPreferences] = useState(loadFitnessPreferences());
  const [workoutPlan, setWorkoutPlan] = useState(loadWorkoutPlan());
  const [workoutHistory, setWorkoutHistory] = useState(loadWorkoutHistory());
  const [customWorkouts, setCustomWorkouts] = useState(loadCustomWorkouts());

  // Navigation tab: 'home', 'library', 'custom', 'progress'
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Modals state
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [motionCoachOpen, setMotionCoachOpen] = useState(false);
  const [selectedMotionExercise, setSelectedMotionExercise] = useState('squat');
  const [customBuilderOpen, setCustomBuilderOpen] = useState(false);
  const [activeSessionWorkout, setActiveSessionWorkout] = useState(null);
  const [inspectExercise, setInspectExercise] = useState(null);

  // Load dataset
  useEffect(() => {
    let mounted = true;
    loadExercises().then(data => {
      if (mounted) {
        setAllExercises(data);
        setLoadingDataset(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Generate initial plan if none exists or preferences update
  useEffect(() => {
    if (allExercises.length > 0 && (!workoutPlan || !workoutPlan.days)) {
      const generated = generateWeeklyPlan(allExercises, preferences);
      setWorkoutPlan(generated);
      saveWorkoutPlan(generated);
    }
  }, [allExercises, preferences, workoutPlan]);

  const handlePreferencesSaved = (newPrefs) => {
    setPreferences(newPrefs);
    if (allExercises.length > 0) {
      const regenerated = generateWeeklyPlan(allExercises, newPrefs);
      setWorkoutPlan(regenerated);
      saveWorkoutPlan(regenerated);
    }
  };

  // Today's prescribed workout
  const todayWorkout = useMemo(() => {
    if (!workoutPlan || !workoutPlan.days) return null;
    // Find first active workout day or fallback
    const activeDay = workoutPlan.days.find(d => !d.isRestDay) || workoutPlan.days[0];
    return activeDay;
  }, [workoutPlan]);

  // Recommended candidate exercises matching user setup
  const recommendedExercises = useMemo(() => {
    if (allExercises.length === 0) return [];
    return selectCandidateExercises(allExercises, preferences, 8);
  }, [allExercises, preferences]);

  const handleStartWorkout = (workoutToStart) => {
    setActiveSessionWorkout(workoutToStart || todayWorkout);
    setSessionOpen(true);
  };

  return (
    <div className="px-4 sm:px-6 pt-6 max-w-6xl mx-auto w-full space-y-6 text-xs font-sans pb-20">
      
      {/* ── 1. HERO HEADER BANNER ─────────────────────────────────────────── */}
      <div className="card p-6 rounded-3xl border border-[#0052ff]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#0052ff]/10 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-white px-3 py-1 rounded-full bg-[#0052ff] flex items-center gap-1 shadow-md">
                <Sparkles size={12} /> Personalized Engine
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                1,324 Exercises Dataset
              </span>
            </div>

            {/* Smart Motion Capture Coach Button & Exercise Dropdown */}
            <div className="pt-1.5 pb-1 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setMotionCoachOpen(true)}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-black text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all border border-purple-400/30"
              >
                <Camera size={16} className="text-purple-200" />
                <span>Start Smart Motion Capture Coach</span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#161b22]/90 border border-purple-500/40 rounded-2xl px-3 py-1.5">
                <span className="text-[10px] uppercase font-black text-purple-300">Exercise:</span>
                <select
                  value={selectedMotionExercise}
                  onChange={(e) => setSelectedMotionExercise(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="squat" className="bg-[#161b22] text-white">🏋️ Bodyweight Squats (Legs)</option>
                  <option value="toe_touch" className="bg-[#161b22] text-white">🤸 Standing Toe Touch (Flexibility & Core)</option>
                  <option value="side_reach" className="bg-[#161b22] text-white">🧘 Standing Side Reach (Obliques & Core)</option>
                  <option value="pushup" className="bg-[#161b22] text-white">💪 Push-Ups (Chest & Arms)</option>
                  <option value="bicep_curl" className="bg-[#161b22] text-white">🏋️‍♂️ Bicep Curls (Biceps)</option>
                  <option value="shoulder_press" className="bg-[#161b22] text-white">🏋️‍♀️ Overhead Shoulder Press (Shoulders)</option>
                  <option value="lunge" className="bg-[#161b22] text-white">🦵 Bodyweight Lunges (Quads)</option>
                </select>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              SpectraTrust Fitness Coach
            </h1>
            <p className="text-[var(--text-secondary)] text-xs">
              Setup: <b className="text-[#0052ff]">{preferences.experience}</b> • Goal: <b className="text-[var(--text-primary)]">{preferences.mainGoal}</b> • Equipment: <b className="text-amber-500 dark:text-amber-400">{preferences.equipment.map(capitalize).join(', ')}</b>
            </p>
          </div>

          <button
            onClick={() => setSetupModalOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-[var(--bg-elevated)] border border-[#0052ff]/40 text-[var(--text-primary)] font-bold hover:border-[#0052ff] flex items-center gap-2 transition-all shadow-md shrink-0 text-xs"
          >
            <Settings size={15} className="text-[#0052ff]" /> Recalibrate Setup
          </button>
        </div>

        {/* Educational Copyright License Statement */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-gray-800 text-[11px] text-gray-400 flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-400 shrink-0" />
          <span>Exercise animations & thumbnails provided by <b>Gym visual dataset</b> for non-commercial educational guidance.</span>
        </div>
      </div>

      {/* ── 2. NAVIGATION TABS ────────────────────────────────────────────── */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto no-scrollbar gap-5 text-xs font-black">
        {[
          { id: 'home', label: 'Fitness Home', icon: Play },
          { id: 'library', label: 'Exercise Library (1,324)', icon: Dumbbell },
          { id: 'custom', label: 'Custom Workout Builder', icon: Plus },
          { id: 'progress', label: 'Activity Progress', icon: BarChart2 }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                isActive ? 'border-[#0052ff] text-[#0052ff]' : 'border-transparent text-[var(--text-secondary)] hover:text-[#0052ff]'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: HOME DASHBOARD ─────────────────────────────────────────── */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* TODAY'S PRESCRIBED WORKOUT CARD */}
          {todayWorkout && (
            <div className="card p-6 rounded-3xl border border-[#0052ff]/50 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#0052ff]/15 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-widest block mb-1">
                    Today's Prescribed Session
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{todayWorkout.title}</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    ~{todayWorkout.estimatedDurationMinutes} Minutes • {todayWorkout.exercises?.length || 5} Exercises
                  </p>
                </div>

                <button
                  onClick={() => handleStartWorkout(todayWorkout)}
                  className="py-3.5 px-6 rounded-2xl bg-[#0052ff] text-white font-black text-xs shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2 shrink-0"
                >
                  <Play size={18} fill="currentColor" /> Start Workout Session →
                </button>
              </div>

              {/* Today's Exercises Preview Grid */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider block">
                  Target Exercises ({todayWorkout.exercises?.length || 0})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(todayWorkout.exercises || []).map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      onClick={() => setInspectExercise(ex)}
                      className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] flex items-center justify-between cursor-pointer hover:border-[#0052ff] transition-all"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-black text-[var(--text-primary)] text-xs">{capitalize(ex.name)}</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">{capitalize(ex.body_part)} • {capitalize(ex.equipment)}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0052ff] bg-[#0052ff]/10 px-2 py-0.5 rounded border border-[#0052ff]/30">
                        {capitalize(ex.target)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MY PLAN WEEKLY SCHEDULE */}
          {workoutPlan && workoutPlan.days && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-[var(--text-primary)]">My Weekly Plan Schedule</h3>
                <button onClick={() => setSetupModalOpen(true)} className="text-[#0052ff] font-bold text-xs hover:underline">
                  Regenerate Plan
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {workoutPlan.days.map((item, idx) => (
                  <button
                    key={item.dayName}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                      selectedDayIdx === idx
                        ? 'bg-[#0052ff] text-white border-[#0052ff] font-black shadow-lg'
                        : item.isRestDay
                          ? 'bg-slate-200 dark:bg-gray-900 text-slate-500 dark:text-gray-400 border-slate-300 dark:border-gray-800'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-gray-600'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block">{item.dayName.slice(0, 3)}</span>
                    <span className="text-xs font-black mt-0.5 block">{item.isRestDay ? 'Rest' : `${item.estimatedDurationMinutes}m`}</span>
                  </button>
                ))}
              </div>

              {/* Day Details Preview */}
              {workoutPlan.days[selectedDayIdx] && (
                <div className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-[#0052ff] uppercase tracking-wider block">
                        {workoutPlan.days[selectedDayIdx].dayName} Target
                      </span>
                      <h4 className="text-lg font-black text-[var(--text-primary)]">{workoutPlan.days[selectedDayIdx].title}</h4>
                    </div>

                    {!workoutPlan.days[selectedDayIdx].isRestDay && (
                      <button
                        onClick={() => handleStartWorkout(workoutPlan.days[selectedDayIdx])}
                        className="py-2 px-4 rounded-xl bg-[#0052ff] text-white font-bold text-xs hover:bg-blue-600 transition-all flex items-center gap-1"
                      >
                        <Play size={14} fill="currentColor" /> Start Day
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECOMMENDED EXERCISES FOR YOU */}
          {recommendedExercises.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-[var(--text-primary)]">Recommended for Your Equipment & Goal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedExercises.slice(0, 4).map(ex => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    onView={(item) => setInspectExercise(item)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── TAB 2: EXERCISE LIBRARY ───────────────────────────────────────── */}
      {activeTab === 'library' && (
        <ExerciseLibraryView
          onSelectExerciseForCustom={(ex) => {
            alert(`Added ${ex.name} to your custom list draft!`);
          }}
        />
      )}

      {/* ── TAB 3: CUSTOM WORKOUT BUILDER ─────────────────────────────────── */}
      {activeTab === 'custom' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">My Custom Workouts</h3>
              <p className="text-xs text-[var(--text-secondary)]">Build your own routines picking from 1,324 dataset exercises.</p>
            </div>

            <button
              onClick={() => setCustomBuilderOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-[#0052ff] text-white font-black text-xs hover:bg-blue-600 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} /> Create Custom Workout
            </button>
          </div>

          {customWorkouts.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] space-y-3">
              <span className="text-4xl">🛠️</span>
              <h4 className="text-base font-bold text-[var(--text-primary)]">No custom workouts created yet</h4>
              <p className="text-[var(--text-secondary)] text-xs">Create your own tailored routines with exercises from the dataset!</p>
              <button onClick={() => setCustomBuilderOpen(true)} className="btn-primary py-2 px-4 text-xs">
                Create Workout Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customWorkouts.map(cw => (
                <div key={cw.id} className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-[var(--text-primary)] text-base">{cw.title}</h4>
                    <span className="text-xs font-mono text-[#0052ff] font-bold bg-[#0052ff]/10 px-2 py-0.5 rounded border border-[#0052ff]/30">
                      {cw.exerciseIds?.length || 0} Exercises
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const fullExs = allExercises.filter(e => cw.exerciseIds.includes(e.id));
                      handleStartWorkout({ title: cw.title, exercises: fullExs });
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0052ff] text-white font-bold text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play size={14} fill="currentColor" /> Start Custom Routine
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: ACTIVITY PROGRESS ──────────────────────────────────────── */}
      {activeTab === 'progress' && <FitnessProgressView />}

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      <FitnessSetupFlow
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        currentPreferences={preferences}
        onSavePreferences={handlePreferencesSaved}
      />

      <ExerciseDetailModal
        isOpen={!!inspectExercise}
        onClose={() => setInspectExercise(null)}
        exercise={inspectExercise}
      />

      <WorkoutSessionView
        isOpen={sessionOpen}
        onClose={() => setSessionOpen(false)}
        workout={activeSessionWorkout}
        allExercises={allExercises}
        preferences={preferences}
        onWorkoutComplete={() => {
          setWorkoutHistory(loadWorkoutHistory());
        }}
      />

      <CustomWorkoutBuilder
        isOpen={customBuilderOpen}
        onClose={() => setCustomBuilderOpen(false)}
        allExercises={allExercises}
        onWorkoutCreated={() => setCustomWorkouts(loadCustomWorkouts())}
      />

      <MotionCoachView
        isOpen={motionCoachOpen}
        onClose={() => setMotionCoachOpen(false)}
        workoutPlan={workoutPlan}
        initialExerciseId={selectedMotionExercise}
      />

    </div>
  );
}
