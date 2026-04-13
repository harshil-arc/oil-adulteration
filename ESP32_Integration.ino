#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Ensure you have installed 'ArduinoJson' by Benoit Blanchon
#include <WebServer.h>

WebServer server(80);
String deviceId;
String deviceName;


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
  
  // Set Device IDs based on MAC address
  String mac = WiFi.macAddress();
  mac.replace(":", "");
  deviceId = "ESP32_" + mac.substring(mac.length() - 6);
  deviceName = "ESP_OIL_" + mac.substring(mac.length() - 4);
  
  // Setup WebServer endpoints
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/sensor", HTTP_GET, handleSensor);
  server.on("/connect", HTTP_GET, handleConnect);
  
  // CORS Headers for all routes
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      server.sendHeader("Access-Control-Allow-Headers", "*");
      server.send(204);
    } else {
      server.send(404, "application/json", "{\"error\":\"Not found\"}");
    }
  });

  server.begin();
  Serial.println("✅ WebServer started on port 80");
}


void loop() {
  server.handleClient(); // Handle incoming HTTP requests without blocking

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
  doc["device_id"] = deviceId;
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

// ── WebServer Handlers ──────────────────────────────
void sendCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
}

void handleStatus() {
  sendCorsHeaders();
  StaticJsonDocument<256> doc;
  doc["deviceId"] = deviceId;
  doc["name"] = deviceName;
  doc["rssi"] = WiFi.RSSI();
  doc["ip"] = WiFi.localIP().toString();
  doc["status"] = "ok";
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleSensor() {
  sendCorsHeaders();
  StaticJsonDocument<512> doc;
  
  // These are the same variables collected in sendSensorData
  doc["adcValue"] = analogRead(32); // Example ADC
  doc["voltage"] = 3.3; // Example Voltage
  doc["tds"] = 95;
  doc["temperature"] = 27.5;
  doc["timestamp"] = "2024-04-08T18:00:00Z";
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleConnect() {
  sendCorsHeaders();
  StaticJsonDocument<256> doc;
  doc["status"] = "ok";
  doc["deviceId"] = deviceId;
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

