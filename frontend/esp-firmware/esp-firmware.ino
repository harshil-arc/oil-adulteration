#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SparkFun_AS7343.h>
#include <Adafruit_MLX90614.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "HX711.h"

// ============================================================
//  CREDENTIALS
// ============================================================
const char* ssid     = "atl";
const char* password = "harshil913";

// ── Firebase Firestore REST API ──────────────────────────────
// Format: POST https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/{collection}
//
// For public write (no auth required if your Firestore rule is:
//   match /readings/{id} { allow write: if true; }
// ), you do NOT need an Auth token — just the API key as a query param.
//
const char* FIREBASE_PROJECT_ID = "oil-adulteration";
const char* FIREBASE_API_KEY    = "AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";

// Full URL built in loop: base + "?key=" + FIREBASE_API_KEY
const char* FIRESTORE_BASE =
  "https://firestore.googleapis.com/v1/projects/oil-adulteration/databases/(default)/documents/readings";

// ============================================================
//  PINS
// ============================================================
const int LOADCELL_DOUT_PIN = 4;
const int LOADCELL_SCK_PIN  = 5;

// ============================================================
//  OLED
// ============================================================
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define OLED_ADDRESS  0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ============================================================
//  SENSORS
// ============================================================
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
SfeAS7343ArdI2C  spectralSensor;
HX711            scale;

// ============================================================
//  OLED HELPER — 4 rows of text
// ============================================================
void oledShow(const char* r0, const char* r1, const char* r2, const char* r3) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,  0); display.println(r0);
  display.setCursor(0, 16); display.println(r1);
  display.setCursor(0, 32); display.println(r2);
  display.setCursor(0, 48); display.println(r3);
  display.display();
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println(F("OLED not found!"));
    while (true);
  }
  oledShow("Initializing...", "", "", "");

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print(F("Connecting to WiFi"));
  oledShow("WiFi connecting...", "", "", "");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println(F("\nWiFi Connected!"));
  char ipBuf[20];
  WiFi.localIP().toString().toCharArray(ipBuf, sizeof(ipBuf));
  oledShow("WiFi Connected!", ipBuf, "", "");
  delay(1000);

  // MLX90614
  if (!mlx.begin()) {
    Serial.println(F("MLX90614: Not Found!"));
    oledShow("MLX90614 ERROR", "Check I2C wiring", "", "");
    delay(1000);
  } else {
    Serial.println(F("MLX90614: Ready."));
  }

  // HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(-7050);
  unsigned long t0 = millis();
  while (!scale.is_ready()) {
    if (millis() - t0 > 5000) {
      Serial.println(F("HX711: Timeout!"));
      oledShow("HX711 Timeout!", "Check wiring", "", "");
      delay(1000);
      break;
    }
    delay(100);
  }
  if (scale.is_ready()) {
    scale.tare();
    Serial.println(F("HX711: Ready & tared."));
  }

  // AS7343
  if (!spectralSensor.begin()) {
    Serial.println(F("AS7343: Not Found!"));
    oledShow("AS7343 Error!", "Check I2C wiring", "", "");
    delay(1000);
  } else {
    spectralSensor.powerOn();
    spectralSensor.setAutoSmux(AUTOSMUX_18_CHANNELS);
    spectralSensor.enableSpectralMeasurement();
    Serial.println(F("AS7343: Ready."));
  }

  oledShow("Setup Complete!", "Pushing to Firebase", "", "");
  delay(1000);
  Serial.println(F("=== Setup Complete. Sending to Firebase Firestore ==="));
}

