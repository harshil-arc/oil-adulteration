/**
 * ESP32 Firestore REST API Simulator
 * 
 * This script simulates the ESP32 hardware pushing real-time sensor
 * telemetry directly to the Firebase Firestore "readings" collection
 * using the exact same REST HTTP payload structure as the C++ code.
 */

const FIREBASE_PROJECT_ID = "oil-adulteration";
const FIREBASE_API_KEY = "AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/readings?key=${FIREBASE_API_KEY}`;

// Generate mock readings
const tempC = parseFloat((Math.random() * 5 + 27).toFixed(2)); // 27 to 32 °C
const weightG = parseFloat((Math.random() * 50 + 200).toFixed(2)); // 200 to 250 g

// Generate channel readings
const ch_f1  = Math.floor(Math.random() * 5 + 1);
const ch_f2  = Math.floor(Math.random() * 10 + 5);
const ch_fz  = Math.floor(Math.random() * 15 + 10);
const ch_f3  = Math.floor(Math.random() * 20 + 15);
const ch_f4  = Math.floor(Math.random() * 25 + 20);
const ch_f5  = Math.floor(Math.random() * 30 + 25);
const ch_fy  = Math.floor(Math.random() * 30 + 25);
const ch_fxl = Math.floor(Math.random() * 30 + 25);
const ch_f6  = Math.floor(Math.random() * 25 + 20);
const ch_f7  = Math.floor(Math.random() * 15 + 10);
const ch_f8  = Math.floor(Math.random() * 10 + 5);
const ch_vis = Math.floor(Math.random() * 50 + 35);
const ch_nir = Math.floor(Math.random() * 5 + 1);

const payload = {
  fields: {
    temperature: { doubleValue: tempC },
    weight: { doubleValue: weightG },
    created_at: { stringValue: new Date().toISOString() },
    spectral_data: {
      mapValue: {
        fields: {
          f1_405nm: { integerValue: String(ch_f1) },
          f2_425nm: { integerValue: String(ch_f2) },
          fz_450nm: { integerValue: String(ch_fz) },
          f3_475nm: { integerValue: String(ch_f3) },
          f4_515nm: { integerValue: String(ch_f4) },
          f5_550nm: { integerValue: String(ch_f5) },
          fy_555nm: { integerValue: String(ch_fy) },
          fxl_600nm: { integerValue: String(ch_fxl) },
          f6_640nm: { integerValue: String(ch_f6) },
          f7_690nm: { integerValue: String(ch_f7) },
          f8_745nm: { integerValue: String(ch_f8) },
          vis: { integerValue: String(ch_vis) },
          nir_855nm: { integerValue: String(ch_nir) }
        }
      }
    }
  }
};

console.log("--------------------------------------------------");
console.log("📡 SIMULATING ESP32 HARDWARE CLOUD PUSH");
console.log(`URL: ${FIRESTORE_URL}`);
console.log("Payload:", JSON.stringify(payload, null, 2));
console.log("--------------------------------------------------");

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
};

fetch(FIRESTORE_URL, options)
  .then(async (res) => {
    const text = await res.text();
    if (res.ok) {
      console.log(`✅ SUCCESS! Document added to Firestore.`);
      console.log(`Response Code: ${res.status}`);
      console.log("Response Body:", text);
      console.log("\n💡 Open your SpectraTrust App, go to 'Scan' -> 'Cloud Mode', and you will see the new live readings instantly!");
    } else {
      console.error(`❌ FAILED! Firebase returned error code: ${res.status}`);
      console.error("Error Detail:", text);
      if (res.status === 403) {
        console.error("\n💡 Double check that your Firestore Rules allow write access to /readings/{id}");
      }
    }
  })
  .catch(err => {
    console.error("❌ Connection failed:", err);
  });
