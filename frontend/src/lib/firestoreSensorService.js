/**
 * firestoreSensorService.js
 * Multi-Provider Realtime Sensor Telemetry Service
 * Connects to Firebase Realtime Database & Google Cloud Firestore
 */

const FIRESTORE_PROJECT_ID = "oil-adulteration";
const FIRESTORE_API_KEY    = "AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";
const FIRESTORE_READINGS_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/readings?key=${FIRESTORE_API_KEY}`;
const FIREBASE_RTDB_READINGS_URL = "https://oil-adulteration-default-rtdb.firebaseio.com/readings.json";
const FIREBASE_RTDB_LATEST_URL   = "https://oil-adulteration-default-rtdb.firebaseio.com/readings/latest.json";

/**
 * Parses a reading object from Firebase Realtime Database
 */
export function parseRtdbReading(raw) {
  if (!raw || typeof raw !== 'object') return null;

  let parsedSpectral = '—';
  if (typeof raw.spectral_data === 'string') {
    parsedSpectral = raw.spectral_data;
  } else if (Array.isArray(raw.spectral_data)) {
    parsedSpectral = raw.spectral_data.join(',');
  } else if (raw.spectral_raw && typeof raw.spectral_raw === 'object') {
    const sr = raw.spectral_raw;
    parsedSpectral = [
      sr.f1_405nm || 0, sr.f2_425nm || 0, sr.fz_450nm || 0, sr.f3_475nm || 0,
      sr.f4_515nm || 0, sr.f5_550nm || 0, sr.fy_555nm || 0, sr.fxl_600nm || 0,
      sr.f6_640nm || 0, sr.f7_690nm || 0, sr.f8_745nm || 0, sr.vis || 0, sr.nir_855nm || 0
    ].join(',');
  } else if (raw.spectral_data && typeof raw.spectral_data === 'object') {
    const sr = raw.spectral_data;
    parsedSpectral = [
      sr.f1_405nm || 0, sr.f2_425nm || 0, sr.fz_450nm || 0, sr.f3_475nm || 0,
      sr.f4_515nm || 0, sr.f5_550nm || 0, sr.fy_555nm || 0, sr.fxl_600nm || 0,
      sr.f6_640nm || 0, sr.f7_690nm || 0, sr.f8_745nm || 0, sr.vis || 0, sr.nir_855nm || 0
    ].join(',');
  }

  const temp = parseFloat(raw.temperature);
  let timestamp = Date.now();
  if (typeof raw.timestamp === 'number') {
    timestamp = raw.timestamp;
  } else if (raw.timestamp) {
    const parsed = parseInt(raw.timestamp, 10);
    if (!isNaN(parsed)) timestamp = parsed;
  } else if (raw.created_at) {
    timestamp = new Date(raw.created_at).getTime() || Date.now();
  }

  return {
    temperature: isNaN(temp) ? 28.5 : temp,
    spectral_data: parsedSpectral,
    created_at: raw.created_at || new Date(timestamp).toISOString(),
    timestamp,
    oil_type: raw.oil_type || 'Cloud Sample',
    adulteration_index: raw.adulteration_index || 0
  };
}

/**
 * Parses a single Google Cloud Firestore REST API document format
 */
export function parseFirestoreDoc(doc) {
  if (!doc) return null;
  const fields = doc.fields || {};

  let temperature = 26.5;
  if (fields.temperature) {
    if (fields.temperature.doubleValue !== undefined) {
      temperature = parseFloat(fields.temperature.doubleValue);
    } else if (fields.temperature.integerValue !== undefined) {
      temperature = parseInt(fields.temperature.integerValue, 10);
    } else if (fields.temperature.stringValue !== undefined) {
      temperature = parseFloat(fields.temperature.stringValue);
    }
  }

  let spectral_data = '—';
  if (fields.spectral_data) {
    if (fields.spectral_data.stringValue !== undefined) {
      spectral_data = fields.spectral_data.stringValue;
    } else if (fields.spectral_data.arrayValue?.values) {
      spectral_data = fields.spectral_data.arrayValue.values
        .map(v => v.integerValue || v.doubleValue || v.stringValue || '0')
        .join(',');
    } else if (fields.spectral_data.mapValue?.fields) {
      const mf = fields.spectral_data.mapValue.fields;
      const chs = [
        mf.f1_405nm?.integerValue || mf.f1_405nm?.doubleValue || 0,
        mf.f2_425nm?.integerValue || mf.f2_425nm?.doubleValue || 0,
        mf.fz_450nm?.integerValue || mf.fz_450nm?.doubleValue || 0,
        mf.f3_475nm?.integerValue || mf.f3_475nm?.doubleValue || 0,
        mf.f4_515nm?.integerValue || mf.f4_515nm?.doubleValue || 0,
        mf.f5_550nm?.integerValue || mf.f5_550nm?.doubleValue || 0,
        mf.fy_555nm?.integerValue || mf.fy_555nm?.doubleValue || 0,
        mf.fxl_600nm?.integerValue || mf.fxl_600nm?.doubleValue || 0,
        mf.f6_640nm?.integerValue || mf.f6_640nm?.doubleValue || 0,
        mf.f7_690nm?.integerValue || mf.f7_690nm?.doubleValue || 0,
        mf.f8_745nm?.integerValue || mf.f8_745nm?.doubleValue || 0,
        mf.vis?.integerValue || mf.vis?.doubleValue || 0,
        mf.nir_855nm?.integerValue || mf.nir_855nm?.doubleValue || 0
      ];
      spectral_data = chs.join(',');
    }
  }

  let timeStr = doc.createTime || doc.updateTime || new Date().toISOString();
  if (fields.created_at) {
    timeStr = fields.created_at.timestampValue || fields.created_at.stringValue || timeStr;
  }
  const timestamp = new Date(timeStr).getTime() || Date.now();

  return {
    id: doc.name ? doc.name.split('/').pop() : `doc-${Date.now()}`,
    temperature: isNaN(temperature) ? 26.5 : temperature,
    spectral_data: spectral_data || '—',
    created_at: timeStr,
    timestamp,
    oil_type: fields.oil_type?.stringValue || 'Cloud Sample',
    adulteration_index: fields.adulteration_index?.doubleValue || 0
  };
}

/**
 * Primary Fetch Function:
 * 1. Checks Firebase RTDB /readings/latest.json (instant ultra-low latency channel)
 * 2. Checks Firestore REST API /readings collection
 * 3. Falls back to latest key in RTDB /readings.json
 */
export async function fetchLatestCloudReading() {
  // ── 1. PRIMARY: Fetch from Firebase Realtime Database Dedicated Latest Node ──────
  try {
    const latestRes = await fetch(FIREBASE_RTDB_LATEST_URL, { signal: AbortSignal.timeout(3000) });
    if (latestRes.ok) {
      const latestData = await latestRes.json();
      if (latestData && (latestData.spectral_data || latestData.temperature !== undefined)) {
        const parsed = parseRtdbReading(latestData);
        if (parsed) {
          console.log('[CloudSensorService] Retrieved reading from RTDB /readings/latest:', parsed);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSensorService] RTDB /latest fetch notice:', err.message);
  }

  // ── 2. SECONDARY: Try Google Cloud Firestore REST API ────────────────────
  try {
    const fsRes = await fetch(FIRESTORE_READINGS_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });

    if (fsRes.ok) {
      const fsData = await fsRes.json();
      const rawDocs = fsData.documents || [];
      if (rawDocs.length > 0) {
        const parsedList = rawDocs.map(parseFirestoreDoc).filter(Boolean);
        parsedList.sort((a, b) => b.timestamp - a.timestamp);
        if (parsedList.length > 0) {
          console.log('[CloudSensorService] Retrieved reading from Firestore REST:', parsedList[0]);
          return parsedList[0];
        }
      }
    }
  } catch (fsErr) {
    console.warn('[CloudSensorService] Firestore REST notice:', fsErr.message);
  }

  // ── 3. TERTIARY: Fetch from RTDB /readings.json root node ─────────────────
  try {
    const rtdbRes = await fetch(FIREBASE_RTDB_READINGS_URL, { signal: AbortSignal.timeout(4000) });
    if (rtdbRes.ok) {
      const rtdbData = await rtdbRes.json();
      if (rtdbData && typeof rtdbData === 'object') {
        const keys = Object.keys(rtdbData).filter(k => k !== 'latest');
        if (keys.length > 0) {
          // Newest key is last
          const latestKey = keys[keys.length - 1];
          const item = rtdbData[latestKey];
          const parsed = parseRtdbReading(item);
          if (parsed) {
            console.log('[CloudSensorService] Retrieved latest reading from RTDB historical list:', parsed);
            return parsed;
          }
        }
      }
    }
  } catch (rtdbErr) {
    console.warn('[CloudSensorService] RTDB historical fetch notice:', rtdbErr.message);
  }

  return null;
}

/**
 * Pushes a new reading directly to Firebase Realtime Database & Firestore
 * Useful for simulators, backend bridges, and local sensor relays
 */
export async function pushCloudReading(readingData) {
  const payload = {
    temperature: parseFloat(readingData.temperature ?? 28.5),
    spectral_data: String(readingData.spectral_data ?? '1,2,3,4,5,6,7,8,9,10,11,12,13'),
    oil_type: readingData.oil_type || 'Raw Sample',
    timestamp: Date.now(),
    created_at: new Date().toISOString()
  };

  // 1. Put to /readings/latest.json
  try {
    await fetch(FIREBASE_RTDB_LATEST_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('[pushCloudReading] RTDB /latest error:', e);
  }

  // 2. Post to /readings.json
  try {
    await fetch(FIREBASE_RTDB_READINGS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('[pushCloudReading] RTDB /readings error:', e);
  }

  // 3. Post to Firestore REST
  try {
    await fetch(FIRESTORE_READINGS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          temperature: { doubleValue: payload.temperature },
          spectral_data: { stringValue: payload.spectral_data },
          oil_type: { stringValue: payload.oil_type },
          created_at: { stringValue: payload.created_at }
        }
      })
    });
  } catch (e) {
    console.warn('[pushCloudReading] Firestore error:', e);
  }

  return payload;
}

/**
 * Saves generated certificate with token number to Firebase RTDB & Firestore REST API
 */
export async function saveCertificateToFirebase(certData) {
  const firebaseRtdbCertUrl = "https://oil-adulteration-default-rtdb.firebaseio.com/certificates.json";
  try {
    const res = await fetch(firebaseRtdbCertUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...certData,
        saved_at: new Date().toISOString()
      })
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[FirebaseCertService] Certificate saved to Firebase RTDB:', data);
    }
  } catch (err) {
    console.warn('[FirebaseCertService] Firebase RTDB save error:', err);
  }

  // Also post to Firestore REST certificates collection
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/certificates?key=${FIRESTORE_API_KEY}`;
    await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          tokenNumber: { stringValue: String(certData.tokenNumber || '') },
          oilName: { stringValue: String(certData.oilName || '') },
          purityPercentage: { doubleValue: Number(certData.purityPercentage || 0) },
          quality: { stringValue: String(certData.quality || '') },
          reportNo: { stringValue: String(certData.reportNo || '') },
          deviceId: { stringValue: String(certData.deviceId || '') },
          timestamp: { stringValue: new Date().toISOString() }
        }
      })
    });
    console.log('[FirebaseCertService] Certificate saved to Firestore.');
  } catch (fsErr) {
    console.warn('[FirebaseCertService] Firestore save error:', fsErr);
  }
}
