/**
 * Disaster & Emergency Notification Service
 */

// Global mock state for emergency flag
let EXPOSED_DISASTER_STATE = {
  active: false,
  zone: null,
  severity: null
};

// Toggle emergency
function triggerDisasterMode(zoneName, severity) {
  EXPOSED_DISASTER_STATE = {
    active: true,
    zone: zoneName,
    severity: severity
  };
  console.warn(`[EMERGENCY] Disaster declared in ${zoneName}. Level: ${severity}`);
  return EXPOSED_DISASTER_STATE;
}

// Check state
function getDisasterStatus() {
  return EXPOSED_DISASTER_STATE;
}

// Resolve emergency
function resolveDisaster() {
  EXPOSED_DISASTER_STATE = { active: false, zone: null, severity: null };
  return EXPOSED_DISASTER_STATE;
}

module.exports = {
  triggerDisasterMode,
  getDisasterStatus,
  resolveDisaster
};