// ============================================================
//  LOOP
// ============================================================
void loop() {

  // ── 1. Temperature (MLX90614) ─────────────────────────────
  float tempC = mlx.readObjectTempC();

  // ── 2. Weight (HX711) ────────────────────────────────────
  float weightG = 0.0;
  unsigned long t0 = millis();
  while (!scale.is_ready()) {
    if (millis() - t0 > 3000) { Serial.println(F("HX711: Timeout in loop")); break; }
    delay(50);
  }
  if (scale.is_ready()) weightG = scale.get_units(3);

  // ── 3. Spectral Data (AS7343) ────────────────────────────
  spectralSensor.ledOn();
  delay(100);
  spectralSensor.readSpectraDataFromSensor();
  spectralSensor.ledOff();

  // Read all 13 channels
  uint16_t ch_f1  = spectralSensor.getChannelData(CH_PURPLE_F1_405NM);
  uint16_t ch_f2  = spectralSensor.getChannelData(CH_DARK_BLUE_F2_425NM);
  uint16_t ch_fz  = spectralSensor.getChannelData(CH_BLUE_FZ_450NM);
  uint16_t ch_f3  = spectralSensor.getChannelData(CH_LIGHT_BLUE_F3_475NM);
  uint16_t ch_f4  = spectralSensor.getChannelData(CH_BLUE_F4_515NM);
  uint16_t ch_f5  = spectralSensor.getChannelData(CH_GREEN_F5_550NM);
  uint16_t ch_fy  = spectralSensor.getChannelData(CH_GREEN_FY_555NM);
  uint16_t ch_fxl = spectralSensor.getChannelData(CH_ORANGE_FXL_600NM);
  uint16_t ch_f6  = spectralSensor.getChannelData(CH_BROWN_F6_640NM);
  uint16_t ch_f7  = spectralSensor.getChannelData(CH_RED_F7_690NM);
  uint16_t ch_f8  = spectralSensor.getChannelData(CH_DARK_RED_F8_745NM);
  uint16_t ch_vis = spectralSensor.getChannelData(CH_VIS_1);
  uint16_t ch_nir = spectralSensor.getChannelData(CH_NIR_855NM);

  // ── 4. Serial Debug ──────────────────────────────────────
  Serial.printf("Temp: %.2f°C | Weight: %.2fg\n", tempC, weightG);
  Serial.printf("Spectral: f1=%u f2=%u fz=%u f3=%u f4=%u f5=%u fy=%u fxl=%u f6=%u f7=%u f8=%u vis=%u nir=%u\n",
    ch_f1, ch_f2, ch_fz, ch_f3, ch_f4, ch_f5, ch_fy, ch_fxl, ch_f6, ch_f7, ch_f8, ch_vis, ch_nir);

  // ── 5. Build Firestore JSON Payload ──────────────────────
  //
  // Firestore REST API expects data in its own typed format:
  // {
  //   "fields": {
  //     "fieldName": { "doubleValue": 25.5 },
  //     "fieldName": { "integerValue": "1234" },
  //     "fieldName": { "mapValue": { "fields": { ... } } }
  //   }
  // }
  //
  // We also include a "created_at" timestamp so the app can
  // order by it with .order('created_at', { ascending: false })
  //
  char payload[1800];

  // Get current timestamp in RFC3339 format
  // (Firestore also accepts serverTimestamp but that needs admin SDK)
  // We'll use a stringValue for created_at; the app sorts by it lexicographically
  // which works perfectly for ISO 8601 strings.
  //
  // NOTE: millis() only gives uptime, not real clock. If you add an NTP
  // sync call, replace timestampStr with actual UTC time. For now we
  // use the upload time on the server side via the app's Firestore write.
  //
  // We encode it as a serverTimestamp field so Firestore fills it automatically.

  snprintf(payload, sizeof(payload),
    "{"
      "\"fields\":{"
        "\"temperature\":{\"doubleValue\":%.4f},"
        "\"weight\":{\"doubleValue\":%.4f},"
        "\"spectral_data\":{"
          "\"mapValue\":{\"fields\":{"
            "\"f1_405nm\":{\"integerValue\":\"%u\"},"
            "\"f2_425nm\":{\"integerValue\":\"%u\"},"
            "\"fz_450nm\":{\"integerValue\":\"%u\"},"
            "\"f3_475nm\":{\"integerValue\":\"%u\"},"
            "\"f4_515nm\":{\"integerValue\":\"%u\"},"
            "\"f5_550nm\":{\"integerValue\":\"%u\"},"
            "\"fy_555nm\":{\"integerValue\":\"%u\"},"
            "\"fxl_600nm\":{\"integerValue\":\"%u\"},"
            "\"f6_640nm\":{\"integerValue\":\"%u\"},"
            "\"f7_690nm\":{\"integerValue\":\"%u\"},"
            "\"f8_745nm\":{\"integerValue\":\"%u\"},"
            "\"vis\":{\"integerValue\":\"%u\"},"
            "\"nir_855nm\":{\"integerValue\":\"%u\"}"
          "}}}"
        "}"
      "}"
    "}",
    tempC, weightG,
    ch_f1, ch_f2, ch_fz, ch_f3, ch_f4,
    ch_f5, ch_fy, ch_fxl, ch_f6, ch_f7,
    ch_f8, ch_vis, ch_nir
  );

  // Safety check
  int payloadLen = strlen(payload);
  Serial.printf("Payload length: %d bytes\n", payloadLen);
  if (payloadLen >= (int)sizeof(payload) - 1) {
    Serial.println(F("⚠ WARNING: payload buffer full — JSON may be truncated!"));
  }

  Serial.println(F("--- Firebase Payload ---"));
  Serial.println(payload);
  Serial.println(F("------------------------"));

  // ── 6. POST to Firebase Firestore REST API ────────────────
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Build full URL with API key appended as query param
    // Firestore auto-generates a document ID when you POST to the collection endpoint
    char url[256];
    snprintf(url, sizeof(url), "%s?key=%s", FIRESTORE_BASE, FIREBASE_API_KEY);

    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int code = http.POST(payload);
    Serial.printf("Firebase Response Code: %d\n", code);

    if (code == 200) {
      Serial.println(F("✅ Document inserted into Firestore successfully."));
      oledShow("Firebase: OK", "Doc inserted!", "", "");
    } else {
      String errBody = http.getString();
      Serial.printf("❌ HTTP %d Error:\n", code);
      Serial.println(errBody);

      if (code == 403) {
        Serial.println(F("   Fix: Set Firestore rule: allow write: if true; for /readings/{id}"));
        oledShow("Firebase: 403", "Check rules!", "", "");
      } else if (code == 400) {
        Serial.println(F("   Fix: JSON payload malformed. Check Serial output."));
        oledShow("Firebase: 400", "Bad JSON!", "", "");
      } else {
        oledShow("Firebase ERR", errBody.substring(0, 20).c_str(), "", "");
      }
    }

    http.end();
  } else {
    Serial.println(F("⚠ WiFi lost — attempting reconnect..."));
    WiFi.reconnect();
    oledShow("WiFi Lost!", "Reconnecting...", "", "");
  }

  // ── 7. OLED Update ───────────────────────────────────────
  char row0[22], row1[22], row2[22], row3[22];
  snprintf(row0, sizeof(row0), "Oil Adulteration Sys");
  snprintf(row1, sizeof(row1), "Temp:   %.2f C", tempC);
  snprintf(row2, sizeof(row2), "Weight: %.2f g", weightG);
  snprintf(row3, sizeof(row3), "WiFi: %s",
    WiFi.status() == WL_CONNECTED ? "Connected" : "Reconnecting");
  oledShow(row0, row1, row2, row3);

  delay(5000);  // push every 5 seconds
}
