/**
 * firestoreSensorService.js
 * Dedicated Cloud Fetching Service for ESP32 Sensor Telemetry
 * Interoperable with Google Cloud Firestore REST API, Firebase RTDB & Supabase
 */

const FIRESTORE_PROJECT_ID = "oil-adulteration";
const FIRESTORE_API_KEY    = "AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";
const FIRESTORE_READINGS_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/readings?key=${FIRESTORE_API_KEY}`;
const FIRESTORE_QUERY_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIRESTORE_API_KEY}`;
const FIREBASE_RTDB_READINGS_URL = "https://oil-adulteration-default-rtdb.firebaseio.com/readings.json";

/**
 * Parses a single Google Cloud Firestore REST API document format
 */
export function parseFirestoreDoc(doc) {
  if (!doc) return null;
  const fields = doc.fields || {};

  // Extract Temperature
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

  // Extract Spectral Data String (13 comma-separated quantized 0-255 values)
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

  // Extract Timestamp
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
 * Primary Fetch Function: Obtains the latest live sensor reading from Cloud Firestore REST API
 */
export async function fetchLatestCloudReading() {
  console.log('[FirestoreService] Fetching latest sensor reading from Cloud Firestore REST API...');

  // 1. Primary Method: Query Cloud Firestore REST API directly
  try {
    const res = await fetch(FIRESTORE_READINGS_URL, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      const rawDocs = data.documents || [];
      
      if (rawDocs.length > 0) {
        const parsedList = rawDocs.map(parseFirestoreDoc).filter(Boolean);
        // Sort absolute newest first by timestamp
        parsedList.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('[FirestoreService] Successfully retrieved latest reading from Firestore REST:', parsedList[0]);
        return parsedList[0];
      }
    }
  } catch (err) {
    console.warn('[FirestoreService] Firestore GET Error:', err);
  }

  // 2. Secondary Method: Try Firestore Structured RunQuery REST API
  try {
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "readings" }],
        limit: 5
      }
    };

    const res = await fetch(FIRESTORE_QUERY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryPayload)
    });

    if (res.ok) {
      const results = await res.json();
      const docs = results
        .map(r => r.document)
        .filter(Boolean)
        .map(parseFirestoreDoc);

      if (docs.length > 0) {
        docs.sort((a, b) => b.timestamp - a.timestamp);
        console.log('[FirestoreService] Retrieved reading via Firestore RunQuery:', docs[0]);
        return docs[0];
      }
    }
  } catch (err) {
    console.warn('[FirestoreService] Firestore RunQuery Error:', err);
  }

  // 3. Fallback Method: Try Firebase Realtime Database
  try {
    const rtdbRes = await fetch(FIREBASE_RTDB_READINGS_URL);
    if (rtdbRes.ok) {
      const rtdbData = await rtdbRes.json();
      if (rtdbData && typeof rtdbData === 'object') {
        const entries = Object.values(rtdbData).filter(item => item && (item.spectral_data || item.temperature));
        entries.sort((a, b) => {
          const tA = typeof a.timestamp === 'number' ? a.timestamp : (new Date(a.created_at || a.timestamp || 0).getTime());
          const tB = typeof b.timestamp === 'number' ? b.timestamp : (new Date(b.created_at || b.timestamp || 0).getTime());
          return tB - tA;
        });
        if (entries.length > 0) {
          const top = entries[0];
          return {
            temperature: parseFloat(top.temperature) || 26.5,
            spectral_data: typeof top.spectral_data === 'string' ? top.spectral_data : '—',
            created_at: top.created_at || new Date().toISOString(),
            timestamp: typeof top.timestamp === 'number' ? top.timestamp : Date.now(),
            oil_type: top.oil_type || 'Cloud Sample',
            adulteration_index: top.adulteration_index || 0
          };
        }
      }
    }
  } catch (rtdbErr) {
    console.warn('[FirestoreService] RTDB fallback error:', rtdbErr);
  }

  // 4. Default Fallback if cloud is initializing
  return null;
}
