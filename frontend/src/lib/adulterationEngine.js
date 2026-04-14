/**
 * adulterationEngine.js
 * Core calculation logic for oil purity analysis.
 *
 * Range priority:
 *   1. Device-calibrated range (from calibrationStore — highest accuracy)
 *   2. Book reference range   (from oilReferenceData — generic fallback)
 */
import { getCalibration } from './calibrationStore';

/** Clamps a value between min and max. */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculate how far a value deviates OUTSIDE a range [min, max].
 * Returns 0 if inside, percentage deviation from nearest boundary if outside.
 * Capped at 100.
 */
function deviationScore(value, rangeMin, rangeMax) {
  if (value >= rangeMin && value <= rangeMax) return 0;
  const rangeSpan = rangeMax - rangeMin;
  if (rangeSpan <= 0) return 0;
  if (value < rangeMin) {
    return clamp(((rangeMin - value) / rangeSpan) * 100, 0, 100);
  }
  return clamp(((value - rangeMax) / rangeSpan) * 100, 0, 100);
}

/**
 * Main adulteration calculation function.
 *
 * @param {Object} sensorReadings - Live ESP32 data:
 *   { temperature, wavelength, density, adulteration_index }
 * @param {Object} oilRef - Reference oil from oilReferenceData.js
 * @returns {Object} Full analysis result
 */
export function calculateAdulteration(sensorReadings, oilRef) {
  if (!sensorReadings || !oilRef) {
    return {
      adulterationPercentage: 0,
      purityPercentage: 100,
      confidenceScore: 0,
      primaryIndicator: 'No data',
      deviationDetails: {},
      tier: 'pure',
      usingCalibration: false,
    };
  }

  const {
    temperature = 25,
    wavelength = 0,
    density = 0,
    adulteration_index = 0,
  } = sensorReadings;

  // ── Resolve ranges: calibrated OR book default ───────────────────────────
  const cal = getCalibration(oilRef.oilName);
  const usingCalibration = !!cal;

  const lightRange = cal
    ? { min: cal.wavelength.min,   max: cal.wavelength.max }
    : { min: oilRef.lightAbsorptionRange.min, max: oilRef.lightAbsorptionRange.max };

  const tempRange = cal
    ? { min: cal.temperature.min,  max: cal.temperature.max }
    : { min: oilRef.temperatureRange.min, max: oilRef.temperatureRange.max };

  const densityRange = cal
    ? { min: cal.density.min,      max: cal.density.max }
    : { min: oilRef.densityRange?.min ?? 0.88, max: oilRef.densityRange?.max ?? 0.95 };

  // ── 1. Compute deviation score per sensor ────────────────────────────────
  const lightDev   = deviationScore(wavelength, lightRange.min, lightRange.max);
  const tempDev    = deviationScore(temperature, tempRange.min, tempRange.max);
  const densityDev = deviationScore(density, densityRange.min, densityRange.max);
  const rawIndexScore = clamp((adulteration_index || 0) * 100, 0, 100);

  // ── 2. Weighted score ────────────────────────────────────────────────────
  // Calibrated mode: light 65%, density 20%, temp 10%, index 5%  (tighter)
  // Book mode:       light 60%, density 15%, temp 15%, index 10% (wider)
  const w = usingCalibration
    ? { light: 0.65, density: 0.20, temp: 0.10, index: 0.05 }
    : { light: 0.60, density: 0.15, temp: 0.15, index: 0.10 };

  const weightedScore =
    lightDev   * w.light  +
    densityDev * w.density +
    tempDev    * w.temp   +
    rawIndexScore * w.index;

  // Natural variation floor when all sensors are in range
  let adulterationPercentage = lightDev === 0 && densityDev === 0
    ? clamp(weightedScore + (rawIndexScore * 0.10), 0, 12)
    : clamp(weightedScore, 0, 100);

  adulterationPercentage = Math.round(adulterationPercentage * 10) / 10;
  const purityPercentage  = Math.round((100 - adulterationPercentage) * 10) / 10;

  // ── 3. Tier ──────────────────────────────────────────────────────────────
  let tier = 'pure';
  if (adulterationPercentage > 60) tier = 'heavy';
  else if (adulterationPercentage > 20) tier = 'moderate';

  // ── 4. Confidence score ──────────────────────────────────────────────────
  // Calibrated device gets +10 confidence bonus (device-specific baseline)
  const outOfRange = [
    lightDev,
    tempDev,
    densityDev,
    rawIndexScore > 30 ? rawIndexScore : 0,
  ].filter((d) => d > 0).length;

  const baseConfidence = { 4: 95, 3: 80, 2: 65, 1: 45, 0: 20 }[outOfRange] ?? 20;
  const confidenceScore = clamp(baseConfidence + (usingCalibration ? 10 : 0), 0, 99);

  // ── 5. Primary indicator ─────────────────────────────────────────────────
  const sensors = [
    { name: 'Light Absorption (Wavelength)', score: lightDev },
    { name: 'Temperature', score: tempDev },
    { name: 'Density', score: densityDev },
    { name: 'Adulteration Index (ESP)', score: rawIndexScore },
  ];
  const primaryIndicator = [...sensors].sort((a, b) => b.score - a.score)[0].name;

  // ── 6. Deviation details for UI ──────────────────────────────────────────
  const deviationDetails = {
    wavelength: {
      label: 'Light Absorption',
      value: wavelength,
      unit: 'nm',
      rangeMin: lightRange.min,
      rangeMax: lightRange.max,
      calibratedCenter: cal?.wavelength.center,
      deviation: lightDev,
      inRange: lightDev === 0,
      calibrated: usingCalibration,
    },
    temperature: {
      label: 'Temperature',
      value: temperature,
      unit: '°C',
      rangeMin: tempRange.min,
      rangeMax: tempRange.max,
      calibratedCenter: cal?.temperature.center,
      deviation: tempDev,
      inRange: tempDev === 0,
      calibrated: usingCalibration,
    },
    density: {
      label: 'Density',
      value: density,
      unit: 'g/cm³',
      rangeMin: densityRange.min,
      rangeMax: densityRange.max,
      calibratedCenter: cal?.density.center,
      deviation: densityDev,
      inRange: densityDev === 0,
      calibrated: usingCalibration,
    },
    adulteration_index: {
      label: 'ESP Adulteration Index',
      value: adulteration_index,
      unit: '',
      rangeMin: 0,
      rangeMax: 0.2,
      deviation: rawIndexScore,
      inRange: adulteration_index <= 0.2,
      calibrated: false,
    },
  };

  return {
    adulterationPercentage,
    purityPercentage,
    confidenceScore,
    primaryIndicator,
    deviationDetails,
    tier,
    usingCalibration,
    calibratedAt: cal?.calibratedAt || null,
    sampleCount: cal?.sampleCount || 0,
  };
}
