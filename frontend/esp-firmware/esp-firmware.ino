#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SparkFun_AS7343.h>
#include <Adafruit_MLX90614.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <math.h>

// ============================================================
//  CREDENTIALS
// ============================================================
const char* ssid       = "atl";
const char* password   = "harshil913";

// Firebase Realtime Database
const char* firebaseHost = "oil-adulteration-default-rtdb.firebaseio.com";

// Node under which readings are pushed. Each POST creates a new
// auto-generated key, e.g. /readings/-NxAbC123.json
const char* firebasePath = "/readings.json";

// Optional Database Auth secret / token (leave empty if rules allow write)
const char* firebaseAuth = "";

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

// ============================================================
//  SPECTRAL QUANTIZATION (raw counts -> compact 0-9 digit)
// ============================================================
const float MAX_RAW_COUNT = 20000.0;

uint8_t quantizeChannel(uint16_t raw) {
  if (raw == 0) return 0;
  float logMax = log2(MAX_RAW_COUNT + 1.0);
  float bin = (log2((float)raw + 1.0) / logMax) * 9.0;
  if (bin < 0) bin = 0;
  if (bin > 9) bin = 9;
  return (uint8_t)(bin + 0.5); // round to nearest digit
}

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

  // I2C Scan
  Serial.println(F("--- I2C Scan ---"));
  int foundDevices = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  Found device at 0x%02X\n", addr);
      foundDevices++;
    }
  }
  if (foundDevices == 0) {
    Serial.println(F("  No I2C devices found! Check wiring/power."));
  }
  Serial.println(F("----------------"));

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

  // Sync time — required for TLS certificate validation
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print(F("Syncing time"));
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(250);
    Serial.print('.');
    now = time(nullptr);
  }
  Serial.println(F(" done."));

  // MLX90614
  if (!mlx.begin()) {
    Serial.println(F("MLX90614: Not Found!"));
    oledShow("MLX90614 ERROR", "Check I2C wiring", "", "");
    delay(1000);
  } else {
    Serial.println(F("MLX90614: Ready."));
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

  // ── 2. Spectral Data (AS7343) ────────────────────────────
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

  // Quantize each raw channel down to a single 0-9 digit
  uint8_t q_f1  = quantizeChannel(ch_f1);
  uint8_t q_f2  = quantizeChannel(ch_f2);
  uint8_t q_fz  = quantizeChannel(ch_fz);
  uint8_t q_f3  = quantizeChannel(ch_f3);
  uint8_t q_f4  = quantizeChannel(ch_f4);
  uint8_t q_f5  = quantizeChannel(ch_f5);
  uint8_t q_fy  = quantizeChannel(ch_fy);
  uint8_t q_fxl = quantizeChannel(ch_fxl);
  uint8_t q_f6  = quantizeChannel(ch_f6);
  uint8_t q_f7  = quantizeChannel(ch_f7);
  uint8_t q_f8  = quantizeChannel(ch_f8);
  uint8_t q_vis = quantizeChannel(ch_vis);
  uint8_t q_nir = quantizeChannel(ch_nir);

  // Build compact quantized 13-digit string (0-9)
  char spectralDigits[14];
  snprintf(spectralDigits, sizeof(spectralDigits), "%u%u%u%u%u%u%u%u%u%u%u%u%u",
    q_f1, q_f2, q_fz, q_f3, q_f4, q_f5, q_fy, q_fxl, q_f6, q_f7, q_f8, q_vis, q_nir);

  // ── 3. Serial Debug ──────────────────────────────────────
  Serial.printf("Temp: %.2f°C | Spectral (0-9): %s\n", tempC, spectralDigits);

  // ── 4. Build JSON Payload (Temperature + Spectral 0-9 string ONLY) ──
  char tempField[16];
  if (isnan(tempC) || isinf(tempC)) {
    snprintf(tempField, sizeof(tempField), "null");
    Serial.println(F(" WARNING: MLX90614 returned NaN — sending null temperature."));
  } else {
    snprintf(tempField, sizeof(tempField), "%.2f", tempC);
  }

  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"temperature\":%s,\"spectral_data\":\"%s\",\"timestamp\":{\".sv\":\"timestamp\"}}",
    tempField, spectralDigits);

  Serial.println(F("--- Firebase Payload ---"));
  Serial.println(payload);
  Serial.println(F("------------------------"));

  // ── 5. POST to Firebase Realtime Database ────────────────
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();   // skip cert validation for Firebase RTDB

    HTTPClient http;

    String url = String("https://") + firebaseHost + firebasePath;
    if (strlen(firebaseAuth) > 0) {
      url += "?auth=";
      url += firebaseAuth;
    }

    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");

    int code = http.POST(payload);
    Serial.printf("Firebase Response: %d\n", code);

    if (code == 200) {
      String resp = http.getString();
      Serial.print(F("Row inserted successfully. Key: "));
      Serial.println(resp);
    } else {
      String errBody = http.getString();
      Serial.printf("HTTP %d Error body:\n", code);
      Serial.println(errBody);
      if (code == 401 || code == 403)
        Serial.println(F("   Fix: check Realtime Database Rules allow writes, or set firebaseAuth."));
    }

    http.end();
  } else {
    Serial.println(F(" WiFi lost — attempting reconnect..."));
    WiFi.reconnect();
  }

  // ── 6. OLED Update ───────────────────────────────────────
  char row0[22], row1[22], row2[22], row3[22];
  snprintf(row0, sizeof(row0), "Oil Adulteration Sys");
  if (isnan(tempC) || isinf(tempC)) {
    snprintf(row1, sizeof(row1), "Temp: ERROR");
  } else {
    snprintf(row1, sizeof(row1), "Temp: %.2f C", tempC);
  }
  snprintf(row2, sizeof(row2), "Spec: %s", spectralDigits);
  snprintf(row3, sizeof(row3), "Status: Pushed to Cloud");
  oledShow(row0, row1, row2, row3);

  delay(2000);
}
