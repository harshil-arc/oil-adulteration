/**
 * ESP32 Firebase Multi-Provider Telemetry Simulator
 * 
 * Simulates the ESP32 hardware pushing real-time sensor telemetry
 * directly to BOTH:
 * 1. Firebase Realtime Database (/readings.json)
 * 2. Google Cloud Firestore (/readings collection via REST API)
 * 
 * Usage:
 *   node simulate-cloud-push.js          -> Push a single test reading
 *   node simulate-cloud-push.js --stream -> Continuously push fresh readings every 2.5s
 */

const FIREBASE_PROJECT_ID = "oil-adulteration";
const FIREBASE_API_KEY = "AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/readings?key=${FIREBASE_API_KEY}`;
const FIREBASE_RTDB_URL = "https://oil-adulteration-default-rtdb.firebaseio.com/readings.json";

function generateSample() {
  const tempC = parseFloat((Math.random() * 4 + 26.5).toFixed(2)); // 26.5 to 30.5 °C
  const weightG = parseFloat((Math.random() * 30 + 210).toFixed(2));

  // 13 AS7343 spectral channels
  const channels = [
    Math.floor(Math.random() * 3 + 1),   // f1_405nm
    Math.floor(Math.random() * 8 + 3),   // f2_425nm
    Math.floor(Math.random() * 12 + 8),  // fz_450nm
    Math.floor(Math.random() * 18 + 12), // f3_475nm
    Math.floor(Math.random() * 22 + 15), // f4_515nm
    Math.floor(Math.random() * 25 + 20), // f5_550nm
    Math.floor(Math.random() * 25 + 20), // fy_555nm
    Math.floor(Math.random() * 25 + 20), // fxl_600nm
    Math.floor(Math.random() * 20 + 15), // f6_640nm
    Math.floor(Math.random() * 12 + 6),  // f7_690nm
    Math.floor(Math.random() * 8 + 3),   // f8_745nm
    Math.floor(Math.random() * 40 + 30), // vis
    Math.floor(Math.random() * 4 + 1)    // nir_855nm
  ];

  const specCsv = channels.join(',');
  const nowEpoch = Date.now();
  const nowIso = new Date().toISOString();

  return { tempC, weightG, channels, specCsv, nowEpoch, nowIso };
}

async function pushReading() {
  const sample = generateSample();

  // 1. Payload for Firebase Realtime Database
  const rtdbPayload = {
    temperature: sample.tempC,
    weight: sample.weightG,
    spectral_data: sample.specCsv,
    oil_type: "Mustard Oil Sample",
    timestamp: sample.nowEpoch,
    created_at: sample.nowIso
  };

  // 2. Payload for Firestore REST API
  const firestorePayload = {
    fields: {
      temperature: { doubleValue: sample.tempC },
      weight: { doubleValue: sample.weightG },
      spectral_data: { stringValue: sample.specCsv },
      oil_type: { stringValue: "Mustard Oil Sample" },
      created_at: { stringValue: sample.nowIso },
      timestamp: { integerValue: String(sample.nowEpoch) }
    }
  };

  console.log(`\n📡 [${new Date().toLocaleTimeString()}] Pushing Sensor Telemetry to Firebase:`);
  console.log(`   Temp: ${sample.tempC}°C | Spec (13-Ch): ${sample.specCsv}`);

  let rtdbSuccess = false;
  let fsSuccess = false;

  // Push to Firebase RTDB
  try {
    const rtdbRes = await fetch(FIREBASE_RTDB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rtdbPayload)
    });
    if (rtdbRes.ok) {
      const data = await rtdbRes.json();
      rtdbSuccess = true;
      console.log(`   ✅ Firebase Realtime Database: SUCCESS (Key: ${data.name})`);
    } else {
      console.error(`   ❌ Firebase Realtime Database: HTTP ${rtdbRes.status}`);
    }
  } catch (err) {
    console.error(`   ❌ Firebase Realtime Database Error:`, err.message);
  }

  // Push to Firestore REST
  try {
    const fsRes = await fetch(FIRESTORE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestorePayload)
    });
    if (fsRes.ok) {
      fsSuccess = true;
      console.log(`   ✅ Google Cloud Firestore: SUCCESS (HTTP 200)`);
    } else {
      console.error(`   ❌ Google Cloud Firestore: HTTP ${fsRes.status}`);
    }
  } catch (err) {
    console.error(`   ❌ Google Cloud Firestore Error:`, err.message);
  }

  return rtdbSuccess || fsSuccess;
}

const isStream = process.argv.includes('--stream') || process.argv.includes('--loop') || process.argv.includes('-s');

if (isStream) {
  console.log("==================================================");
  console.log("🚀 STARTING CONTINUOUS SENSOR TELEMETRY STREAM");
  console.log("   Pushing simulated sensor packets every 2.5s...");
  console.log("   Press Ctrl+C to terminate");
  console.log("==================================================");

  pushReading();
  setInterval(pushReading, 2500);
} else {
  console.log("--------------------------------------------------");
  console.log("📡 SIMULATING SINGLE ESP32 CLOUD PUSH");
  console.log("--------------------------------------------------");
  pushReading().then(ok => {
    if (ok) {
      console.log("\n💡 Telemetry pushed to Firebase! Open the Food 360 App, go to 'Scan' -> 'Cloud Sync' -> 'START FETCHING' to view live data!");
      console.log("💡 To stream continuously, run: node backend/simulate-cloud-push.js --stream");
    }
  });
}
