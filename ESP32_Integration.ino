#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Ensure you have installed 'ArduinoJson' by Benoit Blanchon

// ── Configuration ───────────────────────────────────
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your Network IP from the Settings Page
// Keep the "/api/ingest-reading" at the end!
const char* server_url = "http://192.168.x.x:4000/api/ingest-reading"; 

// This MUST match the DEVICE_API_KEY in the backend .env
const char* api_key = "dev_secret_key_123";

// ── Timing ──────────────────────────────────────────
unsigned long lastTime = 0;
unsigned long timerDelay = 10000; // Send reading every 10 seconds

void setup() {
  Serial.begin(115200);
  
  WiFi.mode(WIFI_STA);
  connectToWiFi();
}

void loop() {
  // Auto-reconnect if WiFi drops
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi dropped. Reconnecting...");
    connectToWiFi();
  }

  // Timer logic for non-blocking delay
  if ((millis() - lastTime) > timerDelay) {
    sendSensorData();
    lastTime = millis();
  }
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected.");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void sendSensorData() {
  HTTPClient http;
  
  Serial.println("\n📡 Sending data to Pure Catalyst Backend...");
  http.begin(server_url);
  
  // Necessary headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", api_key); // Auth Token!

  // Build JSON Payload
  StaticJsonDocument<200> doc;
  doc["device_id"] = "ESP32_01";
  doc["oil_type"] = "Mustard Oil";  // Change based on physical switch or setting

  // Read analog pins (Replace with your actual pin calculations)
  JsonObject sensor_values = doc.createNestedObject("sensor_values");
  sensor_values["ir_value"] = analogRead(34); // Example IR sensor
  sensor_values["uv_value"] = analogRead(35); // Example UV sensor
  sensor_values["density"] = 0.912;           // Mock density
  sensor_values["temperature"] = 28.5;        // Mock Temp sensor (e.g. DS18B20)

  String requestBody;
  serializeJson(doc, requestBody);

  // Perform POST
  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ HTTP Response code: ");
    Serial.println(httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);
  } else {
    Serial.print("❌ Error code: ");
    Serial.println(httpResponseCode);
    Serial.println("Server unreachable or connection refused.");
  }
  
  http.end(); // Free resources
}
