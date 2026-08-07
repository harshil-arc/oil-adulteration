// ─── DETERMINISTIC FITNESS RECOMMENDATION & PLAN GENERATOR ENGINE ──────
// Generates personalized, safe, equipment-matched workout plans and exercise replacements
// from the 1,324 exercise dataset.

/**
 * Filter exercises by user equipment compatibility
 */
export function filterByEquipment(exercises = [], userEquipment = ['body weight']) {
  if (!userEquipment || userEquipment.length === 0) {
    userEquipment = ['body weight'];
  }

  const normalizedEquip = userEquipment.map(e => String(e).toLowerCase().trim());
  const includesBodyweight = normalizedEquip.includes('body weight');

  return exercises.filter(ex => {
    const exEquip = String(ex.equipment || 'body weight').toLowerCase().trim();
    if (exEquip === 'body weight' && includesBodyweight) return true;
    return normalizedEquip.includes(exEquip);
  });
}

/**
 * Filter exercises by preferred body parts
 */
export function filterByBodyParts(exercises = [], preferredAreas = []) {
  if (!preferredAreas || preferredAreas.length === 0) return exercises;

  const normalizedAreas = preferredAreas.map(a => String(a).toLowerCase().trim());
  if (normalizedAreas.includes('full body') || normalizedAreas.includes('all')) {
    return exercises;
  }

  return exercises.filter(ex => {
    const bp = String(ex.body_part || ex.category || '').toLowerCase().trim();
    const target = String(ex.target || '').toLowerCase().trim();
    return normalizedAreas.some(area => bp.includes(area) || area.includes(bp) || target.includes(area));
  });
}

/**
 * Select a balanced candidate list of exercises matching target areas
 */
export function selectCandidateExercises(exercises = [], preferences = {}, targetCount = 6) {
  const equipmentFiltered = filterByEquipment(exercises, preferences.equipment);
  const areaFiltered = filterByBodyParts(equipmentFiltered, preferences.preferredAreas);

  const pool = areaFiltered.length >= targetCount ? areaFiltered : equipmentFiltered;
  if (pool.length === 0) return exercises.slice(0, targetCount);

  // Group by body_part to balance target muscle groups
  const grouped = {};
  pool.forEach(ex => {
    const key = ex.body_part || 'general';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ex);
  });

  const selected = [];
  const groupKeys = Object.keys(grouped);
  let keyIdx = 0;

  while (selected.length < targetCount && pool.length > selected.length) {
    const key = groupKeys[keyIdx % groupKeys.length];
    const candidate = grouped[key].find(item => !selected.some(s => s.id === item.id));
    if (candidate) {
      selected.push(candidate);
    } else {
      // Find from any remaining pool
      const remaining = pool.find(item => !selected.some(s => s.id === item.id));
      if (remaining) selected.push(remaining);
      else break;
    }
    keyIdx++;
  }

  return selected;
}

/**
 * Generate a complete Weekly Workout Plan based on User Preferences
 */
export function generateWeeklyPlan(allExercises = [], preferences = {}) {
  const daysCount = Number(preferences.workoutDays) || 3;
  const duration = Number(preferences.durationMinutes) || 30;
  const exerciseCountPerDay = Math.max(4, Math.min(8, Math.round(duration / 5)));

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Assign active workout days evenly
  let activeDaysIndices = [0, 2, 4]; // Mon, Wed, Fri
  if (daysCount === 1) activeDaysIndices = [0];
  else if (daysCount === 2) activeDaysIndices = [0, 3];
  else if (daysCount === 4) activeDaysIndices = [0, 1, 3, 4];
  else if (daysCount === 5) activeDaysIndices = [0, 1, 2, 4, 5];
  else if (daysCount === 6) activeDaysIndices = [0, 1, 2, 3, 4, 5];
  else if (daysCount === 7) activeDaysIndices = [0, 1, 2, 3, 4, 5, 6];

  const focusSplits = [
    { title: 'Full Body Activation', areas: ['chest', 'back', 'upper legs', 'waist'] },
    { title: 'Upper Body Focus', areas: ['chest', 'back', 'shoulders', 'upper arms'] },
    { title: 'Lower Body & Core', areas: ['upper legs', 'lower legs', 'waist'] },
    { title: 'Full Body Endurance', areas: ['cardio', 'chest', 'back', 'waist'] },
    { title: 'Push & Core Routine', areas: ['chest', 'shoulders', 'waist'] },
    { title: 'Pull & Legs Routine', areas: ['back', 'upper arms', 'upper legs'] },
    { title: 'Active Mobility & Full Body', areas: ['full body', 'waist'] }
  ];

  const planDays = dayNames.map((dayName, idx) => {
    const isActive = activeDaysIndices.includes(idx);
    if (!isActive) {
      return {
        dayName,
        isRestDay: true,
        title: `${dayName} - Active Rest & Recovery`,
        estimatedDurationMinutes: 15,
        exerciseIds: [],
        exercises: []
      };
    }

    const splitInfo = focusSplits[idx % focusSplits.length];
    const dayPrefs = {
      ...preferences,
      preferredAreas: splitInfo.areas
    };

    const daySelectedExercises = selectCandidateExercises(allExercises, dayPrefs, exerciseCountPerDay);

    return {
      dayName,
      isRestDay: false,
      title: `${dayName} - ${splitInfo.title}`,
      targetAreas: splitInfo.areas,
      estimatedDurationMinutes: duration,
      exerciseIds: daySelectedExercises.map(ex => ex.id),
      exercises: daySelectedExercises
    };
  });

  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    preferencesSnapshot: preferences,
    days: planDays
  };
}

/**
 * Get a replacement exercise targeting the same muscle area with user-compatible equipment
 */
export function getReplacementExercise(currentExercise, allExercises = [], existingExerciseIds = [], preferences = {}) {
  const userEquipment = preferences.equipment || ['body weight'];
  const equipmentFiltered = filterByEquipment(allExercises, userEquipment);

  const currentBp = (currentExercise?.body_part || currentExercise?.category || '').toLowerCase();
  const currentTarget = (currentExercise?.target || '').toLowerCase();

  // Find candidate matching same body part/target not in current workout
  let candidates = equipmentFiltered.filter(ex => {
    if (existingExerciseIds.includes(ex.id)) return false;
    const bp = (ex.body_part || ex.category || '').toLowerCase();
    const tm = (ex.target || '').toLowerCase();
    return bp === currentBp || tm === currentTarget;
  });

  if (candidates.length === 0) {
    candidates = equipmentFiltered.filter(ex => !existingExerciseIds.includes(ex.id));
  }

  if (candidates.length === 0) return null;

  // Pick candidate
  return candidates[Math.floor(Math.random() * candidates.length)];
}
