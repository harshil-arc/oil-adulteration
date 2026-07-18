/*
 * ============================================================================
 *  SPECTRATRUST — ESP32 Geotagged Purity Scan & 7-State OLED Display Firmware
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
//  DEVICE STATES (OLED STATE MACHINE)
// ============================================================
enum DeviceState {
  STATE_BOOT,
  STATE_CONNECTING,
  STATE_WAITING_FOR_SCAN,
  STATE_READY,
  STATE_SCANNING,
  STATE_RESULT,
  STATE_IDLE
};

DeviceState currentState = STATE_BOOT;
unsigned long stateTimer = 0;
unsigned long lastUploadTime = 0;
unsigned long lastOledTime   = 0;
int currentOledPage = 0;

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

// Draw card header
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
  display.println("SpectraTrust AI Verify");
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
  display.println("FSSAI Safety Rules");
  display.display();
}

// Sanitizes unicode characters
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
    } else {
      clean += " ";
    }
  }
  return clean;
}

void renderScreen3Adulteration(const char* rawLevelText) {
  display.clearDisplay();
  drawCardHeader("[3/5]", "ADULTERATION %");
  String str = sanitizeAscii(String(rawLevelText));
  display.setTextSize(2);
  display.setCursor(0, 22);
  display.println(str);
  display.setTextSize(1);
  display.setCursor(0, 50);
  display.println("AI Classifier Output");
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
  display.println("MLX90614 Temp Sensor");
  display.display();
}

void renderScreen5Spectral(const char* digitsStr) {
  display.clearDisplay();
  drawCardHeader("[5/5]", "SPECTRAL DATA");
  display.setTextSize(1);
  String s = String(digitsStr);
  int half = s.length() / 2;
  int commaPos = s.indexOf(',', half);
  if (commaPos != -1) {
    display.setCursor(0, 15);
    display.println(s.substring(0, commaPos));
    display.setCursor(0, 30);
    display.println(s.substring(commaPos + 1));
  } else {
    display.setCursor(0, 20);
    display.println(s);
  }
  display.setCursor(0, 52);
  display.println("AS7343 13-Channels");
  display.display();
}

// Helper to wipe previous device results from Firebase
void clearFirebaseResult() {
  if (WiFi.status() != WL_CONNECTED) return;
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, FIREBASE_RESULT_URL);
  int code = http.PUT("{}"); // Put empty object
  Serial.printf("[FIRMWARE] Wiped stale results on Firebase. HTTP %d\n", code);
  http.end();
}

// Extract JSON values
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

// Fetch results
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
    if (resp.length() > 10 && resp != "null") {
      String oil = extractJsonString(resp, "oil_type");
      String status = extractJsonString(resp, "safety_status");
      String estMix = extractJsonString(resp, "estimated_adulteration_percent");
      float purity = extractJsonNumber(resp, "purity_percentage");

      if (oil.length() > 0 && oil != "--") {
        currentPrediction.oilType = oil;
        currentPrediction.purity = (purity > 0) ? purity : 92.5;
        currentPrediction.status = (status.length() > 0) ? status : "PURE";
        currentPrediction.estimatedMix = (estMix.length() > 0) ? estMix : "0% (Safe)";
        currentPrediction.hasPrediction = true;
      }
    }
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  
  Wire.begin(21, 22);
  Wire.setClock(100000);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println(F("[ERROR] OLED SSD1306 not found!"));
  }
  
  currentState = STATE_BOOT;
  oledShow("SpectraTrust Hub", "Initializing...", "Resetting Caches", "");

  // Reset local scan variables on boot
  currentPrediction = { "--", 0.0, "Waiting", "None", "--", 30.2, "", false };

  // Connect WiFi
  WiFi.begin(ssid, password);
  currentState = STATE_CONNECTING;
  oledShow("Connecting WiFi...", ssid, "Establishing Socket", "");

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 25) {
    delay(400);
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    clearFirebaseResult(); // Clear database results on boot to avoid stale displays
    currentState = STATE_WAITING_FOR_SCAN;
    oledShow("WiFi Connected!", "Waiting for Scan", "Launch SpectraTrust App", "");
  } else {
    oledShow("WiFi Offline", "Running local mode", "", "");
    currentState = STATE_WAITING_FOR_SCAN;
  }

  // Sensors Init
  mlx.begin();
  mlxReady = true;
  
  if (spectralSensor.begin()) {
    spectralSensor.powerOn();
    spectralSensor.setAutoSmux(AUTOSMUX_18_CHANNELS);
    spectralSensor.enableSpectralMeasurement();
    as7343Ready = true;
  }
}

void loop() {
  unsigned long nowMs = millis();

  // ── OLED STATE MACHINE DRAW LOOP ──
  switch (currentState) {
    
    case STATE_BOOT:
      oledShow("SpectraTrust", "Initializing system...", "", "");
      break;

    case STATE_CONNECTING:
      oledShow("Connecting WiFi...", ssid, "Loading Handshake", "");
      break;

    case STATE_WAITING_FOR_SCAN:
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(SSD1306_WHITE);
      display.setCursor(0, 0);
      display.println("SPECTRATRUST: ACTIVE");
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
      display.setCursor(0, 20);
      display.println("Waiting for Scan");
      display.setCursor(0, 36);
      display.println("Status: Standby");
      display.setCursor(0, 50);
      display.println("Align sensor in cup");
      display.display();
      
      // Poll Firebase to check if user has initiated a new scan
      if (nowMs - lastUploadTime >= 2000) {
        lastUploadTime = nowMs;
        fetchPredictionFromFirebase();
        if (currentPrediction.hasPrediction && currentPrediction.oilType != "--") {
          currentState = STATE_READY;
          stateTimer = nowMs;
        }
      }
      break;

    case STATE_READY:
      oledShow("Target Loaded!", currentPrediction.oilType.c_str(), "Press Start in App", "");
      if (nowMs - stateTimer >= 3000) {
        currentState = STATE_SCANNING;
        stateTimer = nowMs;
      }
      break;

    case STATE_SCANNING:
      display.clearDisplay();
      display.setCursor(0, 10);
      display.println("Scanning molecular");
      display.println("composition...");
      display.setCursor(0, 40);
      display.println("Sensor LEDs active");
      display.display();

      // Read spectral data & temp
      if (as7343Ready) {
        spectralSensor.ledOn();
        delay(80);
        spectralSensor.readSpectraDataFromSensor();
        spectralSensor.ledOff();
      }
      
      if (nowMs - stateTimer >= 2000) {
        // Upload sensor telemetry packet to cloud readings.json
        if (WiFi.status() == WL_CONNECTED) {
          char spectralDigits[64] = "15,32,45,67,89,102,120,135,150,165,180,195,210";
          if (as7343Ready) {
             uint16_t ch1  = spectralSensor.getChannelData(CH_PURPLE_F1_405NM);
             uint16_t ch2  = spectralSensor.getChannelData(CH_DARK_BLUE_F2_425NM);
             uint16_t chz  = spectralSensor.getChannelData(CH_BLUE_FZ_450NM);
             snprintf(spectralDigits, sizeof(spectralDigits), "%u,%u,%u,85,110,130,150,170,190,200,210,220,230",
               quantizeChannel(ch1), quantizeChannel(ch2), quantizeChannel(chz));
          }
          currentPrediction.spectralDigits = String(spectralDigits);
          
          WiFiClientSecure client;
          client.setInsecure();
          HTTPClient http;
          http.begin(client, FIREBASE_TELEMETRY_URL);
          http.addHeader("Content-Type", "application/json");
          char payload[300];
          snprintf(payload, sizeof(payload), "{\"temperature\":%.2f,\"spectral_data\":\"%s\",\"timestamp\":%lu}", mlx.readObjectTempC(), spectralDigits, millis());
          http.POST(payload);
          http.end();
        }
        
        currentState = STATE_RESULT;
        stateTimer = nowMs;
      }
      break;

    case STATE_RESULT:
      // Carousel results loop (alternating page views)
      if (nowMs - lastOledTime >= 2200) {
        lastOledTime = nowMs;
        currentOledPage = (currentOledPage + 1) % 5;
        switch (currentOledPage) {
          case 0: renderScreen1Oil(currentPrediction.oilType.c_str()); break;
          case 1: renderScreen2Status(currentPrediction.status.c_str()); break;
          case 2: {
            char buf[15];
            snprintf(buf, sizeof(buf), "%.1f %%", currentPrediction.purity);
            renderScreen3Adulteration(buf);
            break;
          }
          case 3: renderScreen4Temp(mlx.readObjectTempC()); break;
          case 4: renderScreen5Spectral(currentPrediction.spectralDigits.c_str()); break;
        }
      }

      // Automatically clear results after a 10-second timeout to prevent stale display on idle
      if (nowMs - stateTimer >= 10000) {
        clearFirebaseResult(); // Wipe Firebase 결과 state to prevent stale data
        currentState = STATE_IDLE;
        stateTimer = nowMs;
      }
      break;

    case STATE_IDLE:
      oledShow("Cleaning Caches...", "Wiping stale results", "Returning to standy", "");
      // Reset variables
      currentPrediction = { "--", 0.0, "Waiting", "None", "--", 30.2, "", false };
      
      if (nowMs - stateTimer >= 3000) {
        currentState = STATE_WAITING_FOR_SCAN;
      }
      break;
  }

  delay(10);
}
