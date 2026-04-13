// ============================================================
// Advanced Oil Adulteration Detection Engine
// Multi-Temperature Pattern Analysis Edition
// ============================================================

// STEP 2: DATASET DESIGN
const OIL_DATASET = {
  "Mustard Oil": {
    density_25C: 0.915,
    density_coeff: -0.0006,
    wavelength_25C: 1.470,
    wavelength_coeff: -0.0003,
    tolerance: 0.02,
    adulterants: {
      "argemone": { density_shift: 0.003, wavelength_shift: 0.002, pattern: "nonlinear" },
      "palm": { density_shift: 0.005, wavelength_shift: -0.001, pattern: "linear_high" }
    }
  },
  "Sunflower Oil": {
    density_25C: 0.919,
    density_coeff: -0.00065,
    wavelength_25C: 1.473,
    wavelength_coeff: -0.00032,
    tolerance: 0.02,
    adulterants: {
      "cottonseed": { density_shift: 0.004, wavelength_shift: 0.001, pattern: "linear_high" },
      "mineral": { density_shift: -0.010, wavelength_shift: -0.005, pattern: "nonlinear" }
    }
  },
  "Coconut Oil": {
    density_25C: 0.910,
    density_coeff: -0.0007,
    wavelength_25C: 1.448,
    wavelength_coeff: -0.00035,
    tolerance: 0.02,
    adulterants: {
      "palm_kernel": { density_shift: 0.002, wavelength_shift: 0.001, pattern: "linear_high" },
      "mineral": { density_shift: -0.020, wavelength_shift: -0.006, pattern: "nonlinear" }
    }
  },
  "Olive Oil": {
    density_25C: 0.912,
    density_coeff: -0.00062,
    wavelength_25C: 1.468,
    wavelength_coeff: -0.0003,
    tolerance: 0.02,
    adulterants: {
      "canola": { density_shift: 0.002, wavelength_shift: 0.001, pattern: "linear_high" },
      "hazelnut": { density_shift: 0.001, wavelength_shift: 0.001, pattern: "nonlinear" },
      "pomace": { density_shift: 0.004, wavelength_shift: 0.002, pattern: "linear_high" }
    }
  }
};

// STEP 4: TEMPERATURE NORMALIZATION
function normalizeTemperature(measuredT, baseVal, coeff) {
  // expected = X_25C + coeff * (T - 25)
  return baseVal + (coeff * (measuredT - 25));
}

// STEP 5: DEVIATION CALCULATION
function calculateDeviation(measured, expected, tolerancePercent) {
  const deviation = Math.abs(measured - expected);
  const toleranceAbsolute = expected * tolerancePercent;
  
  // Clamping score between 0 and 1
  let score = 1 - (deviation / toleranceAbsolute);
  return Math.min(Math.max(score, 0), 1);
}

// STEP 6: MULTI-TEMPERATURE PATTERN ANALYSIS
function analyzePattern(readings, profile) {
  if (!readings || readings.length < 2) return 1.0; // Perfect score if no multi-data to conflict

  // Sort by temperature
  const sorted = [...readings].sort((a,b) => a.T - b.T);
  
  let slopeDensityArr = [];
  let slopeWavelengthArr = [];

  for(let i=0; i<sorted.length-1; i++) {
    let dt = sorted[i+1].T - sorted[i].T;
    if (dt === 0) continue;
    let dd = sorted[i+1].density - sorted[i].density;
    let dw = sorted[i+1].wavelength - sorted[i].wavelength;
    
    slopeDensityArr.push(dd / dt);
    slopeWavelengthArr.push(dw / dt);
  }

  if (slopeDensityArr.length === 0) return 1.0;

  // Average measured slopes
  let avgSlopeD = slopeDensityArr.reduce((a,b)=>a+b, 0) / slopeDensityArr.length;
  let avgSlopeW = slopeWavelengthArr.reduce((a,b)=>a+b, 0) / slopeWavelengthArr.length;

  // Compare to expected coefficient
  let diffD = Math.abs(avgSlopeD - profile.density_coeff);
  let diffW = Math.abs(avgSlopeW - profile.wavelength_coeff);

  // If slopes deviate drastically, reduce the pattern score
  // We use actual coefficients * 2 as a generous threshold for slope deviation
  let scoreD = 1 - (diffD / Math.abs(profile.density_coeff * 2)); 
  let scoreW = 1 - (diffW / Math.abs(profile.wavelength_coeff * 2));

  let patternScore = (Math.max(scoreD, 0) + Math.max(scoreW, 0)) / 2;
  return Math.min(Math.max(patternScore, 0), 1);
}

// Helper to determine exact delta magnitude/direction for Adulterant checking
function getDirectionalDeviation(readings, profile) {
  let avgDensDiff = 0, avgWavDiff = 0;
  for (const r of readings) {
     const expD = normalizeTemperature(r.T, profile.density_25C, profile.density_coeff);
     const expW = normalizeTemperature(r.T, profile.wavelength_25C, profile.wavelength_coeff);
     avgDensDiff += (r.density - expD);
     avgWavDiff += (r.wavelength - expW);
  }
  return { 
     density_shift: avgDensDiff / readings.length,
     wavelength_shift: avgWavDiff / readings.length
  };
}

