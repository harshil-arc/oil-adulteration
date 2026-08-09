// ─── EXERCISE FORM PROFILES DATASET ───────────────────────────────
// Biomechanical definitions, required landmarks, angle formulas,
// recommended camera angles, and rep phase thresholds for AI Motion Coach.

export const EXERCISE_FORM_PROFILES = {
  squat: {
    id: 'squat',
    name: 'Bodyweight Squat',
    category: 'legs',
    recommendedCameraView: 'Side / 45° View',
    requiredLandmarks: ['hip', 'knee', 'ankle', 'shoulder'],
    metrics: ['kneeAngle', 'hipAngle', 'torsoAngle', 'depthPct', 'kneeAlignment'],
    repPhases: ['STANDING', 'DESCENDING', 'BOTTOM', 'ASCENDING', 'COMPLETED'],
    thresholds: {
      standingKneeAngle: 160,  // Knee straight > 160 deg
      bottomKneeAngle: 100,    // Squat depth achieved < 100 deg
      minTorsoAngle: 45,       // Excessive lean check < 45 deg
      kneeAlignmentTolerance: 0.15
    },
    cues: {
      goDeeper: 'Go slightly deeper into your squat',
      chestUp: 'Keep your chest up and back flat',
      kneeAlign: 'Keep your knees aligned with your toes',
      goodForm: 'Form appears good! Great depth & alignment',
      incompleteRep: 'INCOMPLETE REP — Reach full squat depth'
    }
  },

  pushup: {
    id: 'pushup',
    name: 'Push-Up',
    category: 'chest',
    recommendedCameraView: 'Side View',
    requiredLandmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle'],
    metrics: ['elbowAngle', 'plankAlignment', 'depthPct'],
    repPhases: ['PLANK', 'DESCENDING', 'BOTTOM', 'ASCENDING', 'COMPLETED'],
    thresholds: {
      topElbowAngle: 155,
      bottomElbowAngle: 95,
      plankTolerance: 20 // deg deviation from hip-shoulder line
    },
    cues: {
      lowerChest: 'Lower your chest closer to the floor',
      straightBack: 'Keep your hips level & body in a straight plank',
      lockout: 'Push all the way up to full extension',
      goodForm: 'Excellent push-up depth and body rigidity!',
      incompleteRep: 'INCOMPLETE REP — Lower your chest further'
    }
  },

  bicep_curl: {
    id: 'bicep_curl',
    name: 'Bicep Curl',
    category: 'arms',
    recommendedCameraView: 'Front / 45° View',
    requiredLandmarks: ['shoulder', 'elbow', 'wrist'],
    metrics: ['elbowFlexion', 'elbowStability'],
    repPhases: ['EXTENSION', 'FLEXING', 'PEAK', 'LOWERING', 'COMPLETED'],
    thresholds: {
      extendedElbowAngle: 150,
      peakElbowAngle: 60,
      elbowDriftMax: 0.12
    },
    cues: {
      squeezePeak: 'Squeeze your bicep at the top of the curl',
      pinElbows: 'Keep your elbows pinned to your sides',
      fullExtend: 'Extend your arms fully at the bottom',
      goodForm: 'Controlled curl with great bicep contraction!',
      incompleteRep: 'INCOMPLETE REP — Curl higher to peak squeeze'
    }
  },

  shoulder_press: {
    id: 'shoulder_press',
    name: 'Shoulder Press',
    category: 'shoulders',
    recommendedCameraView: 'Front View',
    requiredLandmarks: ['shoulder', 'elbow', 'wrist', 'hip'],
    metrics: ['armExtension', 'overheadLockout'],
    repPhases: ['RACK', 'PRESSING', 'LOCKOUT', 'LOWERING', 'COMPLETED'],
    thresholds: {
      rackElbowAngle: 90,
      lockoutElbowAngle: 160
    },
    cues: {
      pressOverhead: 'Press fully overhead to lockout',
      controlDescent: 'Lower weights under control to shoulder height',
      keepCoreTight: 'Keep your core braced without arching back',
      goodForm: 'Strong overhead press with full lockout!',
      incompleteRep: 'INCOMPLETE REP — Press fully overhead'
    }
  },

  lunge: {
    id: 'lunge',
    name: 'Bodyweight Lunge',
    category: 'legs',
    recommendedCameraView: 'Side / 45° View',
    requiredLandmarks: ['hip', 'knee', 'ankle'],
    metrics: ['frontKneeAngle', 'rearKneeDrop', 'torsoVerticality'],
    repPhases: ['STANDING', 'STEPPING', 'BOTTOM', 'PUSHING_BACK', 'COMPLETED'],
    thresholds: {
      standingAngle: 160,
      bottomKneeAngle: 100
    },
    cues: {
      dropRearKnee: 'Drop your back knee closer to the floor',
      uprightTorso: 'Keep your torso upright during the lunge',
      kneeBehindToes: 'Keep front knee stacked over your ankle',
      goodForm: 'Balanced lunge with excellent knee depth!',
      incompleteRep: 'INCOMPLETE REP — Step out and drop deeper'
    }
  },

  toe_touch: {
    id: 'toe_touch',
    name: 'Standing Toe Touch',
    category: 'flexibility',
    recommendedCameraView: 'Side / 45° View',
    requiredLandmarks: ['shoulder', 'hip', 'knee', 'ankle', 'wrist'],
    metrics: ['hipFlexion', 'kneeStraightness', 'reachDistance'],
    repPhases: ['STANDING', 'BENDING', 'TOE_REACH', 'RISING', 'COMPLETED'],
    thresholds: {
      standingHipAngle: 155,
      bottomHipAngle: 85,
      minKneeAngle: 145
    },
    cues: {
      reachDeeper: 'Bend forward from your hips & reach closer to your toes',
      straightKnees: 'Keep your legs straight while reaching down',
      standUpright: 'Return all the way to a full standing upright position',
      goodForm: 'Excellent flexibility & controlled standing toe touch!',
      incompleteRep: 'INCOMPLETE REP — Reach down to toes & return fully upright'
    }
  },

  side_reach: {
    id: 'side_reach',
    name: 'Standing Side Reach',
    category: 'flexibility',
    recommendedCameraView: 'Front View',
    requiredLandmarks: ['shoulder', 'hip', 'knee', 'wrist'],
    metrics: ['lateralFlexion', 'shoulderHipAlignment'],
    repPhases: ['STANDING', 'REACHING_SIDE', 'SIDE_REACH_PEAK', 'RETURNING', 'COMPLETED'],
    thresholds: {
      standingTiltMax: 10,
      peakSideTiltMin: 26,
      forwardTwistMax: 0.12
    },
    cues: {
      reachFurther: 'Stretch further to the side while keeping posture stable',
      keepShouldersInLine: 'Keep your shoulders in-line with your hips without twisting forward',
      returnCenter: 'Return all the way back to center standing position',
      goodForm: 'Excellent side stretch! Great shoulder-hip alignment',
      incompleteRep: 'INCOMPLETE REP — Stretch deeper to the side and return to center'
    }
  }
};

/**
 * Get profile for an exercise, with fallback to squat if unspecified
 */
export function getExerciseFormProfile(exerciseNameOrId = '') {
  const q = String(exerciseNameOrId).toLowerCase();
  if (q.includes('side') || q.includes('lateral')) return EXERCISE_FORM_PROFILES.side_reach;
  if (q.includes('toe') || q.includes('touch') || q.includes('bend')) return EXERCISE_FORM_PROFILES.toe_touch;
  if (q.includes('push')) return EXERCISE_FORM_PROFILES.pushup;
  if (q.includes('curl') || q.includes('bicep')) return EXERCISE_FORM_PROFILES.bicep_curl;
  if (q.includes('press') || q.includes('shoulder')) return EXERCISE_FORM_PROFILES.shoulder_press;
  if (q.includes('lunge')) return EXERCISE_FORM_PROFILES.lunge;
  
  // Default to squat profile
  return EXERCISE_FORM_PROFILES.squat;
}
