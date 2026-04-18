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
const char* ssid       = "atl";
const char* password   = "harshil913";

// Endpoint targets the `readings` table — columns: temperature, weight, spectral_data
const char* supabaseUrl = "https://vntaprmahmjeyuzhwqsc.supabase.co/rest/v1/readings";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudGFwcm1haG1qZXl1emh3cXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjY3NDMsImV4cCI6MjA5MTA0Mjc0M30.K3NE7-bRaYRRRhV9Up2Y7f4mVoRvM3B0_dNMitJT_S8";

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

  oledShow("Setup Complete!", "Pushing to cloud...", "", "");
  delay(1000);
  Serial.println(F("=== Setup Complete ==="));
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

  // Read all 13 channels individually into named variables
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

  // ── 5. Build JSON Payload ─────────────────────────────────
  // Columns being sent to Supabase `readings` table:
  //   temperature  → DOUBLE PRECISION
  //   weight       → DOUBLE PRECISION
  //   spectral_data → JSONB (object with named channel keys)

  // Step A: spectral_data JSONB object
  char spectralJson[420];   // enlarged: 13 keys × ~20 chars each + braces
  snprintf(spectralJson, sizeof(spectralJson),
    "{\"f1_405nm\":%u,\"f2_425nm\":%u,\"fz_450nm\":%u,"
    "\"f3_475nm\":%u,\"f4_515nm\":%u,\"f5_550nm\":%u,"
    "\"fy_555nm\":%u,\"fxl_600nm\":%u,\"f6_640nm\":%u,"
    "\"f7_690nm\":%u,\"f8_745nm\":%u,\"vis\":%u,\"nir_855nm\":%u}",
    ch_f1, ch_f2, ch_fz, ch_f3, ch_f4,
    ch_f5, ch_fy, ch_fxl, ch_f6, ch_f7,
    ch_f8, ch_vis, ch_nir);

  // Step B: outer INSERT payload (column names must match readings table exactly)
  char payload[700];   // enlarged: 420 spectral + 50 floats + 50 keys
  snprintf(payload, sizeof(payload),
    "{\"temperature\":%.2f,\"weight\":%.2f,\"spectral_data\":%s}",
    tempC, weightG, spectralJson);

  // Safety check: warn if payload was truncated
  int payloadLen = strlen(payload);
  Serial.printf("Payload length: %d bytes\n", payloadLen);
  if (payloadLen >= (int)sizeof(payload) - 1) {
    Serial.println(F("⚠ WARNING: payload buffer full — JSON may be truncated!"));
  }

  Serial.println(F("--- Supabase Payload ---"));
  Serial.println(payload);
  Serial.println(F("------------------------"));

  // ── 6. POST to Supabase ──────────────────────────────────
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabaseUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);

    // Build Authorization header with char buffer (avoids String heap fragmentation)
    char authHeader[320];
    snprintf(authHeader, sizeof(authHeader), "Bearer %s", supabaseKey);
    http.addHeader("Authorization", authHeader);
    http.addHeader("Prefer", "return=minimal");

    int code = http.POST(payload);
    Serial.printf("Supabase Response: %d\n", code);

    if (code == 201) {
      Serial.println(F("✅ Row inserted successfully."));
    } else {
      // Always print body — tells you EXACTLY what Supabase rejected
      String errBody = http.getString();
      Serial.printf("❌ HTTP %d Error body:\n", code);
      Serial.println(errBody);
      if (code == 403)
        Serial.println(F("   Fix: ALTER TABLE public.readings DISABLE ROW LEVEL SECURITY;"));
      if (code == 404)
        Serial.println(F("   Fix: Run setup_readings_table.sql in Supabase SQL Editor."));
      if (code == 400)
        Serial.println(F("   Fix: Column name mismatch or table does not exist yet."));
    }

    http.end();
  } else {
    Serial.println(F("⚠ WiFi lost — attempting reconnect..."));
    WiFi.reconnect();
  }

  // ── 7. OLED Update ───────────────────────────────────────
  char row0[22], row1[22], row2[22], row3[22];
  snprintf(row0, sizeof(row0), "Oil Adulteration Sys");
  snprintf(row1, sizeof(row1), "Temp:   %.2f C", tempC);
  snprintf(row2, sizeof(row2), "Weight: %.2f g", weightG);
  snprintf(row3, sizeof(row3), "WiFi: %s",
    WiFi.status() == WL_CONNECTED ? "Connected" : "Reconnecting");
  oledShow(row0, row1, row2, row3);

  delay(2000);
}