// STEP 8: ADULTERANT TYPE PREDICTION
function detectAdulterant(readings, profile, patternScore) {
  const shifts = getDirectionalDeviation(readings, profile);
  let bestMatch = "Unknown adulteration";
  let highestConfidence = 0;

  if (profile.adulterants) {
    for (const [ad_name, ad_data] of Object.entries(profile.adulterants)) {
      // Check if vectors moved in the same expected direction
      let densMatch = (shifts.density_shift > 0 && ad_data.density_shift > 0) || (shifts.density_shift < 0 && ad_data.density_shift < 0);
      let waveMatch = (shifts.wavelength_shift > 0 && ad_data.wavelength_shift > 0) || (shifts.wavelength_shift < 0 && ad_data.wavelength_shift < 0);
      
      let confidence = 0;
      if (densMatch && waveMatch) {
         // Both moved in expected direction! Rate confidence inversely to pattern score 
         confidence = 50 + ((1 - patternScore) * 40); 
         
         if (confidence > highestConfidence) {
           highestConfidence = confidence;
           bestMatch = ad_name.charAt(0).toUpperCase() + ad_name.slice(1) + " Oil";
         }
      }
    }
  }

  // Fallbacks if no profile match
  if (highestConfidence === 0) {
     if (shifts.density_shift > 0 && shifts.wavelength_shift < 0) {
       bestMatch = "Saturated Fats (e.g. Palm)"; highestConfidence = 65;
     } else if (shifts.density_shift > 0 && shifts.wavelength_shift > 0) {
       bestMatch = "Heavy Oils (e.g. Argemone/Castor)"; highestConfidence = 70;
     } else if (shifts.density_shift < 0 && shifts.wavelength_shift < 0) {
       bestMatch = "Mineral Oil / Solvents"; highestConfidence = 75;
     }
  }
  
  return {
    adulterant: bestMatch,
    confidence: Math.round(Math.min(highestConfidence, 99))
  };
}

// STEP 12 & 3: API-READY FUNCTION
function analyzeOil(inputReadings, oilType) {
  // Ensure we have an array
  let readings = Array.isArray(inputReadings) ? inputReadings : [inputReadings];
  
  // Backwards compatibility mappings for older frontend structures
  readings = readings.map(r => ({
    T: r.temperature_c || r.T || 25,
    density: r.density_gcm3 || r.density,
    wavelength: r.refractive_index || r.wavelength || r.optical
  }));

  // Filter out any invalid readings
  readings = readings.filter(r => r && r.density !== undefined && r.wavelength !== undefined);
  
  if (readings.length === 0) {
    throw new Error("No valid readings provided.");
  }

  const profile = OIL_DATASET[oilType] || OIL_DATASET["Mustard Oil"];
  
  // STEP 11: SAFETY + REALISM checks
  let tempWarnings = [];
  for (let r of readings) {
    if (r.T < 20 || r.T > 40) {
      tempWarnings.push(`Reading at ${r.T}°C is outside optimal 20-40°C range.`);
    }
    // Note: Noise tolerance is intrinsically handled by using `profile.tolerance` in deviations
  }

  const patternScore = analyzePattern(readings, profile);

  let totalReadingScore = 0;

  for (let r of readings) {
    // STEP 4
    let expDens = normalizeTemperature(r.T, profile.density_25C, profile.density_coeff);
    let expWave = normalizeTemperature(r.T, profile.wavelength_25C, profile.wavelength_coeff);

    // STEP 5
    let dScore = calculateDeviation(r.density, expDens, profile.tolerance);
    let wScore = calculateDeviation(r.wavelength, expWave, profile.tolerance);
    
    // temp_confidence: lower if outside 20-40 range
    let tempConf = (r.T >= 20 && r.T <= 40) ? 1.0 : 0.7;

    // STEP 7: PURITY CALC
    // reading_score = (0.4 * density_score + 0.5 * wavelength_score + 0.1 * temp_confidence)
    let rScore = (0.4 * dScore) + (0.5 * wScore) + (0.1 * tempConf);
    totalReadingScore += rScore;
  }

  let avgReadingScore = totalReadingScore / readings.length;
  
  let finalScore;
  if (readings.length > 1) {
    finalScore = (avgReadingScore * 0.7) + (patternScore * 0.3);
  } else {
    finalScore = avgReadingScore;
  }

  let purityPercentage = Math.round(finalScore * 1000) / 10; // 1 decimal

  // STEP 9: DECISION LOGIC
  let status, adulterationDetected;
  if (purityPercentage >= 90) {
    status = "Pure";
    adulterationDetected = false;
  } else if (purityPercentage >= 70) {
    status = "Slightly Suspicious";
    adulterationDetected = true;
  } else if (purityPercentage >= 50) {
    status = "Likely Adulterated";
    adulterationDetected = true;
  } else {
    status = "Highly Adulterated";
    adulterationDetected = true;
  }

  // STEP 8: Prediction
  let prediction = { adulterant: "", confidence: 0 };
  if (adulterationDetected) {
     prediction = detectAdulterant(readings, profile, patternScore);
  }

  // STEP 10: OUTPUT FORMAT
  return {
    oil_type: oilType || "Mustard Oil",
    purity_percentage: purityPercentage,
    status: status,
    adulteration_detected: adulterationDetected,
    possible_adulterant: adulterationDetected ? prediction.adulterant : "",
    adulterant_confidence: adulterationDetected ? `${prediction.confidence}%` : "",
    pattern_analysis: readings.length > 1 ? `Pattern Score: ${(patternScore*100).toFixed(1)}%` : "Not enough data for multi-temp analysis",
    temperature_warning: tempWarnings.length > 0 ? tempWarnings.join(" ") : null,
    readings_used: readings
  };
}

// Export for integration
module.exports = {
  analyzeOil,
  OIL_DATASET
};
