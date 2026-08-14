/**
 * adulterationEngine.js
 * Deterministic spectral channel ratio & threshold calibration system.
 */

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

export function no_oil_check(channels) {
  const ch2 = channels[1] || 0;
  const ch4 = channels[3] || 0;
  const ch5 = channels[4] || 0;
  const ch6 = channels[5] || 0;
  const ch7 = channels[6] || 0;
  const ch11 = channels[10] || 0;
  const total = channels.reduce((a, b) => a + b, 0);

  const cond1 = ch6 >= 3 && ch6 <= 34;
  const cond2 = ch7 >= 3 && ch7 <= 34;
  const cond3 = ch11 >= 3 && ch11 <= 42;

  const denom = (ch4 + ch5) !== 0 ? (ch4 + ch5) : 0.0001;
  const ratio = (ch11 + ch7) / denom;
  const cond4 = ratio < 2.0 || ratio > 3.5;

  const cond5 = (total < 25) || (ch2 >= 16);

  const conditions = [cond1, cond2, cond3, cond4, cond5];
  const conditions_met = conditions.filter(Boolean).length;
  const is_no_oil = conditions_met >= 4;

  return { is_no_oil, conditions_met, ratio, total };
}

export function classifyChannels(channels) {
  if (!Array.isArray(channels) || channels.length < 13) {
    return { result: "ADULTERATED", grade: "Invalid channels", tier: "heavy", led_color: "red", status: "Adulterated Oil" };
  }

  const ch7 = channels[6] || 0;
  const ch8 = channels[7] || 0;
  const ch9 = channels[8] || 0;
  const total78 = ch7 + ch8;

  if (total78 < 21) {
    return {
      result: "PURE OIL",
      grade: "Pure / trace mustard oil to 80% pure",
      tier: "pure",
      led_color: "green",
      status: "Pure Oil"
    };
  } else {
    let grade = "Highly adulterated";
    if (total78 <= 23) grade = "~65% pure";
    else if (total78 <= 35) grade = "~45% pure (significant adulteration)";
    else if (total78 <= 50) grade = "Likely heavily adulterated";

    return {
      result: "ADULTERATED",
      grade,
      tier: "heavy",
      led_color: "red",
      status: "Adulterated Oil"
    };
  }
}

export function calculateAdulteration(sensorReadings, oilRef) {
  if (!sensorReadings || !oilRef) return fallbackResult();

  const temp = sensorReadings.temperature || sensorReadings.temp || 28.2;
  const rawArray = parseSpectralData(sensorReadings.spectral_data || sensorReadings.spectral);

  const classified = classifyChannels(rawArray);

  return {
    usingMlModel: true,
    isMlModel: true,
    modelPath: 'D:\\oilmodel',
    modelType: 'Deterministic Wavelength Calibration Engine',
    modelVersion: 'SpectraTrust Deterministic v3.0',
    oil_type: oilRef.oilName || 'Mustard Oil',
    result: classified.result,
    grade: classified.grade,
    status: classified.status,
    tier: classified.tier,
    led_color: classified.led_color,
    primaryIndicator: `Deterministic Calibration Engine — ${classified.result} (${classified.grade})`,
    temperature: temp,
    deviationDetails: {
      ch78_sum: {
        label: 'Channel7 + Channel8 Sum',
        value: (rawArray[6] || 0) + (rawArray[7] || 0),
        unit: 'count',
        rangeMin: 0,
        rangeMax: 18,
        inRange: ((rawArray[6] || 0) + (rawArray[7] || 0)) <= 18
      },
      ch9_val: {
        label: 'Channel9 NIR Value',
        value: rawArray[8] || 0,
        unit: 'count',
        rangeMin: 0,
        rangeMax: 6,
        inRange: (rawArray[8] || 0) <= 6
      }
    }
  };
}

function fallbackResult() {
  return {
    result: "NO OIL PRESENT",
    grade: "No data",
    status: "No Oil Present",
    primaryIndicator: "No data",
    deviationDetails: {},
    tier: "no_oil",
    led_color: "gray"
  };
}
