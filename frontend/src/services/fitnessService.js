// ─── FOOD 360 AI FITNESS & EXERCISE COACH SERVICE ──────────

const FITNESS_PROFILE_KEY = 'spectratrust_fitness_profile';
const WORKOUT_LOGS_KEY = 'spectratrust_workout_logs';
const WATER_LOGS_KEY = 'spectratrust_water_logs';

export const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const EQUIPMENT_OPTIONS = ['None (Bodyweight)', 'Resistance Bands', 'Dumbbells', 'Full Gym'];
export const FITNESS_GOALS = ['Weight Loss', 'Muscle Building', 'General Fitness', 'Endurance', 'Flexibility'];
export const HEALTH_CONDITIONS_LIST = ['Diabetes', 'Hypertension', 'Obesity', 'Arthritis', 'PCOS', 'Back Pain', 'Knee Pain'];
export const LIFESTYLE_OPTIONS = ['Student', 'Office Worker', 'Homemaker', 'Athlete', 'Senior Citizen'];

/**
 * Rich Exercise Library Database with Full Instructions, Safety & Anatomy
 */
export function getExerciseLibrary() {
  return [
    {
      id: 'ex-1',
      name: 'Push-Ups',
      category: 'Strength',
      muscleGroup: 'Chest, Shoulders & Triceps',
      primaryMuscles: ['Pectoralis Major', 'Anterior Deltoids'],
      secondaryMuscles: ['Triceps Brachii', 'Core Abdominals'],
      difficulty: 'Intermediate',
      sets: 3,
      reps: '12-15 reps',
      restTimeSec: 60,
      caloriesBurnedPerSet: 15,
      equipmentRequired: 'None (Bodyweight)',
      jointSafe: true,
      animationType: 'pushup',
      description: 'Fundamental upper-body compound exercise that strengthens chest, shoulders, and triceps.',
      purpose: 'Builds horizontal pushing strength and core stability.',
      howToPerform: [
        'Place hands slightly wider than shoulder-width apart on the floor.',
        'Extend legs back so you are balanced on hands and toes, forming a straight line from head to heels.',
        'Lower your torso slowly until your chest nearly touches the floor, keeping elbows at a 45-degree angle.',
        'Push powerfully back up to the starting position while exhaling.'
      ],
      commonMistakes: [
        'Flaring elbows out at 90 degrees (strains shoulder joints).',
        'Sagging hips or arching lower back excessively.',
        'Partial range of motion (not lowering chest fully).'
      ],
      benefits: [
        'Builds functional upper-body pressing power.',
        'Engages core stabilizers without requiring gym equipment.',
        'Improves posture and shoulder girdle stability.'
      ],
      precautions: 'Avoid heavy volume if recovering from acute wrist or shoulder impingement.',
      breathingTechnique: 'Inhale on the way down; exhale as you push upward.',
      whoShouldAvoid: 'Individuals with active rotator cuff tears or severe wrist arthritis.',
      alternativeExercises: ['Wall Push-Ups', 'Incline Dumbbell Press', 'Chest Press Machine']
    },
    {
      id: 'ex-2',
      name: 'Bodyweight Squats',
      category: 'Legs',
      muscleGroup: 'Quadriceps, Glutes & Hamstrings',
      primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
      secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
      difficulty: 'Beginner',
      sets: 3,
      reps: '15-20 reps',
      restTimeSec: 60,
      caloriesBurnedPerSet: 18,
      equipmentRequired: 'None (Bodyweight)',
      jointSafe: false, // Knee caution
      animationType: 'squat',
      description: 'Essential lower-body compound movement strengthening thighs, glutes, and hips.',
      purpose: 'Enhances leg power, hip mobility, and daily functional movement.',
      howToPerform: [
        'Stand with feet shoulder-width apart, toes pointed slightly outward.',
        'Inhale and sit back into your hips as if sitting down into an invisible chair.',
        'Lower thighs until parallel with the floor, keeping knees tracking over toes.',
        'Drive through your heels to stand back up, squeezing glutes at top.'
      ],
      commonMistakes: [
        'Knees caving inward (valgus collapse).',
        'Lifting heels off the ground.',
        'Rounding the lower back at the bottom of the squat.'
      ],
      benefits: [
        'Strengthens major leg muscles and hip joints.',
        'Increases calorie expenditure and metabolic rate.',
        'Improves lower body mobility and balance.'
      ],
      precautions: 'Perform chair squats or limit depth if experiencing acute knee pain.',
      breathingTechnique: 'Inhale while descending; exhale while driving upward.',
      whoShouldAvoid: 'Individuals with severe meniscus tears or unmanaged knee joint inflammation.',
      alternativeExercises: ['Chair Squats', 'Glute Bridges', 'Leg Press Machine']
    },
    {
      id: 'ex-3',
      name: 'Dumbbell Bicep Curls',
      category: 'Arms',
      muscleGroup: 'Biceps & Forearms',
      primaryMuscles: ['Biceps Brachii'],
      secondaryMuscles: ['Brachialis', 'Forearm Flexors'],
      difficulty: 'Beginner',
      sets: 3,
      reps: '12 reps',
      restTimeSec: 45,
      caloriesBurnedPerSet: 12,
      equipmentRequired: 'Dumbbells',
      jointSafe: true,
      animationType: 'bicep_curl',
      description: 'Isolation exercise targeting arm flexor muscles.',
      purpose: 'Builds arm pulling strength and bicep muscle definition.',
      howToPerform: [
        'Stand tall holding a dumbbell in each hand with arms fully extended.',
        'Keep elbows pinned close to your torso.',
        'Curl weights upward toward shoulders by contracting biceps.',
        'Slowly lower weights back to starting position under control.'
      ],
      commonMistakes: [
        'Swinging torso or using momentum to lift weight.',
        'Moving elbows forward away from sides.'
      ],
      benefits: [
        'Isolates bicep heads for peak hypertrophy.',
        'Improves grip strength and arm aesthetics.'
      ],
      precautions: 'Do not use excessively heavy weights that force torso swinging.',
      breathingTechnique: 'Exhale while curling upward; inhale while lowering.',
      whoShouldAvoid: 'Individuals with acute bicep tendonitis.',
      alternativeExercises: ['Hammer Curls', 'Resistance Band Curls', 'Chin-Ups']
    },
    {
      id: 'ex-4',
      name: 'Plank Hold',
      category: 'Core',
      muscleGroup: 'Core & Abdominals',
      primaryMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
      secondaryMuscles: ['Obliques', 'Glutes', 'Lower Back'],
      difficulty: 'Beginner',
      sets: 3,
      reps: '45 seconds',
      restTimeSec: 45,
      caloriesBurnedPerSet: 14,
      equipmentRequired: 'None (Bodyweight)',
      jointSafe: true,
      animationType: 'plank',
      description: 'Isometric core exercise strengthening abdominals, spine, and shoulders.',
      purpose: 'Improves core endurance and protects lower back against injury.',
      howToPerform: [
        'Lie face down and place forearms on the floor, elbows under shoulders.',
        'Lift body up onto forearms and toes, forming a rigid straight line.',
        'Squeeze abdominals, glutes, and quads continuously while holding position.'
      ],
      commonMistakes: [
        'Sagging hips toward floor or piking hips high in air.',
        'Holding breath during isometric contraction.'
      ],
      benefits: [
        'Protects lumbar spine by building deep abdominal wall strength.',
        'Improves posture and core stability.'
      ],
      precautions: 'Drop to knees if lower back begins to arch or strain.',
      breathingTechnique: 'Maintain steady, shallow breathing throughout the hold.',
      whoShouldAvoid: 'Pregnant women in 3rd trimester or acute abdominal hernia.',
      alternativeExercises: ['Dead-Bug Hold', 'Bird-Dog', 'Seated Abdominal Crunch']
    },
    {
      id: 'ex-5',
      name: 'Brisk Walking / Incline Walk',
      category: 'Cardio',
      muscleGroup: 'Cardiovascular & Legs',
      primaryMuscles: ['Cardiovascular System', 'Calves'],
      secondaryMuscles: ['Hamstrings', 'Glutes'],
      difficulty: 'Beginner',
      sets: 1,
      reps: '20 minutes',
      restTimeSec: 0,
      caloriesBurnedPerSet: 120,
      equipmentRequired: 'None',
      jointSafe: true,
      animationType: 'walking',
      description: 'Low-impact steady-state cardiovascular exercise ideal for fat loss & heart health.',
      purpose: 'Enhances aerobic capacity, burns calories, and lowers blood sugar.',
      howToPerform: [
        'Walk briskly maintaining an upright posture with head held high.',
        'Swing arms rhythmically at your sides.',
        'Land softly on heels and roll through to push off toes.'
      ],
      commonMistakes: ['Slouching shoulders forward', 'Over-striding.'],
      benefits: [
        'Burns calories gently without joint stress.',
        'Lowers blood pressure and improves insulin sensitivity.'
      ],
      precautions: 'Wear supportive footwear.',
      breathingTechnique: 'Breathe rhythmically in sync with your footsteps.',
      whoShouldAvoid: 'None (Universal low-impact exercise).',
      alternativeExercises: ['Stationary Cycling', 'Elliptical Trainer', 'Water Aerobics']
    },
    {
      id: 'ex-6',
      name: 'Gentle Yoga & Joint Mobility',
      category: 'Flexibility',
      muscleGroup: 'Full Body Flexibility',
      primaryMuscles: ['Hamstrings', 'Spine Flexors', 'Hips'],
      secondaryMuscles: ['Shoulders', 'Calves'],
      difficulty: 'Beginner',
      sets: 1,
      reps: '15 minutes',
      restTimeSec: 0,
      caloriesBurnedPerSet: 60,
      equipmentRequired: 'Yoga Mat (Optional)',
      jointSafe: true,
      animationType: 'yoga',
      description: 'Restorative stretching routine improving joint mobility and stress relief.',
      purpose: 'Relieves muscle tightness, improves posture, and accelerates recovery.',
      howToPerform: [
        'Move slowly through Cat-Cow, Child Pose, and Downward Dog postures.',
        'Hold each stretch for 20-30 seconds without bouncing.'
      ],
      commonMistakes: ['Bouncing into stretches', 'Forcing painful ranges of motion.'],
      benefits: ['Improves range of motion', 'Reduces cortisol and muscular tension.'],
      precautions: 'Never push into sharp joint pain.',
      breathingTechnique: 'Deep diaphragmatic breathing through the nose.',
      whoShouldAvoid: 'None.',
      alternativeExercises: ['Foam Rolling', 'Seated Hamstring Stretch', 'Doorway Chest Stretch']
    }
  ];
}

