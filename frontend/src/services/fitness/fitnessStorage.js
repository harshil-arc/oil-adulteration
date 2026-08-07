// ─── FITNESS PERSISTENCE STORAGE SERVICE ───────────────────────────
// Manages User Preferences, Generated Workout Plans, Completed History & Custom Workouts

const PREFS_KEY = 'spectratrust_fitness_preferences';
const PLAN_KEY = 'spectratrust_fitness_workout_plan';
const HISTORY_KEY = 'spectratrust_fitness_history';
const CUSTOM_KEY = 'spectratrust_fitness_custom_workouts';

// Default Healthy Preferences (Non-restrictive, activity focused)
export const DEFAULT_PREFERENCES = {
  experience: 'Beginner', // 'Beginner' | 'Intermediate' | 'Advanced'
  mainGoal: 'General fitness', // 'General fitness' | 'Strength' | 'Mobility' | 'Endurance'
  equipment: ['body weight'], // ['body weight', 'dumbbell', 'barbell', 'band', 'cable', 'kettlebell', 'leverage machine']
  workoutDays: 3, // 1 to 7
  durationMinutes: 30, // 15, 30, 45, 60
  preferredAreas: ['full body', 'chest', 'back', 'legs', 'waist'], // ['full body', 'chest', 'back', 'shoulders', 'upper arms', 'upper legs', 'waist', 'cardio']
  language: 'en', // 'en' | 'hi'
  isConfigured: false
};

/**
 * Load User Fitness Preferences
 */
export function loadFitnessPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading fitness preferences:', err);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save User Fitness Preferences
 */
export function saveFitnessPreferences(prefs) {
  try {
    const updated = { ...loadFitnessPreferences(), ...prefs, isConfigured: true };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving fitness preferences:', err);
    return prefs;
  }
}

/**
 * Load Generated Workout Plan
 */
export function loadWorkoutPlan() {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Error loading workout plan:', err);
    return null;
  }
}

/**
 * Save Generated Workout Plan
 */
export function saveWorkoutPlan(plan) {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch (err) {
    console.error('Error saving workout plan:', err);
  }
}

/**
 * Load Completed Workout Logs / History
 */
export function loadWorkoutHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error loading workout history:', err);
    return [];
  }
}

/**
 * Record a Completed Workout
 */
export function recordCompletedWorkout(completedEntry) {
  try {
    const history = loadWorkoutHistory();
    const newEntry = {
      id: `wlog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      completedAt: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      workoutTitle: completedEntry.workoutTitle || 'Full Body Workout',
      exerciseIds: completedEntry.exerciseIds || [],
      exerciseNames: completedEntry.exerciseNames || [],
      durationMinutes: completedEntry.durationMinutes || 30,
      targetMuscles: completedEntry.targetMuscles || []
    };

    const updated = [newEntry, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error recording completed workout:', err);
    return [];
  }
}

/**
 * Load Custom Workouts
 */
export function loadCustomWorkouts() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error loading custom workouts:', err);
    return [];
  }
}

/**
 * Save a Custom Workout
 */
export function saveCustomWorkout(customWorkout) {
  try {
    const list = loadCustomWorkouts();
    const newWorkout = {
      id: `cwork_${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: customWorkout.title || 'My Custom Workout',
      exerciseIds: customWorkout.exerciseIds || [],
      estimatedDuration: customWorkout.exerciseIds.length * 6
    };
    const updated = [newWorkout, ...list];
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving custom workout:', err);
    return [];
  }
}
