#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Ensure you have installed 'ArduinoJson' by Benoit Blanchon

// ── Configuration ───────────────────────────────────
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your Network IP from the Settings Page
const char* server_url = "http://192.168.x.x:4000/api/data"; 

// This MUST match the DEVICE_API_KEY in the backend .env
const char* api_key = "dev_secret_key_123";

// ── Timing ──────────────────────────────────────────
unsigned long lastTime = 0;
unsigned long timerDelay = 5000; // Send reading every 5 seconds for real-time feel

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  if ((millis() - lastTime) > timerDelay) {
    sendSensorData();
    lastTime = millis();
  }
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected. IP: " + WiFi.localIP().toString());
}

void sendSensorData() {
  HTTPClient http;
  http.begin(server_url);
  
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-api-key", api_key); // STRICT SECURITY HEADER

  StaticJsonDocument<512> doc;
  doc["device_id"] = "ESP32_01";
  doc["oil_type"] = "Mustard Oil";
  doc["timestamp"] = "2024-04-08T18:00:00Z"; // In production, use NTP to get real time

  JsonObject sensor_values = doc.createNestedObject("sensor_values");
  
  // Replace these with actual analogRead() + calibration formulas
  sensor_values["tds_ppm"] = 95;           // Example TDS sensor reading
  sensor_values["turbidity_ntu"] = 10.2;   // Example Turbidity sensor
  sensor_values["ph"] = 6.45;              // Example pH sensor
  sensor_values["density_gcm3"] = 0.908;   // Calculated density
  sensor_values["temperature_c"] = 27.5;   // DS18B20 Reading
  sensor_values["viscosity_cp"] = 74.2;    // Calculated viscosity
  sensor_values["refractive_index"] = 1.466; // Optical sensor interpolation

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ Data Sent. Response: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("❌ Failed. Error code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
