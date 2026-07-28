#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SparkFun_AS7343.h>
#include <Adafruit_MLX90614.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include <time.h>
#include <math.h>

// ============================================================
//  CREDENTIALS & FIRESTORE / RTDB CONFIG
// ============================================================
const char* ssid     = "atl";
const char* password = "harshil913";

// Firebase RTDB endpoints
const char* firebaseHost = "oil-adulteration-default-rtdb.firebaseio.com";
const char* firebasePath = "/readings.json";
const char* resultPath   = "/device_result.json";

// Cloud Firestore REST Endpoint
const char* FIRESTORE_URL = "https://firestore.googleapis.com/v1/projects/oil-adulteration/databases/(default)/documents/readings?key=AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";

// ============================================================
//  LED INDICATOR HARDWARE PINS
// ============================================================
#define RED_LED_PIN    4   // GPIO4 (D4) - Glows RED when oil is ADULTERATED
#define GREEN_LED_PIN  5   // GPIO5 (D5) - Glows GREEN when oil is PURE

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
//  TWO-WAY SYNCHRONIZATION STATE (AI RESULT PACKET)
// ============================================================
struct AiResultPacket {
  bool hasResult = false;
  char oilType[32] = "Mustard Oil";
  float purity = 91.4;
  int confidence = 97;
  char status[20] = "ADULTERATED"; // "SAFE" or "ADULTERATED"
  char possibleAdulterant[32] = "Palm Oil";
  char scanId[24] = "SCAN-000123";
  unsigned long lastUpdatedMs = 0;
};

AiResultPacket aiResult;

// Carousel Timer State
int currentPage = 1;
const int TOTAL_PAGES = 9;
unsigned long lastPageChangeMs = 0;
const unsigned long PAGE_INTERVAL_MS = 2500; // Switch page every 2.5s

// ============================================================
//  SPECTRAL QUANTIZATION (raw counts -> compact 0-9 digit string)
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
//  NON-BLOCKING OLED 9-PAGE CAROUSEL DISPLAY
// ============================================================
void renderOledCarousel(float tempC, const char* specDigits) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  switch (currentPage) {
    case 1:
      // Page 1: App Title & Status
      display.setTextSize(1);
      display.setCursor(20, 5);
      display.println(F("Food 360 AI"));
      display.drawLine(0, 18, 128, 18, SSD1306_WHITE);

      display.setCursor(15, 30);
      if (aiResult.hasResult) {
        display.println(F("AI Result Synced"));
      } else {
        display.println(F("AI Processing..."));
      }
      display.setCursor(25, 48);
      display.println(F("Please Wait..."));
      break;

    case 2:
      // Page 2: Temperature
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("[1/9] Temp Sensor"));
      display.setTextSize(2);
      display.setCursor(10, 28);
      if (isnan(tempC) || isinf(tempC)) {
        display.println(F("ERROR"));
      } else {
        display.printf("%.1f C", tempC);
      }
      break;

    case 3:
      // Page 3: Spectral (0-9 Digits)
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("[2/9] Spectral 0-9"));
      display.setCursor(0, 24);
      display.setTextSize(1);
      display.println(specDigits);
      break;

    case 4:
      // Page 4: Oil Type
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("[3/9] Tested Oil"));
      display.setTextSize(1);
      display.setCursor(0, 28);
      display.println(aiResult.oilType);
      break;

    case 5:
      // Page 5: Purity Percentage
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("[4/9] Purity Score"));
      display.setTextSize(2);
      display.setCursor(15, 28);
      display.printf("%.1f%%", aiResult.purity);
      break;

    case 6:
      // Page 6: Confidence Score
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("[5/9] AI Confidence"));
      display.setTextSize(2);
      display.setCursor(25, 28);
      display.printf("%d%%", aiResult.confidence);
      break;

    case 7:
      // Page 7: Safety Status (SAFE vs ADULTERATED)
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("[6/9] Safety Status"));
      display.setTextSize(2);
      display.setCursor(0, 28);
      if (strcmp(aiResult.status, "SAFE") == 0) {
        display.println(F("  ✓ SAFE"));
      } else {
        display.println(F("ADULTERATED"));
      }
      break;

    case 8:
      // Page 8: Detected Mix / Adulterant
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("[7/9] Detected Mix"));
      display.setTextSize(1);
      display.setCursor(0, 28);
      if (strcmp(aiResult.possibleAdulterant, "None") == 0 || strlen(aiResult.possibleAdulterant) == 0) {
        display.println(F("No Mix Detected"));
      } else {
        display.println(aiResult.possibleAdulterant);
      }
      break;

    case 9:
      // Page 9: Scan Completed
      display.setTextSize(1);
      display.setCursor(15, 10);
      display.println(F("Scan Completed"));
      display.setTextSize(3);
      display.setCursor(50, 30);
      display.println(F("v"));
      break;

    default:
      currentPage = 1;
      break;
  }

  display.display();
}

// Helper simple OLED print for setup
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

