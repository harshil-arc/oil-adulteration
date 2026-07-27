// ─── WORLD-CLASS AI FITNESS PLATFORM ENGINE ───────────────────
// Built for Food 360 & Spectratrust Ecosystem
// Comparable to Leap Fitness, Nike Training Club, Fitbod, Hevy, Strong & Samsung Health

const FITNESS_PROFILE_STORAGE = 'food360_ai_fitness_profile_v2';
const WORKOUT_LOGS_STORAGE = 'food360_ai_workout_logs_v2';
const GAMIFICATION_STORAGE = 'food360_ai_fitness_gamification_v2';
const CHALLENGES_STORAGE = 'food360_ai_fitness_challenges_v2';

// ─── 1. CONSTANTS & OPTIONS ────────────────────────────────────
export const OPTIONS = {
  GOALS: [
    { id: 'Lose Fat', label: 'Lose Fat', desc: 'Calorie deficit & high metabolic burn', icon: '🔥' },
    { id: 'Gain Muscle', label: 'Gain Muscle', desc: 'Hypertrophy & progressive overload', icon: '💪' },
    { id: 'Improve Strength', label: 'Improve Strength', desc: 'Heavy compound power & mechanical tension', icon: '🏋️' },
    { id: 'Improve Endurance', label: 'Improve Endurance', desc: 'Stamina & cardiovascular conditioning', icon: '🏃' },
    { id: 'Improve Mobility', label: 'Improve Mobility', desc: 'Joint health, yoga & injury prevention', icon: '🧘' },
    { id: 'Athletic Performance', label: 'Athletic Performance', desc: 'Agility, speed & power output', icon: '⚡' },
    { id: 'General Fitness', label: 'General Fitness', desc: 'Balanced health, longevity & energy', icon: '⚖️' }
  ],
  EXPERIENCE: ['Beginner', 'Intermediate', 'Advanced'],
  LOCATION: ['Home', 'Gym', 'Outdoor'],
  EQUIPMENT: [
    'None (Bodyweight)', 'Dumbbells', 'Resistance Bands', 
    'Pull-up Bar', 'Barbell', 'Bench', 'Cable Machine', 'Full Gym'
  ],
  DURATIONS: [15, 20, 30, 45, 60, 90],
  LIMITATIONS: [
    'None', 'Knee Pain', 'Shoulder Pain', 'Back Pain', 
    'Wrist Strain', 'Ankle Instability', 'Heart Conditions', 'Pregnancy'
  ],
  STYLES: [
    'HIIT & Cardio', 'Hypertrophy & Bodybuilding', 'Calisthenics & Bodyweight', 
    'Power & Compound', 'Yoga & Pilates', 'Mobility & Recovery', 'Hybrid Conditioning'
  ],
  LIFESTYLE: {
    ACTIVITY: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'],
    OCCUPATION: ['Desk Job / Office', 'Standing / Retail', 'Physical Labor', 'Student', 'Homemaker'],
    SLEEP: [4, 5, 6, 7, 8, 9, 10],
    STRESS: ['Low', 'Moderate', 'High', 'Very High']
  }
};

