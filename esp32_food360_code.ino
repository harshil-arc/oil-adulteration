/*
 * ============================================================================
 *  FOOD 360 — ESP32 Complete AI Prediction & Telemetry Code
 *  Sensors: AS7343 13-Channel Spectrometer + MLX90614 IR Temperature Sensor
 *  Display: SSD1306 128x64 OLED (7-Screen AI Prediction Carousel)
 *  Cloud Endpoint: Firebase Realtime Database REST API
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SparkFun_AS7343.h>
#include <Adafruit_MLX90614.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <time.h>
#include <math.h>

// ============================================================
//  WIFI & FIREBASE REALTIME DATABASE CONFIG
// ============================================================
const char* ssid     = "atl";
const char* password = "harshil913";

// Firebase Realtime Database Endpoints
const char* FIREBASE_TELEMETRY_URL = "https://oil-adulteration-default-rtdb.firebaseio.com/readings.json";
const char* FIREBASE_RESULT_URL    = "https://oil-adulteration-default-rtdb.firebaseio.com/device_result.json";

// ============================================================
//  OLED DISPLAY (I2C SDA: 21, SCL: 22)
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
SfeAS7343ArdI2C   spectralSensor;

const float MAX_RAW_COUNT = 20000.0;

// Quantize raw channel (0-255)
uint8_t quantizeChannel(uint16_t raw) {
  if (raw == 0) return 0;
  float logMax = log2(MAX_RAW_COUNT + 1.0);
  float bin = (log2((float)raw + 1.0) / logMax) * 255.0;
  if (bin < 0) bin = 0;
  if (bin > 255) bin = 255;
  return (uint8_t)(bin + 0.5);
}

// OLED Helper — Render screen with title, big text & subtitle
void oledCard(const char* screenNum, const char* title, const char* mainVal, const char* subVal) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  
  // Header line
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(screenNum);
  display.print(" ");
  display.println(title);
  display.drawLine(0, 11, 128, 11, SSD1306_WHITE);

  // Main Big Value
  display.setTextSize(2);
  display.setCursor(0, 20);
  display.println(mainVal);

  // Subtitle
  display.setTextSize(1);
  display.setCursor(0, 48);
  display.println(subVal);

  display.display();
}

// OLED Helper — Standard 4-row text
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

// Structure to hold downloaded prediction from Firebase
struct AiPredictionPacket {
  String oilType;
  float purity;
  String status;
  String adulterantType;
  String estimatedMix;
  float temperature;
  int confidence;
  bool hasPrediction;
};

AiPredictionPacket currentPrediction = { "Mustard Oil", 0.0, "Analyzing...", "None", "0%", 28.5, 0, false };

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println(F("OLED not found!"));
    while (true);
  }
  oledShow("Food 360 AI Boot", "Initializing...", "", "");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print(F("Connecting to WiFi"));
  oledShow("Connecting WiFi...", ssid, "", "");

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 30) {
    delay(500);
    Serial.print('.');
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\nWiFi Connected!"));
    char ipBuf[20];
    WiFi.localIP().toString().toCharArray(ipBuf, sizeof(ipBuf));
    oledShow("WiFi Connected!", ipBuf, "", "");
    delay(1000);
  } else {
    Serial.println(F("\nWiFi Failed!"));
    oledShow("WiFi Connect Error!", "Check SSID/Password", "", "");
    delay(1000);
  }

  // NTP Time Sync
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print(F("Syncing NTP Time"));
  time_t now = time(nullptr);
  int tRetry = 0;
  while (now < 8 * 3600 * 2 && tRetry < 15) {
    delay(250);
    Serial.print('.');
    now = time(nullptr);
    tRetry++;
  }
  Serial.println(F(" NTP Ready."));

  // MLX90614 Temp Sensor
  if (!mlx.begin()) {
    Serial.println(F("MLX90614: Not Found!"));
    oledShow("MLX90614 ERROR", "Check Wiring", "", "");
    delay(1000);
  } else {
    Serial.println(F("MLX90614: Ready."));
  }

  // AS7343 Spectral Sensor
  if (!spectralSensor.begin()) {
    Serial.println(F("AS7343: Not Found!"));
    oledShow("AS7343 ERROR!", "Check Wiring", "", "");
    delay(1000);
  } else {
    spectralSensor.powerOn();
    spectralSensor.setAutoSmux(AUTOSMUX_18_CHANNELS);
    spectralSensor.enableSpectralMeasurement();
    Serial.println(F("AS7343: Ready."));
  }

  oledShow("Setup Complete!", "Waiting for AI...", "", "");
  delay(1000);
  Serial.println(F("=== ESP32 Telemetry Ready ==="));
}

// Simple JSON extraction helper for string values
String extractJsonString(String json, String key) {
  int kIdx = json.indexOf("\"" + key + "\"");
  if (kIdx == -1) return "";
  int cIdx = json.indexOf(":", kIdx);
  if (cIdx == -1) return "";
  int vStart = json.indexOf("\"", cIdx);
  if (vStart == -1) return "";
  int vEnd = json.indexOf("\"", vStart + 1);
  if (vEnd == -1) return "";
  return json.substring(vStart + 1, vEnd);
}

// Simple JSON extraction helper for number values
float extractJsonNumber(String json, String key) {
  int kIdx = json.indexOf("\"" + key + "\"");
  if (kIdx == -1) return 0.0;
  int cIdx = json.indexOf(":", kIdx);
  if (cIdx == -1) return 0.0;
  int vStart = cIdx + 1;
  while (vStart < json.length() && (json.charAt(vStart) == ' ' || json.charAt(vStart) == ':')) vStart++;
  int vEnd = vStart;
  while (vEnd < json.length() && (isdigit(json.charAt(vEnd)) || json.charAt(vEnd) == '.' || json.charAt(vEnd) == '-')) vEnd++;
  return json.substring(vStart, vEnd).toFloat();
}

// Fetch prediction from Firebase device_result node
void fetchPredictionFromFirebase() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, FIREBASE_RESULT_URL);
  int code = http.GET();

  if (code == 200) {
    String resp = http.getString();
    if (resp.length() > 10 && resp != "null") {
      String oil = extractJsonString(resp, "oil_type");
      String status = extractJsonString(resp, "safety_status");
      String adulterant = extractJsonString(resp, "adulteration_type");
      String estMix = extractJsonString(resp, "estimated_adulteration_percent");
      float purity = extractJsonNumber(resp, "purity_percentage");
      float confidence = extractJsonNumber(resp, "confidence_score");
      float temp = extractJsonNumber(resp, "temperature");

      if (oil.length() > 0) currentPrediction.oilType = oil;
      if (purity > 0) currentPrediction.purity = purity;
      if (status.length() > 0) currentPrediction.status = status;
      if (adulterant.length() > 0) currentPrediction.adulterantType = adulterant;
      if (estMix.length() > 0) currentPrediction.estimatedMix = estMix;
      if (temp > 0) currentPrediction.temperature = temp;
      if (confidence > 0) currentPrediction.confidence = (int)confidence;

      currentPrediction.hasPrediction = true;
      Serial.printf("[Firebase] Prediction Downloaded: Purity=%.1f%% Status=%s Adulterant=%s\n", 
        currentPrediction.purity, currentPrediction.status.c_str(), currentPrediction.adulterantType.c_str());
    }
  }
  http.end();
}

void loop() {

  // ── 1. READ SENSORS ───────────────────────────────────────
  float tempC = mlx.readObjectTempC();
  if (isnan(tempC) || isinf(tempC) || tempC < -40.0 || tempC > 150.0) {
    tempC = 28.5;
  }

  spectralSensor.ledOn();
  delay(100);
  spectralSensor.readSpectraDataFromSensor();
  spectralSensor.ledOff();

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

  char spectralDigits[64];
  snprintf(spectralDigits, sizeof(spectralDigits), "%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u",
    q_f1, q_f2, q_fz, q_f3, q_f4, q_f5, q_fy, q_fxl, q_f6, q_f7, q_f8, q_vis, q_nir);

  time_t now = time(nullptr);
  uint64_t epochMs = (uint64_t)now * 1000ULL;

  // ── 2. UPLOAD TELEMETRY TO FIREBASE ────────────────────────
  if (WiFi.status() == WL_CONNECTED) {
    char payload[512];
    snprintf(payload, sizeof(payload),
      "{"
      "\"temperature\":%.2f,"
      "\"spectral_data\":\"%s\","
      "\"timestamp\":%llu"
      "}",
      tempC, spectralDigits, epochMs);

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    http.begin(client, FIREBASE_TELEMETRY_URL);
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(payload);
    Serial.printf("Telemetry Upload HTTP Code: %d\n", code);
    http.end();

    // ── 3. DOWNLOAD PREDICTION FROM FIREBASE ──────────────────
    fetchPredictionFromFirebase();
  }

  // ── 4. RENDER 7-SCREEN OLED CAROUSEL ───────────────────────
  if (!currentPrediction.hasPrediction) {
    oledShow("Food 360 AI Scan", "Analyzing...", "Waiting for AI...", "SpectraTrust AI v1");
    delay(2000);
  } else {
    // Screen 1: Oil Type
    char subBuf[30];
    oledCard("[1/7]", "Oil Name", currentPrediction.oilType.c_str(), "SpectraTrust AI");
    delay(2500);

    // Screen 2: Purity %
    char purityBuf[20];
    snprintf(purityBuf, sizeof(purityBuf), "%.1f%%", currentPrediction.purity);
    oledCard("[2/7]", "Purity", purityBuf, "AI Calculated");
    delay(2500);

    // Screen 3: Safety Status
    oledCard("[3/7]", "Status", currentPrediction.status.c_str(), "FSSAI Safety Rule");
    delay(2500);

    // Screen 4: Adulterant Type
    oledCard("[4/7]", "Adulterant", currentPrediction.adulterantType.c_str(), "Detected Foreign Fat");
    delay(2500);

    // Screen 5: Estimated Adulteration %
    oledCard("[5/7]", "Estimated Mix", currentPrediction.estimatedMix.c_str(), "AI Mixture Model");
    delay(2500);

    // Screen 6: Temperature
    char tempBuf[20];
    snprintf(tempBuf, sizeof(tempBuf), "%.1f C", currentPrediction.temperature);
    oledCard("[6/7]", "Temperature", tempBuf, "MLX90614 Thermal");
    delay(2500);

    // Screen 7: AI Confidence
    char confBuf[20];
    snprintf(confBuf, sizeof(confBuf), "%d%%", currentPrediction.confidence);
    oledCard("[7/7]", "AI Confidence", confBuf, "Model v1.0 Validated");
    delay(2500);
  }
}