/**
 * AI Generated Recommendation Rationale Statement
 */
export function getAiWorkoutRationale(profile = {}, workoutPlan = {}) {
  const goal = profile.goal || 'Muscle Building';
  const title = workoutPlan.title || 'Upper Body Strength';
  const focus = workoutPlan.focus || 'Chest & Triceps';

  return `Based on your primary goal (${goal}), your recent nutrition score (94%), recovery history, and previous workout completion, today's workout (${title}) focuses on ${focus} while allowing your lower-body muscles to recover.`;
}

/**
 * Interactive AI Fitness Coach Assistant ("Ask AI Coach")
 */
export function askAiFitnessCoach(prompt = '', currentPlan = {}) {
  const query = prompt.toLowerCase();

  if (query.includes('knee') || query.includes('joint')) {
    return {
      response: '⚠️ Knee joint care activated. I have modified today\'s lower-body exercises to low-impact joint-safe movements (Chair Squats, Glute Bridges, and Wall Sit).',
      modifiedWorkout: {
        title: 'Joint-Safe Lower Body & Mobility',
        focus: 'Low Impact Knee Protection',
        durationMin: 25,
        estCalories: 140,
        exercises: ['Chair Squats', 'Glute Bridges', 'Seated Leg Extensions', 'Hamstring Stretch']
      }
    };
  }

  if (query.includes('20') || query.includes('quick') || query.includes('time')) {
    return {
      response: '⏱️ Express 20-Minute Express Circuit activated! We have streamlined today\'s routine into high-efficiency compound supersets.',
      modifiedWorkout: {
        title: '20-Minute Express Full Body Circuit',
        focus: 'High Efficiency Metabolic Conditioning',
        durationMin: 20,
        estCalories: 180,
        exercises: ['Push-Ups', 'Bodyweight Squats', 'Plank Hold', 'Cool Down']
      }
    };
  }

  if (query.includes('dumbbell') || query.includes('equipment') || query.includes('home')) {
    return {
      response: '🏠 Bodyweight Home Workout Mode activated! No dumbbells or equipment needed.',
      modifiedWorkout: {
        title: 'Bodyweight Calisthenics Home Session',
        focus: 'Zero Equipment Push & Core',
        durationMin: 30,
        estCalories: 210,
        exercises: ['Push-Ups', 'Chair Dips', 'Bodyweight Squats', 'Plank Hold']
      }
    };
  }

  if (query.includes('tired') || query.includes('fatigue') || query.includes('rest')) {
    return {
      response: '🧘 Active Recovery Session recommended! Lowering intensity to restorative yoga & light joint mobility.',
      modifiedWorkout: {
        title: 'Restorative Yoga & Deep Muscle Recovery',
        focus: 'Active Recovery & Stress Relief',
        durationMin: 20,
        estCalories: 90,
        exercises: ['Child Pose', 'Cat-Cow Stretch', 'Hamstring Stretch', 'Deep Meditation']
      }
    };
  }

  return {
    response: `🏋️ AI Coach Recommendation: Today's prescribed session (${currentPlan.title || 'Upper Body Focus'}) is optimal for your current goal. Remember to maintain steady hydration!`,
    modifiedWorkout: currentPlan
  };
}

