// ─── BIOMECHANICAL REP DETECTION STATE MACHINE ───────────────────────
// Enforces full range-of-motion (ROM), starting standing baseline check,
// vertical displacement verification, and incomplete rep rejection.
// Prevents false rep counting when user is sitting or shifting upper body.

export class RepStateMachine {
  constructor(profile) {
    this.profile = profile;
    this.state = 'WAITING_FOR_STAND';
    this.validReps = 0;
    this.incompleteReps = 0;
    this.currentRepScore = 100;
    this.repHistory = [];
    this.minDepthAchieved = 180;
    this.lastStateTime = Date.now();
    this.hasStoodUp = false;
  }

  reset(profile) {
    if (profile) this.profile = profile;
    this.state = 'WAITING_FOR_STAND';
    this.validReps = 0;
    this.incompleteReps = 0;
    this.currentRepScore = 100;
    this.repHistory = [];
    this.minDepthAchieved = 180;
    this.lastStateTime = Date.now();
    this.hasStoodUp = false;
  }

  processFrame(analysis) {
    if (!analysis || !analysis.isValidPose || analysis.fullBodyVisible === false) {
      return {
        state: 'WAITING_FOR_BODY',
        validReps: this.validReps,
        incompleteReps: this.incompleteReps,
        event: 'NO_POSE',
        cueOverride: '⚠️ Full Body Not Detected! Step back until head to feet are visible'
      };
    }

    const { kneeAngle, elbowAngle, formScore } = analysis;
    const now = Date.now();
    let event = 'NONE';
    let cueOverride = null;

    if (this.profile.id === 'squat') {
      const angle = kneeAngle;

      switch (this.state) {
        case 'WAITING_FOR_STAND':
          // Require full standing posture (knee angle >= 165°) before exercise can start
          if (angle >= 165) {
            this.state = 'STANDING';
            this.hasStoodUp = true;
            this.lastStateTime = now;
            event = 'STANDING_BASELINE';
          } else {
            cueOverride = '🧍 Please stand up fully straight to start squat reps';
          }
          break;

        case 'STANDING':
          if (angle >= 165) {
            this.minDepthAchieved = angle;
          } else if (angle < 135 && now - this.lastStateTime > 300) {
            // User begins dropping into squat
            this.state = 'DESCENDING';
            this.minDepthAchieved = angle;
            this.lastStateTime = now;
            event = 'DESCENDING_STARTED';
          }
          break;

        case 'DESCENDING':
          if (angle < this.minDepthAchieved) {
            this.minDepthAchieved = angle;
          }

          if (angle <= this.profile.thresholds.bottomKneeAngle && now - this.lastStateTime > 300) {
            this.state = 'BOTTOM';
            this.lastStateTime = now;
            event = 'BOTTOM_REACHED';
          } else if (angle > 155 && now - this.lastStateTime > 350) {
            // Returned up before reaching valid depth -> INCOMPLETE REP
            this.state = 'STANDING';
            this.incompleteReps += 1;
            this.lastStateTime = now;
            event = 'INCOMPLETE_REP';
            cueOverride = '⚠️ Incomplete Rep! Go deeper into your squat';
          }
          break;

        case 'BOTTOM':
          if (angle > (this.profile.thresholds.bottomKneeAngle + 15) && now - this.lastStateTime > 250) {
            this.state = 'ASCENDING';
            this.lastStateTime = now;
            event = 'ASCENDING_STARTED';
          }
          break;

        case 'ASCENDING':
          if (angle >= 165 && now - this.lastStateTime > 300) {
            // FULL SQUAT REP COMPLETED SUCCESSFULLY!
            this.validReps += 1;
            this.state = 'STANDING';
            this.lastStateTime = now;
            event = 'VALID_REP_COMPLETED';
            
            const repRecord = {
              repNumber: this.validReps,
              formScore: Math.round(formScore),
              timestamp: new Date().toLocaleTimeString(),
              depthAchievedPct: Math.min(100, Math.round(((180 - this.minDepthAchieved) / (180 - this.profile.thresholds.bottomKneeAngle)) * 100))
            };

            this.repHistory.push(repRecord);
          } else if (angle < 120 && now - this.lastStateTime > 600) {
            // User gave up halfway up and dropped back down
            this.state = 'DESCENDING';
          }
          break;

        default:
          if (angle >= 165) this.state = 'STANDING';
          else this.state = 'WAITING_FOR_STAND';
          break;
      }
    } else if (this.profile.id === 'pushup') {
      const angle = elbowAngle;

      switch (this.state) {
        case 'WAITING_FOR_STAND':
        case 'READY':
        case 'PLANK':
          if (angle >= 155) {
            this.state = 'PLANK';
            this.minDepthAchieved = angle;
          } else if (angle < 130 && now - this.lastStateTime > 300) {
            this.state = 'DESCENDING';
            this.minDepthAchieved = angle;
            this.lastStateTime = now;
          } else {
            cueOverride = '💪 Lock out arms in plank position to start push-up reps';
          }
          break;

        case 'DESCENDING':
          if (angle < this.minDepthAchieved) this.minDepthAchieved = angle;

          if (angle <= this.profile.thresholds.bottomElbowAngle && now - this.lastStateTime > 300) {
            this.state = 'BOTTOM';
            this.lastStateTime = now;
          } else if (angle > 145 && now - this.lastStateTime > 350) {
            this.state = 'PLANK';
            this.incompleteReps += 1;
            this.lastStateTime = now;
            event = 'INCOMPLETE_REP';
            cueOverride = '⚠️ Incomplete Push-Up! Lower chest closer to floor';
          }
          break;

        case 'BOTTOM':
          if (angle > (this.profile.thresholds.bottomElbowAngle + 15) && now - this.lastStateTime > 250) {
            this.state = 'ASCENDING';
            this.lastStateTime = now;
          }
          break;

        case 'ASCENDING':
          if (angle >= 155 && now - this.lastStateTime > 300) {
            this.validReps += 1;
            this.state = 'PLANK';
            this.lastStateTime = now;
            event = 'VALID_REP_COMPLETED';
            this.repHistory.push({
              repNumber: this.validReps,
              formScore: Math.round(formScore),
              timestamp: new Date().toLocaleTimeString()
            });
          }
          break;
      }
    } else if (this.profile.id === 'toe_touch') {
      const angle = analysis.hipAngle || 180;

      switch (this.state) {
        case 'WAITING_FOR_STAND':
        case 'READY':
          if (angle >= 155) {
            this.state = 'STANDING';
            this.hasStoodUp = true;
            this.lastStateTime = now;
            event = 'STANDING_BASELINE';
          } else {
            cueOverride = '🧍 Stand up fully straight to begin Standing Toe Touch reps';
          }
          break;

        case 'STANDING':
          if (angle >= 155) {
            this.minDepthAchieved = angle;
          } else if (angle < 130 && now - this.lastStateTime > 300) {
            this.state = 'DESCENDING';
            this.minDepthAchieved = angle;
            this.lastStateTime = now;
            event = 'BENDING_STARTED';
          }
          break;

        case 'DESCENDING':
          if (angle < this.minDepthAchieved) {
            this.minDepthAchieved = angle;
          }

          if (angle <= (this.profile.thresholds.bottomHipAngle || 85) && now - this.lastStateTime > 300) {
            this.state = 'BOTTOM';
            this.lastStateTime = now;
            event = 'TOE_REACH_ACHIEVED';
          } else if (angle > 145 && now - this.lastStateTime > 350) {
            this.state = 'STANDING';
            this.incompleteReps += 1;
            this.lastStateTime = now;
            event = 'INCOMPLETE_REP';
            cueOverride = '⚠️ Incomplete Rep! Reach lower toward your toes';
          }
          break;

        case 'BOTTOM':
          if (angle > 105 && now - this.lastStateTime > 250) {
            this.state = 'ASCENDING';
            this.lastStateTime = now;
            event = 'RISING_STARTED';
          }
          break;

        case 'ASCENDING':
          if (angle >= 155 && now - this.lastStateTime > 300) {
            this.validReps += 1;
            this.state = 'STANDING';
            this.lastStateTime = now;
            event = 'VALID_REP_COMPLETED';

            const repRecord = {
              repNumber: this.validReps,
              formScore: Math.round(formScore),
              timestamp: new Date().toLocaleTimeString(),
              depthAchievedPct: Math.min(100, Math.round(((180 - this.minDepthAchieved) / (180 - (this.profile.thresholds.bottomHipAngle || 85))) * 100))
            };

            this.repHistory.push(repRecord);
          }
          break;
      }
    } else if (this.profile.id === 'side_reach') {
      const tilt = analysis.lateralTiltDeg || 0;

      switch (this.state) {
        case 'WAITING_FOR_STAND':
        case 'READY':
          if (tilt <= 10) {
            this.state = 'STANDING';
            this.hasStoodUp = true;
            this.lastStateTime = now;
            event = 'STANDING_BASELINE';
          } else {
            cueOverride = '🧍 Stand up straight in center position to start Side Reach reps';
          }
          break;

        case 'STANDING':
          if (tilt <= 10) {
            this.minDepthAchieved = tilt;
          } else if (tilt > 15 && now - this.lastStateTime > 300) {
            this.state = 'DESCENDING';
            this.minDepthAchieved = tilt;
            this.lastStateTime = now;
            event = 'SIDE_REACH_STARTED';
          }
          break;

        case 'DESCENDING':
          if (tilt > this.minDepthAchieved) {
            this.minDepthAchieved = tilt;
          }

          if (tilt >= (this.profile.thresholds.peakSideTiltMin || 26) && now - this.lastStateTime > 300) {
            this.state = 'BOTTOM';
            this.lastStateTime = now;
            event = 'SIDE_PEAK_REACHED';
          } else if (tilt < 8 && now - this.lastStateTime > 350) {
            this.state = 'STANDING';
            this.incompleteReps += 1;
            this.lastStateTime = now;
            event = 'INCOMPLETE_REP';
            cueOverride = '⚠️ Incomplete Rep! Stretch further to the side';
          }
          break;

        case 'BOTTOM':
          if (tilt < 20 && now - this.lastStateTime > 250) {
            this.state = 'ASCENDING';
            this.lastStateTime = now;
            event = 'RETURNING_CENTER';
          }
          break;

        case 'ASCENDING':
          if (tilt <= 10 && now - this.lastStateTime > 300) {
            this.validReps += 1;
            this.state = 'STANDING';
            this.lastStateTime = now;
            event = 'VALID_REP_COMPLETED';

            const repRecord = {
              repNumber: this.validReps,
              formScore: Math.round(formScore),
              timestamp: new Date().toLocaleTimeString(),
              depthAchievedPct: Math.min(100, Math.round((this.minDepthAchieved / (this.profile.thresholds.peakSideTiltMin || 26)) * 100))
            };

            this.repHistory.push(repRecord);
          }
          break;
      }
    } else {
      // General Fallback for other exercises
      if (kneeAngle >= 165 || elbowAngle >= 155) {
        this.state = 'STANDING';
      }
    }

    return {
      state: this.state,
      validReps: this.validReps,
      incompleteReps: this.incompleteReps,
      event,
      cueOverride,
      history: this.repHistory
    };
  }
}