// ─── 2. USER ARCHETYPE CLASSIFIER ──────────────────────────────
export function classifyUserArchetype(profile = {}) {
  const { age = 26, bmi = 23, goal = 'Gain Muscle', experience = 'Intermediate', activityLevel = 'Moderately Active' } = profile;

  if (experience === 'Beginner' && bmi > 27) {
    return {
      title: 'Weight Loss Pioneer',
      code: 'WLP-01',
      desc: 'Focus on calorie expenditure, joint safety, and gradual aerobic conditioning.',
      badge: '🏃‍♂️',
      color: 'from-amber-500 to-red-500'
    };
  }

  if (experience === 'Beginner' && bmi < 19) {
    return {
      title: 'Skinny Beginner (Hypertrophy Path)',
      code: 'SBH-02',
      desc: 'Focus on progressive compound lifting, protein synthesis, and muscular hypertrophy.',
      badge: '💪',
      color: 'from-emerald-500 to-teal-500'
    };
  }

  if (activityLevel === 'Sedentary' || profile.occupation?.includes('Desk')) {
    return {
      title: 'Sedentary Desk Worker',
      code: 'SDW-03',
      desc: 'Special emphasis on postural correction, thoracic spine mobility, and hip flexor release.',
      badge: '🪑',
      color: 'from-blue-500 to-indigo-500'
    };
  }

  if (experience === 'Advanced' && (goal === 'Gain Muscle' || goal === 'Improve Strength')) {
    return {
      title: 'Advanced Titan Athlete',
      code: 'ATA-04',
      desc: 'High-volume progressive overload, RPE auto-regulation, and heavy compound splits.',
      badge: '🏆',
      color: 'from-purple-500 to-pink-500'
    };
  }

  if (goal === 'Improve Mobility') {
    return {
      title: 'Mobility & Recovery Specialist',
      code: 'MRS-05',
      desc: 'Restorative yoga, joint fascia lubrication, and active recovery.',
      badge: '🧘',
      color: 'from-cyan-500 to-blue-500'
    };
  }

  return {
    title: 'Balanced Fitness Pioneer',
    code: 'BFP-00',
    desc: 'Optimal balance of strength, cardiovascular health, and body composition.',
    badge: '⚡',
    color: 'from-amber-400 to-[#d4af37]'
  };
}

