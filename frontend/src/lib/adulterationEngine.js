/**
 * adulterationEngine.js
 * Deterministic + Euclidean spectral comparison system for oil purity.
 */

// STEP 4: CALIBRATED DATASET (STRICT USE)
// Used exact mathematical float derivations of your samples to prevent Euclidean rounding-drift inversions
const SPECTRAL_DB = {
  "Groundnut Oil": {
    pure:        [0, 1/30, 3/30, 3/30, 3/30, 1/30, 5/30, 4/30, 3/30, 1/30, 0, 6/30, 0],
    adulterated: [0, 1/26, 3/26, 2/26, 3/26, 1/26, 4/26, 4/26, 2/26, 1/26, 0, 5/26, 0]
  },
  "Mustard Oil": {
    pure:        [0, 1/31, 3/31, 3/31, 3/31, 1/31, 5/31, 4/31, 3/31, 2/31, 0, 6/31, 0],
    adulterated: [0, 1/27, 3/27, 2/27, 3/27, 1/27, 4/27, 4/27, 3/27, 1/27, 0, 5/27, 0]
  },
  "Coconut Oil": {
    pure:        [0, 1/29, 3/29, 3/29, 3/29, 1/29, 5/29, 4/29, 3/29, 1/29, 0, 5/29, 0],
    adulterated: [0, 1/28, 3/28, 3/28, 3/28, 1/28, 4/28, 4/28, 2/28, 1/28, 0, 5/28, 0]
  }
};

// Map fallback names in case of slight string mismatches
function getReference(oilName) {
  const name = oilName.toLowerCase();
  if (name.includes('groundnut') || name.includes('peanut')) return SPECTRAL_DB["Groundnut Oil"];
  if (name.includes('mustard')) return SPECTRAL_DB["Mustard Oil"];
  if (name.includes('coconut')) return SPECTRAL_DB["Coconut Oil"];
  return SPECTRAL_DB["Mustard Oil"]; 
}

// STEP 1: CONVERT STRING → ARRAY
function parseSpectralData(raw) {
  let extract = [];
  
  if (Array.isArray(raw)) {
    extract = raw;
  } else if (typeof raw === 'object' && raw !== null) {
    extract = [
      raw.f1_405nm, raw.f2_425nm, raw.fz_450nm, raw.f3_475nm, 
      raw.f4_515nm, raw.fy_555nm, raw.f5_550nm, raw.fxl_600nm,
      raw.f6_640nm, raw.f7_690nm, raw.f8_745nm, raw.nir_855nm, raw.vis
    ];
  } else if (typeof raw === 'string') {
    // Trim string, split using regex for multiple spaces/commas, map to Number
    const cleaned = raw.replace(/[^0-9.,\s-]/g, ' ');
    const parts = cleaned.trim().split(/[\s,]+/);
    extract = parts.map(p => parseFloat(p));
  }
  
  const finalArray = [];
  for (let i = 0; i < 13; i++) {
    const val = Number(extract[i]);
    finalArray.push(isNaN(val) ? 0 : val);
  }
  
  console.log("[Adulteration Engine] Parsed Spectral Data:", finalArray);
  return finalArray;
}

// STEP 3: NORMALIZATION
function normalizeArray(arr) {
  const sum = arr.reduce((acc, val) => acc + Math.abs(val), 0);
  if (sum === 0) return arr.map(() => 0); 
  return arr.map(val => val / sum);
}

// STEP 5: DISTANCE CALCULATION (Euclidean)
function calculateEuclideanDistance(arr1, arr2) {
  let sumSq = 0;
  for (let i = 0; i < 13; i++) {
    // STEP 10: TOLERANCE (Reduced to 0.005. The old 0.02 wiped out the signals completely)
    let diff = Math.abs(arr1[i] - arr2[i]);
    if (diff <= 0.005) diff = 0;
    
    sumSq += (diff * diff);
  }
  return Math.sqrt(sumSq);
}

