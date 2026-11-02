#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SparkFun_AS7343.h> // Ensure this library is installed
#include <Adafruit_MLX90614.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <time.h>

// ============================================================
//  WIFI & FIREBASE CONFIGURATION
// ============================================================
const char* ssid     = "atl";
const char* password = "harshil913";

// Firebase Realtime Database & Cloud Firestore Endpoints
const char* FIREBASE_RTDB_URL = "https://oil-adulteration-default-rtdb.firebaseio.com/readings.json";
const char* FIRESTORE_URL     = "https://firestore.googleapis.com/v1/projects/oil-adulteration/databases/(default)/documents/readings?key=AIzaSyAhu9pa7EIlmZD-u68xxDeMXz483G98bS0";

// ============================================================
//  HARDWARE OBJECTS & CONFIG
// ============================================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
SfeAS7343ArdI2C spectralSensor;

uint16_t spectralData[ksfAS7343NumChannels]; // Array for 14+ channels
bool mlxReady = false;
bool spectralReady = false;

// Approximate wavelengths in nm for the AS7343 channels (ordered by index)
const int channelWavelengths[] = {425, 475, 525, 550, 600, 650, 700, 750, 800, 850, 400, 450, 500, 550};

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println(F("\n=========================================="));
  Serial.println(F("         SPECTRATRUST ESP32 CLOUD         "));
  Serial.println(F("=========================================="));

  Wire.begin(21, 22); // AS7343 & MLX share SDA:21, SCL:22

  // 1. OLED Init
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
      Serial.println(F("[WARN] OLED not detected on 0x3C / 0x3D"));
    }
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println(F("SPECTRATRUST CLOUD SYNC"));
  display.println(F("Connecting WiFi..."));
  display.display();

  // 2. WiFi Connection
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.printf("[WIFI] Connecting to '%s'", ssid);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    display.println(F("WiFi Connected!"));
    display.println(WiFi.localIP());
    display.display();
  } else {
    Serial.println(F("\n[WIFI] Connection failed. Will retry in loop..."));
    display.println(F("WiFi Failed - Retrying"));
    display.display();
  }

  // 3. Temperature Sensor Init
  if (mlx.begin()) {
    mlxReady = true;
    Serial.println(F("[MLX90614] Temperature Sensor Ready."));
  } else {
    Serial.println(F("[MLX90614] Not Found on I2C bus!"));
  }

  // 4. Spectral Sensor Init
  if (spectralSensor.begin()) {
    spectralSensor.powerOn();
    spectralReady = true;
    Serial.println(F("[AS7343] Spectrometer Ready."));
  } else {
    Serial.println(F("[AS7343] Not Found on I2C bus!"));
  }

  delay(1000);
}

void loop() {
  // Auto-reconnect WiFi if disconnected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Reconnecting..."));
    WiFi.reconnect();
    delay(1000);
  }

  // --- 1. Read Temperature ---
  float objC = 27.5;
  if (mlxReady) {
    float t = mlx.readObjectTempC();
    if (!isnan(t) && !isinf(t) && t > -20.0 && t < 120.0) {
      objC = t;
    }
  }
  
  // --- 2. Read Spectral Data (13/14 Channels) ---
  if (spectralReady) {
    spectralSensor.ledOn();
    delay(100);
    if (spectralSensor.readSpectraDataFromSensor()) {
      spectralSensor.getData(spectralData);
    }
    spectralSensor.ledOff();
  } else {
    // Simulated spectral signature if hardware is offline
    for (int i = 0; i < 14; i++) {
      spectralData[i] = random(5, 45);
    }
  }

  // Find Dominant Wavelength
  uint16_t maxIntensity = 0;
  int peakChannel = 0;
  for (int i = 0; i < 14; i++) {
    if (spectralData[i] > maxIntensity) {
      maxIntensity = spectralData[i];
      peakChannel = i;
    }
  }
  float dominantWavelength = channelWavelengths[peakChannel % 14];

  // Build CSV of 13 channels
  String specCsv = "";
  for (int i = 0; i < 13; i++) {
    specCsv += String(spectralData[i]) + (i == 12 ? "" : ",");
  }

  int rtdbCode = 0;
  int fsCode   = 0;

  // --- 3. Send Telemetry to Firebase Realtime Database & Firestore ---
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();

    // Current epoch timestamp in milliseconds
    time_t nowSec = time(nullptr);
    uint64_t nowEpoch = (uint64_t)nowSec * 1000ULL;
    if (nowEpoch < 1700000000000ULL) {
      nowEpoch = 1785243000000ULL + millis();
    }

    // ── A. Post to Firebase Realtime Database (Primary Live Channel) ──────
    HTTPClient httpRtdb;
    httpRtdb.begin(client, FIREBASE_RTDB_URL);
    httpRtdb.addHeader("Content-Type", "application/json");
    httpRtdb.setTimeout(3500);

    String rtdbPayload = "{";
    rtdbPayload += "\"temperature\":" + String(objC, 2) + ",";
    rtdbPayload += "\"wavelength\":" + String(dominantWavelength, 0) + ",";
    rtdbPayload += "\"spectral_data\":\"" + specCsv + "\",";
    rtdbPayload += "\"oil_type\":\"Raw Sample\",";
    rtdbPayload += "\"timestamp\":" + String(nowEpoch);
    rtdbPayload += "}";

    rtdbCode = httpRtdb.POST(rtdbPayload);
    Serial.printf("[FIREBASE RTDB] HTTP %d | Temp: %.2f C | Spec: %s\n", rtdbCode, objC, specCsv.c_str());
    httpRtdb.end();

    // ── B. Post to Google Cloud Firestore REST API ───────────────────────
    HTTPClient httpFs;
    httpFs.begin(client, FIRESTORE_URL);
    httpFs.addHeader("Content-Type", "application/json");
    httpFs.setTimeout(3500);

    String fsPayload = "{\"fields\":{";
    fsPayload += "\"temperature\":{\"doubleValue\":" + String(objC, 2) + "},";
    fsPayload += "\"wavelength\":{\"doubleValue\":" + String(dominantWavelength, 0) + "},";
    fsPayload += "\"spectral_data\":{\"stringValue\":\"" + specCsv + "\"},";
    fsPayload += "\"oil_type\":{\"stringValue\":\"Raw Sample\"}";
    fsPayload += "}}";

    fsCode = httpFs.POST(fsPayload);
    Serial.printf("[FIREBASE FIRESTORE] HTTP %d\n", fsCode);
    httpFs.end();
  }

  // --- 4. OLED Display Update ---
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println(F("FIREBASE CLOUD SYNC"));
  display.printf("Temp: %.1f C\n", objC);
  display.printf("Peak Wlen: %.0f nm\n", dominantWavelength);
  display.printf("RTDB:%d | FS:%d\n", rtdbCode, fsCode);
  display.print(F("Spec: "));
  for (int i = 0; i < 4; i++) {
    display.print(spectralData[i]);
    display.print(" ");
  }
  display.display();

  delay(3000); // Telemetry cadence: push every 3 seconds
}
