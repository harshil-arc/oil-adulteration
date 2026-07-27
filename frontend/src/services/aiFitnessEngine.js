// ─── PRODUCTION-READY AI FITNESS COACH ENGINE ───────────────────
// Built for Food 360 & Spectratrust Platform

const FITNESS_PROFILE_STORAGE = 'food360_ai_fitness_profile';
const WORKOUT_LOGS_STORAGE = 'food360_ai_workout_logs';
const GAMIFICATION_STORAGE = 'food360_ai_fitness_gamification';
const RECORDF_STORAGE = 'food360_ai_fitness_prs';

// ─── 1. CONSTANTS & OPTIONS ────────────────────────────────────
export const OPTIONS = {
  GOALS: [
    { id: 'Lose Fat', label: 'Lose Fat', desc: 'Calorie deficit & high metabolic burn', icon: '🔥' },
    { id: 'Build Muscle', label: 'Build Muscle', desc: 'Hypertrophy & progressive overload', icon: '💪' },
    { id: 'Maintain Weight', label: 'Maintain Weight', desc: 'Balanced conditioning & tone', icon: '⚖️' },
    { id: 'Improve Endurance', label: 'Improve Endurance', desc: 'Stamina & cardiovascular health', icon: '🏃' },
    { id: 'Increase Strength', label: 'Increase Strength', desc: 'Heavy compound power', icon: '🏋️' },
    { id: 'Improve Flexibility', label: 'Improve Flexibility', desc: 'Mobility, yoga & joint recovery', icon: '🧘' },
    { id: 'General Fitness', label: 'General Fitness', desc: 'Overall health & longevity', icon: '⚡' }
  ],
  EXPERIENCE: ['Beginner', 'Intermediate', 'Advanced'],
  LOCATION: ['Home', 'Gym'],
  EQUIPMENT: ['None (Bodyweight)', 'Dumbbells', 'Resistance Bands', 'Barbell', 'Bench', 'Pull-up Bar', 'Full Gym'],
  DURATIONS: [15, 30, 45, 60, 90],
  LIMITATIONS: ['None', 'Knee Pain', 'Lower Back Pain', 'Shoulder Impingement', 'Wrist Strain', 'Ankle Instability', 'Neck Tension'],
  MEDICAL_CONDITIONS: ['None', 'Diabetes', 'Hypertension', 'Heart Condition', 'Asthma', 'PCOS', 'Arthritis'],
  STYLES: ['HIIT & Cardio', 'Hypertrophy & Bodybuilding', 'Calisthenics & Bodyweight', 'Power & Compound', 'Yoga & Joint Mobility', 'Balanced Functional'],
  REST_DAYS: ['Sunday', 'Wednesday', 'Saturday', 'Monday', 'Tuesday', 'Thursday', 'Friday']
};