export function calculateAdulteration(sensorReadings, oilRef) {
  if (!sensorReadings || !oilRef) return fallbackResult();

  let temp = sensorReadings.temperature || 25;
  const rawArray = parseSpectralData(sensorReadings.spectral_data);

  const refs = getReference(oilRef.oilName);
  
  // Normalization
  const inputNorm = normalizeArray(rawArray);
  const pureNorm = refs.pure; // dataset provided by user is pre-normalized
  const adultNorm = refs.adulterated;

  // STEP 5: Calculate Distances
  const pure_dist = calculateEuclideanDistance(inputNorm, pureNorm);
  const adulterated_dist = calculateEuclideanDistance(inputNorm, adultNorm);

  console.log("[Engine Euclidean]", { pure_dist, adulterated_dist });

  // STEP 7: PURITY CALCULATION
  const total_dist = pure_dist + adulterated_dist;
  let purity = 100;
  
  const sumInput = inputNorm.reduce((a, b) => a + b, 0);
  if (sumInput === 0) {
    purity = 0; // Invalid reading
  } else if (total_dist > 0) {
    // Inverse distance squared weighting to create sharper contrast instead of 50/50 splits
    const wPure = 1 / Math.pow(pure_dist + 0.0001, 2);
    const wAdult = 1 / Math.pow(adulterated_dist + 0.0001, 2);
    purity = (wPure / (wPure + wAdult)) * 100;
  } else {
    purity = 100; 
  }
  
  // Safety clamp
  purity = Math.min(Math.max(purity, 0), 100);

  // STEP 8: ADULTERATION LEVEL
  const adulterationLevel = 100 - purity;
  
  // STEP 6: DECISION LOGIC
  let status = pure_dist <= adulterated_dist ? "Pure Oil" : "Adulterated Oil";
  let matched_with = pure_dist <= adulterated_dist ? "pure" : "adulterated";
  
  let tier = 'pure';
  if (adulterationLevel > 60) tier = 'heavy';
  else if (adulterationLevel > 20) tier = 'moderate';

  // STEP 9: CONFIDENCE SCORE
  let confidence = 100 - (Math.min(pure_dist, adulterated_dist) * 200); // Scaled based on typical Euclidean distances (~0.2 max)
  confidence = Math.min(Math.max(confidence, 0), 100);

  // STEP 11: TEMPERATURE HANDLING
  let primaryIndicator = "Spectral Match";
  if (temp < 20 || temp > 40) {
    primaryIndicator = "Warning: Sensor accuracy may be affected due to temperature variation";
  }

  // Handle uncertain logic
  if (Math.abs(pure_dist - adulterated_dist) < 0.01 && total_dist > 0) {
    primaryIndicator = "Result uncertain, retest recommended";
  }

  // STEP 12: OUTPUT FORMAT
  return {
    // App-expected mapped values
    adulterationPercentage: adulterationLevel,
    purityPercentage: purity,
    confidenceScore: Math.round(confidence),
    primaryIndicator: primaryIndicator,
    tier: tier,
    usingCalibration: false,
    
    // UI rendering format mapped to old schema
    deviationDetails: {
      pure_match: {
         label: 'Euclidean distance to Pure',
         value: pure_dist.toFixed(4),
         unit: 'dist',
         rangeMin: 0,
         rangeMax: 0.5,
         inRange: pure_dist < adulterated_dist
      },
      adult_match: {
         label: 'Euclidean distance to Adulterated',
         value: adulterated_dist.toFixed(4),
         unit: 'dist',
         rangeMin: 0,
         rangeMax: 0.5,
         inRange: adulterated_dist <= pure_dist
      }
    },
    
    // Explicit user requested keys
    distances: {
      pure: pure_dist.toFixed(4),
      adulterated: adulterated_dist.toFixed(4)
    },
    matched_with: matched_with,
    status: status,
    temperature: temp,
    oil_type: oilRef.oilName
  };
}

function fallbackResult() {
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