/**
 * FOOD 360 UNIQUE FEATURE: Post-Workout Meal ↔ Pantry Synchronization
 */
export function getPostWorkoutMealSync(workoutPlan = {}, pantryItems = []) {
  const estCalories = workoutPlan.estCalories || 300;
  const targetProteinGrams = Math.round((estCalories / 300) * 28);
  const hydrationWaterMl = Math.round((estCalories / 300) * 700);

  return {
    proteinTargetGrams: targetProteinGrams,
    hydrationWaterMl,
    recommendedMealName: 'High-Protein Paneer Bhurji & Whole Wheat Roti',
    matchedPantryIngredients: ['Paneer (200g)', 'Whole Wheat Flour', 'Onions & Tomatoes', 'Olive Oil'],
    nutritionSummary: `Post-workout fuel: Target ${targetProteinGrams}g protein & ${hydrationWaterMl}ml water to accelerate muscle protein synthesis & glycogen storage.`,
  };
}

/**
 * AI Weekly 7-Day Workout Generator
 */
export function generateWeeklyWorkoutPlan(profile = {}) {
  const goal = profile.goal || 'Weight Loss';
  const conditions = profile.medicalConditions || [];
  const hasKneeOrBackPain = conditions.includes('Knee Pain') || conditions.includes('Back Pain') || conditions.includes('Arthritis');
  const isSenior = profile.lifestyle === 'Senior Citizen';

  if (isSenior || hasKneeOrBackPain) {
    return [
      { day: 'Monday', title: 'Gentle Mobility & Balance', focus: 'Low Impact Joint Care', durationMin: 20, estCalories: 95, difficulty: 'Beginner', targetMuscles: ['Spine', 'Hips', 'Shoulders'], exercises: ['Chair Squats', 'Wall Push-Ups', 'Gentle Neck & Shoulder Rolls', 'Balance Stance'] },
      { day: 'Tuesday', title: 'Low-Impact Cardio Walk', focus: 'Heart Health', durationMin: 25, estCalories: 130, difficulty: 'Beginner', targetMuscles: ['Cardio', 'Legs'], exercises: ['Brisk Walking', 'Arm Swings', 'Calf Raises'] },
      { day: 'Wednesday', title: 'Core Stability & Posture', focus: 'Spine Support', durationMin: 20, estCalories: 90, difficulty: 'Beginner', targetMuscles: ['Core', 'Lower Back'], exercises: ['Bird-Dog Hold', 'Glute Bridges', 'Seated Torso Twist'] },
      { day: 'Thursday', title: 'Active Recovery & Stretching', focus: 'Flexibility', durationMin: 15, estCalories: 60, difficulty: 'Beginner', targetMuscles: ['Full Body'], exercises: ['Gentle Hamstring Stretch', 'Chest Opener', 'Deep Breathing'] },
      { day: 'Friday', title: 'Light Upper Body Tone', focus: 'Arm & Shoulder Strength', durationMin: 20, estCalories: 100, difficulty: 'Beginner', targetMuscles: ['Chest', 'Arms'], exercises: ['Wall Push-Ups', 'Seated Dumbbell Bicep Curls', 'Seated Overhead Press'] },
      { day: 'Saturday', title: 'Full Body Low-Impact Circuit', focus: 'Overall Vitality', durationMin: 25, estCalories: 140, difficulty: 'Beginner', targetMuscles: ['Full Body'], exercises: ['Chair Squats', 'Seated Row with Bands', 'Step-Touches', 'Cool Down'] },
      { day: 'Sunday', title: 'Rest & Deep Recovery', focus: 'Restoration', durationMin: 15, estCalories: 45, difficulty: 'Beginner', targetMuscles: ['Rest'], exercises: ['Mindful Breathing', 'Gentle Full-Body Stretch'] },
    ];
  }

  if (goal === 'Weight Loss') {
    return [
      { day: 'Monday', title: 'HIIT Cardio & Core Burn', focus: 'High Calorie Burn', durationMin: 35, estCalories: 280, difficulty: 'Intermediate', targetMuscles: ['Cardio', 'Core', 'Legs'], exercises: ['Jumping Jacks', 'Bodyweight Squats', 'Mountain Climbers', 'Plank Hold', 'Cool Down Stretch'] },
      { day: 'Tuesday', title: 'Upper Body & Push Focus', focus: 'Chest, Shoulders & Triceps', durationMin: 30, estCalories: 210, difficulty: 'Intermediate', targetMuscles: ['Chest', 'Shoulders', 'Triceps'], exercises: ['Push-Ups', 'Dumbbell Shoulder Press', 'Tricep Dips', 'Plank'] },
      { day: 'Wednesday', title: 'Lower Body & Glute Burn', focus: 'Legs & Core', durationMin: 35, estCalories: 250, difficulty: 'Intermediate', targetMuscles: ['Quads', 'Glutes', 'Hamstrings'], exercises: ['Bodyweight Squats', 'Lunges', 'Glute Bridges', 'Calf Raises'] },
      { day: 'Thursday', title: 'Active Recovery Yoga', focus: 'Flexibility & Stress Reduction', durationMin: 20, estCalories: 90, difficulty: 'Beginner', targetMuscles: ['Full Body Stretch'], exercises: ['Child Pose', 'Cat-Cow Stretch', 'Hamstring Stretch', 'Deep Meditation'] },
      { day: 'Friday', title: 'Back & Bicep Pull Focus', focus: 'Posterior Chain', durationMin: 30, estCalories: 220, difficulty: 'Intermediate', targetMuscles: ['Back', 'Biceps'], exercises: ['Dumbbell Rows', 'Bicep Curls', 'Supermans', 'Core Crunches'] },
      { day: 'Saturday', title: 'Full Body Endurance Circuit', focus: 'Metabolic Conditioning', durationMin: 40, estCalories: 320, difficulty: 'Advanced', targetMuscles: ['Full Body'], exercises: ['Burpees', 'Squat Jumps', 'Push-Ups', 'Plank Jacks', 'Stretching'] },
      { day: 'Sunday', title: 'Rest & Mobility Restoration', focus: 'Muscular Recovery', durationMin: 15, estCalories: 50, difficulty: 'Beginner', targetMuscles: ['Rest'], exercises: ['Foam Rolling / Gentle Stretching'] },
    ];
  }

  return [
    { day: 'Monday', title: 'Upper Body Strength & Hypertrophy', focus: 'Chest, Shoulders & Triceps', durationMin: 42, estCalories: 325, difficulty: 'Intermediate', targetMuscles: ['Chest', 'Shoulders', 'Triceps'], exercises: ['Push-Ups', 'Dumbbell Bicep Curls', 'Plank Hold', 'Gentle Yoga & Joint Mobility'] },
    { day: 'Tuesday', title: 'Back & Bicep Pull Focus', focus: 'Lats, Rhomboids & Biceps', durationMin: 45, estCalories: 290, difficulty: 'Intermediate', targetMuscles: ['Back', 'Biceps'], exercises: ['Dumbbell Rows', 'Pull-Ups', 'Bicep Curls', 'Reverse Flyes'] },
    { day: 'Wednesday', title: 'Legs & Lower Body Hypertrophy', focus: 'Quads, Hamstrings & Calves', durationMin: 50, estCalories: 360, difficulty: 'Advanced', targetMuscles: ['Quads', 'Glutes', 'Calves'], exercises: ['Bodyweight Squats', 'Romanian Deadlifts', 'Walking Lunges', 'Calf Raises'] },
    { day: 'Thursday', title: 'Core & Mobility Active Rest', focus: 'Core & Joint Mobility', durationMin: 25, estCalories: 110, difficulty: 'Beginner', targetMuscles: ['Core', 'Abs'], exercises: ['Plank Hold', 'Dead-Bug', 'Bird-Dog', 'Hip Opener Stretches'] },
    { day: 'Friday', title: 'Shoulders & Arms Focus', focus: 'Deltoids & Arms', durationMin: 40, estCalories: 260, difficulty: 'Intermediate', targetMuscles: ['Shoulders', 'Biceps', 'Triceps'], exercises: ['Dumbbell Shoulder Press', 'Lateral Raises', 'Bicep Curls', 'Tricep Dips'] },
    { day: 'Saturday', title: 'Full Body Compound Power', focus: 'Strength & Conditioning', durationMin: 45, estCalories: 340, difficulty: 'Advanced', targetMuscles: ['Full Body'], exercises: ['Push-Ups', 'Bodyweight Squats', 'Dumbbell Rows', 'Plank Hold'] },
    { day: 'Sunday', title: 'Complete Muscular Recovery', focus: 'Tissue Repair', durationMin: 15, estCalories: 40, difficulty: 'Beginner', targetMuscles: ['Rest'], exercises: ['Light Walk & Gentle Stretch'] },
  ];
}

