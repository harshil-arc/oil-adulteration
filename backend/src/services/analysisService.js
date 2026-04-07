// ============================================================
// Oil Analysis Service – Pure Catalyst
// Compares sensor readings against pure oil reference ranges
// and calculates purity, adulteration % and likely adulterants
// ============================================================

/**
 * Reference sensor ranges for pure oils.
 * Values represent: { ir: [min,max], uv: [min,max], density: [min,max] }
 */
const OIL_PROFILES = {
  'Mustard Oil': {
    ir: [300, 380], uv: [190, 250], density: [0.905, 0.925],
    icon: '🌿',
    adulterants: {
      low_ir: 'Kerosene',
      high_uv: 'Mineral Oil',
      low_density: 'Hexane',
      high_density: 'Palm Oil',
    },
    healthNote: 'Mineral-adulterated mustard oil can lead to digestive and metabolic issues.',
  },
  'Olive Oil': {
    ir: [350, 430], uv: [180, 240], density: [0.910, 0.920],
    icon: '🫒',
    adulterants: {
      low_ir: 'Sunflower Oil',
      high_uv: 'Mineral Oil',
      low_density: 'Canola Oil',
      high_density: 'Palm Oil',
    },
    healthNote: 'Adulterated olive oil loses antioxidant polyphenols critical for heart health.',
  },
  'Sunflower Oil': {
    ir: [280, 360], uv: [170, 230], density: [0.918, 0.928],
    icon: '🌻',
    adulterants: {
      low_ir: 'Soybean Oil',
      high_uv: 'Cottonseed Oil',
      low_density: 'Hexane',
      high_density: 'Palm Oil',
    },
    healthNote: 'Adulterated sunflower oil may increase trans-fat content causing cardiovascular risk.',
  },
  'Coconut Oil': {
    ir: [410, 490], uv: [150, 210], density: [0.900, 0.915],
    icon: '🥥',
    adulterants: {
      low_ir: 'Palm Kernel Oil',
      high_uv: 'Mineral Oil',
      low_density: 'Vegetable Oil',
      high_density: 'Palm Oil',
    },
    healthNote: 'Adulterated coconut oil may be rancid and promote inflammation.',
  },
  'Groundnut Oil': {
    ir: [310, 390], uv: [165, 225], density: [0.912, 0.920],
    icon: '🥜',
    adulterants: {
      low_ir: 'Cottonseed Oil',
      high_uv: 'Mineral Oil',
      low_density: 'Soybean Oil',
      high_density: 'Palm Oil',
    },
    healthNote: 'Adulterated groundnut oil may trigger severe allergic reactions.',
  },
  'Palm Oil': {
    ir: [370, 450], uv: [200, 260], density: [0.924, 0.935],
    icon: '🌴',
    adulterants: {
      low_ir: 'Soybean Oil',
      high_uv: 'Mineral Oil',
      low_density: 'Vegetable Oil',
      high_density: 'Lard',
    },
    healthNote: 'Adulterated palm oil may contain carcinogenic compounds.',
  },
  // Petroleum / Industrial oils
  'Engine Oil (SAE 10W-30)': {
    ir: [600, 720], uv: [400, 500], density: [0.860, 0.890],
    icon: '⚙️',
    adulterants: {
      low_ir: 'Water Contamination',
      high_uv: 'Coolant Leakage',
      low_density: 'Fuel Dilution',
      high_density: 'Sludge Buildup',
    },
    healthNote: 'Engine oil contamination can cause bearing failure and engine seizure.',
  },
  'Diesel': {
    ir: [520, 640], uv: [350, 450], density: [0.820, 0.845],
    icon: '⛽',
    adulterants: {
      low_ir: 'Kerosene Blending',
      high_uv: 'Water Content',
      low_density: 'Naphtha',
      high_density: 'Heavy Oil Mixing',
    },
    healthNote: 'Adulterated diesel causes fuel injector clogging and excessive emissions.',
  },
  'Kerosene': {
    ir: [490, 610], uv: [320, 420], density: [0.780, 0.820],
    icon: '🛢️',
    adulterants: {
      low_ir: 'Naphtha',
      high_uv: 'Dye Mixing',
      low_density: 'Gasoline',
      high_density: 'Diesel Blending',
    },
    healthNote: 'Adulterated kerosene is a fire hazard and produces toxic fumes.',
  },
};

const DEFAULT_PROFILE = {
  ir: [300, 400], uv: [180, 250], density: [0.900, 0.930],
  adulterants: {
    low_ir: 'Unknown Solvent',
    high_uv: 'Mineral Oil',
    low_density: 'Light Hydrocarbon',
    high_density: 'Heavy Oil',
  },
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
  const range = max - min;
  if (value < min) return Math.min((min - value) / range, 1);
  return Math.min((value - max) / range, 1);
}

/**
 * Main analysis function
 * @param {Object} sensorValues - { ir_value, uv_value, density, temperature }
 * @param {string} oilType
 * @returns {Object} analysis result
 */
function analyzeOil(sensorValues, oilType) {
  const { ir_value, uv_value, density, temperature } = sensorValues;
  const profile = OIL_PROFILES[oilType] || DEFAULT_PROFILE;

  // Calculate deviation for each sensor
  const irDev = deviationScore(ir_value, profile.ir[0], profile.ir[1]);
  const uvDev = deviationScore(uv_value, profile.uv[0], profile.uv[1]);
  const densDev = deviationScore(density, profile.density[0], profile.density[1]);

  // Temperature compensation – slight adjustment
  const tempFactor = temperature > 40 ? 0.97 : temperature < 15 ? 0.98 : 1.0;

  // Weighted average deviation (IR most important, then density, then UV)
  const weightedDev = (irDev * 0.45 + densDev * 0.35 + uvDev * 0.20) * tempFactor;

  // Adulteration increases non-linearly
  const adulterationRaw = clamp(weightedDev * 100, 0, 100);
  const adulteration = Math.round(adulterationRaw * 10) / 10;
  const purity = Math.round((100 - adulteration) * 10) / 10;

  // Identify specific likely adulterants
  const likely_adulterants = [];
  const contaminants = [];

  if (irDev > 0.05) {
    const adulterantName = ir_value < profile.ir[0]
      ? profile.adulterants.low_ir
      : profile.adulterants.high_ir || 'Unknown IR Compound';
    likely_adulterants.push(adulterantName);
    contaminants.push({
      name: adulterantName,
      percentage: Math.round(irDev * 25 * 10) / 10,
      source: 'IR Spectrum',
    });
  }

  if (densDev > 0.05) {
    const adulterantName = density < profile.density[0]
      ? profile.adulterants.low_density
      : profile.adulterants.high_density;
    if (!likely_adulterants.includes(adulterantName)) {
      likely_adulterants.push(adulterantName);
      contaminants.push({
        name: adulterantName,
        percentage: Math.round(densDev * 20 * 10) / 10,
        source: 'Density Sensor',
      });
    }
  }

  if (uvDev > 0.08) {
    const adulterantName = uv_value > profile.uv[1]
      ? profile.adulterants.high_uv
      : 'Synthetic Additives';
    if (!likely_adulterants.includes(adulterantName)) {
      likely_adulterants.push(adulterantName);
      contaminants.push({
        name: adulterantName,
        percentage: Math.round(uvDev * 15 * 10) / 10,
        source: 'UV Fluorescence',
      });
    }
  }

  // Quality classification
  let quality, qualityLabel;
  if (adulteration <= 10) {
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
    sensor_snapshot: { ir_value, uv_value, density, temperature },
  };
}

module.exports = { analyzeOil, OIL_PROFILES };
