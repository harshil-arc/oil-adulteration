// ============================================================
// Oil Analysis Service – Pure Catalyst
// Compares sensor readings against pure oil reference ranges
// and calculates purity, adulteration % and likely adulterants
// ============================================================

/**
 * Reference sensor ranges for pure oils.
 * Values represent: { ir: [min,max], uv: [min,max], density: [min,max] }
 */
/**
 * Reference sensor ranges for pure oils.
 * Values represent: { tds: [min,max], turbidity: [min,max], ph: [min,max], density: [min,max], viscosity: [min,max], refractive: [min,max] }
 */
const OIL_PROFILES = {
  'Mustard Oil': {
    tds: [80, 120], turbidity: [8, 12], ph: [6.2, 6.6], density: [0.905, 0.910], 
    viscosity: [70, 78], refractive: [1.465, 1.468],
    icon: '🌿',
    healthNote: 'Mineral-adulterated mustard oil can lead to digestive and metabolic issues.',
  },
  'Olive Oil': {
    tds: [40, 70], turbidity: [2, 6], ph: [5.8, 6.4], density: [0.910, 0.915], 
    viscosity: [80, 85], refractive: [1.467, 1.470],
    icon: '🫒',
    healthNote: 'Adulterated olive oil loses antioxidant polyphenols critical for heart health.',
  },
  'Sunflower Oil': {
    tds: [100, 150], turbidity: [4, 8], ph: [6.0, 6.5], density: [0.918, 0.923], 
    viscosity: [60, 68], refractive: [1.472, 1.475],
    icon: '🌻',
    healthNote: 'Adulterated sunflower oil may increase trans-fat content causing cardiovascular risk.',
  },
  'Coconut Oil': {
    tds: [30, 60], turbidity: [1, 5], ph: [5.5, 6.2], density: [0.903, 0.910], 
    viscosity: [40, 50], refractive: [1.448, 1.450],
    icon: '🥥',
    healthNote: 'Adulterated coconut oil may be rancid and promote inflammation.',
  },
  'Groundnut Oil': {
    tds: [60, 100], turbidity: [6, 10], ph: [6.3, 6.8], density: [0.912, 0.918], 
    viscosity: [75, 82], refractive: [1.467, 1.470],
    icon: '🥜',
    healthNote: 'Adulterated groundnut oil may trigger severe allergic reactions.',
  },
};

const DEFAULT_PROFILE = {
  tds: [50, 150], turbidity: [5, 15], ph: [6.0, 7.0], density: [0.900, 0.930],
  viscosity: [50, 90], refractive: [1.450, 1.480],
  healthNote: 'Avoid consumption until further testing.',
};

/**
 * Clamp a value between min and max
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculate how far a value is outside its expected range (0 = perfect, 1 = fully outside)
 */
function deviationScore(value, min, max) {
  if (value >= min && value <= max) return 0;
  const range = (max - min) || 1;
  if (value < min) return Math.min((min - value) / (min * 0.2), 1);
  return Math.min((value - max) / (max * 0.2), 1);
}

/**
 * Main analysis function
 * @param {Object} v - sensor values
 * @param {string} oilType
 * @returns {Object} analysis result
 */
function analyzeOil(v, oilType) {
  const profile = OIL_PROFILES[oilType] || DEFAULT_PROFILE;

  // Calculate deviation for each sensor
  const d_tds = deviationScore(v.tds_ppm, profile.tds[0], profile.tds[1]);
  const d_turb = deviationScore(v.turbidity_ntu, profile.turbidity[0], profile.turbidity[1]);
  const d_ph = deviationScore(v.ph, profile.ph[0], profile.ph[1]);
  const d_dens = deviationScore(v.density_gcm3, profile.density[0], profile.density[1]);
  const d_visc = deviationScore(v.viscosity_cp, profile.viscosity[0], profile.viscosity[1]);
  const d_refr = deviationScore(v.refractive_index, profile.refractive[0], profile.refractive[1]);

  // Weighted average deviation
  const weightedDev = (
    d_tds * 0.15 + 
    d_turb * 0.15 + 
    d_ph * 0.10 + 
    d_dens * 0.25 + 
    d_visc * 0.15 + 
    d_refr * 0.20
  );

  // Adulteration increases non-linearly
  const adulterationRaw = clamp(weightedDev * 100, 0, 100);
  const adulteration = Math.round(adulterationRaw * 10) / 10;
  const purity = Math.round((100 - adulteration) * 10) / 10;

  // Identify issues
  const likely_adulterants = [];
  const contaminants = [];

  if (d_dens > 0.05) {
    const issue = v.density_gcm3 < profile.density[0] ? 'Light Hydrocarbons/Solvents' : 'Heavy Oils/Lard';
    likely_adulterants.push(issue);
    contaminants.push({ name: issue, percentage: Math.round(d_dens * 30), source: 'Density' });
  }
  if (d_refr > 0.05) {
    const issue = 'Synthetic Additives/Refractive Modifiers';
    if (!likely_adulterants.includes(issue)) likely_adulterants.push(issue);
    contaminants.push({ name: issue, percentage: Math.round(d_refr * 25), source: 'Refractive Index' });
  }
  if (d_ph > 0.1) {
    likely_adulterants.push('Chemical Neutralizers');
    contaminants.push({ name: 'Chemical Residue', percentage: Math.round(d_ph * 20), source: 'pH Sensor' });
  }

  // Quality classification
  let quality, qualityLabel;
  if (adulteration <= 8) {
    quality = 'Safe';
    qualityLabel = 'Certified Pure';
  } else if (adulteration <= 25) {
    quality = 'Moderate';
    qualityLabel = 'Caution Advised';
  } else {
    quality = 'Unsafe';
    qualityLabel = 'High Adulteration';
  }

  return {
    purity,
    adulteration,
    quality,
    qualityLabel,
    likely_adulterants,
    contaminants,
    health_advisory: adulteration > 10 ? profile.healthNote : null,
    sensor_snapshot: v,
  };
}

module.exports = { analyzeOil, OIL_PROFILES };
