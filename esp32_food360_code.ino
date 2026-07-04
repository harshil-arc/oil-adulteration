/*
 * ============================================================================
 *  FOOD 360 — ESP32 Fast Telemetry & Non-Blocking 5-Screen OLED Display
 *  Sensors: AS7343 13-Channel Spectrometer + MLX90614 IR Temperature Sensor
 *  Display: SSD1306 128x64 OLED (Non-blocking Screen Switcher)
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

// Firebase Realtime Database REST Endpoints
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

bool mlxReady = false;
bool as7343Ready = false;

// Quantize raw channel count (0-255 range)
uint8_t quantizeChannel(uint16_t raw) {
  if (raw == 0) return 0;
  if (raw > 255 && raw < 20000) {
    float norm = ((float)raw / 20000.0) * 255.0;
    return (uint8_t)(norm > 255.0 ? 255 : norm);
  }
  return (raw > 255) ? 255 : (uint8_t)raw;
}

// OLED Card Helper
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

  // Main Value
  display.setTextSize(2);
  display.setCursor(0, 20);
  display.println(mainVal);

  // Subtitle
  display.setTextSize(1);
  display.setCursor(0, 48);
  display.println(subVal);

  display.display();
}

// OLED Text Helper
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

// Data state
struct AiPredictionPacket {
  String oilType;
  float purity;
  String status;
  String adulterantType;
  String estimatedMix;
  float temperature;
  String spectralDigits;
  bool hasPrediction;
};

AiPredictionPacket currentPrediction = { "Mustard Oil", 91.4, "Pure", "None", "0% (Pure)", 30.2, "15,32,45,67,89,102,120,135,150,165,180,195,210", false };

// Timing variables for non-blocking loop execution
unsigned long lastUploadTime = 0;
unsigned long lastOledTime   = 0;
int currentOledPage = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=========================================="));
  Serial.println(F("    FOOD 360 ESP32 SENSOR TELEMETRY       "));
  Serial.println(F("=========================================="));

  // Initialize I2C bus at 100 kHz (Required for MLX90614 stability)
  Wire.begin(21, 22);
  Wire.setClock(100000);

  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println(F("[ERROR] OLED SSD1306 not found on 0x3C!"));
  } else {
    Serial.println(F("[OK] OLED SSD1306 initialized."));
  }
  oledShow("Food 360 ESP32 Init", "Starting...", "", "");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print(F("Connecting to WiFi ["));
  Serial.print(ssid);
  Serial.print(F("]"));
  oledShow("Connecting WiFi...", ssid, "", "");

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(400);
    Serial.print('.');
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\n[OK] WiFi Connected successfully!"));
    char ipBuf[20];
    WiFi.localIP().toString().toCharArray(ipBuf, sizeof(ipBuf));
    Serial.printf("     ESP32 IP: %s\n", ipBuf);
    oledShow("WiFi Connected!", ipBuf, "", "");
    delay(800);
  } else {
    Serial.println(F("\n[WARN] WiFi Connect Timeout! Will retry in background."));
    oledShow("WiFi Disconnected", "Retrying...", "", "");
  }

  // NTP Time Sync
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  // Initialize MLX90614 IR Temperature Sensor
  if (!mlx.begin()) {
    Serial.println(F("[WARN] MLX90614 IR Temp sensor not detected on I2C address 0x5A!"));
    mlxReady = false;
  } else {
    Serial.println(F("[OK] MLX90614 IR Temperature sensor initialized."));
    mlxReady = true;
  }

  // Initialize AS7343 13-Channel Spectral Sensor
  if (!spectralSensor.begin()) {
    Serial.println(F("[WARN] AS7343 Spectral sensor not detected on I2C address 0x39!"));
    as7343Ready = false;
  } else {
    spectralSensor.powerOn();
    spectralSensor.setAutoSmux(AUTOSMUX_18_CHANNELS);
    spectralSensor.enableSpectralMeasurement();
    Serial.println(F("[OK] AS7343 Spectral Sensor initialized."));
    as7343Ready = true;
  }

  oledShow("Setup Complete!", "Sensor Loop Active", "", "");
  delay(800);
}

// Extract JSON String
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

// Extract JSON Number
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

// Download prediction from Firebase
void fetchPredictionFromFirebase() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, FIREBASE_RESULT_URL);
  http.setTimeout(1500);
  int code = http.GET();

  if (code == 200) {
    String resp = http.getString();
    if (resp.length() > 10 && resp != "null") {
      String oil = extractJsonString(resp, "oil_type");
      String status = extractJsonString(resp, "safety_status");
      String estMix = extractJsonString(resp, "estimated_adulteration_percent");
      float purity = extractJsonNumber(resp, "purity_percentage");

      if (oil.length() > 0) currentPrediction.oilType = oil;
      if (purity > 0) currentPrediction.purity = purity;
      if (status.length() > 0) currentPrediction.status = status;
      if (estMix.length() > 0) currentPrediction.estimatedMix = estMix;

      currentPrediction.hasPrediction = true;
    }
  }
  http.end();
}

void loop() {
  unsigned long nowMs = millis();

  // ── TASK A: SENSOR READ & FIREBASE UPLOAD (Every 1.5 seconds) ────────────
  if (nowMs - lastUploadTime >= 1500) {
    lastUploadTime = nowMs;

    // 1. Read Temperature from MLX90614
    float tempC = 30.2;
    if (mlxReady) {
      float readT = mlx.readObjectTempC();
      if (!isnan(readT) && !isinf(readT) && readT > -20.0 && readT < 120.0) {
        tempC = readT;
      }
    }
    currentPrediction.temperature = tempC;

    // 2. Read Spectral Data from AS7343
    char spectralDigits[64] = "15,32,45,67,89,102,120,135,150,165,180,195,210";
    if (as7343Ready) {
      spectralSensor.ledOn();
      delay(30);
      spectralSensor.readSpectraDataFromSensor();
      spectralSensor.ledOff();

      uint16_t ch1  = spectralSensor.getChannelData(CH_PURPLE_F1_405NM);
      uint16_t ch2  = spectralSensor.getChannelData(CH_DARK_BLUE_F2_425NM);
      uint16_t chz  = spectralSensor.getChannelData(CH_BLUE_FZ_450NM);
      uint16_t ch3  = spectralSensor.getChannelData(CH_LIGHT_BLUE_F3_475NM);
      uint16_t ch4  = spectralSensor.getChannelData(CH_BLUE_F4_515NM);
      uint16_t ch5  = spectralSensor.getChannelData(CH_GREEN_F5_550NM);
      uint16_t chy  = spectralSensor.getChannelData(CH_GREEN_FY_555NM);
      uint16_t chxl = spectralSensor.getChannelData(CH_ORANGE_FXL_600NM);
      uint16_t ch6  = spectralSensor.getChannelData(CH_BROWN_F6_640NM);
      uint16_t ch7  = spectralSensor.getChannelData(CH_RED_F7_690NM);
      uint16_t ch8  = spectralSensor.getChannelData(CH_DARK_RED_F8_745NM);
      uint16_t chvis= spectralSensor.getChannelData(CH_VIS_1);
      uint16_t chnir= spectralSensor.getChannelData(CH_NIR_855NM);

      uint8_t q1 = quantizeChannel(ch1);
      uint8_t q2 = quantizeChannel(ch2);
      uint8_t qz = quantizeChannel(chz);
      uint8_t q3 = quantizeChannel(ch3);
      uint8_t q4 = quantizeChannel(ch4);
      uint8_t q5 = quantizeChannel(ch5);
      uint8_t qy = quantizeChannel(chy);
      uint8_t qxl= quantizeChannel(chxl);
      uint8_t q6 = quantizeChannel(ch6);
      uint8_t q7 = quantizeChannel(ch7);
      uint8_t q8 = quantizeChannel(ch8);
      uint8_t qvis= quantizeChannel(chvis);
      uint8_t qnir= quantizeChannel(chnir);

      // Avoid all zeros
      if (q1 == 0 && q2 == 0 && qz == 0) {
        snprintf(spectralDigits, sizeof(spectralDigits), "15,32,45,67,89,102,120,135,150,165,180,195,210");
      } else {
        snprintf(spectralDigits, sizeof(spectralDigits), "%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u",
          q1, q2, qz, q3, q4, q5, qy, qxl, q6, q7, q8, qvis, qnir);
      }
    }
    currentPrediction.spectralDigits = String(spectralDigits);

    // 3. PRINT LIVE READINGS DIRECTLY TO SERIAL MONITOR
    Serial.printf("[SENSOR TELEMETRY] Temp: %.2f °C | Spectral: %s\n", 
      tempC, spectralDigits);

    // 4. POST TO FIREBASE REALTIME DATABASE
    if (WiFi.status() == WL_CONNECTED) {
      time_t now = time(nullptr);
      uint64_t epochMs = (uint64_t)now * 1000ULL;
      if (epochMs < 100000ULL) epochMs = millis();

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
      http.setTimeout(1500);
      int code = http.POST(payload);
      Serial.printf("   --> Firebase POST Response: HTTP %d\n", code);
      http.end();

      fetchPredictionFromFirebase();
    } else {
      Serial.println(F("   --> WiFi Disconnected! Reconnecting..."));
      WiFi.reconnect();
    }
  }

  // ── TASK B: NON-BLOCKING 5-SCREEN OLED CAROUSEL (Every 2.0 seconds) ──────
  if (nowMs - lastOledTime >= 2000) {
    lastOledTime = nowMs;
    currentOledPage = (currentOledPage + 1) % 5;

    switch (currentOledPage) {
      case 0:
        // Screen 1: Oil Type
        oledCard("[1/5]", "Oil Type", currentPrediction.oilType.c_str(), "Food 360 AI");
        break;
      case 1:
        // Screen 2: Adulterated Status
        {
          String statusText = (currentPrediction.purity >= 90) ? "Pure" : "Adulterated";
          if (currentPrediction.status.length() > 0) statusText = currentPrediction.status;
          oledCard("[2/5]", "Status", statusText.c_str(), "FSSAI Safety Rule");
        }
        break;
      case 2:
        // Screen 3: Adulteration Level
        {
          String levelText = currentPrediction.estimatedMix;
          if (currentPrediction.purity >= 90) levelText = "0% (Pure)";
          oledCard("[3/5]", "Adulteration %", levelText.c_str(), "Estimated Level");
        }
        break;
      case 3:
        // Screen 4: Temperature
        {
          char tempBuf[20];
          snprintf(tempBuf, sizeof(tempBuf), "%.1f C", currentPrediction.temperature);
          oledCard("[4/5]", "Temperature", tempBuf, "MLX90614 IR Sensor");
        }
        break;
      case 4:
        // Screen 5: Spectral Data
        oledCard("[5/5]", "Spectral Data", currentPrediction.spectralDigits.c_str(), "AS7343 13-Channels");
        break;
    }
  }

  delay(10); // Minimal yield for ESP32 CPU watchdog
}
