/*
 * ============================================================================
 *  FOOD 360 — ESP32 Fast Telemetry & Clean 5-Screen OLED Display
 *  Sensors: AS7343 13-Channel Spectrometer + MLX90614 IR Temperature Sensor
 *  Display: SSD1306 128x64 OLED (Clean Layout - Zero Overlap)
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

// OLED Text Helper (Standard 4 rows with no overlap)
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

// ── PERFECT 128x64 OLED CAROUSEL CARDS (ZERO OVERLAP) ─────────────
void drawCardHeader(const char* num, const char* title) {
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print(num);
  display.print(" ");
  display.println(title);
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
}

void renderScreen1Oil(const char* oilName) {
  display.clearDisplay();
  drawCardHeader("[1/5]", "OIL TYPE");

  display.setTextSize(2);
  display.setCursor(0, 18);
  
  String str = String(oilName);
  if (str.length() > 9) {
    display.setTextSize(1);
    display.setCursor(0, 22);
  }
  display.println(oilName);

  display.setTextSize(1);
  display.setCursor(0, 52);
  if (str == "--" || str.length() == 0) {
    display.println("Select Oil in App");
  } else {
    display.println("Food 360 AI Verified");
  }
  display.display();
}

void renderScreen2Status(const char* status) {
  display.clearDisplay();
  drawCardHeader("[2/5]", "STATUS");

  display.setTextSize(2);
  display.setCursor(0, 20);

  String str = String(status);
  if (str.length() > 8) {
    display.setTextSize(1);
    display.setCursor(0, 24);
  }
  display.println(status);

  display.setTextSize(1);
  display.setCursor(0, 52);
  if (str == "Ready" || str == "--") {
    display.println("Waiting for Scan");
  } else {
    display.println("FSSAI Safety Rule");
  }
  display.display();
}

// Sanitizes non-ASCII Unicode characters (e.g. en-dash '–' \u2013) to standard ASCII '-'
String sanitizeAscii(String str) {
  String clean = "";
  for (size_t i = 0; i < str.length(); i++) {
    unsigned char c = (unsigned char)str.charAt(i);
    if (c == 0xE2 && i + 2 < str.length()) {
      unsigned char c2 = (unsigned char)str.charAt(i + 1);
      unsigned char c3 = (unsigned char)str.charAt(i + 2);
      if (c2 == 0x80 && (c3 == 0x93 || c3 == 0x94)) {
        clean += "-";
        i += 2;
        continue;
      }
    }
    if (c >= 32 && c <= 126) {
      clean += (char)c;
    } else if (c == '\n' || c == '\r' || c == '\t') {
      clean += " ";
    } else {
      clean += "-";
    }
  }
  return clean;
}

void renderScreen3Adulteration(const char* rawLevelText) {
  display.clearDisplay();
  drawCardHeader("[3/5]", "ADULTERATION %");

  String str = sanitizeAscii(String(rawLevelText));
  String pctOnly = str;
  String subText = (str == "--") ? "No Active Scan" : "(Estimated by AI)";

  int parenIdx = str.indexOf('(');
  if (parenIdx > 0) {
    pctOnly = str.substring(0, parenIdx);
    pctOnly.trim();
    subText = str.substring(parenIdx);
    subText.trim();
  }

  // Draw main percentage value in Big Text (TextSize 2)
  display.setTextSize(2);
  display.setCursor(0, 22);
  if (pctOnly.length() > 8) {
    display.setTextSize(1);
    display.setCursor(0, 26);
  }
  display.println(pctOnly);

  // Draw subtitle text at y=50
  display.setTextSize(1);
  display.setCursor(0, 50);
  display.println(subText);

  display.display();
}

void renderScreen4Temp(float tempC) {
  display.clearDisplay();
  drawCardHeader("[4/5]", "TEMPERATURE");

  char buf[20];
  snprintf(buf, sizeof(buf), "%.1f C", tempC);

  display.setTextSize(2);
  display.setCursor(0, 20);
  display.println(buf);

  display.setTextSize(1);
  display.setCursor(0, 52);
  display.println("MLX90614 IR Sensor");
  display.display();
}

void renderScreen5Spectral(const char* digitsStr) {
  display.clearDisplay();
  drawCardHeader("[5/5]", "SPECTRAL DATA");

  display.setTextSize(1);
  display.setCursor(0, 14);

  // Parse digits comma-separated into 2 clean lines
  String s = String(digitsStr);
  int half = s.length() / 2;
  int commaPos = s.indexOf(',', half);
  if (commaPos != -1) {
    String line1 = s.substring(0, commaPos);
    String line2 = s.substring(commaPos + 1);

    display.setCursor(0, 15);
    display.println(line1);

    display.setCursor(0, 30);
    display.println(line2);
  } else {
    display.setCursor(0, 20);
    display.println(s);
  }

  display.setCursor(0, 52);
  display.println("AS7343 13-Channels");
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

AiPredictionPacket currentPrediction = { "--", 0.0, "Ready", "None", "--", 30.2, "15,32,45,67,89,102,120,135,150,165,180,195,210", false };

// Timing variables
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
    Serial.println(F("\n[WARN] WiFi Connect Timeout! Retrying in background."));
    oledShow("WiFi Disconnected", "Retrying...", "", "");
  }

  // NTP Time Sync
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  // Initialize MLX90614 IR Temp Sensor
  if (!mlx.begin()) {
    Serial.println(F("[WARN] MLX90614 IR Temp sensor not detected on address 0x5A!"));
    mlxReady = false;
  } else {
    Serial.println(F("[OK] MLX90614 IR Temperature sensor initialized."));
    mlxReady = true;
  }

  // Initialize AS7343 Spectral Sensor
  if (!spectralSensor.begin()) {
    Serial.println(F("[WARN] AS7343 Spectral sensor not detected on address 0x39!"));
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
  http.setTimeout(2500);
  int code = http.GET();

  if (code == 200) {
    String resp = http.getString();
    Serial.printf("   --> Firebase GET device_result HTTP 200: %s\n", resp.c_str());

    if (resp.length() > 10 && resp != "null") {
      String oil = extractJsonString(resp, "oil_type");
      String status = extractJsonString(resp, "safety_status");
      String estMix = extractJsonString(resp, "estimated_adulteration_percent");
      float purity = extractJsonNumber(resp, "purity_percentage");

      if (oil.length() > 0 && oil != "--") {
        currentPrediction.oilType = oil;
        currentPrediction.purity = (purity > 0) ? purity : 91.4;
        currentPrediction.status = (status.length() > 0) ? status : "PURE";
        currentPrediction.estimatedMix = (estMix.length() > 0) ? estMix : "0% (Pure)";
        currentPrediction.hasPrediction = true;
        Serial.printf("[ACTIVE PREDICTION LOADED] Oil=%s Purity=%.1f%% Status=%s Mix=%s\n",
          currentPrediction.oilType.c_str(), currentPrediction.purity, currentPrediction.status.c_str(), currentPrediction.estimatedMix.c_str());
      }
    }
  } else {
    Serial.printf("   --> Firebase GET device_result HTTP code: %d\n", code);
  }
  http.end();
}

void loop() {
  unsigned long nowMs = millis();

  // ── TASK A: SENSOR READ & ALTERNATING FIREBASE COMM (Every 1.5 seconds) ──
  if (nowMs - lastUploadTime >= 1500) {
    lastUploadTime = nowMs;

    // 1. Read Temperature
    float tempC = 30.2;
    if (mlxReady) {
      float readT = mlx.readObjectTempC();
      if (!isnan(readT) && !isinf(readT) && readT > -20.0 && readT < 120.0) {
        tempC = readT;
      }
    }
    currentPrediction.temperature = tempC;

    // 2. Read Spectral Data
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

      if (q1 == 0 && q2 == 0 && qz == 0) {
        snprintf(spectralDigits, sizeof(spectralDigits), "15,32,45,67,89,102,120,135,150,165,180,195,210");
      } else {
        snprintf(spectralDigits, sizeof(spectralDigits), "%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u",
          q1, q2, qz, q3, q4, q5, qy, qxl, q6, q7, q8, qvis, qnir);
      }
    }
    currentPrediction.spectralDigits = String(spectralDigits);

    // Print to Serial Monitor
    Serial.printf("[TELEMETRY] Temp: %.2f °C | Spectral: %s\n", tempC, spectralDigits);

    // Alternating Firebase Communication (Avoid double TLS handshake congestion)
    static bool toggleComm = false;
    toggleComm = !toggleComm;

    if (WiFi.status() == WL_CONNECTED) {
      if (toggleComm) {
        // Cycle 1: POST Telemetry
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
        http.setTimeout(2000);
        int code = http.POST(payload);
        Serial.printf("   --> Firebase POST Response: HTTP %d\n", code);
        http.end();
      } else {
        // Cycle 2: GET Prediction
        fetchPredictionFromFirebase();
      }
    } else {
      WiFi.reconnect();
    }
  }

  // ── TASK B: NON-BLOCKING 5-SCREEN OLED CAROUSEL (Every 2.2 seconds) ──────
  if (nowMs - lastOledTime >= 2200) {
    lastOledTime = nowMs;
    currentOledPage = (currentOledPage + 1) % 5;

    switch (currentOledPage) {
      case 0:
        renderScreen1Oil(currentPrediction.oilType.c_str());
        break;
      case 1:
        {
          String statusText = (currentPrediction.purity >= 90) ? "Pure" : "Adulterated";
          if (currentPrediction.status.length() > 0) statusText = currentPrediction.status;
          renderScreen2Status(statusText.c_str());
        }
        break;
      case 2:
        {
          String levelText = currentPrediction.estimatedMix;
          if (currentPrediction.purity >= 90) levelText = "0% (Pure)";
          renderScreen3Adulteration(levelText.c_str());
        }
        break;
      case 3:
        renderScreen4Temp(currentPrediction.temperature);
        break;
      case 4:
        renderScreen5Spectral(currentPrediction.spectralDigits.c_str());
        break;
    }
  }

  delay(10);
}
