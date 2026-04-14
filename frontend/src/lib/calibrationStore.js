/**
 * calibrationStore.js
 * Stores and retrieves device-specific calibration baselines per oil.
 * Written to localStorage so calibrations persist across sessions.
 *
 * Calibration data structure:
 * {
 *   "Mustard Oil": {
 *     calibratedAt: ISO string,
 *     sampleCount: number,
 *     wavelength:   { center, min, max },
 *     temperature:  { center, min, max },
 *     density:      { center, min, max },
 *     rawReadings:  [{ wavelength, temperature, density, adulteration_index }]
 *   },
 *   ...
 * }
 */

const STORAGE_KEY = 'oil_calibration_data';

// ── Tolerance band applied around the calibrated center value ─────────────
// These percentages define how wide the "pure" window is around the observed mean.
const TOLERANCE = {
  wavelength:   0.12,   // ±12% of center value
  temperature:   0.15,  // ±15% (temperature varies with environment)
  density:        0.010, // ±0.010 g/cm³ absolute (not percentage)
};

/** Load all calibrations from localStorage */
export function loadAllCalibrations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

/** Get calibration for a specific oil. Returns null if not calibrated. */
export function getCalibration(oilName) {
  const all = loadAllCalibrations();
  return all[oilName] || null;
}

/** Save a completed calibration for an oil. */
export function saveCalibration(oilName, readings) {
  if (!readings || readings.length === 0) return null;

  // ── Compute mean for each sensor ────────────────────────────────────────
  const mean = (arr, key) => arr.reduce((sum, r) => sum + (r[key] || 0), 0) / arr.length;

  const wCenter = mean(readings, 'wavelength');
  const tCenter = mean(readings, 'temperature');
  const dCenter = mean(readings, 'density');

  const calibration = {
    calibratedAt: new Date().toISOString(),
    sampleCount: readings.length,
    rawReadings: readings,
    wavelength: {
      center: parseFloat(wCenter.toFixed(2)),
      min:    parseFloat((wCenter * (1 - TOLERANCE.wavelength)).toFixed(2)),
      max:    parseFloat((wCenter * (1 + TOLERANCE.wavelength)).toFixed(2)),
    },
    temperature: {
      center: parseFloat(tCenter.toFixed(2)),
      min:    parseFloat((tCenter * (1 - TOLERANCE.temperature)).toFixed(2)),
      max:    parseFloat((tCenter * (1 + TOLERANCE.temperature)).toFixed(2)),
    },
    density: {
      center: parseFloat(dCenter.toFixed(4)),
      min:    parseFloat((dCenter - TOLERANCE.density).toFixed(4)),
      max:    parseFloat((dCenter + TOLERANCE.density).toFixed(4)),
    },
  };

  const all = loadAllCalibrations();
  all[oilName] = calibration;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return calibration;
}

/** Delete calibration for a specific oil (resets to book defaults). */
export function deleteCalibration(oilName) {
  const all = loadAllCalibrations();
  delete all[oilName];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/** Delete ALL calibrations. */
export function clearAllCalibrations() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Returns true if a calibration exists for this oil. */
export function isCalibrated(oilName) {
  return !!getCalibration(oilName);
}