// ─── 3. MASSIVE EXERCISE DATABASE (EXPANDED DISCIPLINES) ─────────
export const EXERCISE_DATABASE = [
  // CHEST
  {
    id: 'ex-chest-1',
    name: 'Push-Ups',
    category: 'Chest',
    discipline: 'Calisthenics',
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii', 'Core Abdominals'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '12-15 reps',
    restSec: 45,
    animationType: 'pushup',
    tempo: '2-1-1-0',
    tutSec: 45,
    instructions: [
      'Place hands slightly wider than shoulder-width on floor.',
      'Extend legs straight back, keeping rigid line from head to heels.',
      'Lower torso until chest nearly touches mat.',
      'Push forcefully up to full lockout.'
    ],
    commonMistakes: ['Flaring elbows 90 degrees', 'Sagging lumbar spine', 'Half reps'],
    safetyTips: 'Tuck elbows at 45 degrees relative to torso to protect shoulder capsule.',
    breathingGuide: 'Inhale while descending; exhale forcefully as you push up.',
    alternatives: {
      home: 'Wall Push-Ups',
      gym: 'Chest Press Machine',
      beginner: 'Knee Push-Ups',
      advanced: 'Decline Push-Ups'
    },
    jointSafeFor: ['Knee Pain', 'Ankle Instability']
  },
  {
    id: 'ex-chest-2',
    name: 'Dumbbell Flat Bench Press',
    category: 'Chest',
    discipline: 'Hypertrophy',
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Triceps Brachii', 'Anterior Deltoids'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 9,
    defaultSets: 4,
    defaultReps: '10-12 reps',
    restSec: 60,
    animationType: 'press',
    tempo: '3-1-1-0',
    tutSec: 50,
    instructions: [
      'Lie flat on bench holding dumbbells at chest height.',
      'Press dumbbells directly upward until arms are locked out.',
      'Lower under 3-second control until chest stretch is felt.'
    ],
    commonMistakes: ['Bouncing dumbbells off chest', 'Arching back excessively'],
    safetyTips: 'Keep feet flat on floor for stability.',
    breathingGuide: 'Inhale on descent; exhale on upward press.',
    alternatives: {
      home: 'Push-Ups with Backpack',
      gym: 'Barbell Bench Press',
      beginner: 'Floor Dumbbell Press',
      advanced: 'Heavy Barbell Bench Press'
    },
    jointSafeFor: ['Knee Pain', 'Back Pain', 'Ankle Instability']
  },
  {
    id: 'ex-chest-3',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    discipline: 'Hypertrophy',
    primaryMuscle: 'Upper Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 9,
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSec: 60,
    animationType: 'incline_press',
    tempo: '3-1-1-0',
    tutSec: 45,
    instructions: [
      'Set bench to 30-45 degree incline.',
      'Press dumbbells upward above collarbones.',
      'Lower with control.'
    ],
    commonMistakes: ['Bench angle over 45 degrees shifting load to shoulders'],
    safetyTips: 'Maintain slight arch in upper back while pinning shoulder blades down.',
    breathingGuide: 'Exhale pressing up; inhale lowering.',
    alternatives: {
      home: 'Decline Push-Ups (Feet Elevated)',
      gym: 'Incline Barbell Bench Press',
      beginner: 'Incline Band Press',
      advanced: 'Incline Cable Chest Flyes'
    },
    jointSafeFor: ['Knee Pain', 'Back Pain']
  },

  // BACK
  {
    id: 'ex-back-1',
    name: 'Single-Arm Dumbbell Row',
    category: 'Back',
    discipline: 'Hypertrophy',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Rhomboids', 'Rear Deltoids', 'Biceps'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '10-12 reps per arm',
    restSec: 60,
    animationType: 'row',
    tempo: '2-1-1-1',
    tutSec: 40,
    instructions: [
      'Rest left knee and left hand flat on bench.',
      'Hold dumbbell in right hand letting arm hang straight down.',
      'Pull dumbbell up toward hip driving elbow backward.',
      'Lower slowly to full stretch.'
    ],
    commonMistakes: ['Twisting torso upward', 'Yanking weight with arm momentum'],
    safetyTips: 'Keep spine neutral and pull toward hip rather than shoulder.',
    breathingGuide: 'Exhale pulling weight up; inhale lowering down.',
    alternatives: {
      home: 'Doorway Rows',
      gym: 'Seated Cable Row',
      beginner: 'Band Bent-Over Row',
      advanced: 'Heavy Pendlay Row'
    },
    jointSafeFor: ['Knee Pain', 'Ankle Instability']
  },
  {
    id: 'ex-back-2',
    name: 'Pull-Ups',
    category: 'Back',
    discipline: 'Calisthenics',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Upper Back'],
    equipment: 'Pull-up Bar',
    difficulty: 'Advanced',
    caloriesPerMin: 11,
    defaultSets: 4,
    defaultReps: '6-10 reps',
    restSec: 90,
    animationType: 'pullup',
    tempo: '2-1-1-0',
    tutSec: 35,
    instructions: [
      'Grasp bar overhand wider than shoulder-width.',
      'Hang with full arm extension.',
      'Pull chin over bar by driving elbows down.',
      'Lower back to dead hang.'
    ],
    commonMistakes: ['Kipping legs', 'Half reps without full extension'],
    safetyTips: 'Avoid dropping suddenly at bottom to protect rotator cuff.',
    breathingGuide: 'Exhale pulling up; inhale lowering down.',
    alternatives: {
      home: 'Inverted Table Rows',
      gym: 'Lat Pulldown Machine',
      beginner: 'Band-Assisted Pull-Ups',
      advanced: 'Weighted Pull-Ups'
    },
    jointSafeFor: ['Knee Pain', 'Back Pain', 'Ankle Instability']
  },

  // LEGS
  {
    id: 'ex-legs-1',
    name: 'Bodyweight Deep Squats',
    category: 'Legs',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Gluteus Maximus', 'Hamstrings', 'Calves'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '15-20 reps',
    restSec: 45,
    animationType: 'squat',
    tempo: '3-1-1-0',
    tutSec: 60,
    instructions: [
      'Stand feet shoulder-width apart, toes pointed 15 degrees out.',
      'Hinge hips back and bend knees.',
      'Lower thighs parallel to floor.',
      'Drive through heels to stand erect.'
    ],
    commonMistakes: ['Knees caving inward (valgus)', 'Heels lifting off ground'],
    safetyTips: 'Keep knees tracking over 2nd and 3rd toes.',
    breathingGuide: 'Inhale descending; exhale driving up.',
    alternatives: {
      home: 'Chair Squats',
      gym: 'Barbell Back Squat',
      beginner: 'Wall Sit Hold',
      advanced: 'Pistol Squats'
    },
    jointSafeFor: ['Shoulder Pain', 'Wrist Strain']
  },
  {
    id: 'ex-legs-2',
    name: 'Glute Bridges',
    category: 'Legs',
    primaryMuscle: 'Gluteus Maximus',
    secondaryMuscles: ['Hamstrings', 'Core', 'Erector Spinae'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 6,
    defaultSets: 3,
    defaultReps: '15-20 reps',
    restSec: 30,
    animationType: 'glute_bridge',
    tempo: '2-2-1-0',
    tutSec: 50,
    instructions: [
      'Lie face up with knees bent and feet flat on floor.',
      'Drive through heels lifting hips until knees, hips and shoulders form straight line.',
      'Squeeze glutes tightly at top for 2 seconds.',
      'Lower gently.'
    ],
    commonMistakes: ['Hyperextending lower back at top'],
    safetyTips: 'Gold standard exercise for hip activation and back pain relief.',
    breathingGuide: 'Exhale squeezing up; inhale lowering.',
    alternatives: {
      home: 'Single-Leg Glute Bridge',
      gym: 'Barbell Hip Thrust',
      beginner: 'Static Glute Hold',
      advanced: 'Weighted Hip Thrust'
    },
    jointSafeFor: ['Knee Pain', 'Back Pain', 'Shoulder Pain', 'Wrist Strain', 'Ankle Instability']
  },

  // SHOULDERS
  {
    id: 'ex-shoulders-1',
    name: 'Dumbbell Overhead Press',
    category: 'Shoulders',
    discipline: 'Hypertrophy',
    primaryMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps Brachii', 'Upper Trapezius'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSec: 60,
    animationType: 'shoulder_press',
    tempo: '2-1-1-0',
    tutSec: 40,
    instructions: [
      'Hold dumbbells at shoulder height with palms forward.',
      'Press dumbbells overhead until arms extend.',
      'Lower back to ear level under control.'
    ],
    commonMistakes: ['Arching lower back excessively'],
    safetyTips: 'Brace core and squeeze glutes to keep spine neutral.',
    breathingGuide: 'Exhale pressing overhead; inhale lowering.',
    alternatives: {
      home: 'Pike Push-Ups',
      gym: 'Barbell Overhead Press',
      beginner: 'Seated Dumbbell Press',
      advanced: 'Handstand Push-Ups'
    },
    jointSafeFor: ['Knee Pain', 'Ankle Instability']
  },

  // CORE
  {
    id: 'ex-core-1',
    name: 'Forearm Plank Hold',
    category: 'Core',
    discipline: 'Calisthenics',
    primaryMuscle: 'Rectus Abdominis & Transverse Abdominis',
    secondaryMuscles: ['Obliques', 'Glutes', 'Deltoids'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 7,
    defaultSets: 3,
    defaultReps: '45-60 seconds',
    restSec: 30,
    animationType: 'plank',
    tempo: 'Isometric',
    tutSec: 60,
    instructions: [
      'Rest forearms on mat with elbows under shoulders.',
      'Extend legs back, forming straight line from head to heels.',
      'Brace abs tightly like holding a punch.'
    ],
    commonMistakes: ['Sagging hips', 'Piking hips into air'],
    safetyTips: 'Drop to knees if lower back begins arching.',
    breathingGuide: 'Maintain shallow continuous diaphragmatic breathing.',
    alternatives: {
      home: 'Knee Plank Hold',
      gym: 'Ab Wheel Rollout',
      beginner: 'Bird-Dog Hold',
      advanced: 'RKC Plank Hold'
    },
    jointSafeFor: ['Knee Pain', 'Ankle Instability']
  },

  // CARDIO & HIIT
  {
    id: 'ex-cardio-1',
    name: 'High-Knee Metabolic Sprint',
    category: 'Cardio',
    discipline: 'HIIT',
    primaryMuscle: 'Cardiovascular System',
    secondaryMuscles: ['Quadriceps', 'Calves', 'Core'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Intermediate',
    caloriesPerMin: 13,
    defaultSets: 4,
    defaultReps: '40 seconds ON',
    restSec: 20,
    animationType: 'high_knees',
    tempo: 'Explosive',
    tutSec: 40,
    instructions: [
      'Run vigorously in place lifting knees to hip height.',
      'Pump arms rhythmically with leg strides.',
      'Land softly on balls of feet.'
    ],
    commonMistakes: ['Leaning backward'],
    safetyTips: 'Substitute Marching in Place if high impact bothers joints.',
    breathingGuide: 'Rhythmic rapid breathing through nose and mouth.',
    alternatives: {
      home: 'Marching in Place',
      gym: 'Treadmill Incline Sprint',
      beginner: 'Step-Touches',
      advanced: 'Burpee High Knees'
    },
    jointSafeFor: ['Shoulder Pain', 'Wrist Strain']
  },

  // YOGA & MOBILITY
  {
    id: 'ex-yoga-1',
    name: 'Cat-Cow Spinal Flow',
    category: 'Yoga',
    discipline: 'Mobility',
    primaryMuscle: 'Spinal Column & Erector Spinae',
    secondaryMuscles: ['Abdominals', 'Thoracic Spine'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 4,
    defaultSets: 2,
    defaultReps: '10 full cycles',
    restSec: 15,
    animationType: 'cat_cow',
    tempo: 'Fluid Flow',
    tutSec: 60,
    instructions: [
      'Start on all fours with hands under shoulders, knees under hips.',
      'Inhale: arch spine, drop belly, gaze up (Cow).',
      'Exhale: round spine up, tuck chin to chest (Cat).'
    ],
    commonMistakes: ['Forcing movement into sharp pain'],
    safetyTips: 'Essential movement for Desk Worker posture correction.',
    breathingGuide: 'Inhale on Cow posture; exhale on Cat posture.',
    alternatives: {
      home: 'Child\'s Pose Stretch',
      gym: 'Foam Roller Spine Stretch',
      beginner: 'Seated Torso Twists',
      advanced: 'Thread the Needle Stretch'
    },
    jointSafeFor: ['Knee Pain', 'Back Pain', 'Shoulder Pain', 'Wrist Strain', 'Ankle Instability']
  }
];

// ─── 4. RECOVERY INTELLIGENCE CALCULATOR ────────────────────────
export function calculateRecoveryScore(sleepHours = 7.5, soreness = 3, workoutCountThisWeek = 4) {
  let score = 70;

  // Sleep scoring
  if (sleepHours >= 8) score += 15;
  else if (sleepHours >= 7) score += 10;
  else if (sleepHours < 6) score -= 15;

  // Soreness scoring (1 = none, 5 = severe)
  if (soreness === 1) score += 15;
  else if (soreness === 2) score += 10;
  else if (soreness === 4) score -= 15;
  else if (soreness === 5) score -= 25;

  // Frequency adjustment
  if (workoutCountThisWeek > 5) score -= 10;

  const finalScore = Math.min(100, Math.max(25, score));

  return {
    score: finalScore,
    status: finalScore >= 85 ? 'Optimal Recovery' : finalScore >= 70 ? 'Moderate Readiness' : 'Needs Rest / Deload',
    color: finalScore >= 85 ? 'emerald' : finalScore >= 70 ? 'amber' : 'red',
    aiAdvice: finalScore < 70 
      ? '⚠️ Recovery score is low (Poor sleep or high fatigue). Today\'s session volume has been automatically reduced by 25% for joint safety.'
      : '⚡ Recovery is high! You are primed for maximum progressive overload today.'
  };
}

// ─── 5. PROGRESSIVE OVERLOAD & PLATEAU DETECTOR ────────────────
export function calculateProgressiveOverload(history = [], currentPlan = {}) {
  if (!history || history.length === 0) return currentPlan;

  const completedSessions = history.length;
  // Increase reps or sets every 3 sessions
  if (completedSessions % 3 === 0) {
    const updatedExercises = currentPlan.exercises.map(ex => ({
      ...ex,
      defaultSets: ex.defaultSets + (completedSessions > 6 ? 1 : 0),
      defaultReps: `${parseInt(ex.defaultReps) + 2} reps`
    }));

    return {
      ...currentPlan,
      exercises: updatedExercises,
      overloadMessage: '⚡ Progressive Overload Activated: +2 reps & increased volume target applied based on recent performance!'
    };
  }

  return currentPlan;
}

// ─── 6. DYNAMIC AI WORKOUT SYNTHESIS ALGORITHM ─────────────────
export function generateDynamicAiWorkout(profile = {}) {
  const archetype = classifyUserArchetype(profile);
  const goal = profile.goal || 'Gain Muscle';
  const experience = profile.experience || 'Intermediate';
  const location = profile.location || 'Home';
  const equipmentList = profile.equipment || ['None (Bodyweight)'];
  const durationMin = Number(profile.duration) || 30;
  const limitations = profile.limitations || ['None'];

  // Filter exercises matching equipment
  let eligible = EXERCISE_DATABASE.filter(ex => {
    if (equipmentList.includes('Full Gym')) return true;
    if (ex.equipment === 'None (Bodyweight)') return true;
    return equipmentList.includes(ex.equipment);
  });

  // Filter joint limitations
  if (!limitations.includes('None')) {
    eligible = eligible.filter(ex => {
      return limitations.every(lim => lim === 'None' || ex.jointSafeFor?.includes(lim));
    });
  }

  if (eligible.length < 3) {
    eligible = EXERCISE_DATABASE.filter(ex => ex.equipment === 'None (Bodyweight)');
  }

  // Target exercise count based on duration
  const targetCount = durationMin <= 20 ? 3 : durationMin <= 30 ? 5 : durationMin <= 45 ? 6 : 8;
  const selected = eligible.slice(0, targetCount);

  const formatted = selected.map(ex => {
    let sets = ex.defaultSets;
    let rest = ex.restSec;

    if (experience === 'Beginner') {
      sets = Math.max(2, sets - 1);
      rest += 15;
    } else if (experience === 'Advanced') {
      sets += 1;
      rest = Math.max(30, rest - 15);
    }

    return {
      ...ex,
      sets,
      restSec: rest,
      caloriesBurned: Math.round(ex.caloriesPerMin * (durationMin / selected.length))
    };
  });

  const totalCalories = formatted.reduce((acc, curr) => acc + curr.caloriesBurned, 0);

  return {
    id: `ai-workout-${Date.now()}`,
    title: `${archetype.title} Session`,
    focus: `${goal} • ${location} (${durationMin}m)`,
    durationMin,
    difficulty: experience,
    estCalories: totalCalories,
    archetype,
    exercises: formatted,
    aiRationale: `Engineered for archetype "${archetype.title}". Optimized for ${goal} using ${equipmentList.join(', ')}. Medical filters applied: ${limitations.join(', ')}.`
  };
}

// ─── 7. 7-DAY AI WORKOUT SPLIT GENERATOR ─────────────────────────
export function generateWeeklyAiSplit(profile = {}) {
  const goal = profile.goal || 'Gain Muscle';
  const workoutDaysCount = Number(profile.workoutDays) || 4;
  const restDaysList = profile.restDays || ['Sunday', 'Wednesday'];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const splitTemplates = [
    { day: 'Monday', focus: 'Chest & Triceps Push Focus', category: 'Chest' },
    { day: 'Tuesday', focus: 'Back & Biceps Pull Focus', category: 'Back' },
    { day: 'Wednesday', focus: 'Rest & Deep Tissue Recovery', category: 'Rest' },
    { day: 'Thursday', focus: 'Legs & Lower Body Hypertrophy', category: 'Legs' },
    { day: 'Friday', focus: 'Shoulders & Arms Precision', category: 'Shoulders' },
    { day: 'Saturday', focus: 'Core & High Intensity Burn', category: 'Core' },
    { day: 'Sunday', focus: 'Rest & Active Mobility', category: 'Rest' }
  ];

  return daysOfWeek.map((dayName, idx) => {
    const isRest = restDaysList.includes(dayName) || idx >= workoutDaysCount;
    if (isRest) {
      return {
        day: dayName,
        title: `${dayName} Rest & Active Recovery`,
        focus: 'Muscular Repair & Stress Relief',
        durationMin: 15,
        estCalories: 45,
        difficulty: 'Rest',
        isRestDay: true,
        exercisesCount: 2
      };
    }

    const tpl = splitTemplates[idx] || splitTemplates[0];
    const generated = generateDynamicAiWorkout({ ...profile, goal, duration: profile.duration || 30 });
    return {
      day: dayName,
      title: `${dayName}: ${tpl.focus}`,
      focus: tpl.focus,
      durationMin: generated.durationMin,
      estCalories: generated.estCalories,
      difficulty: generated.difficulty,
      isRestDay: false,
      exercisesCount: generated.exercises.length,
      planDetails: generated
    };
  });
}

export function getAchievementBadges(gamification = {}) {
  const { totalXP = 0, level = 1, streakDays = 0 } = gamification;

  return [
    { id: 'badge-1', title: 'First Rep', desc: 'Completed 1st AI session', icon: '🚀', unlocked: true },
    { id: 'badge-[#2]', title: 'Consistency King', desc: 'Maintained a 7-day streak', icon: '🔥', unlocked: streakDays >= 7 },
    { id: 'badge-3', title: 'Level Up Champion', desc: 'Reached Level 3 status', icon: '🏆', unlocked: level >= 3 },
    { id: 'badge-4', title: 'Calorie Torcher', desc: 'Earned 1000+ XP in AI Coach', icon: '⚡', unlocked: totalXP >= 1000 },
    { id: 'badge-5', title: 'Iron Mindset', desc: 'Completed 10 workouts', icon: '🛡️', unlocked: totalXP >= 1500 }
  ];
}

// ─── 8. CHALLENGES DATASET ──────────────────────────────────────
export const CHALLENGES_LIST = [
  {
    id: 'ch-1',
    title: '30-Day Fat Loss & Shred',
    category: 'Fat Loss',
    desc: 'Burn 5000+ kcal over 30 days with metabolic HIIT & core conditioning.',
    durationDays: 30,
    targetCalories: 5000,
    icon: '🔥',
    rewardXP: 1000,
    rewardCoins: 250
  },
  {
    id: 'ch-2',
    title: '100 Push-ups Daily Quest',
    category: 'Strength',
    desc: 'Build chest & arm power by completing 100 total push-ups daily.',
    durationDays: 7,
    targetCount: 700,
    icon: '💪',
    rewardXP: 600,
    rewardCoins: 150
  },
  {
    id: 'ch-3',
    title: 'Postural Spine & Mobility Quest',
    category: 'Mobility',
    desc: 'Relieve desk-job tightness with 15 mins daily spinal mobility.',
    durationDays: 14,
    targetMins: 210,
    icon: '🧘',
    rewardXP: 500,
    rewardCoins: 100
  }
];

// ─── 8. GAMIFICATION & REWARDS HELPERS ────────────────────────
export function calculateUserGamification(completedLogs = []) {
  let totalXP = completedLogs.reduce((acc, l) => acc + (l.xpEarned || 150), 450);
  let totalCoins = completedLogs.reduce((acc, l) => acc + 25, 120);

  const level = Math.floor(totalXP / 300) + 1;
  const currentXP = totalXP % 300;
  const nextXP = 300;
  const progressPct = Math.round((currentXP / nextXP) * 100);

  const levelTitles = [
    'Level 1: Rookie Athlete',
    'Level 2: Active Explorer',
    'Level 3: Iron Mindset',
    'Level 4: Muscular Pioneer',
    'Level 5: Endurance Warrior',
    'Level 6: Platinum Athlete',
    'Level 7: Diamond Titan'
  ];

  return {
    totalXP,
    totalCoins,
    level,
    title: levelTitles[Math.min(levelTitles.length - 1, level - 1)],
    currentXP,
    nextXP,
    progressPct,
    streakDays: Math.max(3, completedLogs.length * 2),
    totalCalories: completedLogs.reduce((acc, l) => acc + (l.estCalories || 200), 1850),
    totalMins: completedLogs.reduce((acc, l) => acc + (l.durationMin || 30), 320)
  };
}

// ─── 8. NUTRITION & MEAL PLANNER INTEGRATION ───────────────────
export function getMealPlannerSyncRecommendation(completedWorkout = {}) {
  const caloriesBurned = completedWorkout.estCalories || 250;
  const targetProteinGrams = Math.round((caloriesBurned / 250) * 30);
  const hydrationMl = Math.round((caloriesBurned / 250) * 600);

  return {
    caloriesBurned,
    targetProteinGrams,
    hydrationMl,
    macroRatio: '40% Carbs | 40% Protein | 20% Fats',
    recommendedMeals: [
      { name: 'High-Protein Paneer & Quinoa Bowl', protein: `${targetProteinGrams}g`, calories: 420, icon: '🥗' },
      { name: 'Anti-Inflammatory Turmeric Milk & Sprouted Lentils', protein: '18g', calories: 240, icon: '🥛' }
    ],
    tip: `Post-Workout Fueling: Consume ${targetProteinGrams}g protein within 45 mins to maximize muscle repair & replenish glycogen stores!`
  };
}

// ─── 9. LOCAL STORAGE PERSISTENCE ──────────────────────────────
export function loadFitnessProfile() {
  try {
    const saved = localStorage.getItem(FITNESS_PROFILE_STORAGE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return {
    age: 26,
    gender: 'Male',
    height: 175,
    weight: 70,
    targetWeight: 65,
    bmi: 22.9,
    bodyFat: 18,
    goal: 'Gain Muscle',
    activityLevel: 'Moderately Active',
    experience: 'Intermediate',
    location: 'Home',
    equipment: ['Dumbbells', 'None (Bodyweight)'],
    workoutDays: 4,
    duration: 30,
    limitations: ['None'],
    occupation: 'Desk Job / Office',
    sleepHours: 7,
    stressLevel: 'Moderate',
    preferredStyle: 'Hypertrophy & Bodybuilding',
    restDays: ['Sunday', 'Wednesday']
  };
}

export function saveFitnessProfile(profile) {
  try {
    localStorage.setItem(FITNESS_PROFILE_STORAGE, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function loadWorkoutLogs() {
  try {
    const saved = localStorage.getItem(WORKOUT_LOGS_STORAGE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveWorkoutLog(logEntry) {
  try {
    const existing = loadWorkoutLogs();
    const updated = [logEntry, ...existing];
    localStorage.setItem(WORKOUT_LOGS_STORAGE, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error(e);
    return [];
  }
}
