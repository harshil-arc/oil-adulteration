/**
 * firestoreSensorService.js
 * Multi-Provider Realtime Sensor Telemetry Service
 * Connects to Firebase Realtime Database, Cloud Firestore REST API & Supabase
 */

const FIRESTORE_PROJECT_ID = "oil-adulteration";
const FIRESTORE_API_KEY    = "AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";
const FIRESTORE_READINGS_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/readings?key=${FIRESTORE_API_KEY}`;
const FIREBASE_RTDB_READINGS_URL = "https://oil-adulteration-default-rtdb.firebaseio.com/readings.json";

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
 * Primary Fetch Function: Tries Firebase RTDB (Live Sensor Channel), then Firestore REST
 */
export async function fetchLatestCloudReading() {
  // ── 1. PRIMARY: Fetch from Firebase Realtime Database (Active Live Channel) ──────
  try {
    const rtdbRes = await fetch(FIREBASE_RTDB_READINGS_URL);
    if (rtdbRes.ok) {
      const rtdbData = await rtdbRes.json();
      if (rtdbData && typeof rtdbData === 'object') {
        // Map entries including Firebase push key (_key)
        const entries = Object.keys(rtdbData)
          .map(key => ({ _key: key, ...rtdbData[key] }))
          .filter(item => item && (item.spectral_data || item.temperature !== undefined));
        
        if (entries.length > 0) {
          // Firebase push keys (_key) are naturally chronological.
          // Sort newest first by Firebase key OR normalized timestamp.
          entries.sort((a, b) => {
            if (a._key && b._key) {
              return b._key.localeCompare(a._key);
            }
            const tA = typeof a.timestamp === 'number' ? a.timestamp : (new Date(a.created_at || a.timestamp || 0).getTime());
            const tB = typeof b.timestamp === 'number' ? b.timestamp : (new Date(b.created_at || b.timestamp || 0).getTime());
            return tB - tA;
          });

          const top = entries[0];
          console.log('[CloudSensorService] Retreived NEWEST reading from Firebase RTDB:', top);

          let parsedSpectral = '—';
          if (typeof top.spectral_data === 'string') {
            parsedSpectral = top.spectral_data;
          } else if (top.spectral_raw && typeof top.spectral_raw === 'object') {
            const sr = top.spectral_raw;
            parsedSpectral = [
              sr.f1_405nm || 0, sr.f2_425nm || 0, sr.fz_450nm || 0, sr.f3_475nm || 0,
              sr.f4_515nm || 0, sr.f5_550nm || 0, sr.fy_555nm || 0, sr.fxl_600nm || 0,
              sr.f6_640nm || 0, sr.f7_690nm || 0, sr.f8_745nm || 0, sr.vis || 0, sr.nir_855nm || 0
            ].join(',');
          }

          return {
            temperature: parseFloat(top.temperature) || 28.5,
            spectral_data: parsedSpectral,
            created_at: top.created_at || new Date(top.timestamp || Date.now()).toISOString(),
            timestamp: typeof top.timestamp === 'number' ? top.timestamp : Date.now(),
            oil_type: top.oil_type || 'Cloud Sample',
            adulteration_index: top.adulteration_index || 0
          };
        }
      }
    }
  } catch (rtdbErr) {
    console.warn('[CloudSensorService] RTDB fetch error:', rtdbErr);
  }

  // ── 2. SECONDARY: Try Google Cloud Firestore REST API ────────────────────
  try {
    const res = await fetch(FIRESTORE_READINGS_URL, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      const rawDocs = data.documents || [];
      
      if (rawDocs.length > 0) {
        const parsedList = rawDocs.map(parseFirestoreDoc).filter(Boolean);
        parsedList.sort((a, b) => b.timestamp - a.timestamp);
        console.log('[CloudSensorService] Retrieved reading from Firestore REST:', parsedList[0]);
        return parsedList[0];
      }
    }
  } catch (err) {
    console.warn('[CloudSensorService] Firestore GET Error:', err);
  }

  return null;
}