// Update Hardware LED indicators (Red / Green) based on oil purity & safety status
void updateLedIndicators(const char* status, float purity, bool hasResult) {
  if (!hasResult) {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, LOW);
    return;
  }

  String lowerStatus = String(status);
  lowerStatus.toLowerCase();

  bool isAdulterated = (lowerStatus.indexOf("adulterat") != -1 || lowerStatus.indexOf("fail") != -1 || lowerStatus.indexOf("unsafe") != -1 || purity < 90.0);

  if (isAdulterated) {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
    Serial.printf("[HARDWARE LED] RED LED ON (Pin %d) | GREEN LED OFF (Pin %d) -> OIL ADULTERATED\n", RED_LED_PIN, GREEN_LED_PIN);
  } else {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH);
    Serial.printf("[HARDWARE LED] GREEN LED ON (Pin %d) | RED LED OFF (Pin %d) -> OIL PURE\n", GREEN_LED_PIN, RED_LED_PIN);
  }
}

// ============================================================
//  FETCH LATEST AI RESULT PACKET FROM CLOUD (TWO-WAY SYNC)
// ============================================================
void fetchAiResultPacket() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  String url = String("https://") + firebaseHost + resultPath;
  http.begin(client, url);

  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    if (payload.length() > 10 && payload != "null") {
      DynamicJsonDocument doc(1024);
      DeserializationError err = deserializeJson(doc, payload);
      if (!err) {
        aiResult.hasResult = true;
        if (doc["oil_type"]) strlcpy(aiResult.oilType, doc["oil_type"], sizeof(aiResult.oilType));
        if (doc["purity_percentage"]) aiResult.purity = doc["purity_percentage"];
        if (doc["confidence_score"]) aiResult.confidence = doc["confidence_score"];
        if (doc["safety_status"]) strlcpy(aiResult.status, doc["safety_status"], sizeof(aiResult.status));
        if (doc["possible_adulterant"]) strlcpy(aiResult.possibleAdulterant, doc["possible_adulterant"], sizeof(aiResult.possibleAdulterant));
        if (doc["scan_id"]) strlcpy(aiResult.scanId, doc["scan_id"], sizeof(aiResult.scanId));
        aiResult.lastUpdatedMs = millis();
        
        updateLedIndicators(aiResult.status, aiResult.purity, aiResult.hasResult);

        Serial.println(F("[Two-Way Sync] AI Result Packet Received & OLED/LEDs Updated!"));
      }
    } else if (payload == "null") {
      if (aiResult.hasResult) {
        aiResult.hasResult = false;
        updateLedIndicators(aiResult.status, aiResult.purity, false);
      }
    }
  }
  http.end();
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);

  // Initialize LED Pins
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

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

  // Sync NTP time (required for Firestore timestamps & TLS)
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

  oledShow("Setup Complete!", "Two-Way AI Sync Ready", "", "");
  delay(1000);
  Serial.println(F("=== Setup Complete & Two-Way Sync Ready ==="));
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

  // ── 3. ISO8601 Timestamp for Firestore ───────────────────
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  char isoTime[30];
  strftime(isoTime, sizeof(isoTime), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);

  // ── 4. Build Firestore REST API JSON Payload ──────────────
  char payload[512];
  if (isnan(tempC) || isinf(tempC)) {
    snprintf(payload, sizeof(payload),
      "{\"fields\":{"
      "\"temperature\":{\"nullValue\":null},"
      "\"spectral_data\":{\"stringValue\":\"%s\"},"
      "\"created_at\":{\"timestampValue\":\"%s\"}"
      "}}",
      spectralDigits, isoTime);
  } else {
    snprintf(payload, sizeof(payload),
      "{\"fields\":{"
      "\"temperature\":{\"doubleValue\":%.2f},"
      "\"spectral_data\":{\"stringValue\":\"%s\"},"
      "\"created_at\":{\"timestampValue\":\"%s\"}"
      "}}",
      tempC, spectralDigits, isoTime);
  }

  Serial.printf("Temp: %.2f°C | Spectral (0-9): %s\n", tempC, spectralDigits);

  // ── 5. POST to Cloud Firestore REST API ───────────────────
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // skip cert validation for Firestore REST

    HTTPClient http;
    http.begin(client, FIRESTORE_URL);
    http.addHeader("Content-Type", "application/json");

    int code = http.POST(payload);
    if (code == 200 || code == 201) {
      Serial.println(F("[Firestore] Telemetry Pushed Successfully!"));
    }
    http.end();

    // ── 6. Fetch AI Result Packet from App Sync Node ──────────
    fetchAiResultPacket();
  }

  // ── 7. Non-Blocking OLED Carousel Rotation ────────────────
  if (millis() - lastPageChangeMs >= PAGE_INTERVAL_MS) {
    currentPage = (currentPage % TOTAL_PAGES) + 1;
    lastPageChangeMs = millis();
  }

  renderOledCarousel(tempC, spectralDigits);

  delay(500); // Fast 500ms loop responsiveness
}