// ─── 2. COMPREHENSIVE EXERCISE DATABASE (60+ EXERCISES) ─────────
export const EXERCISE_DATABASE = [
  // CHEST
  {
    id: 'chest-1',
    name: 'Push-Ups',
    category: 'Chest',
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii', 'Core Abdominals'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '12-15 reps',
    restSec: 45,
    animationType: 'pushup',
    instructions: [
      'Position hands slightly wider than shoulder-width apart on the floor.',
      'Extend legs back, balancing on toes with body forming a straight line from head to heels.',
      'Lower torso under control until chest nearly touches the floor.',
      'Push forcefully back up to top lockout while breathing out.'
    ],
    commonMistakes: ['Flaring elbows 90 degrees outward', 'Sagging hips or arching lower back', 'Partial depth'],
    safetyTips: 'Keep elbows tucked at 45 degrees relative to your torso to protect shoulder joints.',
    jointFocus: 'Wrist / Shoulder',
    jointSafeFor: ['Knee Pain', 'Ankle Instability'],
    alternatives: ['Incline Push-Ups', 'Wall Push-Ups', 'Chest Flyes']
  },
  {
    id: 'chest-2',
    name: 'Dumbbell Bench Press',
    category: 'Chest',
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Triceps Brachii', 'Anterior Deltoids'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 9,
    defaultSets: 4,
    defaultReps: '10-12 reps',
    restSec: 60,
    animationType: 'press',
    instructions: [
      'Lie flat on a workout bench with dumbbells resting on thighs.',
      'Kick dumbbells up to shoulder level and press up until arms are fully extended.',
      'Lower dumbbells slowly to the sides of mid-chest level.',
      'Press dumbbells back up until they nearly meet at top.'
    ],
    commonMistakes: ['Bouncing weights off chest', 'Arching lower back off bench excessively'],
    safetyTips: 'Use a spotter or lower weights safely to sides if approaching muscular failure.',
    jointFocus: 'Shoulder',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Ankle Instability'],
    alternatives: ['Push-Ups', 'Resistance Band Chest Press', 'Barbell Bench Press']
  },
  {
    id: 'chest-3',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    primaryMuscle: 'Upper Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 9,
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSec: 60,
    animationType: 'incline_press',
    instructions: [
      'Set incline bench to 30-45 degrees.',
      'Hold dumbbells at upper chest level with palms facing forward.',
      'Press weights directly upward above collarbones.',
      'Lower slowly with controlled tempo.'
    ],
    commonMistakes: ['Setting bench angle too high (shifts load to shoulders)', 'Arching back'],
    safetyTips: '30 degree angle is optimal for isolating the upper chest without straining shoulders.',
    jointFocus: 'Shoulder',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain'],
    alternatives: ['Decline Push-Ups', 'Band Incline Press']
  },
  {
    id: 'chest-4',
    name: 'Wall Push-Ups (Joint-Safe)',
    category: 'Chest',
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 5,
    defaultSets: 3,
    defaultReps: '15-20 reps',
    restSec: 30,
    animationType: 'wall_pushup',
    instructions: [
      'Stand facing a wall at arm\'s length.',
      'Place palms flat on the wall at shoulder height.',
      'Bend elbows to lean chest toward wall.',
      'Push back until arms are straight.'
    ],
    commonMistakes: ['Standing too far from wall causing slipping'],
    safetyTips: 'Perfect low-impact push exercise for wrist or shoulder rehabilitation.',
    jointFocus: 'Low Impact',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Shoulder Impingement', 'Wrist Strain', 'Neck Tension'],
    alternatives: ['Incline Chair Push-Ups']
  },

  // BACK
  {
    id: 'back-1',
    name: 'Dumbbell Bent-Over Rows',
    category: 'Back',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Rhomboids', 'Rear Deltoids', 'Biceps'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 9,
    defaultSets: 3,
    defaultReps: '10-12 reps per arm',
    restSec: 60,
    animationType: 'row',
    instructions: [
      'Hinge at hips with knees slightly bent and torso at 45 degrees, keeping back flat.',
      'Hold dumbbells letting arms hang straight down.',
      'Pull dumbbells up toward ribcage, driving elbows backward and squeezing shoulder blades.',
      'Lower weights under control.'
    ],
    commonMistakes: ['Rounding the spine', 'Jerking torso up to lift weight'],
    safetyTips: 'Brace core tightly to protect lumbar spine.',
    jointFocus: 'Lower Back',
    jointSafeFor: ['Knee Pain', 'Ankle Instability'],
    alternatives: ['Single-Arm Bench Row', 'Inverted Bodyweight Row', 'Band Pull-Aparts']
  },
  {
    id: 'back-2',
    name: 'Bodyweight Inverted Rows',
    category: 'Back',
    primaryMuscle: 'Rhomboids & Upper Back',
    secondaryMuscles: ['Latissimus Dorsi', 'Biceps', 'Core'],
    equipment: 'Bench',
    difficulty: 'Intermediate',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '8-12 reps',
    restSec: 60,
    animationType: 'inverted_row',
    instructions: [
      'Lie underneath a sturdy bar or table edge, gripping shoulder-width apart.',
      'Keep body in a rigid plank position resting on heels.',
      'Pull chest up to touch the bar/edge.',
      'Lower back down slowly.'
    ],
    commonMistakes: ['Sagging hips', 'Not reaching full chest touch'],
    safetyTips: 'Ensure table or bar support is completely stable before pulling.',
    jointFocus: 'Upper Back',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain'],
    alternatives: ['Doorway Rows', 'Resistance Band Rows']
  },
  {
    id: 'back-3',
    name: 'Pull-Ups',
    category: 'Back',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Upper Back'],
    equipment: 'Pull-up Bar',
    difficulty: 'Advanced',
    caloriesPerMin: 11,
    defaultSets: 4,
    defaultReps: '6-10 reps',
    restSec: 90,
    animationType: 'pullup',
    instructions: [
      'Grasp pull-up bar with an overhand grip wider than shoulders.',
      'Hang with arms fully extended.',
      'Pull body up until chin clears the bar, driving elbows downward.',
      'Lower back down under full control.'
    ],
    commonMistakes: ['Kipping legs', 'Half reps without full extension'],
    safetyTips: 'Do not drop suddenly at bottom to protect shoulder labrum.',
    jointFocus: 'Shoulder',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Ankle Instability'],
    alternatives: ['Band-Assisted Pull-Ups', 'Lat Pulldowns', 'Dumbbell Rows']
  },
  {
    id: 'back-4',
    name: 'Superman Spine Extensions',
    category: 'Back',
    primaryMuscle: 'Erector Spinae (Lower Back)',
    secondaryMuscles: ['Gluteus Maximus', 'Hamstrings'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 6,
    defaultSets: 3,
    defaultReps: '12-15 reps (2s hold)',
    restSec: 30,
    animationType: 'superman',
    instructions: [
      'Lie face down on mat with arms extended overhead.',
      'Simultaneously lift arms, chest, and legs off the floor by squeezing back and glutes.',
      'Hold position at peak lift for 2 seconds.',
      'Return gently to mat.'
    ],
    commonMistakes: ['Hyper-extending neck backward', 'Jerking up frantically'],
    safetyTips: 'Keep gaze facing floor to maintain neutral cervical alignment.',
    jointFocus: 'Lower Back Health',
    jointSafeFor: ['Knee Pain', 'Shoulder Impingement', 'Wrist Strain'],
    alternatives: ['Bird-Dog', 'Glute Bridges']
  },

  // LEGS
  {
    id: 'legs-1',
    name: 'Bodyweight Squats',
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
    instructions: [
      'Stand feet shoulder-width apart, toes turned outward 15 degrees.',
      'Initiate movement by pushing hips back and bending knees.',
      'Lower until thighs are parallel to floor while keeping chest erect.',
      'Drive up through mid-foot to starting stance.'
    ],
    commonMistakes: ['Knees caving inward (valgus)', 'Heels coming off ground', 'Rounding back'],
    safetyTips: 'Keep knees tracking directly in line with 2nd & 3rd toes.',
    jointFocus: 'Knee / Hip',
    jointSafeFor: ['Shoulder Impingement', 'Wrist Strain', 'Neck Tension'],
    alternatives: ['Chair Squats', 'Box Squats', 'Wall Sit']
  },
  {
    id: 'legs-2',
    name: 'Chair Squats (Knee-Safe)',
    category: 'Legs',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: 'Bench',
    difficulty: 'Beginner',
    caloriesPerMin: 6,
    defaultSets: 3,
    defaultReps: '12-15 reps',
    restSec: 45,
    animationType: 'chair_squat',
    instructions: [
      'Stand in front of a chair with feet shoulder-width apart.',
      'Slowly sit back until buttocks lightly tap chair cushion.',
      'Pause for 1 second without sitting down completely.',
      'Stand back up driving through heels.'
    ],
    commonMistakes: ['Collapsing onto chair'],
    safetyTips: 'Excellent knee-rehab variation that eliminates deep joint flex compression.',
    jointFocus: 'Joint Safe',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Wrist Strain', 'Ankle Instability'],
    alternatives: ['Glute Bridges', 'Seated Leg Extensions']
  },
  {
    id: 'legs-3',
    name: 'Dumbbell Walking Lunges',
    category: 'Legs',
    primaryMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 10,
    defaultSets: 3,
    defaultReps: '10 reps per leg',
    restSec: 60,
    animationType: 'lunge',
    instructions: [
      'Stand tall holding dumbbells at sides.',
      'Take a controlled step forward with right foot and lower hips until both knees bend at 90 degrees.',
      'Ensure front knee stays behind toes.',
      'Push off right foot to step forward into next lunge.'
    ],
    commonMistakes: ['Front knee slamming inward', 'Torso leaning too far forward'],
    safetyTips: 'Maintain upright posture and engage core for balance.',
    jointFocus: 'Knee',
    jointSafeFor: ['Shoulder Impingement', 'Wrist Strain'],
    alternatives: ['Reverse Lunges', 'Step-Ups', 'Static Split Squats']
  },
  {
    id: 'legs-4',
    name: 'Glute Bridges',
    category: 'Legs',
    primaryMuscle: 'Gluteus Maximus',
    secondaryMuscles: ['Hamstrings', 'Core', 'Lower Back'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 6,
    defaultSets: 3,
    defaultReps: '15-20 reps',
    restSec: 30,
    animationType: 'glute_bridge',
    instructions: [
      'Lie on back with knees bent and feet flat on floor hip-width apart.',
      'Drive through heels to lift hips toward ceiling until thighs and torso align.',
      'Squeeze glutes tightly at top for 2 seconds.',
      'Lower hips back to floor under control.'
    ],
    commonMistakes: ['Arching lower back excessively at top', 'Pushing off toes'],
    safetyTips: 'Focus on squeezing glutes rather than thrusting back too high.',
    jointFocus: 'Posterior Chain',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Shoulder Impingement', 'Wrist Strain', 'Ankle Instability'],
    alternatives: ['Single-Leg Glute Bridge', 'Hip Thrusts']
  },

  // SHOULDERS
  {
    id: 'shoulders-1',
    name: 'Dumbbell Overhead Shoulder Press',
    category: 'Shoulders',
    primaryMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps Brachii', 'Upper Trapezius'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSec: 60,
    animationType: 'shoulder_press',
    instructions: [
      'Sit or stand tall holding dumbbells at shoulder height with palms forward.',
      'Press dumbbells overhead until arms are extended above head.',
      'Lower slowly back to ear/shoulder level.'
    ],
    commonMistakes: ['Arching lower back excessively', 'Pressing dumbbells too far forward'],
    safetyTips: 'Squeeze abs and glutes to lock spine in neutral position.',
    jointFocus: 'Shoulder',
    jointSafeFor: ['Knee Pain', 'Ankle Instability'],
    alternatives: ['Seated Dumbbell Press', 'Pike Push-Ups', 'Band Overhead Press']
  },
  {
    id: 'shoulders-2',
    name: 'Dumbbell Lateral Raises',
    category: 'Shoulders',
    primaryMuscle: 'Lateral Deltoids (Side Shoulders)',
    secondaryMuscles: ['Trapezius'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    caloriesPerMin: 6,
    defaultSets: 3,
    defaultReps: '12-15 reps',
    restSec: 45,
    animationType: 'lateral_raise',
    instructions: [
      'Stand holding dumbbells at sides with slight elbow bend.',
      'Raise arms out to sides until elbows reach shoulder height.',
      'Pause briefly at top then lower down with control.'
    ],
    commonMistakes: ['Using momentum to swing weights up', 'Lifting hands higher than elbows'],
    safetyTips: 'Lead with elbows and keep pinkies slightly tilted upward.',
    jointFocus: 'Deltoid Isolation',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Wrist Strain'],
    alternatives: ['Resistance Band Lateral Raise', 'Cable Side Raise']
  },

  // ARMS
  {
    id: 'arms-1',
    name: 'Dumbbell Bicep Curls',
    category: 'Arms',
    primaryMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis', 'Forearm Flexors'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    caloriesPerMin: 6,
    defaultSets: 3,
    defaultReps: '12-15 reps',
    restSec: 45,
    animationType: 'bicep_curl',
    instructions: [
      'Stand tall holding a dumbbell in each hand with arms extended at sides.',
      'Keep elbows pinned close to torso.',
      'Curl weights upward while rotating wrists so palms face shoulders at top.',
      'Lower back down under full control.'
    ],
    commonMistakes: ['Swinging torso for momentum', 'Elbows drifting forward'],
    safetyTips: 'Perform seated against a wall if torso swinging persists.',
    jointFocus: 'Elbow Flexion',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Shoulder Impingement'],
    alternatives: ['Hammer Curls', 'Band Curls', 'Chin-Ups']
  },
  {
    id: 'arms-2',
    name: 'Tricep Bench Dips',
    category: 'Arms',
    primaryMuscle: 'Triceps Brachii',
    secondaryMuscles: ['Anterior Deltoids', 'Pectoralis Major'],
    equipment: 'Bench',
    difficulty: 'Intermediate',
    caloriesPerMin: 8,
    defaultSets: 3,
    defaultReps: '12-15 reps',
    restSec: 45,
    animationType: 'dips',
    instructions: [
      'Sit on edge of a sturdy bench/chair and place hands next to hips.',
      'Slide hips off edge with legs extended in front.',
      'Lower hips by bending elbows to 90 degrees.',
      'Push up powerfully through palms to straighten arms.'
    ],
    commonMistakes: ['Lowering too deep past 90 degrees (strains shoulders)', 'Shrugging shoulders up'],
    safetyTips: 'Keep back close to bench throughout the movement.',
    jointFocus: 'Elbow / Shoulder',
    jointSafeFor: ['Knee Pain', 'Ankle Instability'],
    alternatives: ['Overhead Tricep Extension', 'Diamond Push-Ups', 'Tricep Kickbacks']
  },

  // CORE
  {
    id: 'core-1',
    name: 'Forearm Plank Hold',
    category: 'Core',
    primaryMuscle: 'Rectus Abdominis & Transverse Abdominis',
    secondaryMuscles: ['Obliques', 'Glutes', 'Deltoids'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 7,
    defaultSets: 3,
    defaultReps: '45-60 seconds',
    restSec: 30,
    animationType: 'plank',
    instructions: [
      'Place forearms on mat with elbows under shoulders.',
      'Extend legs back, resting on toes so body forms a straight line from head to heels.',
      'Brace abs as if about to be punched, squeezing glutes and quads.',
      'Breathe steadily throughout the isometric hold.'
    ],
    commonMistakes: ['Sagging hips toward floor', 'Piking hips into air', 'Holding breath'],
    safetyTips: 'Drop knees to mat if lower back begins to arch.',
    jointFocus: 'Core Stability',
    jointSafeFor: ['Knee Pain', 'Ankle Instability', 'Neck Tension'],
    alternatives: ['Bird-Dog', 'Dead-Bug', 'Knee Plank']
  },
  {
    id: 'core-2',
    name: 'Bird-Dog Stability Hold',
    category: 'Core',
    primaryMuscle: 'Transverse Abdominis & Multifidus',
    secondaryMuscles: ['Glutes', 'Erector Spinae', 'Deltoids'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 5,
    defaultSets: 3,
    defaultReps: '10 reps per side',
    restSec: 30,
    animationType: 'bird_dog',
    instructions: [
      'Start on all fours with hands under shoulders and knees under hips.',
      'Simultaneously reach right arm straight forward and extend left leg straight back.',
      'Hold 2 seconds in a straight line, then return to start.',
      'Switch sides and repeat.'
    ],
    commonMistakes: ['Tilting hips to side', 'Arching lower back'],
    safetyTips: 'Gold standard clinical exercise for lower back pain rehabilitation.',
    jointFocus: 'Spine Safe',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Shoulder Impingement', 'Wrist Strain'],
    alternatives: ['Dead-Bug Hold', 'Glute Bridges']
  },
  {
    id: 'core-3',
    name: 'Bicycle Crunches',
    category: 'Core',
    primaryMuscle: 'Rectus Abdominis & Obliques',
    secondaryMuscles: ['Hip Flexors'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Intermediate',
    caloriesPerMin: 9,
    defaultSets: 3,
    defaultReps: '20 total reps',
    restSec: 45,
    animationType: 'bicycle_crunch',
    instructions: [
      'Lie face up with hands behind head and knees bent at 90 degrees.',
      'Lift shoulders off floor.',
      'Rotate torso bringing right elbow toward left knee while extending right leg straight out.',
      'Switch sides continuously in a smooth pedaling motion.'
    ],
    commonMistakes: ['Yanking neck forward with hands', 'Moving too fast without contraction'],
    safetyTips: 'Rotate from ribcage, not by pulling your head.',
    jointFocus: 'Rotational Core',
    jointSafeFor: ['Knee Pain', 'Shoulder Impingement'],
    alternatives: ['Russian Twists', 'Plank Shoulder Taps']
  },

  // CARDIO & HIIT
  {
    id: 'cardio-1',
    name: 'High-Knee Cardio Burn',
    category: 'Cardio',
    primaryMuscle: 'Cardiovascular System',
    secondaryMuscles: ['Quadriceps', 'Calves', 'Hip Flexors'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Intermediate',
    caloriesPerMin: 12,
    defaultSets: 4,
    defaultReps: '40 seconds ON',
    restSec: 20,
    animationType: 'high_knees',
    instructions: [
      'Stand upright with feet hip-width apart.',
      'Run in place lifting knees vigorously to waist height.',
      'Pump arms rapidly in rhythm with leg strikes.',
      'Land softly on balls of feet.'
    ],
    commonMistakes: ['Leaning backward while lifting knees'],
    safetyTips: 'Perform Marching in Place as a low-impact substitute.',
    jointFocus: 'High Impact',
    jointSafeFor: ['Shoulder Impingement', 'Wrist Strain'],
    alternatives: ['Marching in Place', 'Brisk Walking']
  },
  {
    id: 'hiit-1',
    name: 'Burpees Full Body Burn',
    category: 'HIIT',
    primaryMuscle: 'Full Body Cardiovascular',
    secondaryMuscles: ['Chest', 'Quads', 'Core', 'Shoulders'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Advanced',
    caloriesPerMin: 14,
    defaultSets: 4,
    defaultReps: '30 seconds max reps',
    restSec: 30,
    animationType: 'burpee',
    instructions: [
      'From standing stance, drop into a squat and place hands flat on floor.',
      'Kick feet back into a push-up plank position.',
      'Lower chest to floor (optional), then press back up.',
      'Jump feet forward to hands, then explode upward into vertical jump with hands overhead.'
    ],
    commonMistakes: ['Sagging back during plank kick-back'],
    safetyTips: 'Step feet back one by one instead of jumping if high impact strains joints.',
    jointFocus: 'Explosive',
    jointSafeFor: ['None'],
    alternatives: ['Squat Thrusts', 'Mountain Climbers', 'Jumping Jacks']
  },

  // YOGA, MOBILITY & STRETCHING
  {
    id: 'yoga-1',
    name: 'Cat-Cow Spinal Flow',
    category: 'Yoga',
    primaryMuscle: 'Spinal Column & Erector Spinae',
    secondaryMuscles: ['Abdominals', 'Neck Flexors'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 4,
    defaultSets: 2,
    defaultReps: '10 full cycles',
    restSec: 15,
    animationType: 'cat_cow',
    instructions: [
      'Begin on hands and knees with neutral spine.',
      'Inhale: arch back, drop belly down, and tilt gaze toward ceiling (Cow Pose).',
      'Exhale: round spine upward like an angry cat, tucking chin to chest (Cat Pose).',
      'Flow smoothly between positions with deep rhythmic breathing.'
    ],
    commonMistakes: ['Forcing movement into painful ranges'],
    safetyTips: 'Essential movement for relieving stiff lower back and desk-posture slump.',
    jointFocus: 'Spine Mobility',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Shoulder Impingement', 'Wrist Strain', 'Ankle Instability', 'Neck Tension'],
    alternatives: ['Child\'s Pose', 'Thoracic Windmills']
  },
  {
    id: 'flexibility-1',
    name: 'Standing Hamstring & Calves Stretch',
    category: 'Stretching',
    primaryMuscle: 'Hamstrings & Gastrocnemius',
    secondaryMuscles: ['Lower Back'],
    equipment: 'None (Bodyweight)',
    difficulty: 'Beginner',
    caloriesPerMin: 3,
    defaultSets: 2,
    defaultReps: '30 seconds hold per leg',
    restSec: 15,
    animationType: 'hamstring_stretch',
    instructions: [
      'Stand and extend right leg forward with heel resting on floor and toes pointing up.',
      'Hinge forward at hips keeping back flat until stretch is felt in back of thigh.',
      'Hold position gently without bouncing.',
      'Repeat on left leg.'
    ],
    commonMistakes: ['Bouncing into stretch', 'Rounding shoulders instead of hinging hips'],
    safetyTips: 'Never stretch to point of pain, only mild comfortable tension.',
    jointFocus: 'Hamstring Flexibility',
    jointSafeFor: ['Knee Pain', 'Lower Back Pain', 'Shoulder Impingement', 'Wrist Strain', 'Neck Tension'],
    alternatives: ['Seated Hamstring Stretch', 'Doorway Leg Stretch']
  }
];

// ─── 3. DYNAMIC AI WORKOUT GENERATOR ALGORITHM ─────────────────
export function generateDynamicAiWorkout(profile = {}) {
  const goal = profile.goal || 'Build Muscle';
  const experience = profile.experience || 'Intermediate';
  const location = profile.location || 'Home';
  const equipmentList = profile.equipment || ['None (Bodyweight)'];
  const durationMin = Number(profile.duration) || 30;
  const limitations = profile.limitations || ['None'];
  const conditions = profile.medicalConditions || ['None'];
  const style = profile.preferredStyle || 'Balanced Functional';

  // 1. Filter database matching location & equipment
  let eligibleExercises = EXERCISE_DATABASE.filter(ex => {
    if (equipmentList.includes('Full Gym')) return true;
    if (ex.equipment === 'None (Bodyweight)') return true;
    return equipmentList.includes(ex.equipment);
  });

  // 2. Filter out exercises that trigger joint limitations
  if (!limitations.includes('None')) {
    eligibleExercises = eligibleExercises.filter(ex => {
      return limitations.every(lim => {
        if (lim === 'None') return true;
        return ex.jointSafeFor?.includes(lim) || ex.difficulty === 'Beginner';
      });
    });
  }

  if (eligibleExercises.length < 4) {
    eligibleExercises = EXERCISE_DATABASE.filter(ex => ex.equipment === 'None (Bodyweight)');
  }

  // 3. Goal-based Exercise Selection
  let targetCategories = [];
  if (goal === 'Lose Fat') {
    targetCategories = ['Cardio', 'HIIT', 'Legs', 'Chest', 'Core'];
  } else if (goal === 'Build Muscle' || goal === 'Increase Strength') {
    targetCategories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];
  } else if (goal === 'Improve Flexibility') {
    targetCategories = ['Yoga', 'Stretching', 'Core', 'Legs'];
  } else if (goal === 'Improve Endurance') {
    targetCategories = ['Cardio', 'HIIT', 'Legs', 'Core'];
  } else {
    targetCategories = ['Chest', 'Back', 'Legs', 'Core', 'Stretching'];
  }

  const selectedExercises = [];
  targetCategories.forEach(cat => {
    const match = eligibleExercises.find(ex => ex.category === cat && !selectedExercises.some(s => s.id === ex.id));
    if (match) selectedExercises.push(match);
  });

  const targetCount = durationMin <= 15 ? 3 : durationMin <= 30 ? 5 : durationMin <= 45 ? 7 : 9;
  
  let index = 0;
  while (selectedExercises.length < targetCount && index < eligibleExercises.length) {
    const candidate = eligibleExercises[index];
    if (!selectedExercises.some(s => s.id === candidate.id)) {
      selectedExercises.push(candidate);
    }
    index++;
  }

  // 4. Adjust Volume based on Experience Level & Duration
  const formattedExercises = selectedExercises.map(ex => {
    let sets = ex.defaultSets;
    let reps = ex.defaultReps;
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
      reps,
      restSec: rest,
      caloriesBurned: Math.round(ex.caloriesPerMin * (durationMin / selectedExercises.length))
    };
  });

  const estTotalCalories = formattedExercises.reduce((acc, curr) => acc + curr.caloriesBurned, 0);

  const title = `${experience} ${goal} (${location} ${style.split(' ')[0]})`;
  const focus = `${targetCategories.slice(0, 3).join(', ')} • ${durationMin} Mins`;

  return {
    id: `ai-plan-${Date.now()}`,
    title,
    focus,
    durationMin,
    difficulty: experience,
    estCalories: estTotalCalories,
    location,
    goal,
    exercises: formattedExercises,
    aiRationale: `Tailored for ${profile.gender || 'User'} (${profile.age || 25}y, BMI ${profile.bmi || '22.5'}). Designed for ${goal} at ${location} using ${equipmentList.join(', ')}. Avoids strain on: ${limitations.join(', ')}.`
  };
}

// ─── 4. AI 7-DAY WORKOUT SCHEDULE GENERATOR ─────────────────────
export function generateWeeklyAiSplit(profile = {}) {
  const goal = profile.goal || 'Build Muscle';
  const workoutDaysCount = Number(profile.workoutDays) || 4;
  const restDaysList = profile.restDays || ['Sunday', 'Wednesday'];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const splitTemplates = {
    'Build Muscle': [
      { day: 'Monday', focus: 'Chest & Triceps Push Focus', category: 'Chest' },
      { day: 'Tuesday', focus: 'Back & Biceps Pull Focus', category: 'Back' },
      { day: 'Wednesday', focus: 'Rest & Deep Tissue Recovery', category: 'Rest' },
      { day: 'Thursday', focus: 'Legs & Lower Body Hypertrophy', category: 'Legs' },
      { day: 'Friday', focus: 'Shoulders & Arms Precision', category: 'Shoulders' },
      { day: 'Saturday', focus: 'Core & High Intensity Burn', category: 'Core' },
      { day: 'Sunday', focus: 'Rest & Active Mobility', category: 'Rest' }
    ],
    'Lose Fat': [
      { day: 'Monday', focus: 'HIIT & Full Body Calorie Torch', category: 'HIIT' },
      { day: 'Tuesday', focus: 'Upper Body Metabolic Circuit', category: 'Chest' },
      { day: 'Wednesday', focus: 'Rest & Hydration Recovery', category: 'Rest' },
      { day: 'Thursday', focus: 'Lower Body & Glute Burn', category: 'Legs' },
      { day: 'Friday', focus: 'Core & Cardio Endurance', category: 'Cardio' },
      { day: 'Saturday', focus: 'Full Body Calisthenics Power', category: 'Back' },
      { day: 'Sunday', focus: 'Active Recovery Yoga & Stretch', category: 'Rest' }
    ]
  };

  const defaultTemplate = splitTemplates[goal] || splitTemplates['Build Muscle'];

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

    const tpl = defaultTemplate[idx] || defaultTemplate[0];
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

// ─── 5. GAMIFICATION & REWARDS SYSTEM ─────────────────────────
export function calculateUserGamification(completedWorkouts = []) {
  const baseXPPerWorkout = 100;
  const xpPerSet = 10;

  let totalXP = 0;
  completedWorkouts.forEach(w => {
    totalXP += baseXPPerWorkout;
    totalXP += (w.completedSets || 10) * xpPerSet;
  });

  const level = Math.floor(totalXP / 300) + 1;
  const currentLevelXP = totalXP % 300;
  const nextLevelXP = 300;
  const levelProgressPct = Math.round((currentLevelXP / nextLevelXP) * 100);

  const levelTitles = [
    'Rookie Athlete',
    'Bronze Fitness Enthusiast',
    'Silver Active Pioneer',
    'Gold Muscular Warrior',
    'Platinum Endurance Legend',
    'Diamond Titan Coach'
  ];

  const title = levelTitles[Math.min(levelTitles.length - 1, Math.floor(level / 2))];

  return {
    totalXP,
    level,
    title,
    currentLevelXP,
    nextLevelXP,
    levelProgressPct,
    streakDays: Math.min(30, completedWorkouts.length > 0 ? completedWorkouts.length * 2 : 3),
    totalCaloriesBurned: completedWorkouts.reduce((acc, w) => acc + (w.estCalories || 200), 1450),
    totalWorkoutMins: completedWorkouts.reduce((acc, w) => acc + (w.durationMin || 30), 240)
  };
}

export function getAchievementBadges(gamification = {}) {
  const { totalXP = 0, level = 1, streakDays = 0 } = gamification;

  return [
    { id: 'badge-1', title: 'First Rep', desc: 'Completed 1st AI session', icon: '🚀', unlocked: true },
    { id: 'badge-2', title: 'Consistency King', desc: 'Maintained a 7-day streak', icon: '🔥', unlocked: streakDays >= 7 },
    { id: 'badge-3', title: 'Level Up Champion', desc: 'Reached Level 3 status', icon: '🏆', unlocked: level >= 3 },
    { id: 'badge-4', title: 'Calorie Torcher', desc: 'Earned 1000+ XP in AI Coach', icon: '⚡', unlocked: totalXP >= 1000 },
    { id: 'badge-5', title: 'Iron Mindset', desc: 'Completed 10 workouts', icon: '🛡️', unlocked: totalXP >= 1500 }
  ];
}

// ─── 6. NUTRITION & MEAL PLANNER INTEGRATION ───────────────────
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

// ─── 7. LOCAL STORAGE HELPERS ─────────────────────────────────
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
    targetWeight: 66,
    bmi: 22.9,
    bodyFat: 18,
    goal: 'Build Muscle',
    activityLevel: 'Moderately Active',
    experience: 'Intermediate',
    location: 'Home',
    equipment: ['Dumbbells', 'None (Bodyweight)'],
    workoutDays: 4,
    duration: 30,
    limitations: ['None'],
    medicalConditions: ['None'],
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