/**
 * Synchronized Macro Adapter
 */
export function calculateSyncNutrition(baseTargets = {}, workoutIntensity = 'Heavy Workout Day') {
  const calories = Number(baseTargets.targetCalories) || 2000;
  const protein = Number(baseTargets.targetProtein) || 100;
  const water = Number(baseTargets.waterGoalLiters) || 3.0;

  if (workoutIntensity === 'Heavy Workout Day') {
    return {
      adjustedCalories: calories + 350,
      adjustedProtein: protein + 28,
      adjustedWaterLiters: (water + 0.75).toFixed(1),
      macroTip: '💪 Heavy Workout Day: +28g Protein & +750ml Water added for muscle recovery & glycogen replenishment.',
    };
  }

  return {
    adjustedCalories: calories - 150,
    adjustedProtein: protein,
    adjustedWaterLiters: water.toFixed(1),
    macroTip: '🧘 Active Rest Day: Calorie intake adjusted slightly lower while maintaining protein for muscular repair.',
  };
}

/**
 * Water & Recovery Calculator
 */
export function calculateRecoveryScore(sleepHours = 7.5, waterMl = 2500, workoutCount = 5) {
  let score = 70;
  if (sleepHours >= 7 && sleepHours <= 9) score += 15;
  if (waterMl >= 2500) score += 15;

  const finalScore = Math.min(100, Math.max(30, score));

  return {
    score: finalScore,
    status: finalScore >= 85 ? 'Ready (Optimal)' : finalScore >= 70 ? 'Moderate Recovery' : 'Needs Rest',
    color: finalScore >= 85 ? 'text-emerald-400' : finalScore >= 70 ? 'text-amber-400' : 'text-red-400',
    recommendation: finalScore < 70 ? 'Recovery score is low. Consider light stretching today.' : 'Recovery is optimal! You are ready for today\'s session.',
  };
}

