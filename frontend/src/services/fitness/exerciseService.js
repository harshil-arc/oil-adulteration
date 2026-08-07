// ─── EXERCISE DATA SERVICE ─────────────────────────────────────────
// Clean data access layer for loading, searching, filtering, and normalizing
// the 1,324 exercise dataset (hasaneyldrm/exercises-dataset)

const MEDIA_CDN_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

let cachedExercises = null;
let loadPromise = null;

/**
 * Loads and caches exercises dataset from public JSON
 */
export async function loadExercises() {
  if (cachedExercises) return cachedExercises;

  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const response = await fetch('/data/exercises.json');
        if (!response.ok) {
          throw new Error(`Failed to load exercises: ${response.statusText}`);
        }
        const data = await response.json();
        cachedExercises = data.map(normalizeExercise);
        return cachedExercises;
      } catch (err) {
        console.error('Error loading exercises.json:', err);
        // Fallback array if fetch fails
        cachedExercises = [];
        return cachedExercises;
      } finally {
        loadPromise = null;
      }
    })();
  }

  return loadPromise;
}

/**
 * Synchronously return cached exercises if available
 */
export function getCachedExercisesSync() {
  return cachedExercises || [];
}

/**
 * Normalizes exercise records for consistent runtime access
 */
export function normalizeExercise(raw) {
  const id = String(raw.id || '');
  const name = raw.name || 'Unnamed Exercise';
  const category = (raw.category || raw.body_part || 'general').toLowerCase();
  const bodyPart = (raw.body_part || raw.category || 'full body').toLowerCase();
  const equipment = (raw.equipment || 'body weight').toLowerCase();
  const target = (raw.target || raw.muscle_group || 'general').toLowerCase();
  const muscleGroup = (raw.muscle_group || target).toLowerCase();
  const secondaryMuscles = Array.isArray(raw.secondary_muscles) ? raw.secondary_muscles : [];

  // Media URLs
  const imageRel = raw.image || '';
  const gifRel = raw.gif_url || '';

  const imageUrl = imageRel ? `${MEDIA_CDN_BASE}${imageRel}` : null;
  const gifUrl = gifRel ? `${MEDIA_CDN_BASE}${gifRel}` : null;

  const attribution = raw.attribution || '© Gym visual — https://gymvisual.com/';

  // Instructions normalization
  const instructionsObj = typeof raw.instructions === 'object' && raw.instructions !== null ? raw.instructions : { en: String(raw.instructions || '') };
  const stepsObj = typeof raw.instruction_steps === 'object' && raw.instruction_steps !== null ? raw.instruction_steps : {};

  return {
    id,
    name,
    category,
    body_part: bodyPart,
    equipment,
    target,
    muscle_group: muscleGroup,
    secondary_muscles: secondaryMuscles,
    imageUrl,
    gifUrl,
    imageRel,
    gifRel,
    attribution,
    instructions: instructionsObj,
    instruction_steps: stepsObj
  };
}

/**
 * Helper to retrieve step-by-step instructions array in specified language ('en' | 'hi')
 */
export function getExerciseSteps(exercise, lang = 'en') {
  if (!exercise) return [];
  
  if (exercise.instruction_steps && exercise.instruction_steps[lang] && Array.isArray(exercise.instruction_steps[lang])) {
    return exercise.instruction_steps[lang];
  }

  if (exercise.instruction_steps && exercise.instruction_steps.en && Array.isArray(exercise.instruction_steps.en)) {
    return exercise.instruction_steps.en;
  }

  if (exercise.instructions) {
    const text = exercise.instructions[lang] || exercise.instructions.en || '';
    if (text) return text.split('. ').map(s => s.trim()).filter(Boolean);
  }

  return ['Perform the movement with controlled technique and steady breathing.'];
}

/**
 * Filter exercises by multi-criteria (query, bodyPart, equipment, targetMuscle)
 */
export function filterExercises(exercises, { query = '', bodyPart = 'All', equipment = 'All', targetMuscle = 'All' } = {}) {
  const q = query.trim().toLowerCase();
  const bp = bodyPart.toLowerCase();
  const eq = equipment.toLowerCase();
  const tm = targetMuscle.toLowerCase();

  return exercises.filter(ex => {
    // Text search against name, body_part, target, equipment, secondary muscles
    if (q) {
      const matchesName = ex.name.toLowerCase().includes(q);
      const matchesTarget = ex.target.toLowerCase().includes(q);
      const matchesEquipment = ex.equipment.toLowerCase().includes(q);
      const matchesBody = ex.body_part.toLowerCase().includes(q);
      const matchesSecondary = ex.secondary_muscles.some(m => m.toLowerCase().includes(q));
      if (!matchesName && !matchesTarget && !matchesEquipment && !matchesBody && !matchesSecondary) {
        return false;
      }
    }

    // Body part filter
    if (bp !== 'all' && ex.body_part !== bp && ex.category !== bp) {
      return false;
    }

    // Equipment filter
    if (eq !== 'all' && ex.equipment !== eq) {
      return false;
    }

    // Target muscle filter
    if (tm !== 'all' && ex.target !== tm && ex.muscle_group !== tm) {
      return false;
    }

    return true;
  });
}

/**
 * Extract unique list of Body Parts, Equipment, and Target Muscles from dataset
 */
export function getDatasetMetadata(exercises = []) {
  const bodyParts = new Set(['All']);
  const equipment = new Set(['All']);
  const targetMuscles = new Set(['All']);

  exercises.forEach(ex => {
    if (ex.body_part) bodyParts.add(capitalize(ex.body_part));
    if (ex.equipment) equipment.add(capitalize(ex.equipment));
    if (ex.target) targetMuscles.add(capitalize(ex.target));
  });

  return {
    bodyParts: Array.from(bodyParts),
    equipment: Array.from(equipment),
    targetMuscles: Array.from(targetMuscles)
  };
}

/**
 * Capitalizes string for display
 */
export function capitalize(str = '') {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
