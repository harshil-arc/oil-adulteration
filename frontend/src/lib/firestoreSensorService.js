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
          // Firebase RTDB push keys are inserted chronologically.
          // Attach insertion index and sort by newest pushed entry first (_index descending).
          entries.forEach((item, idx) => {
            item._index = idx;
          });

          entries.sort((a, b) => b._index - a._index);

          const top = entries[0];
          console.log('[CloudSensorService] Retrieved LATEST live reading from Firebase RTDB:', top);

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

  // ── 2. SECONDARY: Try Supabase REST API ────────────────────────────────
  try {
    const supaRes = await fetch("https://vntaprmahmjeyuzhwqsc.supabase.co/rest/v1/readings?select=*&order=id.desc&limit=1", {
      headers: {
        'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudGFwcm1haG1qZXl1emh3cXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjY3NDMsImV4cCI6MjA5MTA0Mjc0M30.K3NE7-bRaYRRRhV9Up2Y7f4mVoRvM3B0_dNMitJT_S8",
        'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudGFwcm1haG1qZXl1emh3cXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjY3NDMsImV4cCI6MjA5MTA0Mjc0M30.K3NE7-bRaYRRRhV9Up2Y7f4mVoRvM3B0_dNMitJT_S8",
        'Accept': 'application/json'
      }
    });

    if (supaRes.ok) {
      const supaData = await supaRes.json();
      if (Array.isArray(supaData) && supaData.length > 0) {
        const item = supaData[0];
        let specStr = '—';
        if (typeof item.spectral_data === 'string') specStr = item.spectral_data;
        else if (Array.isArray(item.spectral_data)) specStr = item.spectral_data.join(',');
        
        console.log('[CloudSensorService] Retrieved reading from Supabase REST:', item);
        return {
          temperature: parseFloat(item.temperature) || 28.5,
          spectral_data: specStr,
          created_at: item.created_at || new Date().toISOString(),
          timestamp: Date.now(),
          oil_type: item.oil_type || 'Cloud Sample',
          adulteration_index: item.adulteration_index || 0
        };
      }
    }
  } catch (supaErr) {
    console.warn('[CloudSensorService] Supabase GET Error:', supaErr);
  }

  // ── 3. TERTIARY: Try Google Cloud Firestore REST API ────────────────────
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
    const FIRESTORE_PROJECT_ID = "oil-adulteration";
    const FIRESTORE_API_KEY    = "AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";
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
