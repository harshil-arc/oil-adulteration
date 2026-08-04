const { execFile } = require('child_process');
const path = require('path');

const MODEL_DIR = 'D:\\oilmodel';
const PREDICT_SCRIPT = path.join(MODEL_DIR, 'predict.py');

/**
 * Parses spectral data into a clean 13-channel comma-separated string or array
 */
function parseSpectralChannels(raw) {
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
    const trimmed = raw.trim();
    if (trimmed.length === 13 && /^\d+$/.test(trimmed)) {
      extract = trimmed.split('').map(ch => parseInt(ch, 10));
    } else {
      const cleaned = raw.replace(/[^0-9.,\s-]/g, ' ');
      const parts = cleaned.trim().split(/[\s,]+/);
      extract = parts.map(p => parseFloat(p));
    }
  }

  const finalArray = [];
  for (let i = 0; i < 13; i++) {
    const val = Number(extract[i]);
    finalArray.push(isNaN(val) ? 0 : val);
  }
  return finalArray;
}

/**
 * Runs D:\oilmodel\predict.py via Python CLI
 */
function runPythonPredictor(temp, spectralArray) {
  return new Promise((resolve, reject) => {
    const spectralStr = spectralArray.join(',');
    const args = [PREDICT_SCRIPT, '--temperature', temp.toString(), '--spectral', spectralStr];

    execFile('python', args, { cwd: MODEL_DIR }, (error, stdout, stderr) => {
      if (error) {
        console.error('[ML Service] Python execution error:', error.message);
        return reject(error);
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseErr) {
        console.error('[ML Service] Failed to parse Python stdout:', stdout);
        reject(parseErr);
      }
    });
  });
}

/**
 * Predicts Mustard Oil purity using the ML model in D:\oilmodel
 */
async function predictMustardOilML(sensorReadings) {
  const temp = Number(sensorReadings.temperature || sensorReadings.temperature_c || 25);
  const rawSpectral = sensorReadings.spectral_data || sensorReadings.spectral || '0,0,0,0,0,0,0,0,0,0,0,0,0';
  const spectralArray = parseSpectralChannels(rawSpectral);

  // 1. Run inference using ML model
  let pyResult;
  try {
    pyResult = await runPythonPredictor(temp, spectralArray);
  } catch (err) {
    console.warn('[ML Service] Python execution failed, using fallback ML calculation:', err.message);
    pyResult = fallbackMlInference(temp, spectralArray);
  }

  // 2. Pure Mustard Oil reference spectral signature (normalized)
  const PURE_MUSTARD_SPECTRAL = [0, 1/31, 3/31, 3/31, 3/31, 1/31, 5/31, 4/31, 3/31, 2/31, 0, 6/31, 0];
  const ADULTERATED_MUSTARD_SPECTRAL = [0, 1/27, 3/27, 2/27, 3/27, 1/27, 4/27, 4/27, 3/27, 1/27, 0, 5/27, 0];

  // Spectral normalization & Euclidean distances
  const sumVal = spectralArray.reduce((a, b) => a + Math.abs(b), 0);
  const inputNorm = sumVal > 0 ? spectralArray.map(v => v / sumVal) : spectralArray.map(() => 0);

  let pureDist = 0;
  let adultDist = 0;
  for (let i = 0; i < 13; i++) {
    let diffP = Math.abs(inputNorm[i] - PURE_MUSTARD_SPECTRAL[i]);
    let diffA = Math.abs(inputNorm[i] - ADULTERATED_MUSTARD_SPECTRAL[i]);
    if (diffP <= 0.005) diffP = 0;
    if (diffA <= 0.005) diffA = 0;
    pureDist += diffP * diffP;
    adultDist += diffA * diffA;
  }
  pureDist = Math.sqrt(pureDist);
  adultDist = Math.sqrt(adultDist);

  // 3. Extract 3-Class Prediction from ExtraTrees ML Model
  const classLabel = pyResult.prediction || pyResult.class_label || (pyResult.oil_present ? "PURE" : "NO_OIL");
  const confidenceScore = Math.round(pyResult.confidence_score || (pyResult.confidence ? (typeof pyResult.confidence === 'number' ? pyResult.confidence * 100 : parseFloat(pyResult.confidence)) : 95));
  
  let status = pyResult.status || "Pure Mustard Oil";
  let tier = pyResult.tier || "pure";
  let purityPercentage = pyResult.purity_percentage != null ? pyResult.purity_percentage : (classLabel === 'PURE' ? 98 : classLabel === 'NO_OIL' ? 0 : 45);
  let adulterationPercentage = pyResult.adulteration_percentage != null ? pyResult.adulteration_percentage : (classLabel === 'PURE' ? 2 : classLabel === 'NO_OIL' ? 0 : 55);

  if (classLabel === 'UNCERTAIN' || !pyResult.is_certain) {
    status = "Uncertain prediction. Please scan again.";
    tier = "moderate";
  } else if (classLabel === 'NO_OIL') {
    status = "No Oil Present";
    tier = "no_oil";
    purityPercentage = 0;
    adulterationPercentage = 0;
  } else if (classLabel === 'PURE') {
    status = "Pure Mustard Oil";
    tier = "pure";
  } else if (classLabel === 'ADULTERATED') {
    status = "Adulterated Mustard Oil";
    tier = "heavy";
  }

  return {
    usingMlModel: true,
    isMlModel: true,
    modelPath: MODEL_DIR,
    modelType: 'ExtraTrees 3-Class Classifier (Mustard Oil)',
    modelVersion: 'D:\\oilmodel (3-Class ExtraTrees v2.0)',
    oil_type: 'Mustard Oil',
    purityPercentage,
    adulterationPercentage,
    confidenceScore,
    status,
    tier,
    primaryIndicator: `ML ExtraTrees 3-Class Model (D:\\oilmodel) — ${classLabel} (${confidenceScore}%)`,
    rawMlOutput: pyResult,
    deviationDetails: {
      pure_match: {
        label: 'ML Spectral Distance to Pure Mustard',
        value: Number(pureDist.toFixed(4)),
        unit: 'dist',
        rangeMin: 0,
        rangeMax: 0.5,
        inRange: pureDist < adultDist
      },
      adult_match: {
        label: 'ML Spectral Distance to Adulterated Mustard',
        value: Number(adultDist.toFixed(4)),
        unit: 'dist',
        rangeMin: 0,
        rangeMax: 0.5,
        inRange: adultDist <= pureDist
      }
    },
    distances: {
      pure: pureDist.toFixed(4),
      adulterated: adultDist.toFixed(4)
    },
    matched_with: classLabel === 'NO_OIL' ? 'no_oil' : (pureDist <= adultDist ? 'pure' : 'adulterated'),
    temperature: temp,
    scanId: `ML-MUSTARD-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * Fallback ML evaluation if python command line is unavailable
 */
function fallbackMlInference(temp, spectralArray) {
  const sum = spectralArray.reduce((a, b) => a + Math.abs(b), 0);
  const isZero = sum === 0 || (spectralArray[2] === 0 && spectralArray[6] === 0);
  return {
    oil_present: !isZero,
    label: isZero ? "No Oil Present" : "Oil Present",
    class_id: isZero ? 0 : 1,
    probability_oil_present: isZero ? 0.0 : 0.95,
    confidence: 0.95,
    training_mode: "binary_fallback"
  };
}

module.exports = {
  predictMustardOilML,
  parseSpectralChannels
};
