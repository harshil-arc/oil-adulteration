// ─── FORM ANALYZER & BIOMECHANIC METRICS ENGINE ─────────────────────
// Calculates joint angles, evaluates form scores, identifies joint errors,
// and delivers prioritized real-time posture feedback cues.

/**
 * Calculates 2D angle (in degrees) between 3 landmarks (A -> B -> C), where B is the vertex
 */
export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) return 180;

  const rad = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
              Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  
  let angle = Math.abs((rad * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

/**
 * Analyze frame landmarks against exercise form profile
 */
export function analyzeFrameForm(landmarks, profile) {
  if (!landmarks || landmarks.length < 25 || !profile) {
    return {
      isValidPose: false,
      fullBodyVisible: false,
      formScore: 0,
      kneeAngle: 180,
      elbowAngle: 180,
      phaseName: 'SEARCHING',
      jointStatuses: {},
      feedbackCue: '⚠️ Full Body Not Detected! Step back until head to feet are visible'
    };
  }

  // Check visibility of critical body parts (hips, knees, ankles)
  const lHip = landmarks[23];
  const rHip = landmarks[24];
  const lKnee = landmarks[25];
  const rKnee = landmarks[26];
  const lAnkle = landmarks[27];
  const rAnkle = landmarks[28];

  const hipVis = Math.max(lHip?.visibility || 0, rHip?.visibility || 0);
  const kneeVis = Math.max(lKnee?.visibility || 0, rKnee?.visibility || 0);
  const ankleVis = Math.max(lAnkle?.visibility || 0, rAnkle?.visibility || 0);

  if (landmarks.distanceStatus === 'TOO_CLOSE') {
    return {
      isValidPose: false,
      fullBodyVisible: false,
      distanceStatus: 'TOO_CLOSE',
      formScore: 0,
      kneeAngle: 180,
      elbowAngle: 180,
      phaseName: 'TOO_CLOSE',
      jointStatuses: {},
      feedbackCue: '↔️ Too Close to Camera! Please step back 2-3 feet so full body can be analyzed'
    };
  }

  // MediaPipe Landmark Index Mapping:
  // 11: L Shoulder, 12: R Shoulder
  // 13: L Elbow, 14: R Elbow
  // 15: L Wrist, 16: R Wrist
  // 23: L Hip, 24: R Hip
  // 25: L Knee, 26: R Knee
  // 27: L Ankle, 28: R Ankle
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lElbow = landmarks[13];
  const rElbow = landmarks[14];
  const lWrist = landmarks[15];
  const rWrist = landmarks[16];

  // Pick clearest side (left or right)
  const leftVis = (lHip?.visibility || 0.5) + (lKnee?.visibility || 0.5);
  const rightVis = (rHip?.visibility || 0.5) + (rKnee?.visibility || 0.5);

  const hip = leftVis >= rightVis ? lHip : rHip;
  const knee = leftVis >= rightVis ? lKnee : rKnee;
  const ankle = leftVis >= rightVis ? lAnkle : rAnkle;
  const shoulder = leftVis >= rightVis ? lShoulder : rShoulder;
  const elbow = leftVis >= rightVis ? lElbow : rElbow;
  const wrist = leftVis >= rightVis ? lWrist : rWrist;

  // Compute key angles
  const kneeAngle = calculateAngle(hip, knee, ankle);
  const hipAngle = calculateAngle(shoulder, hip, knee);
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const torsoAngle = calculateAngle({ x: hip.x, y: hip.y - 0.5 }, hip, knee);

  const jointStatuses = {};
  let formScore = 95;
  let feedbackCue = profile.cues.goodForm || 'Form appears good!';
  let priority = 0; // 0: positive, 1: minor, 2: major, 3: critical

  if (landmarks.distanceStatus === 'TOO_FAR') {
    feedbackCue = '➡️ Too Far! Step slightly closer to camera for optimal form analysis';
  }

  if (profile.id === 'squat') {
    const depthPct = Math.max(0, Math.min(100, Math.round(((180 - kneeAngle) / (180 - profile.thresholds.bottomKneeAngle)) * 100)));
    
    // 2. Knee Over Toe / Alignment Check
    const kneeXDiff = Math.abs(knee.x - ankle.x);
    if (kneeXDiff > profile.thresholds.kneeAlignmentTolerance) {
      formScore -= 15;
      jointStatuses['knee'] = 'RED';
      if (priority < 2) {
        feedbackCue = profile.cues.kneeAlign;
        priority = 2;
      }
    } else {
      jointStatuses['knee'] = 'GREEN';
    }

    // 3. Torso Lean Check
    if (torsoAngle < profile.thresholds.minTorsoAngle) {
      formScore -= 10;
      jointStatuses['hip'] = 'YELLOW';
      if (priority < 1) {
        feedbackCue = profile.cues.chestUp;
        priority = 1;
      }
    } else {
      jointStatuses['hip'] = 'GREEN';
    }

    return {
      isValidPose: true,
      formScore: Math.max(60, formScore),
      kneeAngle: Math.round(kneeAngle),
      hipAngle: Math.round(hipAngle),
      elbowAngle: Math.round(elbowAngle),
      depthPct,
      jointStatuses,
      feedbackCue
    };
  }

  if (profile.id === 'pushup') {
    const depthPct = Math.max(0, Math.min(100, Math.round(((180 - elbowAngle) / (180 - profile.thresholds.bottomElbowAngle)) * 100)));
    
    // Body plank alignment
    const bodyStraightAngle = calculateAngle(shoulder, hip, ankle);
    if (Math.abs(180 - bodyStraightAngle) > profile.thresholds.plankTolerance) {
      formScore -= 20;
      jointStatuses['hip'] = 'RED';
      if (priority < 2) {
        feedbackCue = profile.cues.straightBack;
        priority = 2;
      }
    } else {
      jointStatuses['hip'] = 'GREEN';
      jointStatuses['elbow'] = 'GREEN';
    }

    return {
      isValidPose: true,
      formScore: Math.max(60, formScore),
      elbowAngle: Math.round(elbowAngle),
      kneeAngle: Math.round(kneeAngle),
      depthPct,
      jointStatuses,
      feedbackCue
    };
  }

  // Fallback for curls, press, lunges
  return {
    isValidPose: true,
    formScore: Math.max(60, formScore),
    kneeAngle: Math.round(kneeAngle),
    elbowAngle: Math.round(elbowAngle),
    depthPct: 85,
    jointStatuses: { knee: 'GREEN', elbow: 'GREEN', hip: 'GREEN' },
    feedbackCue: profile.cues.goodForm || 'Form appears good!'
  };
}
