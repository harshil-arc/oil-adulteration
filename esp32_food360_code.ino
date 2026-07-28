/*
 * ============================================================================
 *  SPECTRATRUST — ESP32 Dual-Sync (HTTPS Cloud + Local WebServer) Firmware
 *  Sensors: AS7343 13-Channel Spectrometer + MLX90614 IR Temperature Sensor
 *  Display: SSD1306 128x64 OLED (Clean Layout - Zero Overlap)
 *  Cloud Endpoint: Firebase Realtime Database HTTPS REST API
 *  Local Endpoint: http://<esp32-ip>/result (Port 80 HTTP POST)
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebServer.h>
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

// HTTPS REST Endpoints (Enforces HTTPS for Firebase RTDB)
const char* FIREBASE_TELEMETRY_URL = "https://oil-adulteration-default-rtdb.firebaseio.com/readings.json";
const char* FIREBASE_RESULT_URL    = "https://oil-adulteration-default-rtdb.firebaseio.com/device_result.json";

// ============================================================
//  LOCAL WEBSERVER ON PORT 80
// ============================================================
WebServer server(80);

// ============================================================
//  LED INDICATOR HARDWARE PINS
// ============================================================
#define RED_LED_PIN    4   // GPIO4 (D4) - Glows RED when oil is ADULTERATED
#define GREEN_LED_PIN  5   // GPIO5 (D5) - Glows GREEN when oil is PURE


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

// Telemetry & Prediction State
struct SensorDataPacket {
  float temperature;
  String spectralDigits;
  String oilType;
  float purity;
  String status;
  bool hasActivePrediction;
  unsigned long predictionTime;
  String lastScanId;
};

// Initialized to CLEAN STANDBY state (No hardcoded/stale scan values on startup)
SensorDataPacket currentData = { 28.5, "--", "--", 0.0, "Standby", false, 0, "" };

// Timing variables
unsigned long lastUploadTime = 0;
unsigned long lastOledTime   = 0;
unsigned long lastWifiRetry  = 0;
unsigned long lastResultFetch = 0;
int currentOledPage = 0;

// Quantize raw channel count (0-255 range)
uint8_t quantizeChannel(uint16_t raw) {
  if (raw == 0) return 0;
  if (raw > 255 && raw < 20000) {
    float norm = ((float)raw / 20000.0) * 255.0;
    return (uint8_t)(norm > 255.0 ? 255 : norm);
  }
  return (raw > 255) ? 255 : (uint8_t)raw;
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
  if (str == "--") {
    display.println("Select Oil in App");
  } else {
    display.println("SpectraTrust AI Verify");
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
  if (str == "Standby") {
    display.println("Waiting for Scan");
  } else {
    display.println("FSSAI Safety Rules");
  }
  display.display();
}

void renderScreen3Adulteration(float purity, bool hasPrediction) {
  display.clearDisplay();
  drawCardHeader("[3/5]", "PURITY %");
  display.setTextSize(2);
  display.setCursor(0, 22);
  if (!hasPrediction) {
    display.println("-- %");
  } else {
    char buf[20];
    snprintf(buf, sizeof(buf), "%.1f %%", purity);
    display.println(buf);
  }
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
  display.setTextWrap(true);
  String s = String(digitsStr);
  if (s == "--" || s.length() < 3) {
    display.setCursor(0, 22);
    display.println("Sensor Offline / 0x39");
  } else {
    int commaPos = s.indexOf(',', 22);
    if (commaPos != -1) {
      display.setCursor(0, 16);
      display.println(s.substring(0, commaPos));
      display.setCursor(0, 32);
      display.println(s.substring(commaPos + 1));
    } else {
      display.setCursor(0, 20);
      display.println(s);
    }
  }
  display.setCursor(0, 52);
  display.println("AS7343 13-Channels");
  display.display();
}

// Extract JSON String Helper
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

// Extract JSON Number Helper
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

// Wipe device_result.json from Firebase cloud when result expires or on boot
void clearCloudResult() {
  if (WiFi.status() != WL_CONNECTED) return;
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, FIREBASE_RESULT_URL);
  http.setTimeout(2500);
  int code = http.sendRequest("DELETE");
  Serial.printf("[FIRMWARE] Wiped result node from Firebase. HTTP %d\n", code);
  http.end();
}

// Update Hardware LED indicators (Red / Green) based on oil purity & safety status
void updateLedIndicators(const String& status, float purity, bool hasPrediction) {
  if (!hasPrediction || status == "Standby" || status == "--") {
    // No active prediction or Standby mode: Turn OFF both LEDs
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, LOW);
    return;
  }

  String lowerStatus = status;
  lowerStatus.toLowerCase();

  // Check if oil is adulterated (status contains "adulterat", "fail", "unsafe", or purity < 90%)
  bool isAdulterated = (lowerStatus.indexOf("adulterat") != -1 || lowerStatus.indexOf("fail") != -1 || lowerStatus.indexOf("unsafe") != -1 || purity < 90.0);

  if (isAdulterated) {
    // OIL ADULTERATED: Glow RED LED ON, turn GREEN LED OFF
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
    Serial.printf("[HARDWARE LED] RED LED ON (Pin %d) | GREEN LED OFF (Pin %d) -> OIL ADULTERATED (Purity: %.1f%%, Status: %s)\n", RED_LED_PIN, GREEN_LED_PIN, purity, status.c_str());
  } else {
    // OIL PURE: Glow GREEN LED ON, turn RED LED OFF
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH);
    Serial.printf("[HARDWARE LED] GREEN LED ON (Pin %d) | RED LED OFF (Pin %d) -> OIL PURE (Purity: %.1f%%, Status: %s)\n", GREEN_LED_PIN, RED_LED_PIN, purity, status.c_str());
  }
}

// Fetch results pushed from the Mobile/Web App to device_result.json via HTTPS
void fetchResultsFromApp() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, FIREBASE_RESULT_URL);
  http.setTimeout(2000);
  int code = http.GET();

  if (code == 200) {
    String resp = http.getString();
    if (resp == "null" || resp.length() <= 10) {
      // Cloud node was cleared by App page exit
      if (currentData.hasActivePrediction) {
        currentData.hasActivePrediction = false;
        currentData.oilType = "--";
        currentData.status = "Standby";
        currentData.purity = 0.0;
        currentData.lastScanId = "";
        currentOledPage = 0;
        renderScreen1Oil(currentData.oilType.c_str());
        updateLedIndicators(currentData.status, currentData.purity, currentData.hasActivePrediction);
        Serial.println(F("[FIRMWARE] App page exit detected. OLED returned to Standby mode & LEDs cleared."));
      }
    } else {
      String scanId = extractJsonString(resp, "scan_id");
      String oil = extractJsonString(resp, "oil_type");
      String status = extractJsonString(resp, "safety_status");
      float purity = extractJsonNumber(resp, "purity_percentage");

      if (oil.length() > 0 && oil != "--") {
        bool isNew = (scanId != currentData.lastScanId || currentData.oilType != oil || fabs(currentData.purity - purity) > 0.05);
        currentData.oilType = oil;
        currentData.purity = purity;
        currentData.status = (status.length() > 0) ? status : "Ready";
        currentData.hasActivePrediction = true;

        // Update LEDs based on current prediction status
        updateLedIndicators(currentData.status, currentData.purity, currentData.hasActivePrediction);

        if (isNew) {
          currentData.lastScanId = scanId;
          currentOledPage = 0; // Jump OLED to Screen [1/5] OIL TYPE immediately
          lastOledTime = millis();
          renderScreen1Oil(currentData.oilType.c_str()); // Redraw immediately!
          Serial.printf("[HTTPS CLOUD SYNCED] Oil: %s | Purity: %.1f%% | Status: %s | ScanID: %s\n", oil.c_str(), currentData.purity, currentData.status.c_str(), scanId.c_str());
        }
      }
    }
  }
  http.end();
}

// Direct Local WebServer POST handler (http://<esp32-ip>/result)
void handleLocalResultPost() {
  if (server.hasArg("plain")) {
    String json = server.arg("plain");
    String scanId = extractJsonString(json, "scan_id");
    String oil = extractJsonString(json, "oil_type");
    String status = extractJsonString(json, "safety_status");
    float purity = extractJsonNumber(json, "purity_percentage");

    if (oil.length() > 0 && oil != "--") {
      currentData.oilType = oil;
      currentData.purity = purity;
      currentData.status = (status.length() > 0) ? status : "Ready";
      currentData.hasActivePrediction = true;
      currentData.predictionTime = millis();
      currentData.lastScanId = scanId;

      updateLedIndicators(currentData.status, currentData.purity, currentData.hasActivePrediction);

      currentOledPage = 0;
      lastOledTime = millis();
      renderScreen1Oil(currentData.oilType.c_str());

      server.send(200, "application/json", "{\"status\":\"ok\"}");
      Serial.printf("[LOCAL IP SYNCED] Oil: %s | Purity: %.1f%% | Status: %s\n", oil.c_str(), purity, status.c_str());
      return;
    }
  }
  server.send(400, "application/json", "{\"error\":\"invalid payload\"}");
}

// Non-blocking WiFi reconnect monitor
void maintainWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  
  unsigned long now = millis();
  if (now - lastWifiRetry > 10000) {
    lastWifiRetry = now;
    Serial.println(F("[FIRMWARE] WiFi reconnecting..."));
    WiFi.reconnect();
  }
}

// Read raw hardware sensors
void readSensors() {
  // 1. Read Temperature from MLX90614
  if (mlxReady) {
    float t = mlx.readObjectTempC();
    if (!isnan(t) && !isinf(t) && t > -20.0 && t < 120.0) {
      currentData.temperature = t;
    }
  }

  // 2. Read All 13 Channels from AS7343 Spectrometer
  if (as7343Ready) {
    spectralSensor.ledOn();
    delay(40);
    spectralSensor.readSpectraDataFromSensor();
    spectralSensor.ledOff();

    uint16_t f1  = spectralSensor.getChannelData(CH_PURPLE_F1_405NM);
    uint16_t f2  = spectralSensor.getChannelData(CH_DARK_BLUE_F2_425NM);
    uint16_t fz  = spectralSensor.getChannelData(CH_BLUE_FZ_450NM);
    uint16_t f3  = spectralSensor.getChannelData(CH_LIGHT_BLUE_F3_475NM);
    uint16_t f4  = spectralSensor.getChannelData(CH_BLUE_F4_515NM);
    uint16_t f5  = spectralSensor.getChannelData(CH_GREEN_F5_550NM);
    uint16_t fy  = spectralSensor.getChannelData(CH_GREEN_FY_555NM);
    uint16_t fxl = spectralSensor.getChannelData(CH_ORANGE_FXL_600NM);
    uint16_t f6  = spectralSensor.getChannelData(CH_BROWN_F6_640NM);
    uint16_t f7  = spectralSensor.getChannelData(CH_RED_F7_690NM);
    uint16_t f8  = spectralSensor.getChannelData(CH_DARK_RED_F8_745NM);
    uint16_t vis = spectralSensor.getChannelData(CH_VIS_1);
    uint16_t nir = spectralSensor.getChannelData(CH_NIR_855NM);

    char buf[160];
    snprintf(buf, sizeof(buf), "%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u",
      quantizeChannel(f1), quantizeChannel(f2), quantizeChannel(fz),
      quantizeChannel(f3), quantizeChannel(f4), quantizeChannel(f5),
      quantizeChannel(fy), quantizeChannel(fxl), quantizeChannel(f6),
      quantizeChannel(f7), quantizeChannel(f8), quantizeChannel(vis),
      quantizeChannel(nir));
    currentData.spectralDigits = String(buf);

    Serial.printf("[AS7343 REAL SPECTRAL] F1:%u F2:%u FZ:%u F3:%u F4:%u F5:%u FY:%u FXL:%u F6:%u F7:%u F8:%u VIS:%u NIR:%u\n",
      f1, f2, fz, f3, f4, f5, fy, fxl, f6, f7, f8, vis, nir);
  } else {
    currentData.spectralDigits = "--";
    Serial.println(F("[AS7343 SPECTRAL] Sensor Not Connected or Offline on 0x39 / 0x38"));
  }
}

// Upload sensor telemetry packet to Firebase Realtime Database readings.json
void uploadTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, FIREBASE_TELEMETRY_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(2500);

  time_t nowSec = time(nullptr);
  uint64_t nowEpoch = (uint64_t)nowSec * 1000ULL;
  if (nowEpoch < 1000000000000ULL) {
    nowEpoch = 1721800000000ULL + millis();
  }

  char payload[380];
  snprintf(payload, sizeof(payload),
    "{\"temperature\":%.2f,\"spectral_data\":\"%s\",\"timestamp\":%llu}",
    currentData.temperature, currentData.spectralDigits.c_str(), nowEpoch);

  int code = http.POST(payload);
  Serial.printf("[TELEMETRY UPLOAD] HTTP %d | Temp: %.1f C | Spectral: %s\n", code, currentData.temperature, currentData.spectralDigits.c_str());
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=========================================="));
  Serial.println(F("   SPECTRATRUST ESP32 TELEMETRY HUB       "));
  Serial.println(F("=========================================="));

  // Initialize LED Pins (Red = Adulterated, Green = Pure)
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  Serial.printf("[HARDWARE INIT] Red LED Pin: %d | Green LED Pin: %d initialized.\n", RED_LED_PIN, GREEN_LED_PIN);


  Wire.begin(21, 22);
  Wire.setClock(100000);

  // ── I2C BUS SCANNER ─────────────────────────────────────
  Serial.println(F("[I2C SCANNER] Scanning bus on SDA:21, SCL:22..."));
  byte count = 0;
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.printf("   --> Found I2C device at address 0x%02X\n", address);
      count++;
    }
  }
  if (count == 0) {
    Serial.println(F("   [ERROR] No I2C devices found! Check 3.3V, GND, SDA(21), SCL(22) wiring."));
  }
  Serial.println(F("==========================================\n"));

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("[WARN] OLED 0x3C not responding, trying 0x3D..."));
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
      Serial.println(F("[ERROR] OLED SSD1306 not found on 0x3C or 0x3D!"));
    } else {
      Serial.println(F("[OK] OLED SSD1306 initialized on 0x3D."));
    }
  } else {
    Serial.println(F("[OK] OLED SSD1306 initialized on 0x3C."));
  }

  // WIPE GDRAM BUFFER IMMEDIATELY TO PREVENT GARBLED NOISE / QR CODE PATTERN
  display.clearDisplay();
  display.display();
  delay(50);

  oledShow("SpectraTrust Hub", "Initializing...", "Connecting WiFi", "");

  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.begin(ssid, password);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(400);
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.printf("[OK] WiFi Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    clearCloudResult(); // Clear stale results on Firebase on boot
    oledShow("WiFi Connected!", WiFi.localIP().toString().c_str(), "Telemetry Stream Active", "");
    delay(800);
  } else {
    Serial.println(F("[WARN] WiFi Connection pending. Continuing..."));
    oledShow("WiFi Connecting...", "Telemetry active", "", "");
  }

  // Set up local WebServer endpoints on Port 80
  server.on("/result", HTTP_POST, handleLocalResultPost);
  server.begin();
  Serial.println(F("[OK] Local WebServer ready on port 80 at /result"));

  // Initialize Sensors
  if (mlx.begin()) {
    mlxReady = true;
    Serial.println(F("[OK] MLX90614 IR Temp sensor ready on 0x5A."));
  } else {
    Serial.println(F("[WARN] MLX90614 IR Temp sensor not found on 0x5A."));
  }

  // Initialize AS7343 Spectrometer (Try default 0x39, then alternate 0x38)
  if (spectralSensor.begin(0x39, Wire)) {
    spectralSensor.powerOn();
    spectralSensor.setAutoSmux(AUTOSMUX_18_CHANNELS);
    spectralSensor.enableSpectralMeasurement();
    as7343Ready = true;
    Serial.println(F("[OK] AS7343 Spectral sensor ready on 0x39."));
  } else if (spectralSensor.begin(0x38, Wire)) {
    spectralSensor.powerOn();
    spectralSensor.setAutoSmux(AUTOSMUX_18_CHANNELS);
    spectralSensor.enableSpectralMeasurement();
    as7343Ready = true;
    Serial.println(F("[OK] AS7343 Spectral sensor ready on 0x38."));
  } else if (spectralSensor.begin()) {
    spectralSensor.powerOn();
    spectralSensor.setAutoSmux(AUTOSMUX_18_CHANNELS);
    spectralSensor.enableSpectralMeasurement();
    as7343Ready = true;
    Serial.println(F("[OK] AS7343 Spectral sensor ready on default."));
  } else {
    Serial.println(F("[ERROR] AS7343 Spectral sensor not detected on 0x39 / 0x38. Check wiring or I2C addresses scanned above!"));
  }
}

void loop() {
  unsigned long nowMs = millis();

  maintainWifi();

  // Listen for direct local HTTP POST requests from App
  server.handleClient();

  // 1. Read Hardware Sensors & Upload Telemetry (Every 1.5 seconds)
  if (nowMs - lastUploadTime >= 1500) {
    lastUploadTime = nowMs;
    readSensors();
    uploadTelemetry();
  }

  // 2. Fetch App Result sync via HTTPS Cloud REST (Every 1.8 seconds)
  if (nowMs - lastResultFetch >= 1800) {
    lastResultFetch = nowMs;
    fetchResultsFromApp();
  }

  // 4. Non-blocking OLED Screen Carousel (Every 2.2 seconds)
  if (nowMs - lastOledTime >= 2200) {
    lastOledTime = nowMs;
    currentOledPage = (currentOledPage + 1) % 5;

    switch (currentOledPage) {
      case 0: renderScreen1Oil(currentData.oilType.c_str()); break;
      case 1: renderScreen2Status(currentData.status.c_str()); break;
      case 2: renderScreen3Adulteration(currentData.purity, currentData.hasActivePrediction); break;
      case 3: renderScreen4Temp(currentData.temperature); break;
      case 4: renderScreen5Spectral(currentData.spectralDigits.c_str()); break;
    }
  }

  delay(10);
}