/**
 * Badges Engine
 */
export function getFitnessBadges(completedWorkoutsCount = 12, streakDays = 18, caloriesBurnedTotal = 3400) {
  return [
    { id: 'b1', title: 'First Workout Completed', icon: '🥇', unlocked: completedWorkoutsCount >= 1, desc: 'Started your fitness journey!' },
    { id: 'b2', title: '18-Day Workout Streak', icon: '🔥', unlocked: streakDays >= 18, desc: 'Maintained 18 consecutive active days!' },
    { id: 'b3', title: '50 Workouts Completed', icon: '🏋️', unlocked: completedWorkoutsCount >= 50, desc: 'Halfway to a centurion athlete!' },
    { id: 'b4', title: '10,000 Calories Burned', icon: '💪', unlocked: caloriesBurnedTotal >= 10000, desc: 'Torched 10k calories with AI!' },
    { id: 'b5', title: 'Consistency Champion', icon: '🎯', unlocked: completedWorkoutsCount >= 10, desc: 'Consistently hitting weekly goals!' },
  ];
}

/**
 * Wearable Readiness Payload Generator
 */
export function generateWearableSyncPayload(profile = {}) {
  return {
    syncStatus: 'Ready for Smartwatch / Fitness Band Sync',
    deviceConnected: null,
    heartRateZone: { minBpm: 110, maxBpm: 155 },
    stepTarget: 8000,
    currentSteps: 5420,
    timestamp: new Date().toISOString(),
  };
}
